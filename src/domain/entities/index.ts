// ========== PRODUCT ENTITY ==========
export type ProductCategory =
  | 'Bebidas'
  | 'Alimentos'
  | 'Electrónica'
  | 'Ropa'
  | 'Higiene'
  | 'Hogar'
  | 'Otros';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  category: ProductCategory;
  barcode?: string;
  imageUrl?: string;
  unit: string;       // 'pieza', 'kg', 'lt', etc.
  taxRate: number;    // 0.16 for 16% IVA
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ========== CART ENTITIES ==========
export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
  discount: number;
}

// ========== SALE ENTITY ==========
export type PaymentMethod = 'cash' | 'card' | 'transfer';
export type SaleStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';

export interface Sale {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  customerId?: string;
  status: SaleStatus;
  createdAt: Date;
  ticketNumber: string;
}

// ========== CUSTOMER ENTITY ==========
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  totalPurchases: number;
  totalSpent: number;
  lastPurchaseAt?: Date;
  createdAt: Date;
  notes?: string;
}

// ========== TICKET ENTITY ==========
export interface Ticket {
  id: string;
  saleId: string;
  number: string;
  businessName: string;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  customerName?: string;
  issuedAt: Date;
}

// ========== DASHBOARD METRICS ==========
export interface DashboardMetrics {
  todaySales: number;
  todayRevenue: number;
  todayOrders: number;
  weekRevenue: number;
  monthRevenue: number;
  topProducts: { product: Product; sold: number }[];
  lowStockProducts: Product[];
  recentSales: Sale[];
  hourlyData: { hour: number; revenue: number }[];
}
