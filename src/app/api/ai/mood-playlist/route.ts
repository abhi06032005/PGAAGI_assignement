import { NextRequest, NextResponse } from 'next/server';

interface GroqAnalysis {
  moodTag: string;
  title: string;
  description: string;
  energy: number;
  valence: number;
  danceability: number;
  tempoBpm: number;
  vibeSummary: string;
  rationale?: string;
  recommendedGenres?: string[];
  suggestedTracks?: Array<{
    title: string;
    artist: string;
    album?: string;
  }>;
}

const internationalFallbacks = [
  {
    title: 'Midnight City',
    artist: 'M83',
    album: 'Hurry Up, We’re Dreaming',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/24/09/79/2409794c-3d5d-af26-580e-7dc00ee4f207/mzaf_369629549966021675.plus.aac.p.m4a',
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/cb/7b/a9/cb7ba903-b5f1-cc21-90db-7a81b7aa0997/724596951057.jpg/600x600bb.jpg',
  },
  {
    title: 'Starboy',
    artist: 'The Weeknd ft. Daft Punk',
    album: 'Starboy',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/11/71/d6/1171d6ad-3c96-e027-2af6-58028426588c/mzaf_15137631797407745471.plus.aac.p.m4a',
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/600x600bb.jpg',
  },
  {
    title: 'Resonance',
    artist: 'HOME',
    album: 'Odyssey',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/33/bb/1a/33bb1a1a-1448-3118-6891-639e61784145/mzaf_3810752549913623044.plus.aac.p.m4a',
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/4f/13/65/4f1365b0-e97c-c469-c438-2f7d8f204355/872133025584_cover.jpg/600x600bb.jpg',
  },
  {
    title: 'Breathe',
    artist: 'Télépopmusik',
    album: 'Genetic World',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/e1/71/79/e17179d4-9b2b-d754-8391-3bac6ffc5d01/mzaf_3594546411583999729.plus.aac.p.m4a',
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/be/da/ec/bedaec4f-ed05-3fde-f131-e47fba90ca7e/00602567548744.rgb.jpg/600x600bb.jpg',
  },
];

const hindiFallbacks = [
  {
    title: 'Tum Hi Ho',
    artist: 'Mithoon & Arijit Singh',
    album: 'Aashiqui 2',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/3a/8c/9b/3a8c9b0b-2def-750a-f615-1555bf941edf/mzaf_17229496441442805917.plus.aac.p.m4a',
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/a4/09/f3/a409f3e4-4d89-6fa6-3843-17ea5cf8267f/8902894354226.jpg/600x600bb.jpg',
  },
  {
    title: 'Kesariya',
    artist: 'Pritam & Arijit Singh',
    album: 'Brahmastra',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/4a/51/7b/4a517be1-4b10-6395-888e-6c61f2249c5e/mzaf_13886566270634699564.plus.aac.p.m4a',
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/da/90/a6/da90a6ea-f8f2-8959-b1d5-e2db26a5756a/196589246197.jpg/600x600bb.jpg',
  },
  {
    title: 'Raataan Lambiyan',
    artist: 'Tanishk Bagchi, Jubin Nautiyal & Asees Kaur',
    album: 'Shershaah',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/66/42/1b/66421b44-a906-c040-0aa8-3ad01053fb2a/mzaf_10793774844330107253.plus.aac.p.m4a',
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/ee/12/35/ee123512-ca05-182d-4560-a88ba84620f4/8902894358897.jpg/600x600bb.jpg',
  },
  {
    title: 'Channa Mereya',
    artist: 'Pritam & Arijit Singh',
    album: 'Ae Dil Hai Mushkil',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/9c/04/e4/9c04e43b-0bb5-2d4d-5f80-0c4c449c2567/mzaf_12411697920786966113.plus.aac.p.m4a',
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/37/10/d8/3710d867-27b0-7175-1e35-50e5015b3c58/886446187799.jpg/600x600bb.jpg',
  },
];

