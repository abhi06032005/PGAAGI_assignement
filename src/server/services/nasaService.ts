import 'server-only';
import env from '../env';
import serverCache from '../cache';
import { ApodItem } from '@/types';
import { normalizeContentItem } from './normalize';

interface NasaApodResponse {
  date: string;
  explanation: string;
  hdurl?: string;
  media_type: 'image' | 'video';
  service_version: string;
  title: string;
  url: string;
  copyright?: string;
}

const DEFAULT_APOD: ApodItem = {
  id: 'nasa-apod-default',
  type: 'apod',
  title: 'NGC 1499: The California Nebula',
  description: 'Drifting through the Orion Arm of the spiral Milky Way galaxy, this cosmic cloud echoes the outline of California on the US west coast.',
  summary: 'Drifting through the Orion Arm of the spiral Milky Way galaxy, this cosmic cloud echoes the outline of California on the US west coast.',
  imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
  imageAlt: 'NGC 1499: The California Nebula',
  source: 'NASA APOD',
  sourceName: 'NASA APOD',
  url: 'https://apod.nasa.gov/apod/astropix.html',
  publishedAt: new Date().toISOString(),
  timestamp: 'Today',
  tags: ['Space', 'Astrophysics', 'Cosmos'],
  category: 'space',
  isTrending: true,
  vibeScore: 0.95,
  date: new Date().toISOString().slice(0, 10),
  mediaType: 'image',
  copyright: 'NASA / JPL',
};

export async function fetchNasaApod(): Promise<ApodItem> {
  const cacheKey = 'nasa:apod:today';
  const cached = serverCache.get<ApodItem>(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://api.nasa.gov/planetary/apod?api_key=${env.NASA_API_KEY || 'DEMO_KEY'}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(6000), next: { revalidate: 43200 } });

    if (response.ok) {
      const data: NasaApodResponse = await response.json();
      const item = normalizeContentItem({
        id: `nasa-apod-${data.date}`,
        type: 'apod',
        title: data.title,
        description: data.explanation,
        imageUrl: data.hdurl || data.url,
        imageAlt: data.title,
        source: 'NASA APOD',
        url: data.hdurl || data.url,
        publishedAt: data.date,
        category: 'space',
        tags: ['Astronomy', 'Space', 'NASA'],
        date: data.date,
        mediaType: data.media_type,
        copyright: data.copyright || 'NASA',
        isTrending: true,
      }) as ApodItem;

      serverCache.set(cacheKey, item, 43200); // 12 hours
      return item;
    }
  } catch {
    // Fall through
  }

  serverCache.set(cacheKey, DEFAULT_APOD, 3600);
  return DEFAULT_APOD;
}
