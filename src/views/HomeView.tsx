import React from 'react';
import { Flame, Sparkles, Trophy, Star, ArrowRight, Grid, Zap, BookOpen } from 'lucide-react';
import { MangaItem } from '../types/manga';
import { HeroSlideshow } from '../components/HeroSlideshow';
import { MangaCard } from '../components/MangaCard';
import { getTopManga, CURATED_FEATURED, GENRES_LIST } from '../services/mangaApi';
import { ViewType } from '../components/Navbar';

interface HomeViewProps {
  onSelectManga: (manga: MangaItem) => void;
  onNavigate: (view: ViewType) => void;
  onToast?: (msg: string, type?: 'success' | 'info') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onSelectManga, onNavigate, onToast }) => {
  const [trendingManga, setTrendingManga] = React.useState<MangaItem[]>([]);
  const [trendingManhwa, setTrendingManhwa] = React.useState<MangaItem[]>([]);
  const [highestRated, setHighestRated] = React.useState<MangaItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadHomeData() {
      setLoading(true);
      try {
        const [mangaList, manhwaList] = await Promise.all([
          getTopManga(1, 'manga'),
          getTopManga(1, 'manhwa'),
        ]);
        setTrendingManga(mangaList.length > 0 ? mangaList : CURATED_FEATURED.filter(m => m.format === 'manga'));
        setTrendingManhwa(manhwaList.length > 0 ? manhwaList : CURATED_FEATURED.filter(m => m.format === 'manhwa'));
        setHighestRated([...CURATED_FEATURED].sort((a, b) => b.score - a.score));
      } catch (err) {
        console.error('Home load error', err);
        setTrendingManga(CURATED_FEATURED);
        setTrendingManhwa(CURATED_FEATURED.filter((m) => m.format === 'manhwa'));
        setHighestRated(CURATED_FEATURED);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Slideshow Banner */}
      <HeroSlideshow
        items={CURATED_FEATURED.slice(0, 5)}
        onSelectManga={onSelectManga}
        onToast={onToast}
      />

      {/* Section 1: Trending Manga */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">Trending Manga</h2>
              <p className="text-xs text-slate-400">Most popular Japanese manga series this month</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('search')}
            className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <MangaCard key={i} loading />)
            : trendingManga.slice(0, 6).map((manga) => (
                <MangaCard
                  key={manga.id}
                  manga={manga}
                  onSelect={onSelectManga}
                  onToast={onToast}
                />
              ))}
        </div>
      </section>

      {/* Section 2: Trending Manhwa */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">Trending Manhwa</h2>
              <p className="text-xs text-slate-400">Top Korean webtoons & full-color action series</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('browse')}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <span>Browse Manhwa</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <MangaCard key={i} loading />)
            : trendingManhwa.slice(0, 6).map((manhwa) => (
                <MangaCard
                  key={manhwa.id}
                  manga={manhwa}
                  onSelect={onSelectManga}
                  onToast={onToast}
                />
              ))}
        </div>
      </section>

      {/* Section 3: Popular Genres Grid Banner */}
      <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-800/40 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Popular Genre Categories</h2>
            <p className="text-xs text-slate-400">Discover stories by your favorite themes & demography</p>
          </div>
          <button
            onClick={() => onNavigate('genres')}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-colors"
          >
            Explore All Genres
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {GENRES_LIST.slice(0, 6).map((genre) => (
            <div
              key={genre.id}
              onClick={() => onNavigate('genres')}
              className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 cursor-pointer group transition-all hover:-translate-y-1 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xs text-slate-200 group-hover:text-purple-300">{genre.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: Highest Rated Leaderboard */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Trophy className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">Highest Rated Classics</h2>
              <p className="text-xs text-slate-400">Top acclaimed series rated by millions of readers worldwide</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('rankings')}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
          >
            <span>Full Rankings</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {highestRated.slice(0, 6).map((item) => (
            <MangaCard
              key={item.id}
              manga={item}
              onSelect={onSelectManga}
              onToast={onToast}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
