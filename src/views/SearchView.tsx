import React from 'react';
import { Search, Filter, RefreshCw, Star, X, Loader2, Sparkles } from 'lucide-react';
import { MangaItem, SearchFilters } from '../types/manga';
import { searchManga, GENRES_LIST } from '../services/mangaApi';
import { MangaCard } from '../components/MangaCard';

interface SearchViewProps {
  initialQuery?: string;
  onSelectManga: (manga: MangaItem) => void;
  onToast?: (msg: string, type?: 'success' | 'info') => void;
}

export const SearchView: React.FC<SearchViewProps> = ({ initialQuery = '', onSelectManga, onToast }) => {
  const [filters, setFilters] = React.useState<SearchFilters>({
    query: initialQuery,
    format: 'all',
    genres: [],
    status: 'all',
    demographic: 'all',
    year: 'all',
    minRating: 0,
    sortBy: 'popularity',
    sortOrder: 'desc',
  });

  const [results, setResults] = React.useState<MangaItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = React.useState(false);

  const performSearch = React.useCallback(async (f: SearchFilters) => {
    setLoading(true);
    const res = await searchManga(f);
    setResults(res.items);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    performSearch(filters);
  }, [filters, performSearch]);

  const toggleGenre = (genreName: string) => {
    setFilters((prev) => {
      const exists = prev.genres.includes(genreName);
      const nextGenres = exists
        ? prev.genres.filter((g) => g !== genreName)
        : [...prev.genres, genreName];
      return { ...prev, genres: nextGenres };
    });
  };

  const resetFilters = () => {
    setFilters({
      query: '',
      format: 'all',
      genres: [],
      status: 'all',
      demographic: 'all',
      year: 'all',
      minRating: 0,
      sortBy: 'popularity',
      sortOrder: 'desc',
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <Search className="w-8 h-8 text-purple-400" />
          <span>Advanced Search & Filters</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Search across thousands of manga and manhwa titles with real-time API filters
        </p>
      </div>

      {/* Main Search Bar & Filter Toggle */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-purple-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            placeholder="Type manga title, author, or keyword (e.g., Solo Leveling, Oda)..."
            className="w-full pl-12 pr-10 py-3 rounded-2xl bg-slate-900 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 shadow-inner"
          />
          {filters.query && (
            <button
              onClick={() => setFilters({ ...filters, query: '' })}
              className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilterDrawer(!showFilterDrawer)}
          className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 border transition-colors ${
            showFilterDrawer || filters.genres.length > 0 || filters.format !== 'all'
              ? 'bg-purple-600 text-white border-purple-400 shadow-lg'
              : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>Filters {filters.genres.length > 0 && `(${filters.genres.length})`}</span>
        </button>

        <button
          onClick={resetFilters}
          className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100"
          title="Reset Filters"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Expandable Filter Panel */}
      {showFilterDrawer && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6 animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Format */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Format</label>
              <select
                value={filters.format}
                onChange={(e) => setFilters({ ...filters, format: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Formats</option>
                <option value="manga">Manga (Japanese)</option>
                <option value="manhwa">Manhwa (Korean)</option>
                <option value="manhua">Manhua (Chinese)</option>
                <option value="novel">Light Novel</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Statuses</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="hiatus">On Hiatus</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              >
                <option value="popularity">Most Popular</option>
                <option value="score">Highest Rated</option>
                <option value="title">Title (A-Z)</option>
                <option value="favorites">Most Bookmarked</option>
              </select>
            </div>

            {/* Min Rating */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Min Score: <span className="text-amber-400 font-mono">{filters.minRating}+</span>
              </label>
              <input
                type="range"
                min="0"
                max="9"
                step="0.5"
                value={filters.minRating}
                onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
                className="w-full accent-purple-500"
              />
            </div>
          </div>

          {/* Genre Badges Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">Select Genres</label>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              {GENRES_LIST.map((g) => {
                const active = filters.genres.includes(g.name);
                return (
                  <button
                    key={g.id}
                    onClick={() => toggleGenre(g.name)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      active
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {g.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <p>
          Found <strong className="text-purple-400 font-bold">{results.length}</strong> matching titles
        </p>
        {loading && (
          <span className="flex items-center gap-1.5 text-purple-400 font-bold">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Searching MangaDex & Jikan APIs...</span>
          </span>
        )}
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <MangaCard key={i} loading />)
          : results.map((manga) => (
              <MangaCard
                key={manga.id}
                manga={manga}
                onSelect={onSelectManga}
                onToast={onToast}
              />
            ))}
      </div>
    </div>
  );
};
