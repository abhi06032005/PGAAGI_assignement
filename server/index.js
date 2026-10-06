const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;

app.use(cors());
app.use(express.json());

// Category backdrop images
const categoryImages = {
  technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
  finance: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80',
  sports: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
  entertainment: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
  health: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
  science: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
  space: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
};

// In-memory store for custom user-created items
const customFeedItems = [];

// ============================================================================
// GUARANTEED CATEGORY-SPECIFIC CURATED FALLBACK DATA
// ============================================================================
const categoryFallbackItems = {
  science: [
    {
      id: 'fb-sci-1',
      type: 'news',
      title: 'James Webb Space Telescope Uncovers Deep Cosmic Structures in Early Universe',
      summary: 'Astronomers utilizing infrared spectroscopic data have confirmed the discovery of structured galaxies forming just 300 million years after the Big Bang.',
      category: 'science',
      timestamp: 'Live Science',
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      source: 'Astrophysical Journal',
      sourceName: 'Astrophysical Journal',
      author: 'Dr. Sarah Webb',
      readTimeMinutes: 5,
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Deep Cosmic Infrared View',
      url: 'https://www.nasa.gov/mission_pages/webb/main/index.html',
      isTrending: true,
    },
    {
      id: 'fb-sci-2',
      type: 'news',
      title: 'CERN Detectors Observe Novel Quantum Particle Resonances in Proton Collisions',
      summary: 'Physicists at the Large Hadron Collider report high-confidence observations of rare tetraquark states expanding the standard model boundary.',
      category: 'science',
      timestamp: 'Quantum Dispatch',
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      source: 'CERN Research Bulletin',
      sourceName: 'CERN Bulletin',
      author: 'High Energy Physics Team',
      readTimeMinutes: 4,
      imageUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Particle Accelerator Glow',
      url: 'https://home.cern',
      isTrending: true,
    },
    {
      id: 'fb-sci-3',
      type: 'recommendation',
      subType: 'movie',
      title: 'Interstellar: The Physics of Gravitational Singularities',
      summary: 'Christopher Nolan and Nobel laureate Kip Thorne craft a breathtaking cinematic exploration of relativity, black holes, and the endurance of humanity.',
      category: 'science',
      timestamp: 'Cinema Spotlight',
      publishedAt: '2014-11-07',
      source: 'Syncopy / Paramount',
      sourceName: 'Paramount Pictures',
      rating: 8.7,
      genre: ['Sci-Fi', 'Theoretical Physics', 'Adventure'],
      releaseYear: 2014,
      creator: 'Christopher Nolan',
      imageUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      imageAlt: 'Interstellar Movie Poster',
      url: 'https://www.themoviedb.org/movie/157336-interstellar',
      isTrending: true,
    },
    {
      id: 'fb-sci-4',
      type: 'recommendation',
      subType: 'movie',
      title: 'Cosmos: Possible Worlds',
      summary: 'Ann Druyan and Neil deGrasse Tyson guide viewers through thirteen billion years of cosmic evolution and future scientific possibilities.',
      category: 'science',
      timestamp: 'Series Radar',
      publishedAt: '2020-03-09',
      source: 'National Geographic',
      sourceName: 'National Geographic',
      rating: 9.1,
      genre: ['Science Documentary', 'Cosmology'],
      releaseYear: 2020,
      creator: 'Ann Druyan',
      imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Cosmos Earth and Stars',
      url: 'https://www.nationalgeographic.com/tv/shows/cosmos-possible-worlds',
      isTrending: true,
    },
    {
      id: 'fb-sci-5',
      type: 'social',
      platform: 'mastodon',
      title: 'ESA Solar Orbiter transmits closest high-resolution coronal images yet taken #science',
      summary: 'The European Space Agency Solar Orbiter has completed its perihelion pass, revealing magnetic nanoflares in the corona at unprecedented detail. #science #astronomy #solar',
      category: 'science',
      timestamp: 'Live Post',
      publishedAt: new Date(Date.now() - 1800000).toISOString(),
      authorName: 'European Space Agency',
      authorHandle: '@esa_science',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      likesCount: 382,
      repostsCount: 142,
      commentsCount: 34,
      hashtags: ['#science', '#astronomy', '#space'],
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      source: 'Mastodon Science Wire',
      sourceName: 'Mastodon',
      url: 'https://mastodon.social',
      isTrending: true,
    },
  ],
  technology: [
    {
      id: 'fb-tech-1',
      type: 'news',
      title: 'Next-Gen Autonomous Agentic Architectures Reach Human-Level Code Synthesis',
      summary: 'Computer scientists unveil multi-agent cognitive pipelines demonstrating zero-shot debugging and self-healing systems across enterprise repositories.',
      category: 'technology',
      timestamp: 'AI Radar',
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      source: 'ArXiv Intelligence',
      sourceName: 'ArXiv AI',
      author: 'DeepMind / Research Team',
      readTimeMinutes: 4,
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Microprocessor circuitry',
      url: 'https://news.ycombinator.com',
      isTrending: true,
    },
    {
      id: 'fb-tech-2',
      type: 'recommendation',
      subType: 'movie',
      title: 'The Social Network',
      summary: 'David Fincher and Aaron Sorkin capture the chaotic dawn of algorithmic social networks in Cambridge dorm rooms.',
      category: 'technology',
      timestamp: 'Cinema Spotlight',
      publishedAt: '2010-10-01',
      source: 'Columbia Pictures',
      sourceName: 'Columbia Pictures',
      rating: 8.4,
      genre: ['Drama', 'Technology', 'Biography'],
      releaseYear: 2010,
      creator: 'David Fincher',
      imageUrl: 'https://image.tmdb.org/t/p/w500/n0ybibhJtQ5icDqTpTzbRytNDIg.jpg',
      imageAlt: 'The Social Network Poster',
      url: 'https://www.themoviedb.org/movie/37799-the-social-network',
      isTrending: true,
    },
    {
      id: 'fb-tech-3',
      type: 'recommendation',
      subType: 'movie',
      title: 'Silicon Valley: The Pied Piper Chronicles',
      summary: 'Mike Judge presents an incisive satirical deep dive into tech venture capital, lossy compression algorithms, and startup culture.',
      category: 'technology',
      timestamp: 'Series Radar',
      publishedAt: '2014-04-06',
      source: 'HBO Originals',
      sourceName: 'HBO',
      rating: 8.5,
      genre: ['Comedy', 'Technology', 'Startups'],
      releaseYear: 2014,
      creator: 'Mike Judge',
      imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Silicon Valley code terminals',
      url: 'https://www.hbo.com/silicon-valley',
      isTrending: true,
    },
    {
      id: 'fb-tech-4',
      type: 'social',
      platform: 'mastodon',
      title: 'Distributed systems benchmark: zero-copy networking in Rust yields 3x throughput #technology',
      summary: 'Benchmarked io_uring with kernel-bypass networking in Linux 6.12. Throughput jumped to 4.2 million packets/sec with deterministic sub-millisecond latencies! #technology #rust #systems',
      category: 'technology',
      timestamp: 'Live Post',
      publishedAt: new Date(Date.now() - 2500000).toISOString(),
      authorName: 'Alex Thorne',
      authorHandle: '@athorne_dev',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      likesCount: 294,
      repostsCount: 88,
      commentsCount: 22,
      hashtags: ['#technology', '#rust', '#systems'],
      imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      source: 'Mastodon Tech',
      sourceName: 'Mastodon',
      url: 'https://mastodon.social',
      isTrending: true,
    },
  ],
  finance: [
    {
      id: 'fb-fin-1',
      type: 'news',
      title: 'Global Central Banks Coordinate Policy Amidst Decelerating Inflation Signals',
      summary: 'Treasury bond markets rally as central banking executives outline forward guidance on interest rate trajectories and cross-border currency stabilization.',
      category: 'finance',
      timestamp: 'Market Watch',
      publishedAt: new Date(Date.now() - 4000000).toISOString(),
      source: 'Financial Times Desk',
      sourceName: 'Financial Times',
      author: 'Marcus Vance',
      readTimeMinutes: 4,
      imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Stock market financial chart',
      url: 'https://www.bloomberg.com',
      isTrending: true,
    },
    {
      id: 'fb-fin-2',
      type: 'recommendation',
      subType: 'movie',
      title: 'The Big Short: Inside the Doomsday Machine',
      summary: 'Adam McKay dramatizes Michael Lewis’s investigation into the eccentric outsiders who predicted the global credit default swap implosion.',
      category: 'finance',
      timestamp: 'Cinema Spotlight',
      publishedAt: '2015-12-23',
      source: 'Plan B / Paramount',
      sourceName: 'Paramount',
      rating: 7.9,
      genre: ['Biography', 'Comedy', 'Finance'],
      releaseYear: 2015,
      creator: 'Adam McKay',
      imageUrl: 'https://image.tmdb.org/t/p/w500/isuQ2gg1w3dHvfAvo6y0iQy6ta.jpg',
      imageAlt: 'The Big Short Poster',
      url: 'https://www.themoviedb.org/movie/318846-the-big-short',
      isTrending: true,
    },
    {
      id: 'fb-fin-3',
      type: 'recommendation',
      subType: 'movie',
      title: 'Succession: Corporate Dynasties and Boardroom Clashes',
      summary: 'Jesse Armstrong’s masterful drama dissects the ruthless high-stakes boardroom battles of the Roy family for control of Waystar Royco.',
      category: 'finance',
      timestamp: 'Series Radar',
      publishedAt: '2018-06-03',
      source: 'HBO Originals',
      sourceName: 'HBO',
      rating: 8.9,
      genre: ['Drama', 'Corporate Finance', 'Boardroom'],
      releaseYear: 2018,
      creator: 'Jesse Armstrong',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Corporate skyscraper',
      url: 'https://www.hbo.com/succession',
      isTrending: true,
    },
    {
      id: 'fb-fin-4',
      type: 'social',
      platform: 'mastodon',
      title: 'Macro outlook: institutional flows into sovereign wealth funds surge #finance',
      summary: 'Private equity buyout multiples have compressed 18% year-to-date while cash reserves in investment-grade debt reach a 10-year high. #finance #markets #economy',
      category: 'finance',
      timestamp: 'Live Post',
      publishedAt: new Date(Date.now() - 3200000).toISOString(),
      authorName: 'Sovereign Markets',
      authorHandle: '@sovereign_fin',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      likesCount: 184,
      repostsCount: 46,
      commentsCount: 15,
      hashtags: ['#finance', '#markets', '#economy'],
      imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
      source: 'Mastodon Finance',
      sourceName: 'Mastodon',
      url: 'https://mastodon.social',
      isTrending: true,
    },
  ],
  sports: [
    {
      id: 'fb-spo-1',
      type: 'news',
      title: 'UEFA Champions League Quarterfinal Draw Pairs European Giants in Rematch',
      summary: 'The European club football tournament sets up thrilling knockout fixtures under the lights with record international broadcast viewership.',
      category: 'sports',
      timestamp: 'Stadium Wire',
      publishedAt: new Date(Date.now() - 2800000).toISOString(),
      source: 'Sky Sports International',
      sourceName: 'Sky Sports',
      author: 'David Cross',
      readTimeMinutes: 3,
      imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Soccer stadium pitch',
      url: 'https://www.skysports.com',
      isTrending: true,
    },
    {
      id: 'fb-spo-2',
      type: 'recommendation',
      subType: 'movie',
      title: 'Formula 1: Drive to Survive',
      summary: 'Drivers, managers, and team owners live life in the fast lane — both on and off the high-speed track during each grueling Grand Prix season.',
      category: 'sports',
      timestamp: 'Series Radar',
      publishedAt: '2019-03-08',
      source: 'Box to Box Films / Netflix',
      sourceName: 'Netflix Sports',
      rating: 8.6,
      genre: ['Sports Documentary', 'Motorsport', 'Racing'],
      releaseYear: 2019,
      creator: 'James Gay-Rees',
      imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Formula 1 Grand Prix race car',
      url: 'https://www.netflix.com',
      isTrending: true,
    },
    {
      id: 'fb-spo-3',
      type: 'recommendation',
      subType: 'movie',
      title: 'Ford v Ferrari: The 24 Hours of Le Mans Battle',
      summary: 'Carroll Shelby and fearless racer Ken Miles battle corporate interference to build a revolutionary race car for Ford Motor Company at Le Mans 1966.',
      category: 'sports',
      timestamp: 'Cinema Spotlight',
      publishedAt: '2019-11-15',
      source: '20th Century Fox',
      sourceName: '20th Century Fox',
      rating: 8.1,
      genre: ['Drama', 'Biography', 'Motorsport'],
      releaseYear: 2019,
      creator: 'James Mangold',
      imageUrl: 'https://image.tmdb.org/t/p/w500/6ApDtO7xaVh8ugRe9679TC3D7RP.jpg',
      imageAlt: 'Ford v Ferrari poster',
      url: 'https://www.themoviedb.org/movie/359724-ford-v-ferrari',
      isTrending: true,
    },
    {
      id: 'fb-spo-4',
      type: 'social',
      platform: 'mastodon',
      title: 'Sub-2 hour marathon training camp reveals revolutionary threshold pacing #sports',
      summary: 'Elite distance runners testing dynamic lactating sensors in altitude training clocked a 2:01:14 simulation trial in Valencia today! #sports #athletics #running',
      category: 'sports',
      timestamp: 'Live Post',
      publishedAt: new Date(Date.now() - 3900000).toISOString(),
      authorName: 'Track & Field Global',
      authorHandle: '@athletics_track',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      likesCount: 240,
      repostsCount: 65,
      commentsCount: 19,
      hashtags: ['#sports', '#running', '#athletics'],
      imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
      source: 'Mastodon Sports',
      sourceName: 'Mastodon',
      url: 'https://mastodon.social',
      isTrending: true,
    },
  ],
  health: [
    {
      id: 'fb-hea-1',
      type: 'news',
      title: 'Phase 3 Clinical Trial Confirms Efficacy of Personalized mRNA Cancer Vaccine',
      summary: 'Oncology researchers report a 44% reduction in recurrence rates for melanoma patients receiving bespoke neoantigen mRNA therapy combined with immunotherapy.',
      category: 'health',
      timestamp: 'Medical Journal',
      publishedAt: new Date(Date.now() - 4200000).toISOString(),
      source: 'New England Journal of Medicine',
      sourceName: 'NEJM',
      author: 'Dr. Elena Rostova',
      readTimeMinutes: 4,
      imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Medical laboratory testing',
      url: 'https://www.nejm.org',
      isTrending: true,
    },
    {
      id: 'fb-hea-2',
      type: 'recommendation',
      subType: 'movie',
      title: 'Live to 100: Secrets of the Blue Zones',
      summary: 'Explorer Dan Buettner travels around the world to discover five unique communities where people live extraordinarily vibrant, long, and healthy lives.',
      category: 'health',
      timestamp: 'Series Radar',
      publishedAt: '2023-08-30',
      source: 'MakeMake / Netflix',
      sourceName: 'Netflix Wellness',
      rating: 8.0,
      genre: ['Docuseries', 'Health', 'Longevity'],
      releaseYear: 2023,
      creator: 'Dan Buettner',
      imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Serene yoga and wellness',
      url: 'https://www.netflix.com',
      isTrending: true,
    },
    {
      id: 'fb-hea-3',
      type: 'recommendation',
      subType: 'movie',
      title: 'The Mind, Explained: The Science of Memory, Dreams, and Focus',
      summary: 'Emma Stone narrates this illuminating journey inside the human brain, unpacking how neural connections form habits, manage anxiety, and generate thoughts.',
      category: 'health',
      timestamp: 'Cinema Spotlight',
      publishedAt: '2019-09-12',
      source: 'Vox Media / Netflix',
      sourceName: 'Vox',
      rating: 8.2,
      genre: ['Neuroscience', 'Psychology', 'Health'],
      releaseYear: 2019,
      creator: 'Vox Media',
      imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Brain neural imaging',
      url: 'https://www.netflix.com',
      isTrending: true,
    },
    {
      id: 'fb-hea-4',
      type: 'social',
      platform: 'mastodon',
      title: 'Circadian biology update: morning natural sunlight exposure anchors nocturnal melatonin #health',
      summary: 'Getting 10 to 15 minutes of outdoor sunlight within an hour of waking elevates cortisol at the right time and triggers optimal melatonin synthesis 14 hours later! #health #sleep #wellness',
      category: 'health',
      timestamp: 'Live Post',
      publishedAt: new Date(Date.now() - 3100000).toISOString(),
      authorName: 'Dr. Andrew Huberman Fan Lab',
      authorHandle: '@huberman_lab_notes',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      likesCount: 312,
      repostsCount: 94,
      commentsCount: 28,
      hashtags: ['#health', '#sleep', '#wellness'],
      imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
      source: 'Mastodon Health',
      sourceName: 'Mastodon',
      url: 'https://mastodon.social',
      isTrending: true,
    },
  ],
  entertainment: [
    {
      id: 'fb-ent-1',
      type: 'news',
      title: 'Cannes International Film Festival Unveils Visionary Official Selection',
      summary: 'Prestige filmmakers and global artists gather on the French Riviera to celebrate cinematic storytelling, independent documentaries, and premier feature films.',
      category: 'entertainment',
      timestamp: 'Festival Wire',
      publishedAt: new Date(Date.now() - 3500000).toISOString(),
      source: 'Variety Hollywood',
      sourceName: 'Variety',
      author: 'Rebecca Rubin',
      readTimeMinutes: 3,
      imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Cinema red carpet spotlight',
      url: 'https://variety.com',
      isTrending: true,
    },
    {
      id: 'fb-ent-2',
      type: 'recommendation',
      subType: 'movie',
      title: 'The Batman: Detective Noir on Gotham City Streets',
      summary: 'Robert Pattinson stars as Gotham’s vigilante detective navigating corrupt city institutions and tracking enigmatic serial clues.',
      category: 'entertainment',
      timestamp: 'Cinema Spotlight',
      publishedAt: '2022-03-04',
      source: 'Warner Bros. Pictures',
      sourceName: 'Warner Bros.',
      rating: 7.8,
      genre: ['Action', 'Crime', 'Mystery'],
      releaseYear: 2022,
      creator: 'Matt Reeves',
      imageUrl: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',
      imageAlt: 'The Batman Movie Poster',
      url: 'https://www.themoviedb.org/movie/414906-the-batman',
      isTrending: true,
    },
    {
      id: 'fb-ent-3',
      type: 'recommendation',
      subType: 'movie',
      title: 'Dune: Part Two',
      summary: 'Denis Villeneuve delivers an operatic sci-fi epic following Paul Atreides and the Fremen across the vast deserts of Arrakis.',
      category: 'entertainment',
      timestamp: 'Cinema Spotlight',
      publishedAt: '2024-03-01',
      source: 'Legendary / Warner Bros.',
      sourceName: 'Warner Bros.',
      rating: 8.5,
      genre: ['Sci-Fi', 'Adventure', 'Cinema'],
      releaseYear: 2024,
      creator: 'Denis Villeneuve',
      imageUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
      imageAlt: 'Dune Part Two Poster',
      url: 'https://www.themoviedb.org/movie/693134-dune-part-two',
      isTrending: true,
    },
    {
      id: 'fb-ent-4',
      type: 'social',
      platform: 'mastodon',
      title: 'Behind the camera: 70mm IMAX cinematography techniques with natural anamorphic flares #cinema',
      summary: 'Director of Photography shares lighting setups and mechanical lens rigs used on the latest historical epic. The organic textures are pure magic! #cinema #filmmaking #entertainment',
      category: 'entertainment',
      timestamp: 'Live Post',
      publishedAt: new Date(Date.now() - 2100000).toISOString(),
      authorName: 'Cinema Guild',
      authorHandle: '@cinemaguild_art',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      likesCount: 412,
      repostsCount: 120,
      commentsCount: 35,
      hashtags: ['#cinema', '#entertainment', '#movies'],
      imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
      source: 'Mastodon Cinema',
      sourceName: 'Mastodon',
      url: 'https://mastodon.social',
      isTrending: true,
    },
  ],
};