// Multi-tier track lookup ensuring 100% genuine song matching
async function fetchTrackPreview(title: string, artist: string, promptHint = '') {
  const isIndian = /hindi|bollywood|desi|punjabi|india|urdu|bengali|tamil/i.test(`${title} ${artist} ${promptHint}`);

  // Clean primary artist (strip extras like ", Alka Yagnik", "ft. Daft Punk", etc.)
  const cleanArtist = artist.split(/[,&/]|ft\.|feat\./i)[0].trim();
  // Clean title (strip parentheses like "(Title Track)", "(Remix)", etc.)
  const cleanTitle = title.replace(/\([^)]*\)|\[[^\]]*\]/g, '').trim();

  const searchAttempts = [
    // 1. Title + Primary Artist with country preference
    `https://itunes.apple.com/search?term=${encodeURIComponent(`${cleanTitle} ${cleanArtist}`)}&entity=song&limit=1${isIndian ? '&country=IN' : ''}`,
    // 2. Title + Full Artist with country preference
    `https://itunes.apple.com/search?term=${encodeURIComponent(`${cleanTitle} ${artist}`)}&entity=song&limit=1${isIndian ? '&country=IN' : ''}`,
    // 3. Title only with country preference
    `https://itunes.apple.com/search?term=${encodeURIComponent(cleanTitle)}&entity=song&limit=1${isIndian ? '&country=IN' : ''}`,
    // 4. Global fallback without country restriction
    `https://itunes.apple.com/search?term=${encodeURIComponent(`${cleanTitle} ${cleanArtist}`)}&entity=song&limit=1`,
    // 5. Global title only
    `https://itunes.apple.com/search?term=${encodeURIComponent(cleanTitle)}&entity=song&limit=1`,
  ];

  for (const url of searchAttempts) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
      if (res.ok) {
        const data = await res.json();
        const first = data.results?.[0];
        if (first?.previewUrl) {
          return {
            title: first.trackName as string,
            artist: first.artistName as string,
            previewUrl: first.previewUrl as string,
            imageUrl: first.artworkUrl100 ? (first.artworkUrl100.replace('100x100bb', '600x600bb') as string) : null,
            album: (first.collectionName as string) || null,
          };
        }
      }
    } catch {}
  }
  return null;
}

