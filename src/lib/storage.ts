import { Category } from '@/types/finance';
import { sampleCategories } from '@/pages/Categories'; // optional fallback

const STORAGE_KEY = 'categories';

export const getCategories = (): Category[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  return sampleCategories || [];
};

export const saveCategory = (category: Category) => {
  const categories = getCategories();
  categories.push(category);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
};
