import { Router, Request, Response } from 'express';
import { db } from '../../db/connection.js';
import { sales, products, saleItems } from '../../db/schema.js';
import { eq, and, gte, desc } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/dashboard/metrics
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const businessId = req.auth!.businessId;
    const now = new Date();

    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const monthAgo = new Date(now.getTime() - 30 * 86400000);

    // All completed sales
    const allSales = await db
      .select()
      .from(sales)
      .where(and(eq(sales.businessId, businessId), eq(sales.status, 'completed')))
      .orderBy(desc(sales.createdAt))
      .limit(500);

    const todaySales  = allSales.filter(s => new Date(s.createdAt) >= today);
    const weekSales   = allSales.filter(s => new Date(s.createdAt) >= weekAgo);
    const monthSales  = allSales.filter(s => new Date(s.createdAt) >= monthAgo);

    // Top products
    const allItems = await db
      .select()
      .from(saleItems)
      .where(eq(saleItems.productId, businessId));

    // Product quantities per sale item
    const productTotals: Record<string, { name: string; sold: number; revenue: number }> = {};
    for (const sale of allSales) {
      const items = await db.select().from(saleItems).where(eq(saleItems.saleId, sale.id));
      for (const item of items) {
        if (!productTotals[item.productId]) {
          productTotals[item.productId] = { name: item.productName, sold: 0, revenue: 0 };
        }
        productTotals[item.productId].sold    += item.quantity;
        productTotals[item.productId].revenue += item.subtotal;
      }
    }

    const topProducts = Object.entries(productTotals)
      .map(([id, data]) => ({ productId: id, ...data }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    // Low stock
    const allProducts = await db
      .select()
      .from(products)
      .where(and(eq(products.businessId, businessId), eq(products.isActive, true)));

    const lowStockProducts = allProducts.filter(p => p.stock <= p.minStock);

    // Hourly data for today
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      revenue: todaySales
        .filter(s => new Date(s.createdAt).getHours() === hour)
        .reduce((sum, s) => sum + s.total, 0),
    }));

    res.json({
      data: {
        todaySales:        todaySales.length,
        todayRevenue:      todaySales.reduce((s, r) => s + r.total, 0),
        weekRevenue:       weekSales.reduce((s, r) => s + r.total, 0),
        monthRevenue:      monthSales.reduce((s, r) => s + r.total, 0),
        topProducts,
        lowStockProducts,
        recentSales:       allSales.slice(0, 10),
        hourlyData,
        totalProducts:     allProducts.length,
        lowStockCount:     lowStockProducts.length,
      },
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Error al obtener métricas' });
  }
});

export default router;
