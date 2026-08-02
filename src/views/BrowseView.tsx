import React from 'react';
import { Compass, Filter, Sparkles } from 'lucide-react';
import { MangaItem } from '../types/manga';
import { searchManga, CURATED_FEATURED } from '../services/mangaApi';
import { MangaCard } from '../components/MangaCard';

interface BrowseViewProps {
  onSelectManga: (manga: MangaItem) => void;
  onToast?: (msg: string, type?: 'success' | 'info') => void;
}

export const BrowseView: React.FC<BrowseViewProps> = ({ onSelectManga, onToast }) => {
  const [selectedLetter, setSelectedLetter] = React.useState<string>('All');
  const [selectedDemographic, setSelectedDemographic] = React.useState<string>('All');
  const [selectedFormat, setSelectedFormat] = React.useState<string>('manhwa'); // Default to popular Manhwa
  const [items, setItems] = React.useState<MangaItem[]>([]);
  const [loading, setLoading] = React.useState(false);

  const alphabet = ['All', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];
  const demographics = ['All', 'Shounen', 'Seinen', 'Shoujo', 'Josei'];

  React.useEffect(() => {
    async function fetchBrowse() {
      setLoading(true);
      const res = await searchManga({
        format: selectedFormat === 'All' ? 'all' : selectedFormat,
        letter: selectedLetter === 'All' ? undefined : selectedLetter,
        sortBy: 'popularity',
      });
      let filtered = res.items;
      if (selectedDemographic !== 'All') {
        filtered = filtered.filter(
          (m) => m.demographic?.toLowerCase() === selectedDemographic.toLowerCase()
        );
      }
      setItems(filtered.length > 0 ? filtered : CURATED_FEATURED);
      setLoading(false);
    }
    fetchBrowse();
  }, [selectedLetter, selectedDemographic, selectedFormat]);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <Compass className="w-8 h-8 text-cyan-400" />
          <span>Browse Manga & Manhwa</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Explore by Alphabetical Letter, Demographics, or Format
        </p>
      </div>

      {/* Format & Demographic Pills */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-400 mr-2 shrink-0">Format:</span>
          {['all', 'manhwa', 'manga', 'manhua'].map((fmt) => (
            <button
              key={fmt}
              onClick={() => setSelectedFormat(fmt)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase transition-all shrink-0 ${
                selectedFormat === fmt
                  ? 'bg-cyan-500 text-cyan-950 shadow-md shadow-cyan-500/30'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-400 mr-2 shrink-0">Demographic:</span>
          {demographics.map((demo) => (
            <button
              key={demo}
              onClick={() => setSelectedDemographic(demo)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedDemographic === demo
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {demo}
            </button>
          ))}
        </div>
      </div>

      {/* Alphabet Selector */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <span className="block text-xs font-bold text-slate-400 mb-2">Alphabetical Index:</span>
        <div className="flex flex-wrap gap-1">
          {alphabet.map((letter) => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                selectedLetter === letter
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800/80'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <MangaCard key={i} loading />)
          : items.map((manga) => (
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
