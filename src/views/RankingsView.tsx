import React from 'react';
import { Trophy, Star, Crown, Flame, Award } from 'lucide-react';
import { MangaItem } from '../types/manga';
import { CURATED_FEATURED, getTopManga } from '../services/mangaApi';
import { MangaCard } from '../components/MangaCard';

interface RankingsViewProps {
  onSelectManga: (manga: MangaItem) => void;
  onToast?: (msg: string, type?: 'success' | 'info') => void;
}

export const RankingsView: React.FC<RankingsViewProps> = ({ onSelectManga, onToast }) => {
  const [category, setCategory] = React.useState<string>('top_rated');
  const [rankings, setRankings] = React.useState<MangaItem[]>([]);
  const [loading, setLoading] = React.useState(false);

  const categories = [
    { id: 'top_rated', name: 'Top Rated' },
    { id: 'popular', name: 'Most Popular' },
    { id: 'action', name: 'Best Action' },
    { id: 'fantasy', name: 'Best Fantasy' },
    { id: 'romance', name: 'Best Romance' },
    { id: 'comedy', name: 'Best Comedy' },
    { id: 'horror', name: 'Best Horror' },
    { id: 'sci-fi', name: 'Best Sci-Fi' },
    { id: 'sports', name: 'Best Sports' },
    { id: 'slice_of_life', name: 'Best Slice of Life' },
  ];

  React.useEffect(() => {
    async function loadRankings() {
      setLoading(true);
      try {
        const topList = await getTopManga(1);
        let sorted = [...(topList.length > 0 ? topList : CURATED_FEATURED)];

        if (category === 'top_rated') {
          sorted.sort((a, b) => b.score - a.score);
        } else if (category === 'popular') {
          sorted.sort((a, b) => (a.popularity || 999) - (b.popularity || 999));
        } else {
          // Genre-specific
          const catName = category.replace('_', ' ');
          sorted = sorted.filter((m) =>
            m.genres.some((g) => g.toLowerCase().includes(catName))
          );
          if (sorted.length < 4) sorted = CURATED_FEATURED;
        }
        setRankings(sorted);
      } catch {
        setRankings(CURATED_FEATURED);
      } finally {
        setLoading(false);
      }
    }
    loadRankings();
  }, [category]);

  return (
    <div className="space-y-8 pb-16">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <Trophy className="w-8 h-8 text-amber-400 fill-amber-400/20" />
          <span>Global Manga & Manhwa Leaderboards</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Top 100 highest rated and most popular series according to reader scores
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              category === cat.id
                ? 'bg-amber-500 text-amber-950 font-black shadow-lg shadow-amber-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Top 3 Podium Highlights */}
      {!loading && rankings.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Rank 2 - Silver */}
          <div
            onClick={() => onSelectManga(rankings[1])}
            className="p-5 rounded-3xl bg-slate-900/90 border border-slate-400/30 hover:border-slate-300 shadow-xl cursor-pointer transition-all hover:-translate-y-1 relative flex flex-col items-center text-center space-y-3"
          >
            <span className="absolute -top-3 px-3 py-1 rounded-full bg-slate-300 text-slate-950 text-xs font-black uppercase flex items-center gap-1 shadow-md">
              <Crown className="w-3.5 h-3.5" /> Rank #2 Silver
            </span>
            <img src={rankings[1].coverImage} alt={rankings[1].title} className="w-28 h-40 object-cover rounded-2xl shadow-lg mt-2" />
            <h3 className="font-extrabold text-sm text-slate-100">{rankings[1].title}</h3>
            <span className="text-amber-400 font-bold text-xs flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-current" /> {rankings[1].score?.toFixed(2)} Score
            </span>
          </div>

          {/* Rank 1 - Gold */}
          <div
            onClick={() => onSelectManga(rankings[0])}
            className="p-6 rounded-3xl bg-gradient-to-b from-amber-950/60 to-slate-900 border-2 border-amber-500/60 hover:border-amber-400 shadow-2xl cursor-pointer transition-all hover:-translate-y-2 relative flex flex-col items-center text-center space-y-3 md:-mt-4"
          >
            <span className="absolute -top-4 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 text-xs font-black uppercase flex items-center gap-1.5 shadow-xl shadow-amber-500/40">
              <Crown className="w-4 h-4 fill-current" /> Rank #1 Champion
            </span>
            <img src={rankings[0].coverImage} alt={rankings[0].title} className="w-32 h-48 object-cover rounded-2xl shadow-2xl mt-2 border-2 border-amber-400/50" />
            <h3 className="font-black text-base text-amber-300">{rankings[0].title}</h3>
            <span className="text-amber-400 font-extrabold text-sm flex items-center gap-1">
              <Star className="w-4 h-4 fill-current" /> {rankings[0].score?.toFixed(2)} Score
            </span>
          </div>

          {/* Rank 3 - Bronze */}
          <div
            onClick={() => onSelectManga(rankings[2])}
            className="p-5 rounded-3xl bg-slate-900/90 border border-amber-800/40 hover:border-amber-700 shadow-xl cursor-pointer transition-all hover:-translate-y-1 relative flex flex-col items-center text-center space-y-3"
          >
            <span className="absolute -top-3 px-3 py-1 rounded-full bg-amber-800 text-amber-100 text-xs font-black uppercase flex items-center gap-1 shadow-md">
              <Award className="w-3.5 h-3.5" /> Rank #3 Bronze
            </span>
            <img src={rankings[2].coverImage} alt={rankings[2].title} className="w-28 h-40 object-cover rounded-2xl shadow-lg mt-2" />
            <h3 className="font-extrabold text-sm text-slate-100">{rankings[2].title}</h3>
            <span className="text-amber-400 font-bold text-xs flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-current" /> {rankings[2].score?.toFixed(2)} Score
            </span>
          </div>
        </div>
      )}

      {/* Remaining Leaderboard Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-4">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <MangaCard key={i} loading />)
          : rankings.slice(3).map((manga, idx) => (
              <div key={manga.id} className="relative">
                <span className="absolute top-2 left-2 z-20 w-6 h-6 rounded-lg bg-slate-950/90 text-amber-400 font-mono font-bold text-xs flex items-center justify-center border border-slate-700">
                  #{idx + 4}
                </span>
                <MangaCard
                  manga={manga}
                  onSelect={onSelectManga}
                  onToast={onToast}
                />
              </div>
            ))}
      </div>
    </div>
  );
};
