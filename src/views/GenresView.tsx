import React from 'react';
import { Grid, Sparkles, BookOpen, ArrowRight } from 'lucide-react';
import { GENRES_LIST } from '../services/mangaApi';
import { ViewType } from '../components/Navbar';

interface GenresViewProps {
  onSelectGenre: (genreName: string) => void;
}

export const GenresView: React.FC<GenresViewProps> = ({ onSelectGenre }) => {
  return (
    <div className="space-y-8 pb-16">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <Grid className="w-8 h-8 text-purple-400" />
          <span>Genre Explorer</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Browse manga and manhwa categorized by themes, tropes, and demographic tags
        </p>
      </div>

      {/* Genre Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {GENRES_LIST.map((genre) => (
          <div
            key={genre.id}
            onClick={() => onSelectGenre(genre.name)}
            className="group relative p-6 rounded-3xl glass-panel glass-panel-hover cursor-pointer overflow-hidden flex flex-col justify-between space-y-4"
          >
            {/* Top Icon & Title */}
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>

              <span className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-purple-400 group-hover:border-purple-500/50 transition-colors">
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-lg text-slate-100 group-hover:text-purple-300 transition-colors">
                {genre.name}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">{genre.description}</p>
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-slate-500 border-t border-slate-800/80">
              <span>Explore Titles</span>
              <span className="text-purple-400">View Category →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
