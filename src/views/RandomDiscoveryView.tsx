import React from 'react';
import { Shuffle, Sparkles, Flame, Zap, Play, Loader2 } from 'lucide-react';
import { MangaItem } from '../types/manga';
import { getRandomManga, GENRES_LIST } from '../services/mangaApi';
import { MangaCard } from '../components/MangaCard';

interface RandomDiscoveryViewProps {
  onSelectManga: (manga: MangaItem) => void;
  onToast?: (msg: string, type?: 'success' | 'info') => void;
}

export const RandomDiscoveryView: React.FC<RandomDiscoveryViewProps> = ({
  onSelectManga,
  onToast,
}) => {
  const [currentManga, setCurrentManga] = React.useState<MangaItem | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleSpinRandom = async (format?: 'manga' | 'manhwa') => {
    setLoading(true);
    const result = await getRandomManga(format);
    setCurrentManga(result);
    setLoading(false);
    onToast?.(`Discovered "${result.title}"!`, 'info');
  };

  React.useEffect(() => {
    handleSpinRandom();
  }, []);

  return (
    <div className="space-y-8 pb-16">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <Shuffle className="w-8 h-8 text-fuchsia-400" />
          <span>Random Manga & Manhwa Discovery</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Spin the roulette to discover hidden gems and unexpected titles from thousands of series
        </p>
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => handleSpinRandom('manga')}
          className="p-5 rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30 transition-all hover:scale-105 active:scale-95"
        >
          <Flame className="w-5 h-5 fill-current text-amber-300" />
          <span>Random Manga</span>
        </button>

        <button
          onClick={() => handleSpinRandom('manhwa')}
          className="p-5 rounded-3xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-600/30 transition-all hover:scale-105 active:scale-95"
        >
          <Zap className="w-5 h-5 fill-current text-cyan-300" />
          <span>Random Manhwa</span>
        </button>

        <button
          onClick={() => handleSpinRandom()}
          className="p-5 rounded-3xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-fuchsia-600/30 transition-all hover:scale-105 active:scale-95"
        >
          <Shuffle className="w-5 h-5" />
          <span>Shuffle Surprise</span>
        </button>
      </div>

      {/* Discovered Spotlight Card */}
      <div className="relative p-8 rounded-3xl glass-panel border border-fuchsia-500/40 shadow-2xl overflow-hidden min-h-[380px] flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center gap-3 text-fuchsia-400">
            <Loader2 className="w-12 h-12 animate-spin" />
            <p className="font-bold text-sm text-slate-200">Shuffling MangaVerse Roulette...</p>
          </div>
        ) : currentManga ? (
          <div className="flex flex-col md:flex-row items-center gap-8 w-full">
            <img
              src={currentManga.coverImage}
              alt={currentManga.title}
              className="w-44 h-64 object-cover rounded-2xl shadow-2xl border-2 border-fuchsia-500/40 shrink-0"
            />
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-fuchsia-600 text-white">
                  {currentManga.format}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ★ {currentManga.score?.toFixed(2)} Rating
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white">{currentManga.title}</h2>

              <p className="text-xs sm:text-sm text-slate-300 line-clamp-4 leading-relaxed font-normal">
                {currentManga.synopsis}
              </p>

              <div className="pt-2 flex justify-center md:justify-start gap-3">
                <button
                  onClick={() => onSelectManga(currentManga)}
                  className="px-6 py-3 rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-fuchsia-600/40 transition-colors"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Inspect Details & Chapters</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