// ============================================================================
// 1. DYNAMIC REAL-TIME NEWS (NewsAPI + HackerNews Live + Spaceflight News)
// ============================================================================
async function getLiveNews(category = 'technology', search = '') {
  const liveItems = [];
  const newsApiKey = process.env.NEWS_API_KEY;
  const q = search ? search.trim() : '';
  const currentCategory = category !== 'all' ? category.toLowerCase() : 'technology';

  // 1A. NewsAPI (Live Everything Search or Top Headlines)
  if (newsApiKey) {
    try {
      let newsUrl = '';
      if (q) {
        newsUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&pageSize=12&sortBy=publishedAt&apiKey=${newsApiKey}`;
      } else {
        const catMap = {
          finance: 'business',
          science: 'science',
          technology: 'technology',
          sports: 'sports',
          entertainment: 'entertainment',
          health: 'health',
        };
        const apiCat = catMap[currentCategory] || 'technology';
        newsUrl = `https://newsapi.org/v2/top-headlines?country=us&category=${apiCat}&pageSize=12&apiKey=${newsApiKey}`;
      }

      const res = await fetch(newsUrl, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const json = await res.json();
        if (json.articles && Array.isArray(json.articles)) {
          json.articles
            .filter((a) => a.title && a.title !== '[Removed]')
            .slice(0, 8)
            .forEach((a, idx) => {
              liveItems.push({
                id: `newsapi-${encodeURIComponent(a.url || String(idx))}`,
                type: 'news',
                title: a.title,
                summary: a.description || a.content || 'Latest breaking reporting from international news desks.',
                category: currentCategory,
                timestamp: 'Live Wire',
                publishedAt: a.publishedAt || new Date().toISOString(),
                source: a.source?.name || 'NewsAPI Live',
                sourceName: a.source?.name || 'NewsAPI Live',
                author: a.author || 'Staff Journalist',
                readTimeMinutes: Math.max(2, Math.floor(Math.random() * 5) + 2),
                imageUrl: a.urlToImage || categoryImages[currentCategory] || categoryImages.technology,
                imageAlt: a.title,
                url: a.url || 'https://news.google.com',
                isTrending: idx < 2,
              });
            });
        }
      }
    } catch {
      // Continue to public live APIs
    }
  }

  // 1B. HackerNews Algolia Real-Time Search API (Free, Instant, Live)
  try {
    const categoryTerms = {
      technology: 'technology software ai',
      finance: 'finance markets economy',
      science: 'science physics astronomy biology',
      sports: 'sports athletics',
      health: 'health medicine wellness',
      entertainment: 'entertainment cinema film',
    };
    const term = q || categoryTerms[currentCategory] || currentCategory;
    const hnUrl = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(term)}&tags=story&hitsPerPage=8`;
    const res = await fetch(hnUrl, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (data.hits && Array.isArray(data.hits)) {
        data.hits.forEach((hit, idx) => {
          if (hit.title && !liveItems.some((i) => i.title.toLowerCase() === hit.title.toLowerCase())) {
            let hostname = 'Hacker News Live';
            try {
              if (hit.url) hostname = new URL(hit.url).hostname.replace('www.', '');
            } catch {}

            liveItems.push({
              id: `hn-${hit.objectID}`,
              type: 'news',
              title: hit.title,
              summary: `${hit.points || 140} verified points and ${hit.num_comments || 38} discussions covering latest ${currentCategory} breakthroughs.`,
              category: currentCategory,
              timestamp: 'Live Stream',
              publishedAt: hit.created_at || new Date().toISOString(),
              source: hostname,
              sourceName: hostname,
              author: hit.author || 'Desk Correspondent',
              readTimeMinutes: Math.max(2, Math.floor((hit.points || 90) / 45)),
              imageUrl: categoryImages[currentCategory] || categoryImages.technology,
              imageAlt: hit.title,
              url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
              isTrending: idx < 2,
            });
          }
        });
      }
    }
  } catch {}

  // 1C. Spaceflight News Live API (For science / space)
  if (currentCategory === 'science' || currentCategory === 'space' || /space|nasa|mars|moon|orbit/i.test(q)) {
    try {
      const spaceQuery = q ? `&search=${encodeURIComponent(q)}` : '';
      const spaceRes = await fetch(`https://api.spaceflightnewsapi.net/v4/articles/?limit=6${spaceQuery}`, { signal: AbortSignal.timeout(4000) });
      if (spaceRes.ok) {
        const data = await spaceRes.json();
        if (data.results && Array.isArray(data.results)) {
          data.results.forEach((art) => {
            if (!liveItems.some((i) => i.title.toLowerCase() === art.title.toLowerCase())) {
              liveItems.push({
                id: `space-${art.id}`,
                type: 'news',
                title: art.title,
                summary: art.summary || 'Live aerospace mission updates, orbital telemetry, and scientific observations.',
                category: 'science',
                timestamp: 'Live Science',
                publishedAt: art.published_at || new Date().toISOString(),
                source: art.news_site || 'Orbital Dispatch',
                sourceName: art.news_site || 'Orbital Dispatch',
                author: art.authors?.[0]?.name || 'Mission Control',
                readTimeMinutes: 4,
                imageUrl: art.image_url || categoryImages.science,
                imageAlt: art.title,
                url: art.url,
                isTrending: true,
              });
            }
          });
        }
      }
    } catch {}
  }

  return liveItems;
}

