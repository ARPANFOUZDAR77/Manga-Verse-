import { MangaItem, MangaDetail, Chapter, Character, Review, Genre, SearchFilters } from '../types/manga';
import { MANGA_DATASET } from '../data/mangaDataset';

const JIKAN_BASE = 'https://api.jikan.moe/v4';
const MANGADEX_BASE = 'https://api.mangadex.org';
const ANILIST_GRAPHQL = 'https://graphql.anilist.co';
const KITSU_BASE = 'https://kitsu.io/api/edge';

// Memory cache for fast response and avoiding rate limits
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Helper delay function for rate limit throttling
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithCache<T>(url: string, options?: RequestInit): Promise<T | null> {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      if (res.status === 429) {
        console.warn(`Rate limited for ${url}, using fallback.`);
        await delay(500);
      }
      return null;
    }
    const data = await res.json();
    cache.set(url, { data, timestamp: Date.now() });
    return data as T;
  } catch (err) {
    console.warn(`Fetch error for ${url}:`, err);
    return null;
  }
}

// Full curated dataset with 100+ titles
export const CURATED_FEATURED: MangaItem[] = MANGA_DATASET;

// Helper to transform Jikan API Manga item to MangaItem
function mapJikanToMangaItem(item: any): MangaItem {
  const typeStr = (item.type || '').toLowerCase();
  let format: MangaItem['format'] = 'manga';
  if (typeStr.includes('manhwa')) format = 'manhwa';
  else if (typeStr.includes('manhua')) format = 'manhua';
  else if (typeStr.includes('novel')) format = 'novel';
  else if (typeStr.includes('one-shot') || typeStr.includes('oneshot')) format = 'one_shot';

  const statusStr = (item.status || '').toLowerCase();
  let status: MangaItem['status'] = 'ongoing';
  if (statusStr.includes('complete')) status = 'completed';
  else if (statusStr.includes('hiatus')) status = 'hiatus';
  else if (statusStr.includes('discontinued') || statusStr.includes('cancelled')) status = 'cancelled';

  const genres = (item.genres || []).map((g: any) => g.name);
  const themes = (item.themes || []).map((t: any) => t.name);
  const authors = (item.authors || []).map((a: any) => ({
    id: a.mal_id ? String(a.mal_id) : a.name,
    name: a.name,
    role: 'Author',
  }));

  return {
    id: `jikan-${item.mal_id}`,
    malId: item.mal_id,
    title: item.title || 'Unknown Title',
    englishTitle: item.title_english || item.title,
    japaneseTitle: item.title_japanese,
    synonyms: item.titles?.map((t: any) => t.title) || [],
    coverImage: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || '',
    bannerImage: item.images?.jpg?.large_image_url,
    format,
    status,
    score: item.score || 8.0,
    ranked: item.rank || 0,
    popularity: item.popularity || 0,
    favorites: item.favorites || 0,
    synopsis: item.synopsis || 'No synopsis available.',
    genres: genres.length > 0 ? genres : ['Action', 'Fantasy'],
    themes,
    tags: [...genres, ...themes],
    authors,
    year: item.published?.prop?.from?.year || item.year || 2020,
    volumes: item.volumes,
    chapters: item.chapters,
    demographic: item.demographics?.[0]?.name || 'Shounen',
    serialization: item.serializations?.[0]?.name || 'MangaVerse',
    contentRating: item.demographics?.[0]?.name === 'Hentai' ? 'erotica' : 'safe',
  };
}

// 1. Fetch Top Manga / Trending
export async function getTopManga(page = 1, type?: 'manga' | 'manhwa'): Promise<MangaItem[]> {
  let url = `${JIKAN_BASE}/top/manga?page=${page}&limit=25`;
  if (type === 'manhwa') {
    url += '&type=manhwa';
  }
  const data = await fetchWithCache<any>(url);
  let apiItems: MangaItem[] = [];
  if (data && data.data && Array.isArray(data.data)) {
    apiItems = data.data.map(mapJikanToMangaItem);
  }

  // Combine with curated items matching format
  let fallbackList = CURATED_FEATURED;
  if (type === 'manhwa') {
    fallbackList = CURATED_FEATURED.filter((m) => m.format === 'manhwa');
  } else if (type === 'manga') {
    fallbackList = CURATED_FEATURED.filter((m) => m.format === 'manga');
  }

  const seenTitles = new Set<string>();
  const combined: MangaItem[] = [];

  for (const item of [...apiItems, ...fallbackList]) {
    const key = item.title.toLowerCase().trim();
    if (!seenTitles.has(key)) {
      seenTitles.add(key);
      combined.push(item);
    }
  }

  return combined;
}

