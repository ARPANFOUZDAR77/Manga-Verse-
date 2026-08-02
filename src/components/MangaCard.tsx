import React from 'react';
import { Star, Bookmark, Play, Flame } from 'lucide-react';
import { MangaItem, ReadingStatus } from '../types/manga';
import { getMangaProgress, updateMangaProgress, removeFromLibrary } from '../services/storageService';

interface MangaCardProps {
  manga?: MangaItem;
  loading?: boolean;
  onSelect?: (manga: MangaItem) => void;
  onToast?: (msg: string, type?: 'success' | 'info') => void;
}

export const MangaCard: React.FC<MangaCardProps> = ({ manga, loading, onSelect, onToast }) => {
  const [isInLibrary, setIsInLibrary] = React.useState(false);

  React.useEffect(() => {
    if (manga) {
      const prog = getMangaProgress(manga.id);
      setIsInLibrary(!!prog);
    }
  }, [manga]);

  if (loading || !manga) {
    return (
      <div className="relative rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden animate-pulse flex flex-col h-[340px]">
        <div className="w-full h-[220px] bg-slate-800/80" />
        <div className="p-3 flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-slate-800 rounded w-3/4" />
            <div className="h-3 bg-slate-800/60 rounded w-1/2" />
          </div>
          <div className="flex justify-between items-center pt-2">
            <div className="h-3 bg-slate-800/80 rounded w-12" />
            <div className="h-3 bg-slate-800/80 rounded w-12" />
          </div>
        </div>
      </div>
    );
  }

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInLibrary) {
      removeFromLibrary(manga.id);
      setIsInLibrary(false);
      onToast?.(`Removed "${manga.title}" from library`);
    } else {
      updateMangaProgress(manga, 'favorites');
      setIsInLibrary(true);
      onToast?.(`Saved "${manga.title}" to Favorites!`, 'success');
    }
  };

  const isManhwa = manga.format === 'manhwa';

  return (
    <div
      id={`manga-card-${manga.id}`}
      onClick={() => onSelect?.(manga)}
      className="group relative rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-purple-500/50 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-purple-900/20 flex flex-col h-full"
    >
      {/* Cover Image Container */}
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-slate-950">
        <img
          src={manga.coverImage}
          alt={manga.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-center z-10">
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-md ${
              isManhwa
                ? 'bg-cyan-500/80 text-cyan-950 border border-cyan-300/40'
                : 'bg-purple-600/80 text-purple-100 border border-purple-400/40'
            }`}
          >
            {manga.format}
          </span>

          <button
            id={`btn-bookmark-${manga.id}`}
            onClick={handleBookmarkClick}
            title={isInLibrary ? 'Remove from library' : 'Bookmark manga'}
            className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${
              isInLibrary
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/50'
                : 'bg-slate-900/60 text-slate-300 hover:text-white hover:bg-purple-600/80'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>

        {/* Floating Quick Read Hover Icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <div className="w-12 h-12 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-xl shadow-purple-600/50 scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 ml-0.5 fill-current" />
          </div>
        </div>

        {/* Rating & Chapter Badge on Image bottom */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between z-10 text-xs">
          <div className="flex items-center gap-1 text-amber-400 font-semibold bg-slate-950/80 px-2 py-0.5 rounded-md border border-amber-500/20 backdrop-blur-sm">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{manga.score ? manga.score.toFixed(1) : 'N/A'}</span>
          </div>
          {manga.chapters ? (
            <span className="text-[11px] text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-700/50">
              {manga.chapters} Chs
            </span>
          ) : (
            <span className="text-[11px] text-emerald-400 bg-slate-900/80 px-2 py-0.5 rounded-md border border-emerald-500/30">
              Ongoing
            </span>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-100 line-clamp-1 group-hover:text-purple-400 transition-colors">
            {manga.title}
          </h3>
          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
            {manga.authors?.[0]?.name || 'Unknown Author'}
          </p>
        </div>

        <div className="mt-2.5 flex flex-wrap gap-1">
          {manga.genres?.slice(0, 2).map((genre) => (
            <span
              key={genre}
              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/50"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
