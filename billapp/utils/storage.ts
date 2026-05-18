import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, PRESET_CATEGORIES } from '../constants/categories';

export interface ExpenseRecord {
  id: string;
  amount: number;
  categoryId: string;
  date: string;
  note: string;
}

export interface AppSettings {
  billingStartDay: number;
  currency: string;
}

const KEYS = {
  RECORDS: '@bill_records',
  CATEGORIES: '@bill_categories',
  SETTINGS: '@bill_settings',
};

export async function loadRecords(): Promise<ExpenseRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.RECORDS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveRecords(records: ExpenseRecord[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.RECORDS, JSON.stringify(records));
}

export async function loadCategories(): Promise<Category[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.CATEGORIES);
    if (raw) return JSON.parse(raw);
    await AsyncStorage.setItem(KEYS.CATEGORIES, JSON.stringify(PRESET_CATEGORIES));
    return PRESET_CATEGORIES;
  } catch {
    return PRESET_CATEGORIES;
  }
}

export async function saveCategories(categories: Category[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : { billingStartDay: 1, currency: '¥' };
  } catch {
    return { billingStartDay: 1, currency: '¥' };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.RECORDS);
  await AsyncStorage.removeItem(KEYS.CATEGORIES);
  await AsyncStorage.removeItem(KEYS.SETTINGS);
}