// 2. Fetch Manga by Search Filters
export async function searchManga(filters: Partial<SearchFilters>, page = 1): Promise<{ items: MangaItem[]; hasNextPage: boolean }> {
  let params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', '25');

  if (filters.query) {
    params.set('q', filters.query);
  }
  if (filters.format && filters.format !== 'all') {
    params.set('type', filters.format);
  }
  if (filters.sortBy) {
    let order = filters.sortBy;
    if (order === 'popularity') params.set('order_by', 'popularity');
    else if (order === 'score') params.set('order_by', 'score');
    else if (order === 'title') params.set('order_by', 'title');
    else if (order === 'favorites') params.set('order_by', 'favorites');
    params.set('sort', filters.sortOrder || 'desc');
  }
  if (filters.letter) {
    params.set('letter', filters.letter);
  }

  const url = `${JIKAN_BASE}/manga?${params.toString()}`;
  const resData = await fetchWithCache<any>(url);

  let apiMapped: MangaItem[] = [];
  let hasNext = false;

  if (resData && resData.data && Array.isArray(resData.data)) {
    apiMapped = resData.data.map(mapJikanToMangaItem);
    hasNext = resData.pagination?.has_next_page || false;
  }

  // Match local curated items with filters
  let filteredCurated = [...CURATED_FEATURED];
  if (filters.query) {
    const q = filters.query.toLowerCase().trim();
    filteredCurated = filteredCurated.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        (m.englishTitle && m.englishTitle.toLowerCase().includes(q)) ||
        m.genres.some((g) => g.toLowerCase().includes(q)) ||
        m.authors.some((a) => a.name.toLowerCase().includes(q))
    );
  }
  if (filters.format && filters.format !== 'all') {
    filteredCurated = filteredCurated.filter((m) => m.format === filters.format);
  }
  if (filters.letter) {
    const l = filters.letter.toLowerCase();
    filteredCurated = filteredCurated.filter((m) => m.title.toLowerCase().startsWith(l));
  }
  if (filters.minRating) {
    filteredCurated = filteredCurated.filter((m) => m.score >= (filters.minRating || 0));
  }
  if (filters.genres && filters.genres.length > 0) {
    filteredCurated = filteredCurated.filter((m) =>
      filters.genres!.some((g) => m.genres.some((mg) => mg.toLowerCase().includes(g.toLowerCase())))
    );
  }

  // Combine both sets cleanly
  const seen = new Set<string>();
  const combined: MangaItem[] = [];

  for (const item of [...apiMapped, ...filteredCurated]) {
    const key = item.title.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.add(key);
      combined.push(item);
    }
  }

  // Apply sorting to combined results
  if (filters.sortBy === 'score') {
    combined.sort((a, b) => (filters.sortOrder === 'asc' ? a.score - b.score : b.score - a.score));
  } else if (filters.sortBy === 'title') {
    combined.sort((a, b) => (filters.sortOrder === 'desc' ? b.title.localeCompare(a.title) : a.title.localeCompare(b.title)));
  } else if (filters.sortBy === 'popularity') {
    combined.sort((a, b) => (b.favorites || b.score) - (a.favorites || a.score));
  }

  return { items: combined, hasNextPage: hasNext };
}

