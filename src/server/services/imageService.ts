import 'server-only';
import { Category, ContentType } from '@/types';

/**
 * Returns a standardized accessibility description for category-based placeholders
 * e.g. "Technology news", "Entertainment recommendation", "Space apod"
 */
export function getCategoryPlaceholderAlt(category: Category | string = 'technology', type: ContentType | string = 'news'): string {
  const cat = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  return `${cat} ${type}`;
}