// ============================================================================
// 2. DYNAMIC REAL-TIME RECOMMENDATIONS (TMDB + TVMaze + Apple iTunes)
// ============================================================================
async function getLiveRecommendations(category = 'entertainment', search = '') {
  const liveItems = [];
  const q = search ? search.trim() : '';
  const currentCategory = category !== 'all' ? category.toLowerCase() : 'entertainment';
  const tmdbKey = process.env.TMDB_API_KEY;

  // 2A. TMDB API (Live Search or Category Movies)
  if (tmdbKey) {
    try {
      let tmdbUrl = '';
      if (q) {
        tmdbUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(q)}&api_key=${tmdbKey}`;
      } else {
        const categoryMovieQueries = {
          science: 'space',
          technology: 'cyber',
          finance: 'money',
          sports: 'sport',
          health: 'doctor',
          entertainment: '',
        };
        const queryTerm = categoryMovieQueries[currentCategory];
        if (queryTerm) {
          tmdbUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(queryTerm)}&api_key=${tmdbKey}`;
        } else {
          tmdbUrl = `https://api.themoviedb.org/3/trending/movie/week?api_key=${tmdbKey}`;
        }
      }

      const res = await fetch(tmdbUrl, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
          data.results.slice(0, 6).forEach((m) => {
            const title = m.title || m.name || 'Untitled';
            const year = (m.release_date || m.first_air_date || '2026').slice(0, 4);
            const poster = m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : undefined;
            const backdrop = m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : undefined;

            liveItems.push({
              id: `tmdb-${m.id}`,
              type: 'recommendation',
              subType: 'movie',
              title,
              summary: m.overview || 'Critically acclaimed cinematic performance.',
              category: currentCategory,
              timestamp: 'Cinema Spotlight',
              publishedAt: m.release_date || new Date().toISOString(),
              source: 'TMDB Spotlight',
              sourceName: 'TMDB',
              rating: Number((m.vote_average || 7.8).toFixed(1)),
              genre: ['Cinema', currentCategory],
              releaseYear: parseInt(year, 10) || 2026,
              creator: 'The Movie Database',
              imageUrl: poster || categoryImages[currentCategory] || categoryImages.entertainment,
              backdropUrl: backdrop,
              imageAlt: title,
              url: `https://www.themoviedb.org/movie/${m.id}`,
              isTrending: (m.vote_average || 0) > 7.5,
            });
          });
        }
      }
    } catch {}
  }

  // 2B. TVMaze Live Shows API (Instant TV & Entertainment Search)
  try {
    const showKeywords = {
      science: 'science',
      technology: 'technology',
      finance: 'money',
      sports: 'sport',
      health: 'doctor',
      entertainment: 'drama',
    };
    const showTerm = q || showKeywords[currentCategory] || currentCategory;
    const tvRes = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(showTerm)}`, { signal: AbortSignal.timeout(4000) });
    if (tvRes.ok) {
      const shows = await tvRes.json();
      if (Array.isArray(shows)) {
        shows.slice(0, 4).forEach((entry) => {
          const show = entry.show;
          if (show && show.name && !liveItems.some((i) => i.title.toLowerCase() === show.name.toLowerCase())) {
            const cleanSummary = show.summary ? show.summary.replace(/<[^>]*>?/gm, '') : 'Acclaimed episodic series.';
            liveItems.push({
              id: `tvmaze-${show.id}`,
              type: 'recommendation',
              subType: 'movie',
              title: show.name,
              summary: cleanSummary.length > 200 ? cleanSummary.slice(0, 200) + '...' : cleanSummary,
              category: currentCategory,
              timestamp: 'Series Radar',
              publishedAt: show.premiered || new Date().toISOString(),
              source: 'TVMaze Live',
              sourceName: 'TVMaze',
              rating: show.rating?.average || 8.2,
              genre: show.genres?.length ? show.genres : [currentCategory],
              releaseYear: show.premiered ? new Date(show.premiered).getFullYear() : 2026,
              creator: show.network?.name || 'Studio Production',
              imageUrl: show.image?.medium || show.image?.original || categoryImages[currentCategory] || categoryImages.entertainment,
              imageAlt: show.name,
              url: show.url,
              isTrending: (show.rating?.average || 0) > 8,
            });
          }
        });
      }
    }
  } catch {}

  // 2C. Apple iTunes Live Music Search API
  try {
    const musicKeywords = {
      science: 'ambient space',
      technology: 'synthwave cyberpunk',
      finance: 'classical focus',
      sports: 'workout high energy',
      health: 'meditation calm',
      entertainment: 'soundtrack cinema',
    };
    const musicTerm = q || musicKeywords[currentCategory] || currentCategory;
    const itunesRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(musicTerm)}&entity=album&limit=3`, { signal: AbortSignal.timeout(4000) });
    if (itunesRes.ok) {
      const itunesData = await itunesRes.json();
      if (itunesData.results && Array.isArray(itunesData.results)) {
        itunesData.results.forEach((alb) => {
          if (alb.collectionName && !liveItems.some((i) => i.title.toLowerCase() === alb.collectionName.toLowerCase())) {
            liveItems.push({
              id: `itunes-${alb.collectionId}`,
              type: 'music',
              title: alb.collectionName,
              summary: `Featured album by ${alb.artistName} with ${alb.trackCount || 10} tracks in ${alb.primaryGenreName || currentCategory}.`,
              category: currentCategory,
              timestamp: 'Music Spotlight',
              publishedAt: alb.releaseDate || new Date().toISOString(),
              source: 'Apple Music Live',
              sourceName: 'Apple Music',
              creator: alb.artistName,
              genre: [alb.primaryGenreName || currentCategory],
              releaseYear: alb.releaseDate ? new Date(alb.releaseDate).getFullYear() : 2026,
              imageUrl: alb.artworkUrl100 ? alb.artworkUrl100.replace('100x100bb', '600x600bb') : categoryImages[currentCategory],
              imageAlt: alb.collectionName,
              url: alb.collectionViewUrl || alb.artistViewUrl,
              isTrending: true,
            });
          }
        });
      }
    }
  } catch {}

  return liveItems;
}