// Fetch real chapters from MangaDex or generate structured feed
export async function fetchMangaDexChapters(title: string): Promise<Chapter[]> {
  try {
    const searchUrl = `${MANGADEX_BASE}/manga?title=${encodeURIComponent(title)}&limit=1`;
    const searchRes = await fetchWithCache<any>(searchUrl);
    if (!searchRes || !searchRes.data || searchRes.data.length === 0) {
      return [];
    }

    const mangaDexId = searchRes.data[0].id;
    const feedUrl = `${MANGADEX_BASE}/manga/${mangaDexId}/feed?translatedLanguage[]=en&order[chapter]=desc&limit=100`;
    const feedRes = await fetchWithCache<any>(feedUrl);

    if (feedRes && feedRes.data && Array.isArray(feedRes.data)) {
      return feedRes.data.map((ch: any) => ({
        id: `mangadex-${ch.id}`,
        chapterNumber: ch.attributes.chapter || '1',
        title: ch.attributes.title || `Chapter ${ch.attributes.chapter || '1'}`,
        releaseDate: ch.attributes.publishAt?.split('T')[0] || new Date().toISOString().split('T')[0],
        language: 'en',
        groupName: 'Official Scans',
        pagesCount: ch.attributes.pages || 20,
      }));
    }
  } catch (err) {
    console.warn('Chapter fetch error:', err);
  }
  return [];
}

// 3. Fetch Full Manga Details with Chapters, Characters, Recommendations
export async function getMangaDetails(id: string): Promise<MangaDetail | null> {
  const malId = id.replace('jikan-', '');
  if (!isNaN(Number(malId))) {
    const detailUrl = `${JIKAN_BASE}/manga/${malId}/full`;
    const detailRes = await fetchWithCache<any>(detailUrl);

    if (detailRes && detailRes.data) {
      const baseItem = mapJikanToMangaItem(detailRes.data);

      // Attempt MangaDex real chapters
      let chaptersList: Chapter[] = await fetchMangaDexChapters(baseItem.title);

      // Fallback chapter list if MangaDex returns empty
      if (chaptersList.length === 0) {
        const totalCh = baseItem.chapters || 50;
        chaptersList = Array.from({ length: Math.min(totalCh, 100) }, (_, i) => {
          const chNum = String(totalCh - i);
          return {
            id: `ch-${chNum}`,
            chapterNumber: chNum,
            title: `Chapter ${chNum}: ${baseItem.title}`,
            releaseDate: new Date(Date.now() - i * 86400000 * 3).toISOString().split('T')[0],
            language: 'en',
            groupName: 'MangaVerse Scans',
            pagesCount: 18 + (i % 6),
          };
        });
      }

      // Fetch characters with delay to prevent 429
      await delay(200);
      const charUrl = `${JIKAN_BASE}/manga/${malId}/characters`;
      const charRes = await fetchWithCache<any>(charUrl);
      let characters: Character[] = [];
      if (charRes && charRes.data) {
        characters = charRes.data.slice(0, 12).map((c: any) => ({
          id: String(c.character.mal_id),
          name: c.character.name,
          role: c.role === 'Main' ? 'Main' : 'Supporting',
          image: c.character.images?.jpg?.image_url || '',
          favorites: c.favorites,
        }));
      }

      // Fetch Recommendations
      await delay(200);
      const recUrl = `${JIKAN_BASE}/manga/${malId}/recommendations`;
      const recRes = await fetchWithCache<any>(recUrl);
      let recommendations: MangaItem[] = [];
      if (recRes && recRes.data) {
        recommendations = recRes.data.slice(0, 10).map((r: any) => mapJikanToMangaItem(r.entry));
      }

      // Sample reviews
      const reviews: Review[] = [
        {
          id: 'r1',
          username: 'OtakuMaster99',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
          score: 9.5,
          content: `${baseItem.title} is an absolute masterpiece! The artwork, pacing, and character development are peak fiction. Highly recommended to anyone who loves ${baseItem.genres.join(', ')}.`,
          date: '2024-05-12',
          likes: 342,
          tags: ['Masterpiece', 'Amazing Art', 'Must Read'],
        },
        {
          id: 'r2',
          username: 'ManhwaLover',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
          score: 9.0,
          content: 'Incredible hype moments! Every chapter keeps you on the edge of your seat. The paneling and visual impact are top tier.',
          date: '2024-06-01',
          likes: 189,
          tags: ['High Energy', 'Epic Battles'],
        },
      ];

      return {
        ...baseItem,
        chaptersList,
        characters,
        recommendations,
        reviews,
      };
    }
  }

  // Fallback if not found in Jikan API
  const found = CURATED_FEATURED.find((m) => m.id === id) || CURATED_FEATURED[0];
  const chaptersList: Chapter[] = Array.from({ length: 40 }, (_, i) => ({
    id: `ch-${40 - i}`,
    chapterNumber: String(40 - i),
    title: `Chapter ${40 - i}`,
    releaseDate: new Date(Date.now() - i * 86400000 * 2).toISOString().split('T')[0],
    language: 'en',
    groupName: 'MangaVerse Scans',
    pagesCount: 20,
  }));

  return {
    ...found,
    chaptersList,
    characters: [
      { id: 'c1', name: 'Protagonist', role: 'Main', image: found.coverImage },
      { id: 'c2', name: 'Companion', role: 'Supporting', image: found.coverImage },
    ],
    recommendations: CURATED_FEATURED.filter((m) => m.id !== found.id).slice(0, 6),
    reviews: [
      {
        id: 'r1',
        username: 'MangaCritic',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        score: 9.2,
        content: 'One of the best series of the decade. Compelling narrative and extraordinary visuals.',
        date: '2024-04-10',
        likes: 120,
      },
    ],
  };
}

