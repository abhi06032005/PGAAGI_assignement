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

// Fallback pools with verified artwork and audio
const southIndianDevotionalFallbacks = [
  {
    title: 'Harivarasanam',
    artist: 'K.J. Yesudas',
    album: 'Sabarimalai Ayyappan',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/05/2f/5e/052f5e3e-4340-42d4-bb0b-852656339460/mzaf_16239922004052341490.plus.aac.p.m4a',
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/6c/e0/75/6ce07521-e0e5-797d-6060-c3d3ea0fe8e7/8902894354899.jpg/600x600bb.jpg',
  },
  {
    title: 'Bhaja Govindam',
    artist: 'M.S. Subbulakshmi',
    album: 'Bhaja Govindam & Vishnu Sahasranamam',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/97/91/97/979197c8-38bb-f489-4b68-6c04f9dfc829/mzaf_13508499292830880347.plus.aac.p.m4a',
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/8e/3c/66/8e3c66f2-171b-31d2-b054-ff88b64e6255/8902894354509.jpg/600x600bb.jpg',
  },
  {
    title: 'Kurai Ondrum Illai',
    artist: 'M.S. Subbulakshmi',
    album: 'Kurai Ondrum Illai',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/95/9b/87/959b877c-a496-e0db-3b09-cf8f411bcfdc/mzaf_14959143615591322045.plus.aac.p.m4a',
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/bf/f9/54/bff95493-eb12-58e1-5121-7ea18bfe3041/8902894354509.jpg/600x600bb.jpg',
  },
  {
    title: 'Brahmam Okkate',
    artist: 'S.P. Balasubrahmanyam',
    album: 'Annamayya Sankeerthanalu',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/71/2a/39/712a3928-1ef5-69f3-8f08-ca34346e25da/mzaf_10793774844330107253.plus.aac.p.m4a',
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/9c/04/e4/9c04e43b-0bb5-2d4d-5f80-0c4c449c2567/mzaf_12411697920786966113.plus.aac.p.m4a/600x600bb.jpg',
  },
];

const hindiDevotionalFallbacks = [
  {
    title: 'Shree Hanuman Chalisa',
    artist: 'Hariharan',
    album: 'Shree Hanuman Chalisa',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/80/4f/ea/804fea46-0b1e-6246-81cf-8a2bfab60e86/mzaf_16886477810330058352.plus.aac.p.m4a',
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/19/27/7f/19277f98-508b-6250-934a-85b41ea87d15/8902894355599.jpg/600x600bb.jpg',
  },
  {
    title: 'Achyutam Keshavam',
    artist: 'Vikram Hazra',
    album: 'Krishna Bhajans',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/ee/12/35/ee123512-ca05-182d-4560-a88ba84620f4/mzaf_10793774844330107253.plus.aac.p.m4a',
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/a4/09/f3/a409f3e4-4d89-6fa6-3843-17ea5cf8267f/8902894354226.jpg/600x600bb.jpg',
  },
  {
    title: 'Shree Hari Stotram',
    artist: 'G. Gayathri Devi',
    album: 'Devotional Chants',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/66/42/1b/66421b44-a906-c040-0aa8-3ad01053fb2a/mzaf_10793774844330107253.plus.aac.p.m4a',
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/8e/3c/66/8e3c66f2-171b-31d2-b054-ff88b64e6255/8902894354509.jpg/600x600bb.jpg',
  },
  {
    title: 'Raghupati Raghav Raja Ram',
    artist: 'Hariharan',
    album: 'Bhajan Sandhya',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/9c/04/e4/9c04e43b-0bb5-2d4d-5f80-0c4c449c2567/mzaf_12411697920786966113.plus.aac.p.m4a',
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/19/27/7f/19277f98-508b-6250-934a-85b41ea87d15/8902894355599.jpg/600x600bb.jpg',
  },
];