// ============================================================================
// 3. DYNAMIC REAL-TIME SOCIAL (Mastodon Live Timeline & Search)
// ============================================================================
async function getLiveSocialPosts(category = 'technology', search = '') {
  const liveItems = [];
  const q = search ? search.trim() : '';
  const currentCategory = category !== 'all' ? category.toLowerCase() : 'technology';

  const categoryTags = {
    technology: 'technology',
    finance: 'finance',
    sports: 'sports',
    entertainment: 'cinema',
    health: 'health',
    science: 'science',
    space: 'astronomy',
  };

  const tag = q ? encodeURIComponent(q.replace(/^#/, '')) : categoryTags[currentCategory] || 'technology';

  try {
    const res = await fetch(`https://mastodon.social/api/v1/timelines/tag/${tag}?limit=8`, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const posts = await res.json();
      if (Array.isArray(posts)) {
        posts.forEach((p) => {
          if (p.content && p.account) {
            const rawText = p.content.replace(/<[^>]*>?/gm, '').trim();
            if (rawText.length > 15) {
              const snippet = rawText.length > 75 ? rawText.slice(0, 75) + '...' : rawText;

              liveItems.push({
                id: `social-${p.id}`,
                type: 'social',
                platform: 'mastodon',
                title: snippet,
                summary: rawText,
                category: currentCategory,
                timestamp: 'Live Post',
                publishedAt: p.created_at || new Date().toISOString(),
                authorName: p.account.display_name || p.account.username,
                authorHandle: `@${p.account.acct}`,
                authorAvatar: p.account.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
                verified: Boolean(p.account.bot === false),
                likesCount: p.favourites_count || 32,
                repostsCount: p.reblogs_count || 8,
                commentsCount: p.replies_count || 3,
                hashtags: p.tags?.length ? p.tags.map((t) => `#${t.name}`) : [`#${currentCategory}`],
                imageUrl: p.media_attachments?.[0]?.url || p.media_attachments?.[0]?.preview_url || undefined,
                imageAlt: `Post by ${p.account.display_name || p.account.username}`,
                source: 'Mastodon Live',
                sourceName: 'Mastodon',
                url: p.url,
                isTrending: (p.reblogs_count || 0) > 4,
              });
            }
          }
        });
      }
    }
  } catch {}

  return liveItems;
}

// ============================================================================
// EXPRESS API ROUTES
// ============================================================================

// 1. Unified Aggregated Feed (/api/feed)
app.get('/api/feed', async (req, res) => {
  try {
    const { category = 'all', types = 'all', search = '', trending, page = 1, limit = 12 } = req.query;
    const cat = category !== 'all' ? category.split(',')[0].trim().toLowerCase() : 'all';
    const q = typeof search === 'string' ? search.trim() : '';

    // Fetch from all sources
    const [news, recs, social] = await Promise.all([
      getLiveNews(cat, q),
      getLiveRecommendations(cat, q),
      getLiveSocialPosts(cat, q),
    ]);

    let allItems = [...customFeedItems, ...news, ...recs, ...social];

    // 1. Filter by Category strictly
    if (category && category !== 'all') {
      const allowedCategories = category.split(',').map((c) => c.trim().toLowerCase());
      allItems = allItems.filter((i) => allowedCategories.includes(i.category.toLowerCase()));

      // If live sources didn't return enough for this category, inject curated fallbacks!
      if (allItems.length < 8 && categoryFallbackItems[cat]) {
        const fallbacks = categoryFallbackItems[cat];
        fallbacks.forEach((fb) => {
          if (!allItems.some((existing) => existing.id === fb.id)) {
            allItems.push(fb);
          }
        });
      }
    } else {
      // If 'all', ensure rich mix across categories
      if (allItems.length < 12) {
        Object.values(categoryFallbackItems).flat().forEach((fb) => {
          if (!allItems.some((existing) => existing.id === fb.id)) {
            allItems.push(fb);
          }
        });
      }
    }

    // 2. Filter by Content Types
    if (types && types !== 'all') {
      const allowedTypes = types.split(',').map((t) => t.trim().toLowerCase());
      allItems = allItems.filter((i) => {
        if (allowedTypes.includes(i.type)) return true;
        if (allowedTypes.includes('movies') && i.type === 'recommendation') return true;
        if (allowedTypes.includes('recommendations') && i.type === 'recommendation') return true;
        return false;
      });

      // If user filtered by a specific type (e.g. movies / recommendation) and live is empty, pull type fallbacks
      if (allItems.length === 0 && cat !== 'all' && categoryFallbackItems[cat]) {
        const typeFallbacks = categoryFallbackItems[cat].filter((fb) => {
          if (allowedTypes.includes(fb.type)) return true;
          if (allowedTypes.includes('movies') && fb.type === 'recommendation') return true;
          if (allowedTypes.includes('recommendations') && fb.type === 'recommendation') return true;
          return false;
        });
        allItems = [...typeFallbacks];
      }
    }

    // 3. Filter by Trending
    if (trending === 'true') {
      allItems = allItems.filter((i) => i.isTrending);
    }

    // 4. Keyword search relevance sorting
    if (q) {
      const qLower = q.toLowerCase();
      allItems.sort((a, b) => {
        const aMatch = (a.title + ' ' + a.summary).toLowerCase().includes(qLower);
        const bMatch = (b.title + ' ' + b.summary).toLowerCase().includes(qLower);
        return Number(bMatch) - Number(aMatch);
      });
    }

    // 5. Pagination
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.max(1, parseInt(limit, 10) || 12);
    const total = allItems.length;
    const startIndex = (p - 1) * l;
    const paginated = allItems.slice(startIndex, startIndex + l);
    const hasMore = startIndex + l < total;

    res.json({
      success: true,
      backend: 'Express Decoupled Backend',
      category: cat,
      items: paginated,
      data: paginated,
      total,
      page: p,
      limit: l,
      hasMore,
      nextPage: hasMore ? p + 1 : null,
      isRealtime: true,
      sources: {
        customCount: customFeedItems.length,
        newsCount: news.length,
        recommendationsCount: recs.length,
        socialCount: social.length,
      },
    });
  } catch (error) {
    console.error('[Express /api/feed Error]:', error);
    res.status(500).json({ success: false, error: 'Live feed aggregation failed' });
  }
});

// 2. Custom Feed Items (Add Custom Things)
app.post('/api/custom-items', (req, res) => {
  try {
    const { title, summary, category = 'technology', type = 'news', url = '#', imageUrl, source = 'User Post' } = req.body;
    if (!title || !summary) {
      return res.status(400).json({ success: false, error: 'Title and summary are required' });
    }
    const cleanCategory = (category || 'technology').toLowerCase();
    const newItem = {
      id: `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: type || 'news',
      title: title.trim(),
      summary: summary.trim(),
      category: cleanCategory,
      timestamp: 'Custom Story',
      publishedAt: new Date().toISOString(),
      source: source || 'Custom Feed',
      sourceName: source || 'User Created',
      author: 'You',
      url: url || '#',
      imageUrl: imageUrl || categoryImages[cleanCategory] || categoryImages.technology,
      imageAlt: title,
      isTrending: true,
      isCustom: true,
    };
    customFeedItems.unshift(newItem);
    res.status(201).json({ success: true, item: newItem });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create custom item' });
  }
});

app.get('/api/custom-items', (req, res) => {
  res.json({ success: true, items: customFeedItems });
});

// 3. Live News Endpoint (/api/news)
app.get('/api/news', async (req, res) => {
  try {
    const { category = 'technology', search = '' } = req.query;
    const items = await getLiveNews(category, search);
    res.json({ success: true, count: items.length, items, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Live news fetch failed' });
  }
});

// 4. Live Recommendations Endpoint (/api/recommendations)
app.get('/api/recommendations', async (req, res) => {
  try {
    const { category = 'entertainment', search = '' } = req.query;
    const items = await getLiveRecommendations(category, search);
    res.json({ success: true, count: items.length, items, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Live recommendations fetch failed' });
  }
});

// 5. Live Social Media Endpoint (/api/social)
app.get('/api/social', async (req, res) => {
  try {
    const { category = 'technology', search = '' } = req.query;
    const items = await getLiveSocialPosts(category, search);
    res.json({ success: true, count: items.length, items, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Live social fetch failed' });
  }
});

// 6. Server-Sent Events (SSE) Stream (/api/stream)
app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  // Initial connection ACK
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`);

  // Stream live items every 6 seconds
  const pushRandomLiveItem = async () => {
    try {
      const categories = ['technology', 'science', 'finance', 'sports', 'entertainment', 'health'];
      const randomCat = categories[Math.floor(Math.random() * categories.length)];
      const items = await getLiveNews(randomCat);
      if (items.length > 0) {
        const sample = items[Math.floor(Math.random() * items.length)];
        const liveEvent = {
          type: 'FEED_UPDATE',
          timestamp: new Date().toISOString(),
          category: randomCat,
          item: {
            ...sample,
            id: `live-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            timestamp: 'Just now',
            publishedAt: new Date().toISOString(),
            isTrending: true,
          },
        };
        res.write(`data: ${JSON.stringify(liveEvent)}\n\n`);
      }
    } catch {}
  };

  const initialTimer = setTimeout(pushRandomLiveItem, 1500);
  const intervalId = setInterval(pushRandomLiveItem, 5000);

  req.on('close', () => {
    clearTimeout(initialTimer);
    clearInterval(intervalId);
    res.end();
  });
});

// ============================================================================
// 8. AI MOOD DJ — Powered by Groq LLM + Spotify Search
// ============================================================================

// Get a Spotify client-credentials access token
async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.access_token || null;
}

// Search Spotify for tracks matching a query
async function searchSpotifyTracks(query, token, limit = 8) {
  if (!token) return [];
  try {
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}&market=IN`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.tracks?.items || []).map((t) => ({
      id: `spotify-${t.id}`,
      type: 'music',
      title: t.name,
      artist: t.artists.map((a) => a.name).join(', '),
      album: t.album?.name || '',
      summary: `${t.artists.map((a) => a.name).join(', ')} — ${t.album?.name || ''}`,
      category: 'entertainment',
      timestamp: 'AI Mood DJ',
      publishedAt: t.album?.release_date || new Date().toISOString(),
      durationMs: t.duration_ms || 180000,
      imageUrl: t.album?.images?.[0]?.url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
      imageAlt: `${t.name} by ${t.artists[0]?.name}`,
      previewUrl: t.preview_url || null,
      externalUrl: t.external_urls?.spotify || `https://open.spotify.com/search/${encodeURIComponent(t.name)}`,
      source: 'Spotify',
      sourceName: 'Spotify',
      tags: ['AI Curated', 'Spotify'],
      isTrending: (t.popularity || 0) > 60,
      spotifyUri: t.uri,
    }));
  } catch {
    return [];
  }
}

// Ask Groq to deeply understand the mood prompt and return structured search queries
async function analyzeWithGroq(promptText) {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return null;

  const systemPrompt = `You are a world-class music curator AI. A user will describe how they feel or what they want to listen to. 
Your job is to:
1. Deeply understand their emotional state, context, and any language/genre preferences mentioned (e.g. "Hindi songs", "Bollywood", "Tamil", "English pop", etc.)
2. Return a JSON object with EXACTLY this structure (no markdown, pure JSON):
{
  "moodTag": "short mood label in 2-4 words",
  "title": "creative playlist title (no emojis)",
  "description": "2-sentence description of this playlist's vibe and feel",
  "energy": <0-100 integer>,
  "valence": <0-100 integer>,
  "danceability": <0-100 integer>,
  "tempoBpm": <integer BPM>,
  "vibeSummary": "one sentence acoustic/musical description",
  "rationale": "2 sentence explanation of why these music choices fit the emotion",
  "spotifyQueries": ["query1", "query2", "query3", "query4"],
  "recommendedGenres": ["genre1", "genre2", "genre3"]
}

The spotifyQueries MUST be specific, realistic Spotify search queries that will return real songs matching the emotion AND any language/genre specified.
If the user mentions Hindi/Bollywood/Tamil/etc, ALL queries must include that language/genre.
If the user mentions a specific scenario (falling in love, heartbreak, late night drive), pick songs that perfectly fit that feeling.
Examples of good queries: "Arijit Singh love song Hindi", "Tum Hi Ho", "AR Rahman romantic Hindi", "Khairiyat Arijit".`;

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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: promptText },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || '';
    // Strip any markdown code fences
    const cleaned = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

// Fallback keyword-based sentiment for when Groq is unavailable
function basicSentiment(text) {
  const t = text.toLowerCase();
  if (/gym|workout|run|energy|power|beast|pump/i.test(t)) {
    return { moodTag: 'High Energy', title: 'Power Session', description: 'High tempo tracks to fuel your energy.', energy: 88, valence: 72, danceability: 85, tempoBpm: 140, vibeSummary: 'Fast, powerful beats.', rationale: 'High BPM tracks for peak performance.', spotifyQueries: ['workout motivation', 'high energy gym', 'power training music', 'EDM workout'], recommendedGenres: ['EDM', 'Trap', 'Drum & Bass'] };
  }
  if (/hindi|bollywood|desi|indian/i.test(t)) {
    return { moodTag: 'Bollywood Vibes', title: 'Desi Mood', description: 'The best of Hindi and Bollywood music.', energy: 65, valence: 75, danceability: 70, tempoBpm: 100, vibeSummary: 'Rich melodic Hindi soundscapes.', rationale: 'AI selected top Hindi tracks for your mood.', spotifyQueries: ['Arijit Singh best songs', 'Hindi romantic hits', 'Bollywood 2024 hits', 'AR Rahman Hindi'], recommendedGenres: ['Bollywood', 'Hindi Pop', 'Desi'] };
  }
  if (/sad|heartbreak|miss|lonely|cry|depress|lost/i.test(t)) {
    return { moodTag: 'Melancholy', title: 'Quiet Hours', description: 'Songs that understand your sadness.', energy: 30, valence: 20, danceability: 25, tempoBpm: 72, vibeSummary: 'Soft, emotional and introspective.', rationale: 'Low tempo tracks with emotional resonance.', spotifyQueries: ['sad songs acoustic', 'heartbreak indie', 'emotional piano', 'melancholy slow'], recommendedGenres: ['Indie Folk', 'Acoustic', 'Sad Pop'] };
  }
  if (/love|romantic|crush|date|girl|boy|relationship/i.test(t)) {
    return { moodTag: 'Romantic', title: 'In Your Feelings', description: 'Warm, intimate songs for those tender moments.', energy: 50, valence: 80, danceability: 55, tempoBpm: 88, vibeSummary: 'Warm, intimate melodies.', rationale: 'Romantic tracks with emotional depth.', spotifyQueries: ['romantic love songs', 'intimate R&B', 'love ballad', 'soft romantic pop'], recommendedGenres: ['R&B', 'Soul', 'Romantic Pop'] };
  }
  return { moodTag: 'Chill Vibes', title: 'Easy Listening', description: 'Relaxed, easygoing music for any moment.', energy: 45, valence: 60, danceability: 50, tempoBpm: 90, vibeSummary: 'Mellow, balanced soundscape.', rationale: 'Balanced energy and calming rhythm.', spotifyQueries: ['chill vibes lofi', 'relaxing indie', 'easy listening', 'mellow acoustic'], recommendedGenres: ['Lo-Fi', 'Chill Pop', 'Indie'] };
}

const moodCatalogFallbacks = {
  workout: [
    {
      id: 'ai-track-wo-1',
      type: 'music',
      title: 'Titanium Rhythm',
      artist: 'Kavinsky & Daft Beats',
      album: 'Outrun Velocity',
      summary: 'Aggressive electro-industrial bassline built for peak heart rates.',
      category: 'entertainment',
      timestamp: 'AI Mood DJ',
      durationMs: 215000,
      imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
      previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      externalUrl: 'https://open.spotify.com/search/Titanium%20Rhythm',
      tags: ['EDM', 'Workout', 'Peak Energy', 'AI Curated'],
    },
    {
      id: 'ai-track-wo-2',
      type: 'music',
      title: 'Overdrive 140',
      artist: 'Ghost Data',
      album: 'Voidwalker',
      summary: 'Fast-paced drum and bass driving unstoppable forward motion.',
      category: 'entertainment',
      timestamp: 'AI Mood DJ',
      durationMs: 198000,
      imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
      previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      externalUrl: 'https://open.spotify.com/search/Overdrive%20140',
      tags: ['Drum & Bass', 'High Tempo', 'AI Curated'],
    },
    {
      id: 'ai-track-wo-3',
      type: 'music',
      title: 'Neon Power Surge',
      artist: 'Carpenter Brut',
      album: 'Trilogy Apex',
      summary: 'Heavy analog synthesizers pumping relentless rhythm.',
      category: 'entertainment',
      timestamp: 'AI Mood DJ',
      durationMs: 232000,
      imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80',
      previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      externalUrl: 'https://open.spotify.com/search/Carpenter%20Brut',
      tags: ['Darksynth', 'Power', 'AI Curated'],
    },
  ],
  focus: [
    {
      id: 'ai-track-foc-1',
      type: 'music',
      title: 'Midnight Terminal',
      artist: 'Tycho',
      album: 'Epoch Horizons',
      summary: 'Hypnotic modular synthesis tailored for zero cognitive interference.',
      category: 'technology',
      timestamp: 'AI Mood DJ',
      durationMs: 245000,
      imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
      previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      externalUrl: 'https://open.spotify.com/search/Tycho%20Epoch',
      tags: ['Ambient Focus', 'Deep Work', 'Synthwave', 'AI Curated'],
    },
    {
      id: 'ai-track-foc-2',
      type: 'music',
      title: 'Subsurface Echoes',
      artist: 'HOME & Disasterpeace',
      album: 'Odyssey Wave',
      summary: 'Warm analog lofi texture anchoring continuous deep thought.',
      category: 'technology',
      timestamp: 'AI Mood DJ',
      durationMs: 212000,
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
      previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
      externalUrl: 'https://open.spotify.com/search/HOME%20Odyssey',
      tags: ['Chillwave', 'Flow State', 'AI Curated'],
    },
    {
      id: 'ai-track-foc-3',
      type: 'music',
      title: 'Algorithm Drift',
      artist: 'Kiasmos',
      album: 'Blurred Horizons',
      summary: 'Minimalist neo-classical piano layered with gentle glitch percussion.',
      category: 'technology',
      timestamp: 'AI Mood DJ',
      durationMs: 260000,
      imageUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=600&q=80',
      previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
      externalUrl: 'https://open.spotify.com/search/Kiasmos',
      tags: ['Minimalist', 'Code Flow', 'AI Curated'],
    },
  ],
  melancholy: [
    {
      id: 'ai-track-mel-1',
      type: 'music',
      title: 'Rain on Copper Leaves',
      artist: 'Bon Iver & Novo Amor',
      album: 'Solitude Sessions',
      summary: 'Delicate acoustic guitar and whispered harmonies evoking quiet solace.',
      category: 'entertainment',
      timestamp: 'AI Mood DJ',
      durationMs: 230000,
      imageUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80',
      previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
      externalUrl: 'https://open.spotify.com/search/Novo%20Amor',
      tags: ['Acoustic Folk', 'Melancholy', 'Rain', 'AI Curated'],
    },
    {
      id: 'ai-track-mel-2',
      type: 'music',
      title: 'Glass Reflection at Twilight',
      artist: 'Ólafur Arnalds',
      album: 'Re:member',
      summary: 'Haunting string quartet and felted upright piano in gentle minor key.',
      category: 'entertainment',
      timestamp: 'AI Mood DJ',
      durationMs: 218000,
      imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80',
      previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
      externalUrl: 'https://open.spotify.com/search/Olafur%20Arnalds',
      tags: ['Neo-Classical', 'Piano Solitude', 'AI Curated'],
    },
  ],
  cozy: [
    {
      id: 'ai-track-coz-1',
      type: 'music',
      title: 'Sunday Morning Matcha',
      artist: 'Idealism & Tomppabeats',
      album: 'Warm Mug Melodies',
      summary: 'Soft vinyl crackle, acoustic jazz chords, and gentle rimshots.',
      category: 'entertainment',
      timestamp: 'AI Mood DJ',
      durationMs: 185000,
      imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
      previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
      externalUrl: 'https://open.spotify.com/search/Idealism%20Lofi',
      tags: ['Cozy Lofi', 'Coffee Vibe', 'Chill', 'AI Curated'],
    },
    {
      id: 'ai-track-coz-2',
      type: 'music',
      title: 'Golden Hour Porch',
      artist: 'Khruangbin',
      album: 'Con Todo El Mundo',
      summary: 'Warm psychedelic surf-soul basslines and breezy guitars.',
      category: 'entertainment',
      timestamp: 'AI Mood DJ',
      durationMs: 220000,
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
      externalUrl: 'https://open.spotify.com/search/Khruangbin',
      tags: ['Warm Groove', 'Cozy Chill', 'AI Curated'],
    },
  ],
  euphoric: [
    {
      id: 'ai-track-eup-1',
      type: 'music',
      title: 'Solar Flare Dance',
      artist: 'SG Lewis & Dua Lipa',
      album: 'Times Unlimited',
      summary: 'Unapologetic disco strings, infectious four-on-the-floor beat, and sparkling joy.',
      category: 'entertainment',
      timestamp: 'AI Mood DJ',
      durationMs: 210000,
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
      previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
      externalUrl: 'https://open.spotify.com/search/SG%20Lewis',
      tags: ['Nu-Disco', 'Feel Good', 'Euphoria', 'AI Curated'],
    },
    {
      id: 'ai-track-eup-2',
      type: 'music',
      title: 'Neon Starlight Celebration',
      artist: 'Purple Disco Machine',
      album: 'Exotica',
      summary: 'Deep funky slap bass and retro vocoders guaranteed to elevate mood.',
      category: 'entertainment',
      timestamp: 'AI Mood DJ',
      durationMs: 225000,
      imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80',
      previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
      externalUrl: 'https://open.spotify.com/search/Purple%20Disco%20Machine',
      tags: ['Funk', 'Celebration', 'AI Curated'],
    },
  ],
};

function analyzeMoodSentiment(rawText, chip) {
  const text = `${rawText || ''} ${chip || ''}`.toLowerCase();

  // High energy / workout / hype
  if (/workout|gym|pump|heavy|lift|run|sprint|hype|energy|unstoppable|fire|beast|fast|rage|adrenaline|hardcore/i.test(text)) {
    return {
      moodKey: 'workout',
      moodTag: 'Apex Surge & Beast Mode',
      title: 'Apex Velocity: High-Octane Surge',
      description: 'Adrenaline-fueled bass drops, driving synth percussion, and relentless tempo designed for peak physical output.',
      vibeSummary: 'High-energy acoustic profile detected with rapid 142 BPM cadence and heavy kinetic drive.',
      energy: 94,
      valence: 78,
      danceability: 88,
      tempoBpm: 142,
      searchQuery: 'high energy workout electronic hits',
      recommendedGenres: ['EDM', 'Phonk', 'Drum & Bass', 'Industrial Electro'],
      rationale: 'AI mapped your high-arousal mental state to rapid 142 BPM percussion and explosive bass dynamics.'
    };
  }

  // Melancholy / sad / rainy / heartbroken
  if (/rain|sad|melanchol|tear|cry|heartbreak|grief|alone|lonely|blue|down|depress|nostalg|miss|cold/i.test(text)) {
    return {
      moodKey: 'melancholy',
      moodTag: 'Velvet Rain & Melancholy',
      title: 'Echoes in the Rain: Quiet Solitude',
      description: 'Gentle acoustic fingerpicking, bittersweet minor progressions, and warm analog rain textures.',
      vibeSummary: 'Reflective, low-valence profile with spacious acoustic timbre and tender pacing.',
      energy: 28,
      valence: 24,
      danceability: 32,
      tempoBpm: 68,
      searchQuery: 'sad indie acoustic piano melancholy ballad',
      recommendedGenres: ['Indie Folk', 'Acoustic Ballad', 'Ambient Piano', 'Slowcore'],
      rationale: 'AI calibrated subtle acoustic resonance, minor intervals, and low 68 BPM to provide empathetic stillness.'
    };
  }

  // Focus / coding / midnight / deep work / flow
  if (/code|coding|dev|focus|study|flow|midnight|night|cyber|hack|terminal|concentrat|work|read|deep work/i.test(text)) {
    return {
      moodKey: 'focus',
      moodTag: 'Midnight Cyber Flow',
      title: 'Neon Synapse: Deep Work Matrix',
      description: 'Zero vocal distraction, hypnotic synth arpeggios, and sub-bass frequencies tailored for prolonged focus.',
      vibeSummary: 'Optimal cognitive state with steady rhythmic entrainment and rich synthetic texture.',
      energy: 62,
      valence: 54,
      danceability: 60,
      tempoBpm: 110,
      searchQuery: 'synthwave focus chill lofi electronic beats',
      recommendedGenres: ['Synthwave', 'Lo-Fi Chillhop', 'Ambient Techno', 'Retrowave'],
      rationale: 'AI tuned repetitive synth motifs at 110 BPM to induce alpha/theta brainwave entrainment for deep code flow.'
    };
  }

  // Cozy / coffee / relax / sunday / calm / chill
  if (/cozy|coffee|tea|matcha|sunday|chill|relax|peace|warm|seren|zen|quiet|morning|sunshine|rest/i.test(text)) {
    return {
      moodKey: 'cozy',
      moodTag: 'Cozy Cafe & Sunday Sun',
      title: 'Warm Cinnamon: Cozy Lounge Drift',
      description: 'Soft Rhodes piano, gentle bossa rhythms, and warm crackling lo-fi nostalgia for peaceful afternoons.',
      vibeSummary: 'Comforting mid-tempo warmth with organic timbre and laid-back cadence.',
      energy: 36,
      valence: 76,
      danceability: 48,
      tempoBpm: 82,
      searchQuery: 'lofi coffee shop chill relaxing jazz lounge',
      recommendedGenres: ['Lo-Fi Beats', 'Bossa Nova', 'Chillhop', 'Warm Ambient'],
      rationale: 'AI blended organic Rhodes keyboards and gentle low-pass filtered beats at 82 BPM for calm serenity.'
    };
  }

  // Euphoric / happy / party / dance / celebrate
  if (/happy|joy|euphor|party|dance|celebrat|fun|groov|disco|good vibes|summer|excited|love|laugh/i.test(text)) {
    return {
      moodKey: 'euphoric',
      moodTag: 'Golden Euphoria & Disco',
      title: 'Solar Radiance: Feel-Good Disco Fever',
      description: 'Infectious basslines, bright brass, and soaring euphoric choruses that make stillness impossible.',
      vibeSummary: 'Peak valence with high danceability and uplifting melodic motifs.',
      energy: 88,
      valence: 96,
      danceability: 94,
      tempoBpm: 124,
      searchQuery: 'feel good upbeat disco funk dance pop hits',
      recommendedGenres: ['Nu-Disco', 'Funk Pop', 'Dance Pop', 'Soul Groove'],
      rationale: 'AI maximized valence (96%) and rhythmic danceability with syncopated funk rhythms at 124 BPM.'
    };
  }

  // Default balanced spectrum
  return {
    moodKey: 'focus',
    moodTag: 'Harmonic Mindscape',
    title: 'Intuitive Spectrum: Tailored Resonance',
    description: 'Dynamic fusion of modern beats, expressive melodies, and rich harmonic texture matching your current feeling.',
    vibeSummary: 'Balanced acoustic resonance tuned to your nuanced emotional reflection.',
    energy: 58,
    valence: 64,
    danceability: 62,
    tempoBpm: 100,
    searchQuery: 'chill indie alternative electronic beats focus',
    recommendedGenres: ['Indie Electronic', 'Chillwave', 'Alt-Pop', 'Downtempo'],
    rationale: 'AI synthesized a balanced harmonic curve with 64% valence and 100 BPM to complement your emotional headspace.'
  };
}

async function fetchLiveMoodTracks(query, moodKey = 'focus') {
  const tracks = [];
  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=10`;
    const res = await fetch(itunesUrl, { signal: AbortSignal.timeout(4500) });
    if (res.ok) {
      const data = await res.json();
      if (data.results && Array.isArray(data.results)) {
        data.results.forEach((song) => {
          if (song.trackName && song.artistName && song.previewUrl) {
            const artwork = song.artworkUrl100
              ? song.artworkUrl100.replace('100x100bb', '600x600bb')
              : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600';

            tracks.push({
              id: `itunes-track-${song.trackId}`,
              type: 'music',
              title: song.trackName,
              artist: song.artistName,
              album: song.collectionName || 'Featured Single',
              summary: `Selected by AI Mood DJ for harmonic match with ${song.primaryGenreName || 'Current Mood'}.`,
              category: 'entertainment',
              timestamp: 'AI Mood DJ',
              publishedAt: song.releaseDate || new Date().toISOString(),
              durationMs: song.trackTimeMillis || 180000,
              imageUrl: artwork,
              imageAlt: `${song.trackName} by ${song.artistName}`,
              previewUrl: song.previewUrl,
              externalUrl: song.trackViewUrl || `https://open.spotify.com/search/${encodeURIComponent(song.trackName + ' ' + song.artistName)}`,
              source: 'Spotify Live',
              sourceName: 'Spotify',
              tags: [song.primaryGenreName || 'Music', 'AI Curated', 'Mood DJ'],
              isTrending: true,
            });
          }
        });
      }
    }
  } catch {}

  // Fill from guaranteed curated catalog so we always have >= 6 premium tracks
  const catalog = moodCatalogFallbacks[moodKey] || moodCatalogFallbacks.focus;
  catalog.forEach((item) => {
    if (!tracks.some((t) => t.title.toLowerCase() === item.title.toLowerCase())) {
      tracks.push(item);
    }
  });

  return tracks.slice(0, 8);
}