// 4. Fetch All Genres
export const GENRES_LIST: Genre[] = [
  { id: 'action', name: 'Action', description: 'Fast-paced, physical fights, explosions, and high intensity combats.', color: 'from-amber-500 to-red-600', icon: 'Zap' },
  { id: 'adventure', name: 'Adventure', description: 'Journeys through uncharted realms, questing, and exploring mysteries.', color: 'from-emerald-500 to-teal-700', icon: 'Compass' },
  { id: 'comedy', name: 'Comedy', description: 'Hilarious situations, slapstick humor, and witty dialogue.', color: 'from-yellow-400 to-amber-600', icon: 'Smile' },
  { id: 'drama', name: 'Drama', description: 'Emotional conflict, relational struggles, and deeply personal journeys.', color: 'from-rose-500 to-pink-700', icon: 'Heart' },
  { id: 'fantasy', name: 'Fantasy', description: 'Magic, mythical creatures, enchanted artifacts, and otherworldly realms.', color: 'from-purple-500 to-indigo-700', icon: 'Wand2' },
  { id: 'romance', name: 'Romance', description: 'Love stories, relationship dynamics, heart-fluttering moments.', color: 'from-pink-500 to-rose-600', icon: 'HeartHandshake' },
  { id: 'horror', name: 'Horror', description: 'Terrifying creatures, psychological dread, chilling atmospheres.', color: 'from-red-700 to-stone-900', icon: 'Skull' },
  { id: 'mystery', name: 'Mystery', description: 'Uncovering secrets, detective investigations, puzzle solving.', color: 'from-cyan-600 to-blue-900', icon: 'Search' },
  { id: 'sci-fi', name: 'Sci-Fi', description: 'Futuristic technology, space exploration, cybernetics, and AI.', color: 'from-blue-500 to-cyan-600', icon: 'Bot' },
  { id: 'sports', name: 'Sports', description: 'Athletic competition, teamwork, determination, and championship rivalries.', color: 'from-orange-500 to-amber-700', icon: 'Trophy' },
  { id: 'slice-of-life', name: 'Slice of Life', description: 'Heartwarming daily routines, friendship, and quiet everyday beauty.', color: 'from-lime-500 to-emerald-600', icon: 'Coffee' },
  { id: 'supernatural', name: 'Supernatural', description: 'Ghosts, curses, spirits, psychic powers, and mystical phenomena.', color: 'from-violet-600 to-fuchsia-800', icon: 'Sparkles' },
  { id: 'historical', name: 'Historical', description: 'Set in historical eras, featuring authentic cultural and political settings.', color: 'from-amber-700 to-yellow-900', icon: 'Crown' },
  { id: 'school', name: 'School', description: 'High school life, clubs, exams, youth romance, and student rivalries.', color: 'from-sky-500 to-indigo-600', icon: 'GraduationCap' },
  { id: 'isekai', name: 'Isekai', description: 'Reincarnated or transported into another game or fantasy world.', color: 'from-fuchsia-500 to-purple-800', icon: 'DoorOpen' },
  { id: 'martial-arts', name: 'Martial Arts', description: 'Hand-to-hand combat techniques, cultivation, and martial sects.', color: 'from-red-600 to-orange-700', icon: 'Swords' },
  { id: 'psychological', name: 'Psychological', description: 'Mind games, manipulation, morality dilemmas, and mental tension.', color: 'from-indigo-600 to-slate-900', icon: 'Brain' },
  { id: 'thriller', name: 'Thriller', description: 'Suspenseful plots, high stakes, ticking clocks, and dangerous conspiracies.', color: 'from-zinc-700 to-black', icon: 'ShieldAlert' },
];

