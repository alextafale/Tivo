import { Product, Sale, Customer, DashboardMetrics } from '../entities';

// ========== REPOSITORY INTERFACES ==========

export interface IProductRepository {
  getAll(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  search(query: string): Promise<Product[]>;
  getByBarcode(barcode: string): Promise<Product | null>;
  getByCategory(category: string): Promise<Product[]>;
  getLowStock(): Promise<Product[]>;
  create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>;
  update(id: string, data: Partial<Product>): Promise<Product>;
  updateStock(id: string, delta: number): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface ISaleRepository {
  getAll(): Promise<Sale[]>;
  getById(id: string): Promise<Sale | null>;
  getByDateRange(from: Date, to: Date): Promise<Sale[]>;
  getToday(): Promise<Sale[]>;
  create(sale: Omit<Sale, 'id' | 'createdAt' | 'ticketNumber'>): Promise<Sale>;
  updateStatus(id: string, status: Sale['status']): Promise<void>;
  getDashboardMetrics(): Promise<DashboardMetrics>;
}

export interface ICustomerRepository {
  getAll(): Promise<Customer[]>;
  getById(id: string): Promise<Customer | null>;
  search(query: string): Promise<Customer[]>;
  create(customer: Omit<Customer, 'id' | 'createdAt' | 'totalPurchases' | 'totalSpent'>): Promise<Customer>;
  update(id: string, data: Partial<Customer>): Promise<Customer>;
  recordPurchase(id: string, amount: number): Promise<void>;
}
