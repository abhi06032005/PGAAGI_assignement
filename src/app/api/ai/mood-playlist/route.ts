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
  rationale: string;
  recommendedGenres?: string[];
  suggestedTracks?: Array<{
    title: string;
    artist: string;
    album?: string;
  }>;
}

const fallbackTracks = [
  {
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/24/09/79/2409794c-3d5d-af26-580e-7dc00ee4f207/mzaf_369629549966021675.plus.aac.p.m4a',
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/cb/7b/a9/cb7ba903-b5f1-cc21-90db-7a81b7aa0997/724596951057.jpg/600x600bb.jpg',
  },
  {
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/11/71/d6/1171d6ad-3c96-e027-2af6-58028426588c/mzaf_15137631797407745471.plus.aac.p.m4a',
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/600x600bb.jpg',
  },
  {
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/33/bb/1a/33bb1a1a-1448-3118-6891-639e61784145/mzaf_3810752549913623044.plus.aac.p.m4a',
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/4f/13/65/4f1365b0-e97c-c469-c438-2f7d8f204355/872133025584_cover.jpg/600x600bb.jpg',
  },
  {
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/e1/71/79/e17179d4-9b2b-d754-8391-3bac6ffc5d01/mzaf_3594546411583999729.plus.aac.p.m4a',
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/be/da/ec/bedaec4f-ed05-3fde-f131-e47fba90ca7e/00602567548744.rgb.jpg/600x600bb.jpg',
  },
];

async function fetchTrackPreview(title: string, artist: string) {
  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(`${title} ${artist}`)}&entity=song&limit=1`;
    const res = await fetch(itunesUrl, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const data = await res.json();
      const first = data.results?.[0];
      if (first?.previewUrl) {
        return {
          previewUrl: first.previewUrl as string,
          imageUrl: first.artworkUrl100 ? (first.artworkUrl100.replace('100x100bb', '600x600bb') as string) : null,
          album: (first.collectionName as string) || null,
        };
      }
    }
  } catch {}
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
            content: `You are an elite music curator AI. Given a user mood or feeling, return ONLY a valid JSON object (no markdown, no backticks, no emojis anywhere):
{
  "moodTag": "short mood label in 2-4 clean words without emojis",
  "title": "creative playlist title without emojis",
  "description": "atmospheric two-sentence description of this sonic journey",
  "energy": <integer 0-100>,
  "valence": <integer 0-100>,
  "danceability": <integer 0-100>,
  "tempoBpm": <integer 60-175>,
  "vibeSummary": "one-sentence harmonic acoustic summary",
  "rationale": "insightful explanation of why this frequency profile matches their mental state",
  "recommendedGenres": ["Genre1", "Genre2", "Genre3"],
  "suggestedTracks": [
    { "title": "Track Name 1", "artist": "Artist 1", "album": "Album 1" },
    { "title": "Track Name 2", "artist": "Artist 2", "album": "Album 2" },
    { "title": "Track Name 3", "artist": "Artist 3", "album": "Album 3" },
    { "title": "Track Name 4", "artist": "Artist 4", "album": "Album 4" }
  ]
}`,
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
    const rawPrompt = body.moodText || body.vibeChip || 'Deep focus and flow';
    const text = rawPrompt.toLowerCase();

    // 1. Try Groq AI directly
    let analysis: GroqAnalysis | null = await callGroqAi(rawPrompt);

    // 2. Deterministic high-quality fallback if Groq not reached
    if (!analysis) {
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
        rationale: 'Harmonic keys and drum textures aligned to your requested frequency.',
        recommendedGenres: ['Electronic', 'Ambient', 'Indie', 'Neo-Classical'],
        suggestedTracks: [
          { title: 'Subtle Pulse', artist: 'Kiasmos', album: 'Blurred Elements' },
          { title: 'Solar Echoes', artist: 'Tycho', album: 'Epoch Vision' },
          { title: 'Midnight Current', artist: 'Bonobo', album: 'Fragments' },
          { title: 'Aura Cascade', artist: 'Jon Hopkins', album: 'Singularity' },
        ],
      };
    }

    // Strip any lingering emojis from Groq output
    const cleanNoEmoji = (str: string) => str.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();

    const cleanMoodTag = cleanNoEmoji(analysis.moodTag || 'Sonic Atmosphere');
    const cleanTitle = cleanNoEmoji(analysis.title || 'Curated Soundscape');
    const cleanDesc = cleanNoEmoji(analysis.description || 'Personalized acoustic mix.');

    const rawSuggested = (
      analysis.suggestedTracks && analysis.suggestedTracks.length > 0
        ? analysis.suggestedTracks
        : [
            { title: 'Midnight City', artist: 'M83', album: 'Hurry Up, We’re Dreaming' },
            { title: 'Starboy', artist: 'The Weeknd', album: 'Starboy' },
            { title: 'Resonance', artist: 'HOME', album: 'Odyssey' },
            { title: 'Breathe', artist: 'Télépopmusik', album: 'Genetic World' },
          ]
    ).slice(0, 4);

    const tracksList = await Promise.all(
      rawSuggested.map(async (t, i) => {
        const liveMatch = await fetchTrackPreview(t.title, t.artist);
        const fb = fallbackTracks[i % fallbackTracks.length];
        return {
          id: `ai-track-${Date.now()}-${i}`,
          type: 'music' as const,
          title: cleanNoEmoji(t.title),
          artist: cleanNoEmoji(t.artist),
          album: liveMatch?.album || (t.album ? cleanNoEmoji(t.album) : 'Studio Session'),
          summary: `${cleanNoEmoji(t.title)} by ${cleanNoEmoji(t.artist)} • Curated for ${cleanMoodTag}`,
          category: 'entertainment' as const,
          timestamp: 'AI DJ Master',
          durationMs: 190000 + i * 22000,
          imageUrl: liveMatch?.imageUrl || fb.imageUrl,
          previewUrl: liveMatch?.previewUrl || fb.previewUrl,
          externalUrl: `https://open.spotify.com/search/${encodeURIComponent(`${t.title} ${t.artist}`)}`,
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
          vibeSummary: cleanNoEmoji(analysis.vibeSummary || `${analysis.tempoBpm || 110} BPM atmospheric cadence`),
          recommendedGenres: analysis.recommendedGenres?.map(cleanNoEmoji) || ['Electronic', 'Downtempo'],
          rationale: cleanNoEmoji(analysis.rationale || 'Engineered for emotional resonance and sonic clarity.'),
        },
        tracks: tracksList,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to generate playlist' },
      { status: 500 }
    );
  }
}