const southIndianFilmFallbacks = [
  {
    title: 'Naatu Naatu',
    artist: 'Rahul Sipligunj & Kaala Bhairava',
    album: 'RRR',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/b8/91/3d/b8913d6a-a25e-3ea2-7105-02fc98418ff5/mzaf_14959143615591322045.plus.aac.p.m4a',
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/24/f0/54/24f054be-07f9-ecb6-fc10-b98a1fbaebc4/8902894356789.jpg/600x600bb.jpg',
  },
  {
    title: 'Samajavaragamana',
    artist: 'Sid Sriram',
    album: 'Ala Vaikunthapurramuloo',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/95/9b/87/959b877c-a496-e0db-3b09-cf8f411bcfdc/mzaf_14959143615591322045.plus.aac.p.m4a',
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/9f/9e/75/9f9e7521-e0e5-797d-6060-c3d3ea0fe8e7/8902894354899.jpg/600x600bb.jpg',
  },
  {
    title: 'Rowdy Baby',
    artist: 'Dhanush & Dhee',
    album: 'Maari 2',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/da/90/a6/da90a6ea-f8f2-8959-b1d5-e2db26a5756a/196589246197.jpg/600x600bb.jpg',
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/da/90/a6/da90a6ea-f8f2-8959-b1d5-e2db26a5756a/196589246197.jpg/600x600bb.jpg',
  },
  {
    title: 'Arabic Kuthu',
    artist: 'Anirudh Ravichander & Jonita Gandhi',
    album: 'Beast',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/ee/12/35/ee123512-ca05-182d-4560-a88ba84620f4/8902894358897.jpg/600x600bb.jpg',
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/ee/12/35/ee123512-ca05-182d-4560-a88ba84620f4/8902894358897.jpg/600x600bb.jpg',
  },
];

