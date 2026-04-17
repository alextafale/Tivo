/**
 * TIVO — AI Routes
 * POST /api/ai/chat       → Chatbot con Qwen
 * POST /api/ai/recommend  → Recomendaciones de productos
 * GET  /api/ai/alerts     → Alertas inteligentes de inventario
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import {
  chatWithQwen,
  chatWithQwenStream,
  getAIRecommendations,
  getAIAlerts,
} from '../../ai/chatService.js';
import { db } from '../../db/connection.js';
import { chatSessions } from '../../db/schema.js';
import { eq, and } from 'drizzle-orm';

const router = Router();
router.use(requireAuth);

// ─── POST /api/ai/chat ────────────────────────────────────────────────────────

const chatSchema = z.object({
  message:   z.string().min(1).max(1000),
  sessionId: z.string().uuid().optional(),
  stream:    z.boolean().optional().default(false),
});

router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, sessionId, stream } = chatSchema.parse(req.body);
    const { businessId, userId } = req.auth!;

    // Cargar historial de la sesión si existe
    let history: { role: 'user' | 'assistant'; content: string }[] = [];
    let currentSessionId = sessionId;

    if (sessionId) {
      const [session] = await db
        .select()
        .from(chatSessions)
        .where(and(eq(chatSessions.id, sessionId), eq(chatSessions.userId, userId)))
        .limit(1);

      if (session) {
        history = (session.messages as any[]) ?? [];
      }
    }

    if (stream) {
      // ─── Streaming response ──────────────────────────────────────────────
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let fullResponse = '';

      for await (const chunk of chatWithQwenStream({ message, history, businessId })) {
        fullResponse += chunk;
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }

      // Guardar sesión
      const newHistory = [
        ...history,
        { role: 'user' as const, content: message },
        { role: 'assistant' as const, content: fullResponse },
      ].slice(-20); // máximo 20 mensajes guardados

      if (currentSessionId) {
        await db
          .update(chatSessions)
          .set({ messages: newHistory, updatedAt: new Date() })
          .where(eq(chatSessions.id, currentSessionId));
      } else {
        const [newSession] = await db.insert(chatSessions).values({
          businessId, userId, messages: newHistory,
        }).returning();
        currentSessionId = newSession.id;
      }

      res.write(`data: ${JSON.stringify({ done: true, sessionId: currentSessionId })}\n\n`);
      res.end();
    } else {
      // ─── Blocking response ───────────────────────────────────────────────
      const response = await chatWithQwen({ message, history, businessId });

      const newHistory = [
        ...history,
        { role: 'user' as const, content: message },
        { role: 'assistant' as const, content: response },
      ].slice(-20);

      if (currentSessionId) {
        await db
          .update(chatSessions)
          .set({ messages: newHistory, updatedAt: new Date() })
          .where(eq(chatSessions.id, currentSessionId));
      } else {
        const [newSession] = await db.insert(chatSessions).values({
          businessId, userId, messages: newHistory,
        }).returning();
        currentSessionId = newSession.id;
      }

      res.json({ data: { response, sessionId: currentSessionId } });
    }
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Datos inválidos', details: err.errors });
      return;
    }
    console.error('AI chat error:', err.message);
    res.status(500).json({ error: 'Error del servicio de IA. Verifica tu DASHSCOPE_API_KEY.' });
  }
});

// ─── POST /api/ai/recommend ───────────────────────────────────────────────────

const recommendSchema = z.object({
  productIds: z.array(z.string()).min(1),
  limit:      z.number().int().min(1).max(5).optional(),
});

router.post('/recommend', async (req: Request, res: Response) => {
  try {
    const { productIds, limit } = recommendSchema.parse(req.body);
    const suggestions = await getAIRecommendations({
      productIds,
      businessId: req.auth!.businessId,
      limit,
    });

    res.json({ data: { suggestions } });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Datos inválidos', details: err.errors });
      return;
    }
    console.error('AI recommend error:', err.message);
    res.status(500).json({ error: 'Error al generar recomendaciones' });
  }
});

// ─── GET /api/ai/alerts ───────────────────────────────────────────────────────

router.get('/alerts', async (req: Request, res: Response) => {
  try {
    const alerts = await getAIAlerts(req.auth!.businessId);
    res.json({ data: { alerts } });
  } catch (err) {
    console.error('AI alerts error:', err);
    res.status(500).json({ error: 'Error al obtener alertas' });
  }
});

export default router;
