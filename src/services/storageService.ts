import { UserProgress, ReadingStatus, MangaItem } from '../types/manga';

const STORAGE_KEYS = {
  LIBRARY: 'mangaverse_library_v1',
  RECENTLY_VIEWED: 'mangaverse_recent_v1',
  SETTINGS: 'mangaverse_settings_v1',
};

export interface AppSettings {
  theme: 'dark' | 'light';
  defaultReaderMode: 'single' | 'webtoon';
  autoBookmark: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  defaultReaderMode: 'webtoon',
  autoBookmark: true,
};

// Get all library items
export const getLibrary = (): Record<string, UserProgress> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LIBRARY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

// Update or set progress for a manga
export const updateMangaProgress = (
  manga: MangaItem,
  status: ReadingStatus,
  chapterNumber?: string,
  chapterId?: string
): UserProgress => {
  const library = getLibrary();
  const existing = library[manga.id] || {
    mangaId: manga.id,
    mangaTitle: manga.title,
    coverImage: manga.coverImage,
    status: status,
    lastReadChapter: '1',
    lastReadDate: new Date().toISOString(),
    chaptersReadCount: 0,
    totalChapters: manga.chapters || undefined,
  };

  const updated: UserProgress = {
    ...existing,
    mangaTitle: manga.title,
    coverImage: manga.coverImage,
    status,
    lastReadDate: new Date().toISOString(),
    lastReadChapter: chapterNumber || existing.lastReadChapter,
    lastReadChapterId: chapterId || existing.lastReadChapterId,
    totalChapters: manga.chapters || existing.totalChapters,
  };

  library[manga.id] = updated;
  try {
    localStorage.setItem(STORAGE_KEYS.LIBRARY, JSON.stringify(library));
  } catch (e) {
    console.error('Failed to save to local storage', e);
  }
  return updated;
};

// Remove from library
export const removeFromLibrary = (mangaId: string): void => {
  const library = getLibrary();
  delete library[mangaId];
  try {
    localStorage.setItem(STORAGE_KEYS.LIBRARY, JSON.stringify(library));
  } catch (e) {
    console.error('Failed to update library', e);
  }
};

// Get progress for single manga
export const getMangaProgress = (mangaId: string): UserProgress | null => {
  const library = getLibrary();
  return library[mangaId] || null;
};

// Recently Viewed
export const getRecentlyViewed = (): MangaItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENTLY_VIEWED);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addRecentlyViewed = (manga: MangaItem): void => {
  const list = getRecentlyViewed().filter((item) => item.id !== manga.id);
  list.unshift(manga);
  const trimmed = list.slice(0, 20); // Keep last 20
  try {
    localStorage.setItem(STORAGE_KEYS.RECENTLY_VIEWED, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save recent item', e);
  }
};

// Settings
export const getSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: Partial<AppSettings>): AppSettings => {
  const current = getSettings();
  const updated = { ...current, ...settings };
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
  return updated;
};

// Backup and Restore
export const exportLibraryData = (): string => {
  const library = getLibrary();
  const settings = getSettings();
  return JSON.stringify({ library, settings, exportedAt: new Date().toISOString() }, null, 2);
};

export const importLibraryData = (jsonStr: string): boolean => {
  try {
    const data = JSON.parse(jsonStr);
    if (data && typeof data === 'object' && data.library) {
      localStorage.setItem(STORAGE_KEYS.LIBRARY, JSON.stringify(data.library));
      if (data.settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      }
      return true;
    }
  } catch (e) {
    console.error('Import error', e);
  }
  return false;
};
