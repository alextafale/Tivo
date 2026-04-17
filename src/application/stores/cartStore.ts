import { create } from 'zustand';
import { CartItem, Product, PaymentMethod } from '../../domain/entities';
import {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  calculateCartTotals,
  createSaleFromCart,
} from '../../domain/usecases';

interface CartState {
  items: CartItem[];
  paymentMethod: PaymentMethod;
  customerId?: string;
  // Computed
  subtotal: number;
  tax: number;
  total: number;
  discount: number;
  itemCount: number;
  // Actions
  addProduct: (product: Product, quantity?: number) => void;
  removeProduct: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setCustomer: (customerId?: string) => void;
  clearCart: () => void;
  getSalePayload: (amountPaid: number) => ReturnType<typeof createSaleFromCart>;
}

function computeTotals(items: CartItem[]) {
  const totals = calculateCartTotals(items);
  return {
    ...totals,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
  };
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  paymentMethod: 'cash',
  customerId: undefined,
  subtotal: 0,
  tax: 0,
  total: 0,
  discount: 0,
  itemCount: 0,

  addProduct: (product, quantity = 1) => {
    const newItems = addToCart(get().items, product, quantity);
    set({ items: newItems, ...computeTotals(newItems) });
  },

  removeProduct: (productId) => {
    const newItems = removeFromCart(get().items, productId);
    set({ items: newItems, ...computeTotals(newItems) });
  },

  updateQuantity: (productId, quantity) => {
    const newItems = updateCartQuantity(get().items, productId, quantity);
    set({ items: newItems, ...computeTotals(newItems) });
  },

  setPaymentMethod: (method) => set({ paymentMethod: method }),

  setCustomer: (customerId) => set({ customerId }),

  clearCart: () => set({
    items: [],
    paymentMethod: 'cash',
    customerId: undefined,
    subtotal: 0, tax: 0, total: 0, discount: 0, itemCount: 0,
  }),

  getSalePayload: (amountPaid) => {
    const { items, paymentMethod, customerId } = get();
    return createSaleFromCart(items, paymentMethod, amountPaid, customerId);
  },
}));