// 5. Fetch Random Manga
export async function getRandomManga(format?: 'manga' | 'manhwa'): Promise<MangaItem> {
  const url = `${JIKAN_BASE}/random/manga`;
  const res = await fetchWithCache<any>(url);
  if (res && res.data) {
    const item = mapJikanToMangaItem(res.data);
    if (!format || item.format === format) {
      return item;
    }
  }
  const pool = format ? CURATED_FEATURED.filter((m) => m.format === format) : CURATED_FEATURED;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex] || CURATED_FEATURED[0];
}

// 6. Fetch Chapter Images (MangaDex or High Quality Rendered Manga Pages)
export async function getChapterPages(chapterId: string, mangaTitle: string): Promise<string[]> {
  if (chapterId.startsWith('mangadex-')) {
    const realMdId = chapterId.replace('mangadex-', '');
    try {
      const atHomeUrl = `${MANGADEX_BASE}/at-home/server/${realMdId}`;
      const atHomeRes = await fetchWithCache<any>(atHomeUrl);
      if (atHomeRes && atHomeRes.baseUrl && atHomeRes.chapter) {
        const { baseUrl, chapter } = atHomeRes;
        const pageFiles: string[] = chapter.data || [];
        if (pageFiles.length > 0) {
          return pageFiles.map((filename) => `${baseUrl}/data/${chapter.hash}/${filename}`);
        }
      }
    } catch (e) {
      console.warn('Error fetching MangaDex@Home pages:', e);
    }
  }

  // Try on-the-fly MangaDex search for chapter
  try {
    const chNum = chapterId.replace('ch-', '');
    const mdSearchUrl = `${MANGADEX_BASE}/manga?title=${encodeURIComponent(mangaTitle)}&limit=1`;
    const mdSearchRes = await fetchWithCache<any>(mdSearchUrl);
    if (mdSearchRes && mdSearchRes.data?.[0]?.id) {
      const mdId = mdSearchRes.data[0].id;
      const feedUrl = `${MANGADEX_BASE}/manga/${mdId}/feed?translatedLanguage[]=en&chapter=${chNum}&limit=1`;
      const feedRes = await fetchWithCache<any>(feedUrl);
      if (feedRes && feedRes.data?.[0]?.id) {
        const realMdId = feedRes.data[0].id;
        const atHomeRes = await fetchWithCache<any>(`${MANGADEX_BASE}/at-home/server/${realMdId}`);
        if (atHomeRes && atHomeRes.baseUrl && atHomeRes.chapter?.data?.length > 0) {
          const { baseUrl, chapter } = atHomeRes;
          return chapter.data.map((filename: string) => `${baseUrl}/data/${chapter.hash}/${filename}`);
        }
      }
    }
  } catch (err) {
    console.warn('On-the-fly MangaDex page fetch failed:', err);
  }

  // Fallback to high quality canvas-rendered manga panels
  return generateArtisticMangaPages(mangaTitle, chapterId.replace('ch-', ''));
}