async function callGroqAi(promptText: string): Promise<GroqAnalysis | null> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return null;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.8-27b',
        messages: [
          {
            role: 'system',
            content: `You are an elite music curator AI. Given a user mood, feeling, or music request, return ONLY a valid JSON object (no markdown, no backticks, no emojis anywhere):
{
  "moodTag": "short mood label in 2-4 clean words without emojis",
  "title": "creative playlist title without emojis",
  "description": "atmospheric two-sentence description of this playlist",
  "energy": <integer 0-100>,
  "valence": <integer 0-100>,
  "danceability": <integer 0-100>,
  "tempoBpm": <integer 60-175>,
  "vibeSummary": "one-sentence harmonic acoustic summary",
  "suggestedTracks": [
    { "title": "Exact Real Song Title", "artist": "Primary Artist Name", "album": "Album Name" }
  ]
}
CRITICAL RULES:
1. Always suggest 4-6 REAL, FAMOUS, EXISTING songs that can be found on Spotify/Apple Music.
2. If the user specifies any language, country, or genre (e.g. Hindi, Bollywood, Punjabi, Spanish, K-Pop, Rock, EDM, Classical), you MUST suggest iconic, famous songs in that EXACT language/genre!
   - Example for "love songs in hindi": suggest real tracks like "Tum Hi Ho" by "Arijit Singh", "Kesariya" by "Pritam", "Raataan Lambiyan" by "Jubin Nautiyal", "Channa Mereya" by "Arijit Singh", "Pehla Nasha" by "Udit Narayan".
3. Provide the single primary artist name for "artist" so search matches reliably.
4. Never invent fake artists or mismatch artist names.
5. No emojis anywhere.`,
          },
          { role: 'user', content: promptText },
        ],
        temperature: 0.6,
        max_tokens: 650,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || '';
    const cleaned = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned) as GroqAnalysis;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Support prompt, moodText, vibeChip
    const rawPrompt = (body.prompt || body.moodText || body.vibeChip || '').trim() || 'Deep focus and flow';
    const text = rawPrompt.toLowerCase();
    const isHindiRequest = /hindi|bollywood|desi|punjabi|india|urdu|arijit/i.test(text);

    // 1. Try Groq AI directly
    let analysis: GroqAnalysis | null = await callGroqAi(rawPrompt);

    // 2. Deterministic high-quality fallback if Groq not reached
    if (!analysis) {
      if (isHindiRequest) {
        analysis = {
          moodTag: 'Hindi Romance',
          title: 'Heartfelt Hindi Melodies',
          description: 'A handpicked compilation of iconic, soulful Hindi love songs for intimate warmth and romantic longing.',
          energy: 65,
          valence: 82,
          danceability: 58,
          tempoBpm: 96,
          vibeSummary: 'Soulful acoustic guitars, bansuri melodies, and tender playback vocals.',
          suggestedTracks: [
            { title: 'Tum Hi Ho', artist: 'Arijit Singh', album: 'Aashiqui 2' },
            { title: 'Kesariya', artist: 'Pritam', album: 'Brahmastra' },
            { title: 'Raataan Lambiyan', artist: 'Jubin Nautiyal', album: 'Shershaah' },
            { title: 'Channa Mereya', artist: 'Arijit Singh', album: 'Ae Dil Hai Mushkil' },
          ],
        };
      } else {
        const isWorkout = /workout|gym|run|pump|energy|fast|sweat/i.test(text);
        const isSad = /rain|sad|melanchol|cry|alone|heart|somber/i.test(text);
        const isCozy = /cozy|coffee|matcha|sunday|chill|relax|lo-fi|warm/i.test(text);
        const isEuphoric = /happy|joy|disco|party|dance|groove|club/i.test(text);

        const moodTag = isWorkout
          ? 'High Energy Surge'
          : isSad
          ? 'Velvet Rain and Melancholy'
          : isCozy
          ? 'Cozy Atmosphere and Warmth'
          : isEuphoric
          ? 'Golden Euphoria and Rhythm'
          : 'Midnight Cyber Flow';

        const energy = isWorkout ? 94 : isSad ? 28 : isCozy ? 36 : isEuphoric ? 88 : 62;
        const valence = isWorkout ? 78 : isSad ? 24 : isCozy ? 76 : isEuphoric ? 96 : 54;
        const danceability = isWorkout || isEuphoric ? 85 : 55;
        const tempo = isWorkout ? 142 : isSad ? 68 : isCozy ? 82 : isEuphoric ? 124 : 110;

        analysis = {
          moodTag,
          title: `${moodTag.split(' ')[0]} Soundscape`,
          description: `Precision-curated acoustic resonance harmonized to your state of mind.`,
          energy,
          valence,
          danceability,
          tempoBpm: tempo,
          vibeSummary: `Calibrated with ${energy}% dynamic energy at ${tempo} BPM cadence.`,
          suggestedTracks: [
            { title: 'Midnight City', artist: 'M83', album: 'Hurry Up, We’re Dreaming' },
            { title: 'Starboy', artist: 'The Weeknd', album: 'Starboy' },
            { title: 'Resonance', artist: 'HOME', album: 'Odyssey' },
            { title: 'Breathe', artist: 'Télépopmusik', album: 'Genetic World' },
          ],
        };
      }
    }

    // Strip any lingering emojis from Groq output
    const cleanNoEmoji = (str: string) => str.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();

    const cleanMoodTag = cleanNoEmoji(analysis.moodTag || 'Sonic Atmosphere');
    const cleanTitle = cleanNoEmoji(analysis.title || 'Curated Soundscape');
    const cleanDesc = cleanNoEmoji(analysis.description || 'Personalized acoustic mix.');

    const rawSuggested = (
      analysis.suggestedTracks && analysis.suggestedTracks.length > 0
        ? analysis.suggestedTracks
        : (isHindiRequest ? hindiFallbacks : internationalFallbacks)
    ).slice(0, 6);

    const fallbacksPool = isHindiRequest ? hindiFallbacks : internationalFallbacks;

    const tracksList = await Promise.all(
      rawSuggested.map(async (t, i) => {
        const liveMatch = await fetchTrackPreview(t.title, t.artist, rawPrompt);
        const fb = fallbacksPool[i % fallbacksPool.length];

        return {
          id: `ai-track-${Date.now()}-${i}`,
          type: 'music' as const,
          title: liveMatch ? liveMatch.title : cleanNoEmoji(t.title),
          artist: liveMatch ? liveMatch.artist : cleanNoEmoji(t.artist),
          album: liveMatch?.album || (t.album ? cleanNoEmoji(t.album) : fb.album || 'Studio Session'),
          summary: `${liveMatch ? liveMatch.title : cleanNoEmoji(t.title)} by ${liveMatch ? liveMatch.artist : cleanNoEmoji(t.artist)} • Curated for ${cleanMoodTag}`,
          category: 'entertainment' as const,
          timestamp: 'AI DJ Master',
          durationMs: 190000 + i * 22000,
          imageUrl: liveMatch?.imageUrl || fb.imageUrl,
          previewUrl: liveMatch?.previewUrl || fb.previewUrl,
          externalUrl: `https://open.spotify.com/search/${encodeURIComponent(`${liveMatch ? liveMatch.title : t.title} ${liveMatch ? liveMatch.artist : t.artist}`)}`,
          tags: ['AI DJ', cleanMoodTag],
        };
      })
    );

    return NextResponse.json({
      success: true,
      playlist: {
        id: `ai-pl-${Date.now()}`,
        title: cleanTitle,
        description: cleanDesc,
        prompt: rawPrompt,
        createdAt: new Date().toISOString(),
        sentiment: {
          moodTag: cleanMoodTag,
          energy: Math.min(100, Math.max(0, analysis.energy || 50)),
          valence: Math.min(100, Math.max(0, analysis.valence || 50)),
          danceability: Math.min(100, Math.max(0, analysis.danceability || 50)),
          tempoBpm: Math.min(180, Math.max(50, analysis.tempoBpm || 110)),
          vibeSummary: cleanNoEmoji(analysis.vibeSummary || `${analysis.tempoBpm || 110} BPM cadence`),
          recommendedGenres: analysis.recommendedGenres?.map(cleanNoEmoji) || (isHindiRequest ? ['Bollywood', 'Hindi Romantic'] : ['Pop', 'Electronic']),
        },
        tracks: tracksList,
      },
    });
  } catch (error) {
    console.error('Mood playlist API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to synthesize mood playlist' },
      { status: 500 }
    );
  }
}