app.post('/api/ai/mood-playlist', async (req, res) => {
  try {
    const { moodText = '', vibeChip = '' } = req.body || {};
    const text = (moodText || vibeChip || 'late night chill vibes').trim();

    // 1. Use Groq to deeply understand the prompt
    let sentiment = await analyzeWithGroq(text);
    if (!sentiment) {
      // Groq unavailable — fall back to keyword matching
      sentiment = basicSentiment(text);
    }

    // 2. Get Spotify access token
    const spotifyToken = await getSpotifyToken();

    // 3. Search Spotify for each query Groq suggested
    const queries = Array.isArray(sentiment.spotifyQueries) ? sentiment.spotifyQueries : [];
    const trackMap = new Map();

    await Promise.all(
      queries.map(async (q) => {
        const results = await searchSpotifyTracks(q, spotifyToken, 4);
        results.forEach((t) => {
          if (!trackMap.has(t.id)) trackMap.set(t.id, t);
        });
      })
    );

    let tracks = Array.from(trackMap.values());

    // 4. Sort by popularity (isTrending = popularity > 60) and deduplicate
    tracks.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));
    tracks = tracks.slice(0, 10);

    const playlist = {
      id: `ai-pl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: sentiment.title,
      description: sentiment.description,
      prompt: text,
      createdAt: new Date().toISOString(),
      sentiment: {
        moodTag: sentiment.moodTag,
        energy: sentiment.energy,
        valence: sentiment.valence,
        danceability: sentiment.danceability,
        tempoBpm: sentiment.tempoBpm,
        vibeSummary: sentiment.vibeSummary,
        recommendedGenres: sentiment.recommendedGenres || [],
        rationale: sentiment.rationale,
      },
      tracks,
    };

    res.json({ success: true, playlist });
  } catch (error) {
    console.error('[AI Mood Playlist Error]:', error);
    res.status(500).json({ success: false, error: 'Failed to generate AI mood playlist' });
  }
});


// 7. Health & Status
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'Express Standalone Real-Time Backend',
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'Pulse Content Dashboard - Express Backend API',
    endpoints: ['/api/feed', '/api/custom-items', '/api/news', '/api/recommendations', '/api/social', '/api/stream', '/api/ai/mood-playlist', '/health'],
  });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`[Express Backend] Running on http://localhost:${PORT}`);
});