function generateArtisticMangaPages(title: string, chapterNum: string): string[] {
  const pagesCount = 10;
  const pages: string[] = [];

  const storyPages = [
    {
      pageType: 'title_splash',
      headerTitle: `CHAPTER ${chapterNum}: AWAKENING`,
      sfx: 'ゴゴゴゴ...!',
      dialogue1: 'The ancient seal has broken... Destiny begins now!',
      dialogue2: `Welcome to ${title} — Official MangaVerse Edition`,
      panels: [
        { x: 50, y: 220, w: 700, h: 800, bg: '#0f172a', border: '#8b5cf6', style: 'splash' }
      ]
    },
    {
      pageType: 'strategy',
      sfx: 'チクタク...',
      dialogue1: 'Commander! Thermal sensors detected dark energy signatures in Sector 7!',
      dialogue2: 'If we don’t act within five minutes, the entire city falls.',
      dialogue3: 'Then we have no choice. Prepare all squads for deployment!',
      panels: [
        { x: 50, y: 60, w: 220, h: 960, bg: '#f1f5f9', border: '#0f172a', style: 'vertical' },
        { x: 290, y: 60, w: 220, h: 960, bg: '#1e293b', border: '#0f172a', style: 'dark_map' },
        { x: 530, y: 60, w: 220, h: 960, bg: '#f8fafc', border: '#0f172a', style: 'action' }
      ]
    },
    {
      pageType: 'confrontation',
      sfx: 'ククク...',
      dialogue1: 'So you actually dared to enter my domain... fool.',
      dialogue2: 'I came to take back what you stole ten years ago!',
      dialogue3: 'Then try and take it from my cold dead hands!',
      panels: [
        { x: 50, y: 60, w: 700, h: 420, bg: '#020617', border: '#dc2626', style: 'boss_throne' },
        { x: 50, y: 500, w: 340, h: 520, bg: '#f8fafc', border: '#0f172a', style: 'hero_draw' },
        { x: 410, y: 500, w: 340, h: 520, bg: '#f1f5f9', border: '#0f172a', style: 'stance' }
      ]
    },
    {
      pageType: 'first_strike',
      sfx: 'シュババッ!',
      dialogue1: 'SECRET TECHNIQUE: PHANTOM BLADE DASH!',
      dialogue2: 'Futile! Your speed means nothing against my void barrier!',
      dialogue3: 'DOKAAAN!!',
      panels: [
        { x: 50, y: 60, w: 700, h: 460, bg: '#0f172a', border: '#38bdf8', style: 'speed_cut' },
        { x: 50, y: 540, w: 700, h: 480, bg: '#f8fafc', border: '#0f172a', style: 'impact_block' }
      ]
    },
    {
      pageType: 'flashback_quad',
      sfx: 'ズズズズ...',
      dialogue1: 'Remember... true strength is born when protecting others.',
      dialogue2: 'I will NOT let everyone’s sacrifices be in vain!',
      dialogue3: 'LIMIT BREAK: AURA RELEASED!',
      dialogue4: 'N-Nani?! His power output is multiplying exponentially!!',
      panels: [
        { x: 50, y: 60, w: 340, h: 460, bg: '#e2e8f0', border: '#64748b', style: 'grey_memory' },
        { x: 410, y: 60, w: 340, h: 460, bg: '#f8fafc', border: '#0f172a', style: 'resolve' },
        { x: 50, y: 540, w: 340, h: 480, bg: '#0f172a', border: '#c084fc', style: 'aura_power' },
        { x: 410, y: 540, w: 340, h: 480, bg: '#f1f5f9', border: '#0f172a', style: 'shock_enemy' }
      ]
    },
    {
      pageType: 'climax_splash',
      sfx: 'バキィィィン!!',
      dialogue1: 'TAKE THIS! OMEGA CATACLYSM BURST!!',
      dialogue2: 'NOOOOOOO!! THIS IMPOSSIBLE STRENGTH...!',
      panels: [
        { x: 50, y: 60, w: 700, h: 960, bg: '#020617', border: '#f59e0b', style: 'mega_burst' }
      ]
    },
    {
      pageType: 'aftermath',
      sfx: 'シーン...',
      dialogue1: 'The dust is finally clearing...',
      dialogue2: 'Is... is it over?',
      dialogue3: 'Incredible... you actually broke through my ultimate barrier...',
      panels: [
        { x: 50, y: 60, w: 700, h: 320, bg: '#f1f5f9', border: '#0f172a', style: 'smoke' },
        { x: 50, y: 400, w: 700, h: 320, bg: '#f8fafc', border: '#0f172a', style: 'crater' },
        { x: 50, y: 740, w: 700, h: 280, bg: '#0f172a', border: '#475569', style: 'defeated_boss' }
      ]
    },
    {
      pageType: 'reunion',
      sfx: 'ピカーン!',
      dialogue1: 'You did it! The realm is saved!',
      dialogue2: 'We couldn’t have done it without everyone standing together.',
      dialogue3: 'Wait... look at the ancient stone on your neck! It’s glowing blue!',
      panels: [
        { x: 50, y: 60, w: 340, h: 960, bg: '#f8fafc', border: '#0f172a', style: 'hero_sheath' },
        { x: 410, y: 60, w: 340, h: 960, bg: '#f1f5f9', border: '#0f172a', style: 'glow_amulet' }
      ]
    },
    {
      pageType: 'cliffhanger',
      sfx: 'ゴォォォォ...',
      dialogue1: 'Did you really think I was working alone...?',
      dialogue2: 'The Sovereign Lord wakes in the shadows of the next realm...',
      panels: [
        { x: 50, y: 60, w: 700, h: 600, bg: '#020617', border: '#7c3aed', style: 'giant_shadow' },
        { x: 50, y: 680, w: 700, h: 340, bg: '#0f172a', border: '#334155', style: 'ominous_sky' }
      ]
    },
    {
      pageType: 'to_be_continued',
      sfx: 'ドドォォン!!',
      dialogue1: `TO BE CONTINUED IN CHAPTER ${Number(chapterNum) + 1 || 2}!`,
      dialogue2: 'Thank you for reading on MangaVerse Reader',
      panels: [
        { x: 50, y: 60, w: 700, h: 960, bg: '#090d16', border: '#10b981', style: 'ending_stamp' }
      ]
    }
  ];

  for (let p = 1; p <= pagesCount; p++) {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1150;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    const data = storyPages[p - 1] || storyPages[0];

    // Background - Manga Paper Tone
    ctx.fillStyle = p % 2 === 0 ? '#f8fafc' : '#f1f5f9';
    ctx.fillRect(0, 0, 800, 1150);

    // Page Outer Frame
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, 740, 1090);

    // Draw Page-Specific Panels
    data.panels.forEach((pnl, idx) => {
      // Panel Fill
      ctx.fillStyle = pnl.bg;
      ctx.fillRect(pnl.x, pnl.y, pnl.w, pnl.h);

      // Panel Border
      ctx.strokeStyle = pnl.border;
      ctx.lineWidth = 4;
      ctx.strokeRect(pnl.x, pnl.y, pnl.w, pnl.h);

      // Artistic Speed Lines / Background Textures based on panel style
      if (pnl.style === 'splash' || pnl.style === 'mega_burst' || pnl.style === 'aura_power') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        const centerX = pnl.x + pnl.w / 2;
        const centerY = pnl.y + pnl.h / 2;
        for (let a = 0; a < 360; a += 15) {
          const rad = (a * Math.PI) / 180;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(centerX + Math.cos(rad) * 450, centerY + Math.sin(rad) * 450);
          ctx.stroke();
        }
      } else if (pnl.style === 'speed_cut') {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 15; i++) {
          ctx.beginPath();
          ctx.moveTo(pnl.x, pnl.y + i * 30);
          ctx.lineTo(pnl.x + pnl.w, pnl.y + i * 30 + 40);
          ctx.stroke();
        }
      }

      // Panel Dialogue Speech Bubble
      const dlgText = idx === 0 ? data.dialogue1 : idx === 1 ? data.dialogue2 : data.dialogue3 || data.dialogue4;
      if (dlgText) {
        const bubbleX = pnl.x + pnl.w / 2;
        const bubbleY = pnl.y + (pnl.h > 400 ? 120 : 70);

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(bubbleX, bubbleY, Math.min(pnl.w / 2.2, 160), 45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(dlgText.length > 40 ? dlgText.substring(0, 38) + '...' : dlgText, bubbleX, bubbleY);
      }
    });

    // Japanese Sound Effects (SFX)
    ctx.fillStyle = p === 6 ? '#f59e0b' : p === 1 ? '#c084fc' : '#0f172a';
    ctx.font = 'bold 42px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(data.sfx, 80, 150);

    // Header stamp for Chapter on Page 1
    if (p === 1 && data.headerTitle) {
      ctx.fillStyle = '#8b5cf6';
      ctx.fillRect(50, 50, 700, 60);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(data.headerTitle, 400, 85);
    }

    // Bottom Footer Page Indicator
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`— PAGE ${p} OF ${pagesCount} —`, 400, 1095);

    pages.push(canvas.toDataURL('image/jpeg', 0.85));
  }

  return pages;
}
