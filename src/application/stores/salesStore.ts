import { create } from 'zustand';
import { Sale } from '../../domain/entities';
import { mockSales } from '../../infrastructure/mock/mockData';
import { computeDashboardMetrics } from '../../domain/usecases';
import { mockProducts } from '../../infrastructure/mock/mockData';

interface SalesState {
  sales: Sale[];
  lastSale: Sale | null;
  isLoaded: boolean;
  // Actions
  load: () => void;
  addSale: (sale: Omit<Sale, 'id' | 'createdAt' | 'ticketNumber'>) => Sale;
  getMetrics: () => ReturnType<typeof computeDashboardMetrics>;
  getToday: () => Sale[];
}

export const useSalesStore = create<SalesState>((set, get) => ({
  sales: [],
  lastSale: null,
  isLoaded: false,

  load: () => {
    if (get().isLoaded) return;
    set({ sales: mockSales, isLoaded: true });
  },

  addSale: (saleData) => {
    const id = `sale_${Date.now()}`;
    const ticketNumber = `T-${id.slice(-6).toUpperCase()}`;
    const sale: Sale = { ...saleData, id, ticketNumber, createdAt: new Date() };
    set(state => ({ sales: [sale, ...state.sales], lastSale: sale }));
    return sale;
  },

  getMetrics: () => {
    const { sales } = get();
    return computeDashboardMetrics(sales, mockProducts);
  },

  getToday: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return get().sales.filter(s => {
      const d = new Date(s.createdAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });
  },
}));
