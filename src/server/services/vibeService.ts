import 'server-only';
import { VibeData, VibeLabel, ContentItem } from '@/types';
import { fetchSpotifyTopArtists, fetchSpotifyRecentlyPlayed } from './spotifyService';

const GENRE_VIBE_MAP: Record<string, VibeLabel> = {
  // Chill
  ambient: 'Chill',
  chillwave: 'Chill',
  downtempo: 'Chill',
  acoustic: 'Chill',
  lofi: 'Chill',
  'lo-fi': 'Chill',
  soul: 'Chill',
  folk: 'Chill',
  indie: 'Chill',

  // Energetic
  pop: 'Energetic',
  dance: 'Energetic',
  edm: 'Energetic',
  rock: 'Energetic',
  workout: 'Energetic',
  punk: 'Energetic',

  // Focused
  classical: 'Focused',
  instrumental: 'Focused',
  jazz: 'Focused',
  soundtrack: 'Focused',
  electronic: 'Focused',
  minimal: 'Focused',

  // Feel-good
  disco: 'Feel-good',
  funk: 'Feel-good',
  reggae: 'Feel-good',
  rnb: 'Feel-good',
  'r&b': 'Feel-good',
  groove: 'Feel-good',

  // Hype
  hiphop: 'Hype',
  'hip hop': 'Hype',
  rap: 'Hype',
  trap: 'Hype',
  metal: 'Hype',
  techno: 'Hype',
  bass: 'Hype',
};

function getTimeOfDayVibeBias(): { preferred: VibeLabel; alt: VibeLabel } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return { preferred: 'Focused', alt: 'Chill' };
  } else if (hour >= 12 && hour < 18) {
    return { preferred: 'Energetic', alt: 'Feel-good' };
  } else if (hour >= 18 && hour < 22) {
    return { preferred: 'Chill', alt: 'Feel-good' };
  } else {
    return { preferred: 'Chill', alt: 'Hype' };
  }
}

export async function computeUserVibe(accessToken?: string): Promise<VibeData> {
  const topArtists = await fetchSpotifyTopArtists(accessToken);
  const recentTracks = await fetchSpotifyRecentlyPlayed(accessToken);

  const scores: Record<VibeLabel, number> = {
    Chill: 0,
    Energetic: 0,
    Focused: 0,
    'Feel-good': 0,
    Hype: 0,
  };

  const drivingArtistsSet = new Set<string>();

  // 1. Analyze artist genres
  for (const artist of topArtists) {
    drivingArtistsSet.add(artist.name);
    for (const genre of artist.genres) {
      const gLower = genre.toLowerCase();
      for (const [key, vibe] of Object.entries(GENRE_VIBE_MAP)) {
        if (gLower.includes(key)) {
          scores[vibe] += 2;
        }
      }
    }
  }

  // 2. Analyze recent tracks
  for (const track of recentTracks.slice(0, 5)) {
    if (track.artists[0]) {
      drivingArtistsSet.add(track.artists[0]);
    }
  }

  // 3. Apply time of day bias
  const timeBias = getTimeOfDayVibeBias();
  scores[timeBias.preferred] += 3;
  scores[timeBias.alt] += 1.5;

  // Rank vibes by score
  const sortedVibes = (Object.keys(scores) as VibeLabel[]).sort(
    (a, b) => scores[b] - scores[a]
  );

  const primaryVibe = sortedVibes[0] || 'Chill';
  const secondaryVibe = sortedVibes[1] || 'Feel-good';

  const vibeDescriptions: Record<VibeLabel, string> = {
    Chill: 'Smooth, relaxed rhythms and atmospheric sounds setting a peaceful cadence.',
    Energetic: 'Upbeat, high-drive selections keeping momentum and creativity flowing.',
    Focused: 'Minimalist clarity, deep instrumentals, and structured deep-work melodies.',
    'Feel-good': 'Warm grooves, uplifting harmonies, and comforting auditory sunshine.',
    Hype: 'High-voltage basslines, punchy delivery, and unmatched nighttime electric energy.',
  };

  return {
    primaryVibe,
    secondaryVibe,
    description: vibeDescriptions[primaryVibe],
    drivingArtists: Array.from(drivingArtistsSet).slice(0, 4),
  };
}

export function computeItemVibeScore(item: ContentItem, activeVibe: VibeLabel): number {
  let score = 0.5;

  switch (activeVibe) {
    case 'Chill':
      if (item.category === 'space' || item.type === 'apod') score += 0.4;
      if (item.category === 'entertainment') score += 0.2;
      break;
    case 'Focused':
      if (item.category === 'technology' || item.category === 'science') score += 0.4;
      if (item.type === 'news') score += 0.2;
      break;
    case 'Energetic':
      if (item.category === 'sports' || item.category === 'finance') score += 0.4;
      if (item.isTrending) score += 0.2;
      break;
    case 'Feel-good':
      if (item.type === 'music' || item.type === 'social') score += 0.4;
      break;
    case 'Hype':
      if (item.isTrending) score += 0.4;
      if (item.category === 'entertainment' || item.category === 'technology') score += 0.2;
      break;
  }

  return Math.min(1.0, score);
}
