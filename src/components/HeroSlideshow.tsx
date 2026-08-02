import React from 'react';
import { Star, Play, Bookmark, Flame, Sparkles, Hand } from 'lucide-react';
import { MangaItem } from '../types/manga';
import { getMangaProgress, updateMangaProgress, removeFromLibrary } from '../services/storageService';

interface HeroSlideshowProps {
  items: MangaItem[];
  onSelectManga: (manga: MangaItem) => void;
  onToast?: (msg: string, type?: 'success' | 'info') => void;
}

export const HeroSlideshow: React.FC<HeroSlideshowProps> = ({ items, onSelectManga, onToast }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isBookmarked, setIsBookmarked] = React.useState(false);

  // Finger slide / touch swipe state
  const [touchStartX, setTouchStartX] = React.useState<number | null>(null);
  const [touchCurrentX, setTouchCurrentX] = React.useState<number | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState(0);

  const current = items[currentIndex] || items[0];

  // Auto slideshow with reset support
  React.useEffect(() => {
    if (!items || items.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [items, currentIndex]);

  React.useEffect(() => {
    if (current) {
      const prog = getMangaProgress(current.id);
      setIsBookmarked(!!prog);
    }
  }, [current]);

  if (!current) return null;

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBookmarked) {
      removeFromLibrary(current.id);
      setIsBookmarked(false);
      onToast?.(`Removed "${current.title}" from library`);
    } else {
      updateMangaProgress(current, 'favorites');
      setIsBookmarked(true);
      onToast?.(`Added "${current.title}" to Favorites!`, 'success');
    }
  };

  // Finger slide / Touch swipe gesture handlers
  const handleStart = (clientX: number) => {
    setTouchStartX(clientX);
    setTouchCurrentX(clientX);
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || touchStartX === null) return;
    setTouchCurrentX(clientX);
    const offset = clientX - touchStartX;
    // Bound drag offset for smooth elasticity
    setDragOffset(offset);
  };

  const handleEnd = () => {
    if (!isDragging || touchStartX === null || touchCurrentX === null) {
      setIsDragging(false);
      setDragOffset(0);
      return;
    }

    const deltaX = touchCurrentX - touchStartX;
    const minSwipeDistance = 40; // minimum px for finger slide

    if (deltaX < -minSwipeDistance) {
      // Swiped Left -> Next Slide
      setCurrentIndex((prev) => (prev + 1) % items.length);
    } else if (deltaX > minSwipeDistance) {
      // Swiped Right -> Previous Slide
      setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    }

    setIsDragging(false);
    setTouchStartX(null);
    setTouchCurrentX(null);
    setDragOffset(0);
  };

  // Touch Events
  const onTouchStart = (e: React.TouchEvent) => handleStart(e.touches[0].clientX);
  const onTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);
  const onTouchEnd = () => handleEnd();

  // Mouse Events for desktop drag
  const onMouseDown = (e: React.MouseEvent) => {
    // Only drag if left click
    if (e.button === 0) handleStart(e.clientX);
  };
  const onMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);
  const onMouseUp = () => handleEnd();
  const onMouseLeave = () => {
    if (isDragging) handleEnd();
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      className="relative w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-800/80 shadow-2xl min-h-[480px] lg:min-h-[520px] flex flex-col justify-end select-none touch-pan-y cursor-grab active:cursor-grabbing group transition-all"
    >
      {/* Background Cover Image with Drag Animation */}
      <div
        className={`absolute inset-0 z-0 transition-transform ${
          isDragging ? 'duration-75' : 'duration-700 ease-out'
        }`}
        style={{
          transform: `translateX(${dragOffset * 0.4}px) scale(1.05)`,
        }}
      >
        <img
          src={current.bannerImage || current.coverImage}
          alt={current.title}
          draggable={false}
          className="w-full h-full object-cover object-center filter brightness-60 pointer-events-none"
        />
        {/* Layered Vignette & Neon Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
      </div>

      {/* Main Banner Content */}
      <div
        className={`relative z-10 p-6 sm:p-10 lg:p-12 max-w-3xl lg:max-w-4xl space-y-4 pb-16 sm:pb-12 pr-4 sm:pr-36 transition-transform ${
          isDragging ? 'duration-75' : 'duration-500 ease-out'
        }`}
        style={{
          transform: `translateX(${dragOffset * 0.15}px)`,
        }}
      >
        {/* Top Badges & Swipe Hint */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/40 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 fill-current text-amber-300" />
            <span>Featured Title #{currentIndex + 1}</span>
          </span>

          <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 backdrop-blur-md">
            {current.format}
          </span>

          <span className="px-3 py-1 rounded-full text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 backdrop-blur-md flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{current.score ? current.score.toFixed(2) : '9.0'} Score</span>
          </span>

          {/* Finger Slide Hint Badge */}
          <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-[11px] font-semibold text-slate-300 bg-slate-900/80 border border-slate-700/60 backdrop-blur-md items-center gap-1.5 ml-auto">
            <Hand className="w-3 h-3 text-purple-400 animate-pulse" />
            <span>Swipe or drag to slide</span>
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none drop-shadow-lg">
          {current.title}
        </h1>

        {/* Authors & Year */}
        <p className="text-xs sm:text-sm text-purple-300 font-semibold flex items-center gap-3">
          <span>By {current.authors?.[0]?.name || 'Unknown Author'}</span>
          <span>•</span>
          <span>{current.year || '2024'}</span>
          <span>•</span>
          <span className="text-emerald-400 font-bold capitalize">{current.status}</span>
        </p>

        {/* Synopsis */}
        <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed max-w-2xl font-normal">
          {current.synopsis}
        </p>

        {/* Genres */}
        <div className="flex flex-wrap gap-2 pt-1">
          {current.genres?.map((g) => (
            <span
              key={g}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-900/80 text-slate-200 border border-slate-700/60 font-medium"
            >
              {g}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-3">
          <button
            id={`btn-hero-read-${current.id}`}
            onClick={(e) => {
              // Ignore click if user was swipe-dragging
              if (Math.abs(dragOffset) > 10) return;
              onSelectManga(current);
            }}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm flex items-center gap-2 shadow-xl shadow-purple-600/40 hover:shadow-purple-600/60 transition-all hover:scale-105 active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Read Now</span>
          </button>

          <button
            id={`btn-hero-bookmark-${current.id}`}
            onClick={(e) => {
              if (Math.abs(dragOffset) > 10) return;
              handleBookmarkToggle(e);
            }}
            className={`px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 border transition-all ${
              isBookmarked
                ? 'bg-purple-600/80 text-white border-purple-400 shadow-lg'
                : 'bg-slate-900/80 text-slate-200 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            <span>{isBookmarked ? 'In Library' : 'Bookmark'}</span>
          </button>
        </div>
      </div>

      {/* Slide Position Indicator Dots (No chevron arrow buttons) */}
      <div className="absolute top-6 right-6 sm:bottom-6 sm:top-auto z-20 flex items-center gap-1.5 bg-slate-950/80 px-3 py-2 rounded-2xl border border-slate-800/80 backdrop-blur-md shadow-xl pointer-events-auto">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            title={`Slide ${i + 1}`}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              i === currentIndex ? 'w-6 bg-purple-500 shadow-sm shadow-purple-500/50' : 'w-2.5 bg-slate-700 hover:bg-slate-500'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

