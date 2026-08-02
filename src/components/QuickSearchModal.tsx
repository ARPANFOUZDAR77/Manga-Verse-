import React from 'react';
import { Search, X, Star, Bookmark, ArrowRight, Loader2 } from 'lucide-react';
import { MangaItem } from '../types/manga';
import { searchManga } from '../services/mangaApi';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectManga: (manga: MangaItem) => void;
  onFullSearch: (query: string) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectManga,
  onFullSearch,
}) => {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<MangaItem[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open signal handled by parent
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Live search debounced
  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      const res = await searchManga({ query, sortBy: 'popularity' });
      setResults(res.items.slice(0, 6));
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Header Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <Search className="w-5 h-5 text-purple-400 shrink-0 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles, authors, genres (e.g. Solo Leveling, Berserk)..."
            autoFocus
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                onFullSearch(query);
                onClose();
              }
            }}
          />
          {loading ? (
            <Loader2 className="w-5 h-5 text-purple-400 animate-spin shrink-0 ml-2" />
          ) : query ? (
            <button
              onClick={() => setQuery('')}
              className="text-slate-500 hover:text-slate-300 ml-2 p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>

        {/* Results Container */}
        <div className="p-2 max-h-[60vh] overflow-y-auto">
          {results.length > 0 ? (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Instant Suggestions
              </div>
              {results.map((manga) => (
                <div
                  key={manga.id}
                  onClick={() => {
                    onSelectManga(manga);
                    onClose();
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/80 cursor-pointer transition-colors group"
                >
                  <img
                    src={manga.coverImage}
                    alt={manga.title}
                    className="w-10 h-14 object-cover rounded-lg bg-slate-950 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-slate-100 group-hover:text-purple-400 truncate">
                      {manga.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      <span className="capitalize px-1.5 py-0.2 rounded bg-slate-800 text-purple-300 text-[10px] font-bold">
                        {manga.format}
                      </span>
                      <span className="flex items-center gap-1 text-amber-400 font-semibold text-[11px]">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {manga.score ? manga.score.toFixed(1) : 'N/A'}
                      </span>
                      <span className="truncate">{manga.genres.slice(0, 2).join(', ')}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    onFullSearch(query);
                    onClose();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <span>View all results for "{query}"</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : query && !loading ? (
            <div className="p-8 text-center text-slate-400">
              <p className="text-sm font-semibold">No manga found for "{query}"</p>
              <p className="text-xs text-slate-500 mt-1">Try searching for genres like "Action", "Isekai", or titles like "Solo Leveling"</p>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500 text-xs">
              <p className="font-medium text-slate-400 mb-2">Quick Shortcuts</p>
              <div className="flex justify-center gap-3">
                <span className="px-2 py-1 bg-slate-950 rounded border border-slate-800">Type "Solo" for Manhwa</span>
                <span className="px-2 py-1 bg-slate-950 rounded border border-slate-800">Type "Berserk" for Dark Fantasy</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
