import 'server-only';
import env from '../env';
import serverCache from '../cache';
import { RecommendationItem } from '@/types';
import { mockRecommendations } from '../mocks/recommendations';
import { normalizeContentItem } from './normalize';

interface TmdbMovie {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
}

const TMDB_GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

export async function fetchTmdbRecommendations(): Promise<RecommendationItem[]> {
  const cacheKey = 'tmdb:trending';
  const cached = serverCache.get<RecommendationItem[]>(cacheKey);
  if (cached) return cached;

  if (env.TMDB_API_KEY) {
    try {
      const url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${env.TMDB_API_KEY}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(6000), next: { revalidate: 3600 } });

      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const items: RecommendationItem[] = data.results.slice(0, 15).map((m: TmdbMovie) => {
            const movieTitle = m.title || m.name || 'Untitled';
            const releaseYear = (m.release_date || m.first_air_date || '2024').slice(0, 4);
            const posterUrl = m.poster_path
              ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
              : undefined;
            const backdropUrl = m.backdrop_path
              ? `https://image.tmdb.org/t/p/original${m.backdrop_path}`
              : undefined;

            const genres = (m.genre_ids || [])
              .map((id) => TMDB_GENRE_MAP[id])
              .filter(Boolean);

            return normalizeContentItem({
              id: `tmdb-${m.id}`,
              type: 'recommendation',
              subType: 'movie',
              title: movieTitle,
              description: m.overview || 'Critically acclaimed cinema selection.',
              imageUrl: posterUrl,
              backdropUrl,
              imageAlt: movieTitle,
              source: 'TMDB',
              url: `https://www.themoviedb.org/movie/${m.id}`,
              publishedAt: m.release_date || new Date().toISOString(),
              category: 'entertainment',
              tags: genres.length > 0 ? genres : ['Cinema', 'Popular'],
              rating: Number(m.vote_average.toFixed(1)),
              genre: genres.length > 0 ? genres : ['Feature Film'],
              releaseYear: parseInt(releaseYear, 10) || 2024,
              creator: 'The Movie Database',
              isTrending: m.vote_average > 7.5,
            }) as RecommendationItem;
          });

          if (items.length > 0) {
            serverCache.set(cacheKey, items, 3600); // 1 hour TTL
            return items;
          }
        }
      }
    } catch {
      // Fallback
    }
  }

  serverCache.set(cacheKey, mockRecommendations, 600);
  return mockRecommendations;
}