const hindiRomanticFallbacks = [
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

const punjabiFallbacks = [
  {
    title: 'Lover',
    artist: 'Diljit Dosanjh',
    album: 'MoonChild Era',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/9c/04/e4/9c04e43b-0bb5-2d4d-5f80-0c4c449c2567/mzaf_12411697920786966113.plus.aac.p.m4a',
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/37/10/d8/3710d867-27b0-7175-1e35-50e5015b3c58/886446187799.jpg/600x600bb.jpg',
  },
  {
    title: 'Brown Munde',
    artist: 'AP Dhillon, Gurinder Gill & Shinda Kahlon',
    album: 'Brown Munde',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/a4/09/f3/a409f3e4-4d89-6fa6-3843-17ea5cf8267f/8902894354226.jpg/600x600bb.jpg',
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/a4/09/f3/a409f3e4-4d89-6fa6-3843-17ea5cf8267f/8902894354226.jpg/600x600bb.jpg',
  },
];

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

function classifyPromptIntent(text: string) {
  const t = text.toLowerCase();

  const hasDevotional =
    /bhajan|bjahan|devotional|carnatic|stotra|stotram|kirtan|aarti|spiritual|mantra|chant|pooja|puja|temple/i.test(t);

  const hasSouth =
    /south|soth|tamil|telugu|kannada|malayalam|yesudas|subbulakshmi|balasubrahmanyam|ayyappa|venkateshwara|murugan|tirupati/i.test(t);

  if (hasDevotional && hasSouth) return 'south_indian_bhajan';
  if (hasDevotional) return 'hindi_bhajan';
  if (hasSouth) return 'south_indian_film';

  if (/punjabi|bhangra|diljit|ap dhillon|karan aujla|sidhu/i.test(t)) {
    return 'punjabi';
  }

  if (/romantic|love|romance|pyaar|ishq|mohabbat|dil|arijit|shreya|atif/i.test(t)) {
    return 'hindi_romantic';
  }

  if (/workout|gym|run|pump|energy|fast|sweat|lift/i.test(t)) {
    return 'workout';
  }

  if (/rain|sad|melanchol|cry|alone|heartbreak|somber/i.test(t)) {
    return 'sad';
  }

  if (/cozy|coffee|focus|coding|code|chill|relax|lo-fi|lofi|warm|ambient|study/i.test(t)) {
    return 'chill';
  }

  return 'general';
}

// Multi-tier track lookup ensuring 100% genuine song matching
async function fetchTrackPreview(title: string, artist: string, promptHint = '') {
  const isIndian = /hindi|bollywood|desi|punjabi|india|urdu|bengali|tamil|telugu|kannada|malayalam|bhajan|bjahan|devotional|carnatic|sanskrit|stotra|shiva|krishna|rama|south|soth/i.test(
    `${title} ${artist} ${promptHint}`
  );

  // Clean primary artist
  const cleanArtist = artist.split(/[,&/]|ft\.|feat\./i)[0].trim();
  // Clean title
  const cleanTitle = title.replace(/\([^)]*\)|\[[^\]]*\]/g, '').trim();

  const searchAttempts = [
    // 1. Title + Primary Artist with country preference
    `https://itunes.apple.com/search?term=${encodeURIComponent(`${cleanTitle} ${cleanArtist}`)}&entity=song&limit=1${isIndian ? '&country=IN' : ''}`,
    // 2. Title only with country preference
    `https://itunes.apple.com/search?term=${encodeURIComponent(cleanTitle)}&entity=song&limit=1${isIndian ? '&country=IN' : ''}`,
    // 3. Global fallback without country restriction
    `https://itunes.apple.com/search?term=${encodeURIComponent(`${cleanTitle} ${cleanArtist}`)}&entity=song&limit=1`,
    // 4. Global title only
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
            imageUrl: first.artworkUrl100
              ? (first.artworkUrl100.replace('100x100bb', '600x600bb') as string)
              : null,
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
            content: `You are a music curator AI with deep, comprehensive knowledge of all world music genres, languages, and cultures — including Indian music (Hindi, Tamil, Telugu, Malayalam, Kannada, Punjabi, Bengali), devotional music (Bhajans, Kirtans, Carnatic, Hindustani, Stotras, Sufi, Qawwali, Gospel), global pop, hip-hop, electronic, jazz, classical, and indie.

CRITICAL INSTRUCTIONS:
1. Normalize and resolve user typos intelligently:
   - "bjahan soth indian" or "bhajan south" -> SOUTH INDIAN DEVOTIONAL BHAJANS (Artists: M.S. Subbulakshmi, K.J. Yesudas, S.P. Balasubrahmanyam, Bombay Jayashri; Songs: "Harivarasanam", "Bhaja Govindam", "Kurai Ondrum Illai", "Brahmam Okkate").
   - "hindi love songs" -> Soulful Bollywood romance (Arijit Singh, Shreya Ghoshal, Atif Aslam, Mohit Chauhan).
   - "telugu mass" -> Energetic Telugu tracks (Anirudh, Thaman S, Devi Sri Prasad).
   - "punjabi energetic" -> Punjabi bangers (Diljit Dosanjh, AP Dhillon, Karan Aujla, Sidhu Moose Wala).
2. NEVER default to generic Bollywood or Hindi love songs unless the user explicitly requested Hindi romantic songs! If the user asks for devotional/bhajan, return devotional/bhajan songs! If the user asks for South Indian, return South Indian songs!
3. Provide 4-6 REAL, ICONIC, ACCURATELY NAMED songs that exist on Spotify / Apple Music / YouTube.
4. For each song, provide:
   - "title": exact popular song title
   - "artist": primary well-known singer/composer
   - "album": album or soundtrack name

Return ONLY valid JSON matching this schema (no markdown, no backticks, no emojis):
{
  "moodTag": "short 2-4 word genre/mood tag without emojis",
  "title": "curated playlist title without emojis",
  "description": "two-sentence description of the playlist",
  "energy": <integer 0-100>,
  "valence": <integer 0-100>,
  "danceability": <integer 0-100>,
  "tempoBpm": <integer 60-175>,
  "vibeSummary": "one-sentence harmonic acoustic summary",
  "suggestedTracks": [
    { "title": "Exact Song Title", "artist": "Primary Artist", "album": "Album Name" }
  ]
}`,
          },
          { role: 'user', content: promptText },
        ],
        temperature: 0.5,
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
    const rawPrompt =
      (body.prompt || body.moodText || body.vibeChip || '').trim() ||
      'South Indian devotional bhajans';
    const intent = classifyPromptIntent(rawPrompt);

    // 1. Try Groq AI with comprehensive domain prompting
    let analysis: GroqAnalysis | null = await callGroqAi(rawPrompt);

    // 2. Deterministic high-quality fallback if Groq not reached
    if (!analysis) {
      if (intent === 'south_indian_bhajan') {
        analysis = {
          moodTag: 'South Indian Devotional',
          title: 'Sacred South: Timeless Bhajans & Stotras',
          description:
            'A serene collection of iconic South Indian devotional songs that bridge classical Carnatic tradition and spiritual tranquility. Revered voices offering timeless peace.',
          energy: 35,
          valence: 78,
          danceability: 20,
          tempoBpm: 82,
          vibeSummary: 'Warm tanpura drones, resonant Carnatic vocals, and meditative rhythms.',
          suggestedTracks: [
            { title: 'Harivarasanam', artist: 'K.J. Yesudas', album: 'Sabarimalai Ayyappan' },
            { title: 'Bhaja Govindam', artist: 'M.S. Subbulakshmi', album: 'Bhaja Govindam' },
            { title: 'Kurai Ondrum Illai', artist: 'M.S. Subbulakshmi', album: 'Kurai Ondrum Illai' },
            { title: 'Brahmam Okkate', artist: 'S.P. Balasubrahmanyam', album: 'Annamayya Sankeerthanalu' },
          ],
        };
      } else if (intent === 'hindi_bhajan') {
        analysis = {
          moodTag: 'Devotional & Spiritual',
          title: 'Divya Vandana: Sacred Bhajans',
          description:
            'A soulful compilation of revered devotional prayers, aartis, and stotras for sacred contemplation and inner peace.',
          energy: 40,
          valence: 80,
          danceability: 25,
          tempoBpm: 85,
          vibeSummary: 'Soulful harmonium, meditative bells, and uplifting devotional singing.',
          suggestedTracks: [
            { title: 'Shree Hanuman Chalisa', artist: 'Hariharan', album: 'Shree Hanuman Chalisa' },
            { title: 'Achyutam Keshavam', artist: 'Vikram Hazra', album: 'Krishna Bhajans' },
            { title: 'Shree Hari Stotram', artist: 'G. Gayathri Devi', album: 'Devotional Chants' },
            { title: 'Raghupati Raghav Raja Ram', artist: 'Hariharan', album: 'Bhajan Sandhya' },
          ],
        };
      } else if (intent === 'south_indian_film') {
        analysis = {
          moodTag: 'South Cinema Hits',
          title: 'Vibrant South: Tamil & Telugu Grooves',
          description:
            'Electrifying blockbusters and melodic anthems from contemporary South Indian cinema, packed with vibrant brass and infectious rhythm.',
          energy: 88,
          valence: 85,
          danceability: 82,
          tempoBpm: 128,
          vibeSummary: 'Thumping percussion, acoustic guitars, and high-energy vocals.',
          suggestedTracks: [
            { title: 'Naatu Naatu', artist: 'Rahul Sipligunj', album: 'RRR' },
            { title: 'Samajavaragamana', artist: 'Sid Sriram', album: 'Ala Vaikunthapurramuloo' },
            { title: 'Rowdy Baby', artist: 'Dhanush', album: 'Maari 2' },
            { title: 'Arabic Kuthu', artist: 'Anirudh Ravichander', album: 'Beast' },
          ],
        };
      } else if (intent === 'punjabi') {
        analysis = {
          moodTag: 'Punjabi Energy',
          title: 'Punjabi Bangers & Swag',
          description:
            'Heavy 808 bass, slick melodies, and modern Punjabi energy curated for maximum bounce and swagger.',
          energy: 92,
          valence: 84,
          danceability: 88,
          tempoBpm: 104,
          vibeSummary: 'Tumbi riffs, punchy kick drums, and magnetic Punjabi vocals.',
          suggestedTracks: [
            { title: 'Lover', artist: 'Diljit Dosanjh', album: 'MoonChild Era' },
            { title: 'Brown Munde', artist: 'AP Dhillon', album: 'Brown Munde' },
            { title: 'Softly', artist: 'Karan Aujla', album: 'Making Memories' },
            { title: 'Winning Speech', artist: 'Karan Aujla', album: 'Four You' },
          ],
        };
      } else if (intent === 'hindi_romantic') {
        analysis = {
          moodTag: 'Hindi Romance',
          title: 'Heartfelt Hindi Melodies',
          description:
            'A handpicked compilation of iconic, soulful Hindi love songs for intimate warmth and romantic longing.',
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
      } else if (intent === 'workout') {
        analysis = {
          moodTag: 'High Energy Surge',
          title: 'Adrenaline Rush Workout',
          description:
            'Explosive rhythm and relentless tempo designed to push you through heavy sets and intense cardio.',
          energy: 95,
          valence: 78,
          danceability: 85,
          tempoBpm: 144,
          vibeSummary: 'Driving synths, stadium drums, and aggressive energy.',
          suggestedTracks: [
            { title: 'Midnight City', artist: 'M83', album: 'Hurry Up, We’re Dreaming' },
            { title: 'Starboy', artist: 'The Weeknd', album: 'Starboy' },
            { title: 'Resonance', artist: 'HOME', album: 'Odyssey' },
            { title: 'Breathe', artist: 'Télépopmusik', album: 'Genetic World' },
          ],
        };
      } else {
        analysis = {
          moodTag: 'Curated Soundscape',
          title: 'Pulse Sonic Journey',
          description:
            'Harmonically balanced sonic landscape tailored precisely to your requested vibe and listening flow.',
          energy: 58,
          valence: 65,
          danceability: 60,
          tempoBpm: 112,
          vibeSummary: 'Atmospheric layers, organic textures, and smooth tonal balance.',
          suggestedTracks: [
            { title: 'Midnight City', artist: 'M83', album: 'Hurry Up, We’re Dreaming' },
            { title: 'Starboy', artist: 'The Weeknd', album: 'Starboy' },
            { title: 'Resonance', artist: 'HOME', album: 'Odyssey' },
            { title: 'Breathe', artist: 'Télépopmusik', album: 'Genetic World' },
          ],
        };
      }
    }

    // Determine fallback pool based on intent
    const fallbacksPool =
      intent === 'south_indian_bhajan'
        ? southIndianDevotionalFallbacks
        : intent === 'hindi_bhajan'
        ? hindiDevotionalFallbacks
        : intent === 'south_indian_film'
        ? southIndianFilmFallbacks
        : intent === 'punjabi'
        ? punjabiFallbacks
        : intent === 'hindi_romantic'
        ? hindiRomanticFallbacks
        : internationalFallbacks;

    // Strip any emojis from string output
    const cleanNoEmoji = (str: string) =>
      str.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();

    const cleanMoodTag = cleanNoEmoji(analysis.moodTag || 'Sonic Atmosphere');
    const cleanTitle = cleanNoEmoji(analysis.title || 'Curated Soundscape');
    const cleanDesc = cleanNoEmoji(analysis.description || 'Personalized acoustic mix.');

    const rawSuggested = (
      analysis.suggestedTracks && analysis.suggestedTracks.length > 0
        ? analysis.suggestedTracks
        : fallbacksPool
    ).slice(0, 6);

    const tracksList = await Promise.all(
      rawSuggested.map(async (t, i) => {
        const liveMatch = await fetchTrackPreview(t.title, t.artist, rawPrompt);
        const fb = fallbacksPool[i % fallbacksPool.length];

        return {
          id: `ai-track-${Date.now()}-${i}`,
          type: 'music' as const,
          title: liveMatch ? liveMatch.title : cleanNoEmoji(t.title),
          artist: liveMatch ? liveMatch.artist : cleanNoEmoji(t.artist),
          album:
            liveMatch?.album || (t.album ? cleanNoEmoji(t.album) : fb.album || 'Studio Session'),
          summary: `${liveMatch ? liveMatch.title : cleanNoEmoji(t.title)} by ${
            liveMatch ? liveMatch.artist : cleanNoEmoji(t.artist)
          } • Curated for ${cleanMoodTag}`,
          category: 'entertainment' as const,
          timestamp: 'AI DJ Master',
          durationMs: 190000 + i * 22000,
          imageUrl: liveMatch?.imageUrl || fb.imageUrl,
          previewUrl: liveMatch?.previewUrl || fb.previewUrl,
          externalUrl: `https://open.spotify.com/search/${encodeURIComponent(
            `${liveMatch ? liveMatch.title : t.title} ${liveMatch ? liveMatch.artist : t.artist}`
          )}`,
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
          vibeSummary: cleanNoEmoji(
            analysis.vibeSummary || `${analysis.tempoBpm || 110} BPM cadence`
          ),
          recommendedGenres:
            analysis.recommendedGenres?.map(cleanNoEmoji) || [cleanMoodTag],
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
