import 'server-only';
import env from '../env';
import serverCache from '../cache';
import { NewsItem, Category } from '@/types';
import { mockNewsArticles } from '../mocks/news';
import { getCategoryPlaceholderAlt } from './imageService';
import { normalizeContentItem } from './normalize';

interface NewsApiArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export async function fetchNewsArticles(category?: Category): Promise<NewsItem[]> {
  const cacheKey = `news:${category || 'all'}`;
  const cached = serverCache.get<NewsItem[]>(cacheKey);
  if (cached) return cached;

  if (env.NEWS_API_KEY) {
    try {
      const newsCategory = category && category !== 'all' && category !== 'space' ? (category === 'finance' ? 'business' : category) : 'technology';
      const url = `https://newsapi.org/v2/top-headlines?country=us&category=${newsCategory}&pageSize=15&apiKey=${env.NEWS_API_KEY}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(6000), next: { revalidate: 900 } });

      if (response.ok) {
        const data = await response.json();
        if (data.articles && data.articles.length > 0) {
          const items: NewsItem[] = data.articles
            .filter((art: NewsApiArticle) => art.title && art.title !== '[Removed]')
            .map((art: NewsApiArticle, index: number) => {
              const imageUrl = art.urlToImage || undefined;
              const effectiveCategory = category && category !== 'all' ? category : 'technology';
              const imageAlt = imageUrl ? art.title : getCategoryPlaceholderAlt(effectiveCategory, 'news');

              return normalizeContentItem({
                id: `news-api-${encodeURIComponent(art.url)}`,
                type: 'news',
                title: art.title,
                description: art.description || art.title,
                imageUrl,
                imageAlt,
                source: art.source?.name || 'NewsAPI',
                url: art.url,
                publishedAt: art.publishedAt,
                category: effectiveCategory,
                tags: [art.source?.name || 'News', effectiveCategory],
                author: art.author || 'Staff Writer',
                readTimeMinutes: Math.floor(Math.random() * 4) + 2,
                isTrending: index < 3,
              }) as NewsItem;
            });

          if (items.length > 0) {
            serverCache.set(cacheKey, items, 900); // 15 min TTL
            return items;
          }
        }
      }
    } catch {
      // Fall through to mock
    }
  }

  // Fallback to high quality mock news
  let fallbackItems = [...mockNewsArticles];
  if (category && category !== 'all') {
    fallbackItems = fallbackItems.filter((i) => i.category === category);
    if (fallbackItems.length === 0) fallbackItems = [...mockNewsArticles];
  }

  serverCache.set(cacheKey, fallbackItems, 300);
  return fallbackItems;
}
