import 'server-only';
import { Category, ContentItem, ContentType, NormalizedContentItem } from '@/types';

export function normalizeContentItem(raw: {
  id: string;
  type: ContentType;
  title: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  source?: string;
  url?: string;
  publishedAt?: string;
  category?: Category;
  tags?: string[];
  isTrending?: boolean;
  vibeScore?: number;
  [key: string]: unknown;
}): ContentItem {
  const normalized: NormalizedContentItem = {
    id: raw.id,
    type: raw.type,
    title: raw.title,
    description: raw.description || '',
    summary: raw.description || raw.title, // alias
    imageUrl: raw.imageUrl || '',
    imageAlt: raw.imageAlt || raw.title,
    source: raw.source || 'Pulse',
    sourceName: raw.source || 'Pulse', // alias
    url: raw.url || '#',
    publishedAt: raw.publishedAt || new Date().toISOString(),
    timestamp: raw.publishedAt || 'Just now', // alias
    tags: raw.tags || [],
    category: raw.category || 'technology',
    isTrending: Boolean(raw.isTrending),
    vibeScore: raw.vibeScore ?? 0.8,
  };

  return {
    ...raw,
    ...normalized,
  } as ContentItem;
}
