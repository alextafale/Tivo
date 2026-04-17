import { Product, Sale, Customer, DashboardMetrics, CartItem, PaymentMethod } from '../entities';

// ====== USE CASE: Search Products ======
export async function searchProducts(
  query: string,
  products: Product[]
): Promise<Product[]> {
  if (!query.trim()) return products.filter(p => p.isActive);
  const q = query.toLowerCase().trim();
  return products.filter(p =>
    p.isActive &&
    (p.name.toLowerCase().includes(q) ||
     p.barcode?.includes(q) ||
     p.category.toLowerCase().includes(q))
  );
}

// ====== USE CASE: Add To Cart ======
export function addToCart(cart: CartItem[], product: Product, quantity = 1): CartItem[] {
  const existing = cart.find(i => i.product.id === product.id);
  if (existing) {
    return cart.map(i =>
      i.product.id === product.id
        ? { ...i, quantity: i.quantity + quantity, subtotal: (i.quantity + quantity) * product.price }
        : i
    );
  }
  return [
    ...cart,
    { product, quantity, subtotal: quantity * product.price, discount: 0 },
  ];
}

// ====== USE CASE: Remove From Cart ======
export function removeFromCart(cart: CartItem[], productId: string): CartItem[] {
  return cart.filter(i => i.product.id !== productId);
}

// ====== USE CASE: Update Cart Quantity ======
export function updateCartQuantity(
  cart: CartItem[],
  productId: string,
  quantity: number
): CartItem[] {
  if (quantity <= 0) return removeFromCart(cart, productId);
  return cart.map(i =>
    i.product.id === productId
      ? { ...i, quantity, subtotal: quantity * i.product.price }
      : i
  );
}

// ====== USE CASE: Calculate Cart Totals ======
export function calculateCartTotals(cart: CartItem[]): {
  subtotal: number;
  tax: number;
  total: number;
  discount: number;
} {
  const subtotal = cart.reduce((sum, i) => sum + i.subtotal - i.discount, 0);
  const tax = cart.reduce((sum, i) => sum + (i.subtotal - i.discount) * i.product.taxRate, 0);
  const discount = cart.reduce((sum, i) => sum + i.discount, 0);
  const total = subtotal + tax;
  return { subtotal, tax, total, discount };
}

// ====== USE CASE: Create Sale ======
export function createSaleFromCart(
  cart: CartItem[],
  paymentMethod: PaymentMethod,
  amountPaid: number,
  customerId?: string
): Omit<Sale, 'id' | 'createdAt' | 'ticketNumber'> {
  const totals = calculateCartTotals(cart);
  return {
    items: cart,
    ...totals,
    paymentMethod,
    amountPaid,
    change: Math.max(0, amountPaid - totals.total),
    customerId,
    status: 'completed',
  };
}

// ====== USE CASE: Get Dashboard Metrics ======
export function computeDashboardMetrics(sales: Sale[], products: Product[]): DashboardMetrics {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaySalesList = sales.filter(s => {
    const d = new Date(s.createdAt);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime() && s.status === 'completed';
  });

  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const weekSales = sales.filter(s => new Date(s.createdAt) >= weekAgo && s.status === 'completed');
  const monthSales = sales.filter(s => new Date(s.createdAt) >= monthAgo && s.status === 'completed');

  // Top products
  const productSales: Record<string, { product: Product; sold: number }> = {};
  sales.filter(s => s.status === 'completed').forEach(sale => {
    sale.items.forEach(item => {
      if (!productSales[item.product.id]) {
        productSales[item.product.id] = { product: item.product, sold: 0 };
      }
      productSales[item.product.id].sold += item.quantity;
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  // Hourly data for today
  const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    revenue: todaySalesList
      .filter(s => new Date(s.createdAt).getHours() === hour)
      .reduce((sum, s) => sum + s.total, 0),
  }));

  return {
    todaySales: todaySalesList.length,
    todayRevenue: todaySalesList.reduce((sum, s) => sum + s.total, 0),
    todayOrders: todaySalesList.length,
    weekRevenue: weekSales.reduce((sum, s) => sum + s.total, 0),
    monthRevenue: monthSales.reduce((sum, s) => sum + s.total, 0),
    topProducts,
    lowStockProducts: products.filter(p => p.stock <= p.minStock && p.isActive),
    recentSales: [...sales].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 10),
    hourlyData,
  };
}
