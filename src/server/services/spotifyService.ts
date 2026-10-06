import 'server-only';
import { MusicItem, SpotifyArtist, SpotifyTrack } from '@/types';
import { mockMusicTracks } from '../mocks/music';
import { normalizeContentItem } from './normalize';
import serverCache from '../cache';

interface SpotifyApiTrack {
  id: string;
  name: string;
  artists: Array<{ name: string; id: string }>;
  album: {
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  duration_ms: number;
  preview_url: string | null;
  external_urls: { spotify: string };
}

interface SpotifyApiArtist {
  id: string;
  name: string;
  genres: string[];
  images: Array<{ url: string; height: number; width: number }>;
}

export async function fetchSpotifyNowPlaying(accessToken?: string): Promise<MusicItem | null> {
  if (!accessToken) {
    // Return null or first mock track as preview if offline
    return null;
  }

  try {
    const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });

    if (res.status === 204 || res.status > 400) {
      return null;
    }

    const data = await res.json();
    if (!data || !data.item) return null;

    const track: SpotifyApiTrack = data.item;
    const albumArt = track.album?.images?.[0]?.url || '';

    return normalizeContentItem({
      id: `spotify-now-${track.id}`,
      type: 'music',
      title: track.name,
      artist: track.artists.map((a) => a.name).join(', '),
      album: track.album.name,
      description: `${track.artists.map((a) => a.name).join(', ')} — ${track.album.name}`,
      imageUrl: albumArt,
      imageAlt: `${track.name} album cover`,
      source: 'Spotify',
      url: track.external_urls?.spotify || 'https://open.spotify.com',
      publishedAt: new Date().toISOString(),
      category: 'entertainment',
      tags: ['Now Playing', 'Spotify'],
      durationMs: track.duration_ms,
      progressMs: data.progress_ms || 0,
      previewUrl: track.preview_url,
      externalUrl: track.external_urls?.spotify,
      isPlaying: Boolean(data.is_playing),
      isTrending: true,
    }) as MusicItem;
  } catch {
    return null;
  }
}

export async function fetchSpotifyRecentlyPlayed(accessToken?: string): Promise<SpotifyTrack[]> {
  if (!accessToken) {
    return mockMusicTracks.map((m: MusicItem) => ({
      id: m.id,
      name: m.title,
      artists: [m.artist],
      album: m.album,
      albumArt: m.imageUrl || '',
      durationMs: m.durationMs || 180000,
      spotifyUrl: m.externalUrl,
    }));
  }

  const cacheKey = `spotify:recent:${accessToken.slice(-8)}`;
  const cached = serverCache.get<SpotifyTrack[]>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=10', {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.items && Array.isArray(data.items)) {
        const tracks: SpotifyTrack[] = data.items.map((item: { track: SpotifyApiTrack }) => {
          const t = item.track;
          return {
            id: t.id,
            name: t.name,
            artists: t.artists.map((a) => a.name),
            album: t.album.name,
            albumArt: t.album.images?.[0]?.url || '',
            durationMs: t.duration_ms,
            previewUrl: t.preview_url,
            spotifyUrl: t.external_urls?.spotify,
          };
        });

        serverCache.set(cacheKey, tracks, 60);
        return tracks;
      }
    }
  } catch {
    // Fallback
  }

  return mockMusicTracks.map((m: MusicItem) => ({
    id: m.id,
    name: m.title,
    artists: [m.artist],
    album: m.album,
    albumArt: m.imageUrl || '',
    durationMs: m.durationMs || 180000,
    spotifyUrl: m.externalUrl,
  }));
}

export async function fetchSpotifyTopArtists(accessToken?: string): Promise<SpotifyArtist[]> {
  if (!accessToken) {
    return [
      { id: 'artist-1', name: 'Daft Punk', genres: ['electronic', 'french touch'], imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80' },
      { id: 'artist-2', name: 'Tycho', genres: ['chillwave', 'ambient', 'electronic'], imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80' },
      { id: 'artist-3', name: 'Bonobo', genres: ['downtempo', 'electronica', 'chill'], imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80' },
    ];
  }

  const cacheKey = `spotify:artists:${accessToken.slice(-8)}`;
  const cached = serverCache.get<SpotifyArtist[]>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch('https://api.spotify.com/v1/me/top/artists?limit=6', {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.items && Array.isArray(data.items)) {
        const artists: SpotifyArtist[] = data.items.map((art: SpotifyApiArtist) => ({
          id: art.id,
          name: art.name,
          genres: art.genres,
          imageUrl: art.images?.[0]?.url,
        }));

        serverCache.set(cacheKey, artists, 3600);
        return artists;
      }
    }
  } catch {
    // Fallback
  }

  return [
    { id: 'artist-1', name: 'Daft Punk', genres: ['electronic', 'french touch'], imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80' },
    { id: 'artist-2', name: 'Tycho', genres: ['chillwave', 'ambient', 'electronic'], imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80' },
  ];
}

export async function fetchMusicRecommendations(accessToken?: string): Promise<MusicItem[]> {
  if (!accessToken) {
    return mockMusicTracks;
  }

  const cacheKey = `spotify:rec:${accessToken.slice(-8)}`;
  const cached = serverCache.get<MusicItem[]>(cacheKey);
  if (cached) return cached;

  try {
    const topArtists = await fetchSpotifyTopArtists(accessToken);
    const topArtistName = topArtists[0]?.name || 'Tycho';

    // Search catalog using top artist name (avoids audio-features and popularity deprecations)
    const res = await fetch(
      `https://api.spotify.com/v1/search?q=artist:${encodeURIComponent(topArtistName)}&type=track&limit=8`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        next: { revalidate: 1800 },
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (data.tracks?.items && Array.isArray(data.tracks.items)) {
        const items: MusicItem[] = data.tracks.items.map((t: SpotifyApiTrack) => {
          return normalizeContentItem({
            id: `spotify-curated-${t.id}`,
            type: 'music',
            title: t.name,
            artist: t.artists.map((a) => a.name).join(', '),
            album: t.album.name,
            description: `Curated from ${topArtistName} catalog matching your taste.`,
            imageUrl: t.album.images?.[0]?.url || '',
            imageAlt: `${t.name} cover`,
            source: 'Spotify',
            url: t.external_urls?.spotify || 'https://open.spotify.com',
            publishedAt: new Date().toISOString(),
            category: 'entertainment',
            tags: ['Music', 'Spotify', topArtistName],
            durationMs: t.duration_ms,
            previewUrl: t.preview_url,
            externalUrl: t.external_urls?.spotify,
            isTrending: true,
          }) as MusicItem;
        });

        if (items.length > 0) {
          serverCache.set(cacheKey, items, 1800);
          return items;
        }
      }
    }
  } catch {
    // Fallback
  }

  serverCache.set(cacheKey, mockMusicTracks, 600);
  return mockMusicTracks;
}
