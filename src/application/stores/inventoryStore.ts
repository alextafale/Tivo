import { create } from 'zustand';
import { Product } from '../../domain/entities';
import { mockProducts } from '../../infrastructure/mock/mockData';

interface InventoryState {
  products: Product[];
  isLoaded: boolean;
  // Actions
  load: () => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  adjustStock: (id: string, delta: number) => void;
  deductStock: (items: { productId: string; quantity: number }[]) => void;
  searchProducts: (query: string) => Product[];
  getById: (id: string) => Product | undefined;
  getLowStock: () => Product[];
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  products: [],
  isLoaded: false,

  load: () => {
    if (get().isLoaded) return;
    set({ products: mockProducts, isLoaded: true });
  },

  addProduct: (productData) => {
    const now = new Date();
    const product: Product = {
      ...productData,
      id: `p_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    set(state => ({ products: [product, ...state.products] }));
  },

  updateProduct: (id, data) => {
    set(state => ({
      products: state.products.map(p =>
        p.id === id ? { ...p, ...data, updatedAt: new Date() } : p
      ),
    }));
  },

  adjustStock: (id, delta) => {
    set(state => ({
      products: state.products.map(p =>
        p.id === id
          ? { ...p, stock: Math.max(0, p.stock + delta), updatedAt: new Date() }
          : p
      ),
    }));
  },

  deductStock: (items) => {
    set(state => ({
      products: state.products.map(p => {
        const item = items.find(i => i.productId === p.id);
        if (!item) return p;
        return { ...p, stock: Math.max(0, p.stock - item.quantity), updatedAt: new Date() };
      }),
    }));
  },

  searchProducts: (query) => {
    const { products } = get();
    if (!query.trim()) return products.filter(p => p.isActive);
    const q = query.toLowerCase();
    return products.filter(p =>
      p.isActive && (
        p.name.toLowerCase().includes(q) ||
        p.barcode?.includes(q) ||
        p.category.toLowerCase().includes(q)
      )
    );
  },

  getById: (id) => get().products.find(p => p.id === id),

  getLowStock: () => get().products.filter(p => p.stock <= p.minStock && p.isActive),
}));
