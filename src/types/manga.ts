export type MangaFormat = 'manga' | 'manhwa' | 'manhua' | 'novel' | 'one_shot';
export type MangaStatus = 'ongoing' | 'completed' | 'hiatus' | 'cancelled' | 'upcoming';
export type ReadingStatus = 'favorites' | 'reading' | 'plan_to_read' | 'completed' | 'dropped';

export interface Genre {
  id: string;
  name: string;
  count?: number;
  description?: string;
  color?: string;
  icon?: string;
}

export interface Author {
  id: string;
  name: string;
  role?: 'Author' | 'Artist' | 'Story & Art';
  image?: string;
}

export interface Character {
  id: string;
  name: string;
  role: 'Main' | 'Supporting';
  image: string;
  description?: string;
  favorites?: number;
}

export interface Chapter {
  id: string;
  chapterNumber: string;
  title: string;
  releaseDate: string;
  language: string;
  groupName?: string;
  pagesCount?: number;
  externalUrl?: string;
  pages?: string[];
}

export interface Review {
  id: string;
  username: string;
  avatar: string;
  score: number;
  content: string;
  date: string;
  likes: number;
  tags?: string[];
}

export interface MangaItem {
  id: string;
  malId?: number;
  title: string;
  englishTitle?: string;
  japaneseTitle?: string;
  synonyms?: string[];
  coverImage: string;
  bannerImage?: string;
  format: MangaFormat;
  status: MangaStatus;
  score: number; // e.g. 8.92
  ranked?: number;
  popularity?: number;
  favorites?: number;
  synopsis: string;
  genres: string[];
  themes?: string[];
  tags?: string[];
  authors: Author[];
  artists?: Author[];
  year?: number;
  volumes?: number | null;
  chapters?: number | null;
  demographic?: string;
  serialization?: string;
  languages?: string[];
  updatedAt?: string;
  contentRating?: 'safe' | 'suggestive' | 'erotica';
}

export interface MangaDetail extends MangaItem {
  chaptersList?: Chapter[];
  characters?: Character[];
  reviews?: Review[];
  recommendations?: MangaItem[];
  externalLinks?: { title: string; url: string }[];
  communityScore?: {
    mean: number;
    distribution: Record<string, number>;
  };
}

export interface SearchFilters {
  query: string;
  format: string; // 'all' | 'manga' | 'manhwa' | 'manhua'
  genres: string[];
  status: string; // 'all' | 'ongoing' | 'completed' | 'hiatus'
  demographic: string; // 'all' | 'shounen' | 'seinen' | 'shoujo' | 'josei'
  year: string; // 'all' | '2024' | '2023' ...
  minRating: number;
  sortBy: 'popularity' | 'score' | 'title' | 'updatedAt' | 'favorites';
  sortOrder: 'desc' | 'asc';
  letter?: string;
}

export interface UserProgress {
  mangaId: string;
  mangaTitle: string;
  coverImage: string;
  status: ReadingStatus;
  lastReadChapter: string;
  lastReadChapterId?: string;
  lastReadDate: string;
  rating?: number;
  notes?: string;
  chaptersReadCount: number;
  totalChapters?: number;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'info' | 'warning' | 'error';
}
