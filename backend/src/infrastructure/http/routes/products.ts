import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../db/connection.js';
import { products } from '../../db/schema.js';
import { eq, and, ilike } from 'drizzle-orm';
import { categoryEnum } from '../../db/schema.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/products?q=&category=
router.get('/', async (req: Request, res: Response) => {
  try {
    const { q, category } = req.query as Record<string, string>;
    const businessId = req.auth!.businessId;

    let query = db
      .select()
      .from(products)
      .where(and(
        eq(products.businessId, businessId),
        eq(products.isActive, true),
        q ? ilike(products.name, `%${q}%`) : undefined,
        category && category !== 'Todos' ? eq(products.category as any, category) : undefined,
      ));

    const rows = await query;
    res.json({ data: rows, total: rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// GET /api/products/low-stock
router.get('/low-stock', async (req: Request, res: Response) => {
  try {
    const rows = await db
      .select()
      .from(products)
      .where(and(
        eq(products.businessId, req.auth!.businessId),
        eq(products.isActive, true),
      ));

    const lowStock = rows.filter(p => p.stock <= p.minStock);
    res.json({ data: lowStock });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener stock bajo' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, req.params.id as string), eq(products.businessId, req.auth!.businessId)))
      .limit(1);

    if (!product) { res.status(404).json({ error: 'Producto no encontrado' }); return; }
    res.json({ data: product });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// Valores válidos extraidos del pgEnum del schema
const CATEGORIES = categoryEnum.enumValues;

// POST /api/products
const createSchema = z.object({
  name:        z.string().min(1),
  description: z.string().optional(),
  price:       z.number().positive(),
  cost:        z.number().min(0).optional(),
  stock:       z.number().int().min(0).optional(),
  minStock:    z.number().int().min(0).optional(),
  category:    z.enum(CATEGORIES).optional(),
  barcode:     z.string().optional(),
  unit:        z.string().optional(),
  taxRate:     z.number().min(0).max(1).optional(),
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const data = createSchema.parse(req.body);
    const [product] = await db.insert(products).values({
      ...data,
      businessId: req.auth!.businessId,
    }).returning();

    res.status(201).json({ data: product });
  } catch (err: any) {
    if (err.name === 'ZodError') { res.status(400).json({ error: 'Datos inválidos', details: err.errors }); return; }
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// PUT /api/products/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const data = createSchema.partial().parse(req.body);
    const [updated] = await db
      .update(products)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(products.id, req.params.id as string), eq(products.businessId, req.auth!.businessId)))
      .returning();

    if (!updated) { res.status(404).json({ error: 'Producto no encontrado' }); return; }
    res.json({ data: updated });
  } catch (err: any) {
    if (err.name === 'ZodError') { res.status(400).json({ error: 'Datos inválidos', details: err.errors }); return; }
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// PATCH /api/products/:id/stock
router.patch('/:id/stock', async (req: Request, res: Response) => {
  try {
    const { stock } = z.object({ stock: z.number().int().min(0) }).parse(req.body);
    const [updated] = await db
      .update(products)
      .set({ stock, updatedAt: new Date() })
      .where(and(eq(products.id, req.params.id as string), eq(products.businessId, req.auth!.businessId)))
      .returning();

    if (!updated) { res.status(404).json({ error: 'Producto no encontrado' }); return; }
    res.json({ data: updated });
  } catch (err: any) {
    if (err.name === 'ZodError') { res.status(400).json({ error: 'Datos inválidos', details: err.errors }); return; }
    res.status(500).json({ error: 'Error al ajustar stock' });
  }
});

// DELETE /api/products/:id (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await db
      .update(products)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(products.id, req.params.id as string), eq(products.businessId, req.auth!.businessId)));

    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

export default router;
