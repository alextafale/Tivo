import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../db/connection.js';
import { sales, saleItems, products, customers } from '../../db/schema.js';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/sales?from=&to=
router.get('/', async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query as Record<string, string>;
    const businessId = req.auth!.businessId;

    const conditions = [eq(sales.businessId, businessId)];
    if (from) conditions.push(gte(sales.createdAt, new Date(from)));
    if (to)   conditions.push(lte(sales.createdAt, new Date(to)));

    const rows = await db
      .select()
      .from(sales)
      .where(and(...conditions))
      .orderBy(desc(sales.createdAt))
      .limit(100);

    res.json({ data: rows, total: rows.length });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener ventas' });
  }
});

// GET /api/sales/today
router.get('/today', async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rows = await db
      .select()
      .from(sales)
      .where(and(
        eq(sales.businessId, req.auth!.businessId),
        gte(sales.createdAt, today),
      ))
      .orderBy(desc(sales.createdAt));

    const revenue = rows.reduce((s, r) => s + r.total, 0);
    res.json({ data: rows, total: rows.length, revenue });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener ventas del día' });
  }
});

// GET /api/sales/:id (con items)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const [sale] = await db
      .select()
      .from(sales)
      .where(and(eq(sales.id, req.params.id as string), eq(sales.businessId, req.auth!.businessId)))
      .limit(1);

    if (!sale) { res.status(404).json({ error: 'Venta no encontrada' }); return; }

    const items = await db.select().from(saleItems).where(eq(saleItems.saleId, sale.id));
    res.json({ data: { ...sale, items } });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener venta' });
  }
});

// POST /api/sales
const saleItemSchema = z.object({
  productId: z.string().uuid(),
  quantity:  z.number().int().positive(),
  unitPrice: z.number().positive(),
  subtotal:  z.number().positive(),
  discount:  z.number().min(0).optional(),
});

const createSaleSchema = z.object({
  items:         z.array(saleItemSchema).min(1),
  subtotal:      z.number().positive(),
  tax:           z.number().min(0).optional(),
  discount:      z.number().min(0).optional(),
  total:         z.number().positive(),
  paymentMethod: z.enum(['cash', 'card', 'transfer']),
  amountPaid:    z.number().positive(),
  change:        z.number().min(0).optional(),
  customerId:    z.string().uuid().optional(),
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const data = createSaleSchema.parse(req.body);
    const businessId = req.auth!.businessId;
    const userId = req.auth!.userId;

    const ticketNumber = `T-${Date.now().toString(36).toUpperCase()}`;

    // Insertar venta
    const [sale] = await db.insert(sales).values({
      businessId,
      userId,
      customerId:    data.customerId,
      ticketNumber,
      subtotal:      data.subtotal,
      tax:           data.tax ?? 0,
      discount:      data.discount ?? 0,
      total:         data.total,
      paymentMethod: data.paymentMethod,
      amountPaid:    data.amountPaid,
      change:        data.change ?? 0,
      status:        'completed',
    }).returning();

    // Insertar items + actualizar stock
    for (const item of data.items) {
      const [product] = await db
        .select({ name: products.name })
        .from(products)
        .where(eq(products.id, item.productId))
        .limit(1);

      await db.insert(saleItems).values({
        saleId:      sale.id,
        productId:   item.productId,
        productName: product?.name ?? 'Producto',
        unitPrice:   item.unitPrice,
        quantity:    item.quantity,
        subtotal:    item.subtotal,
        discount:    item.discount ?? 0,
      });

      // Descontar stock con decremento atómico — sql`` parametriza automáticamente
      await db.execute(
        sql`UPDATE products SET stock = GREATEST(0, stock - ${item.quantity}), updated_at = NOW() WHERE id = ${item.productId}::uuid`
      );
    }

    // Actualizar stats del cliente si aplica
    if (data.customerId) {
      await db.execute(
        sql`UPDATE customers SET total_purchases = total_purchases + 1, total_spent = total_spent + ${data.total}, last_purchase_at = NOW() WHERE id = ${data.customerId}::uuid`
      );
    }

    const items = await db.select().from(saleItems).where(eq(saleItems.saleId, sale.id));
    res.status(201).json({ data: { ...sale, items } });
  } catch (err: any) {
    if (err.name === 'ZodError') { res.status(400).json({ error: 'Datos inválidos', details: err.errors }); return; }
    console.error('Create sale error:', err);
    res.status(500).json({ error: 'Error al registrar venta' });
  }
});

export default router;
