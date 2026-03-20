import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StockItem {
  id: string;
  name: string;
  branch: string;
  category: string;
  quantity: number;
  lowStockThreshold: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

interface StockStore {
  items: StockItem[];
  addItem: (item: Omit<StockItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateQuantity: (id: string, quantity: number) => void;
  deductStock: (id: string, amount: number) => boolean;
  removeItem: (id: string) => void;
}

export const useStockStore = create<StockStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => ({
          items: [
            {
              ...item,
              id: `stock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            ...state.items,
          ],
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, quantity: Math.max(0, quantity), updatedAt: new Date().toISOString() }
              : item
          ),
        })),

      deductStock: (id, amount) => {
        const item = get().items.find((i) => i.id === id);
        if (!item || item.quantity < amount) return false;
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id
              ? { ...i, quantity: i.quantity - amount, updatedAt: new Date().toISOString() }
              : i
          ),
        }));
        return true;
      },

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
    }),
    { name: 'stock-storage' }
  )
);
