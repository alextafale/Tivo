import { create } from 'zustand';
import { Customer } from '../../domain/entities';
import { mockCustomers } from '../../infrastructure/mock/mockData';

type AuthUser = { id: string; name: string; businessName: string; role: 'admin' | 'cashier' };

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Mock admin credentials
const MOCK_CREDS = [
  { email: 'admin@tivo.app', password: '1234', user: { id: 'u1', name: 'Admin TIVO', businessName: 'Mi Negocio', role: 'admin' as const } },
  { email: 'cajero@tivo.app', password: '1234', user: { id: 'u2', name: 'Juan Cajero', businessName: 'Mi Negocio', role: 'cashier' as const } },
];

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));
    const match = MOCK_CREDS.find(c => c.email === email && c.password === password);
    if (match) {
      set({ user: match.user, isAuthenticated: true, isLoading: false });
      return true;
    }
    set({ isLoading: false });
    return false;
  },

  logout: () => set({ user: null, isAuthenticated: false }),
}));

// ========== CUSTOMER STORE ==========
interface CustomerState {
  customers: Customer[];
  isLoaded: boolean;
  load: () => void;
  addCustomer: (data: Pick<Customer, 'name' | 'email' | 'phone' | 'address' | 'notes'>) => Customer;
  searchCustomers: (query: string) => Customer[];
  recordPurchase: (id: string, amount: number) => void;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  isLoaded: false,

  load: () => {
    if (get().isLoaded) return;
    set({ customers: mockCustomers, isLoaded: true });
  },

  addCustomer: (data) => {
    const customer: Customer = {
      ...data,
      id: `c_${Date.now()}`,
      totalPurchases: 0,
      totalSpent: 0,
      createdAt: new Date(),
    };
    set(state => ({ customers: [customer, ...state.customers] }));
    return customer;
  },

  searchCustomers: (query) => {
    const { customers } = get();
    if (!query.trim()) return customers;
    const q = query.toLowerCase();
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  },

  recordPurchase: (id, amount) => {
    set(state => ({
      customers: state.customers.map(c =>
        c.id === id
          ? { ...c, totalPurchases: c.totalPurchases + 1, totalSpent: c.totalSpent + amount, lastPurchaseAt: new Date() }
          : c
      ),
    }));
  },
}));
