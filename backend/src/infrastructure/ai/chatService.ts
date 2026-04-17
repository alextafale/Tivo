/**
 * TIVO — Chatbot Service (Qwen)
 *
 * Inyecta contexto del negocio en el system prompt:
 * - Nombre del negocio
 * - Inventario actual (productos y stock)
 * - Ventas del día
 *
 * Esto hace que Qwen "conozca" el negocio y pueda responder
 * preguntas específicas como "¿qué producto se vende más?"
 * o "¿qué productos tienen stock bajo?"
 */

import { and, eq, gte } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { products, sales } from '../db/schema.js';
import { qwenComplete, qwenStream, type ChatMessage } from './qwenClient.js';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
  businessId: string;
  stream?: boolean;
}

export interface RecommendRequest {
  productIds: string[]; // productos en el carrito actual
  businessId: string;
  limit?: number;
}

// ─── Construcción del contexto del negocio ────────────────────────────────────

async function buildBusinessContext(businessId: string): Promise<string> {
  // Productos activos
  const activeProducts = await db
    .select({ name: products.name, stock: products.stock, minStock: products.minStock, price: products.price, category: products.category })
    .from(products)
    .where(and(eq(products.businessId, businessId), eq(products.isActive, true)));

  const lowStock = activeProducts.filter(p => p.stock <= p.minStock);

  // Ventas del día
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySales = await db
    .select({ total: sales.total, paymentMethod: sales.paymentMethod })
    .from(sales)
    .where(and(eq(sales.businessId, businessId), gte(sales.createdAt, today)));

  const todayRevenue = todaySales.reduce((s, sale) => s + sale.total, 0);
  const businessName = process.env.BUSINESS_NAME ?? 'Mi Negocio';

  return `
Eres TIVO AI, el asistente inteligente de punto de venta del negocio "${businessName}".
Responde siempre en español, de forma clara, amable y concisa.
No inventes datos que no estén en el contexto.

=== CONTEXTO DEL NEGOCIO ===
Nombre: ${businessName}
Productos en inventario: ${activeProducts.length}
Productos con stock bajo (≤ mínimo): ${lowStock.length} — ${lowStock.map(p => `${p.name} (${p.stock} disponibles)`).join(', ') || 'ninguno'}
Ventas hoy: ${todaySales.length} transacciones · Ingresos: $${todayRevenue.toFixed(2)}

=== CATÁLOGO (resumen) ===
${activeProducts.slice(0, 20).map(p =>
    `- ${p.name}: $${p.price} | Stock: ${p.stock} | Categoría: ${p.category}`
  ).join('\n')}

=== TUS CAPACIDADES ===
Puedes ayudar con: ventas, inventario, reportes, clientes, configuración de TIVO.
Si el usuario pregunta algo fuera de tu alcance, sugiere crear un ticket de soporte.
`.trim();
}

// ─── Chatbot principal ────────────────────────────────────────────────────────

export async function chatWithQwen(req: ChatRequest): Promise<string> {
  const systemContext = await buildBusinessContext(req.businessId);

  const messages: ChatMessage[] = [
    { role: 'system', content: systemContext },
    ...req.history.slice(-10), // máximo 10 mensajes de historial
    { role: 'user', content: req.message },
  ];

  const response = await qwenComplete(messages, {
    maxTokens: 512,
    temperature: 0.6,
  });

  return response;
}

// ─── Streaming del chatbot ────────────────────────────────────────────────────

export async function* chatWithQwenStream(req: ChatRequest) {
  const systemContext = await buildBusinessContext(req.businessId);

  const messages: ChatMessage[] = [
    { role: 'system', content: systemContext },
    ...req.history.slice(-10),
    { role: 'user', content: req.message },
  ];

  yield* qwenStream(messages, { maxTokens: 512, temperature: 0.6 });
}

// ─── Recomendaciones IA ───────────────────────────────────────────────────────

export async function getAIRecommendations(req: RecommendRequest): Promise<string[]> {
  if (!req.productIds.length) return [];

  // Obtener nombres de productos en el carrito
  const cartProducts = await db
    .select({ name: products.name, category: products.category })
    .from(products)
    .where(eq(products.businessId, req.businessId));

  const cartItems = cartProducts.filter(p => req.productIds.includes(p.name));
  const allAvailable = cartProducts.filter(p => !req.productIds.includes(p.name));

  if (!allAvailable.length) return [];

  const prompt: ChatMessage[] = [
    {
      role: 'system',
      content: `Eres un sistema de recomendaciones para un punto de venta.
Analiza los productos en el carrito y sugiere exactamente ${req.limit ?? 3} productos complementarios del catálogo disponible.
Responde SOLO con los nombres exactos de los productos, uno por línea, sin numeración ni explicación.`,
    },
    {
      role: 'user',
      content: `Carrito actual: ${cartItems.map(p => p.name).join(', ')}

Catálogo disponible:
${allAvailable.map(p => `- ${p.name} (${p.category})`).join('\n')}

Sugiere ${req.limit ?? 3} productos complementarios:`,
    },
  ];

  const response = await qwenComplete(prompt, { maxTokens: 128, temperature: 0.4 });

  // Parsear respuesta — extraer nombres línea por línea
  const suggestions = response
    .split('\n')
    .map(l => l.replace(/^[-•*\d.)\s]+/, '').trim())
    .filter(Boolean)
    .slice(0, req.limit ?? 3);

  // Validar que existan en el catálogo
  return suggestions.filter(s =>
    allAvailable.some(p => p.name.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(p.name.toLowerCase()))
  );
}

// ─── Alertas inteligentes ─────────────────────────────────────────────────────

export async function getAIAlerts(businessId: string): Promise<{ type: string; message: string }[]> {
  const activeProducts = await db
    .select({ name: products.name, stock: products.stock, minStock: products.minStock })
    .from(products)
    .where(and(eq(products.businessId, businessId), eq(products.isActive, true)));

  const lowStockProducts = activeProducts.filter(p => p.stock <= p.minStock);
  const outOfStock = activeProducts.filter(p => p.stock === 0);

  const alerts: { type: string; message: string }[] = [];

  if (outOfStock.length > 0) {
    alerts.push({
      type: 'danger',
      message: `Sin stock: ${outOfStock.map(p => p.name).join(', ')}`,
    });
  }

  if (lowStockProducts.length > 0) {
    alerts.push({
      type: 'warning',
      message: `Stock bajo: ${lowStockProducts.filter(p => p.stock > 0).map(p => `${p.name} (${p.stock})`).join(', ')}`,
    });
  }

  return alerts;
}
