import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  ExpenseRecord,
  AppSettings,
  loadRecords,
  saveRecords,
  loadCategories,
  saveCategories,
  loadSettings,
  saveSettings,
  clearAllData,
} from '../utils/storage';
import { Category, PRESET_CATEGORIES } from '../constants/categories';

interface BillStore {
  records: ExpenseRecord[];
  categories: Category[];
  settings: AppSettings;
  initialized: boolean;

  init: () => Promise<void>;

  addRecord: (record: Omit<ExpenseRecord, 'id'>) => Promise<void>;
  updateRecord: (id: string, record: Partial<ExpenseRecord>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;

  addCategory: (category: Omit<Category, 'id' | 'isPreset'>) => Promise<void>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  resetCategories: () => Promise<void>;

  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  clearAll: () => Promise<void>;
}

export const useBillStore = create<BillStore>((set, get) => ({
  records: [],
  categories: PRESET_CATEGORIES,
  settings: { billingStartDay: 1, currency: '¥' },
  initialized: false,

  init: async () => {
    if (get().initialized) return;
    const [records, categories, settings] = await Promise.all([
      loadRecords(),
      loadCategories(),
      loadSettings(),
    ]);
    set({ records, categories, settings, initialized: true });
  },

  addRecord: async (record) => {
    const newRecord: ExpenseRecord = { ...record, id: uuidv4() };
    const updated = [newRecord, ...get().records];
    set({ records: updated });
    await saveRecords(updated);
  },

  updateRecord: async (id, data) => {
    const updated = get().records.map((r) => (r.id === id ? { ...r, ...data } : r));
    set({ records: updated });
    await saveRecords(updated);
  },

  deleteRecord: async (id) => {
    const updated = get().records.filter((r) => r.id !== id);
    set({ records: updated });
    await saveRecords(updated);
  },

  addCategory: async (category) => {
    const newCat: Category = { ...category, id: uuidv4(), isPreset: false };
    const updated = [...get().categories, newCat];
    set({ categories: updated });
    await saveCategories(updated);
  },

  updateCategory: async (id, data) => {
    const updated = get().categories.map((c) => (c.id === id ? { ...c, ...data } : c));
    set({ categories: updated });
    await saveCategories(updated);
  },

  deleteCategory: async (id) => {
    const updated = get().categories.filter((c) => c.id !== id);
    set({ categories: updated });
    await saveCategories(updated);
  },

  resetCategories: async () => {
    set({ categories: PRESET_CATEGORIES });
    await saveCategories(PRESET_CATEGORIES);
  },

  updateSettings: async (data) => {
    const updated = { ...get().settings, ...data };
    set({ settings: updated });
    await saveSettings(updated);
  },

  clearAll: async () => {
    await clearAllData();
    set({
      records: [],
      categories: PRESET_CATEGORIES,
      settings: { billingStartDay: 1, currency: '¥' },
    });
  },
}));
