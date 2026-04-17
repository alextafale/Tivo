import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../db/connection.js';
import { customers } from '../../db/schema.js';
import { eq, and, ilike, desc } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/customers?q=
router.get('/', async (req: Request, res: Response) => {
  try {
    const { q } = req.query as Record<string, string>;
    const businessId = req.auth!.businessId;

    const rows = await db
      .select()
      .from(customers)
      .where(and(
        eq(customers.businessId, businessId),
        q ? ilike(customers.name, `%${q}%`) : undefined,
      ))
      .orderBy(desc(customers.totalSpent));

    res.json({ data: rows, total: rows.length });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

// GET /api/customers/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const [customer] = await db
      .select()
      .from(customers)
      .where(and(eq(customers.id, req.params.id as string), eq(customers.businessId, req.auth!.businessId)))
      .limit(1);

    if (!customer) { res.status(404).json({ error: 'Cliente no encontrado' }); return; }
    res.json({ data: customer });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
});

const createSchema = z.object({
  name:    z.string().min(1),
  email:   z.string().email().optional().or(z.literal('')),
  phone:   z.string().optional(),
  address: z.string().optional(),
  notes:   z.string().optional(),
});

// POST /api/customers
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = createSchema.parse(req.body);
    const [customer] = await db.insert(customers).values({
      ...data,
      email:      data.email || undefined,
      businessId: req.auth!.businessId,
    }).returning();

    res.status(201).json({ data: customer });
  } catch (err: any) {
    if (err.name === 'ZodError') { res.status(400).json({ error: 'Datos inválidos', details: err.errors }); return; }
    res.status(500).json({ error: 'Error al crear cliente' });
  }
});

// PUT /api/customers/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const data = createSchema.partial().parse(req.body);
    const [updated] = await db
      .update(customers)
      .set(data)
      .where(and(eq(customers.id, req.params.id as string), eq(customers.businessId, req.auth!.businessId)))
      .returning();

    if (!updated) { res.status(404).json({ error: 'Cliente no encontrado' }); return; }
    res.json({ data: updated });
  } catch (err: any) {
    if (err.name === 'ZodError') { res.status(400).json({ error: 'Datos inválidos', details: err.errors }); return; }
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
});

export default router;
