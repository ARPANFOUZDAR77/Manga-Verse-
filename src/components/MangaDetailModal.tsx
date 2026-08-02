import React from 'react';
import {
  X,
  Star,
  Bookmark,
  Play,
  Calendar,
  Layers,
  BookOpen,
  Users,
  MessageSquare,
  Share2,
  ExternalLink,
  Search,
  ArrowUpDown,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { MangaDetail, Chapter, ReadingStatus, MangaItem } from '../types/manga';
import { getMangaDetails } from '../services/mangaApi';
import { getMangaProgress, updateMangaProgress, removeFromLibrary } from '../services/storageService';

interface MangaDetailModalProps {
  mangaId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenChapter: (manga: MangaItem, chapter: Chapter) => void;
  onSelectRelated: (manga: MangaItem) => void;
  onToast?: (msg: string, type?: 'success' | 'info') => void;
}

export const MangaDetailModal: React.FC<MangaDetailModalProps> = ({
  mangaId,
  isOpen,
  onClose,
  onOpenChapter,
  onSelectRelated,
  onToast,
}) => {
  const [detail, setDetail] = React.useState<MangaDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'overview' | 'chapters' | 'characters' | 'reviews' | 'related'>('overview');
  const [readingStatus, setReadingStatus] = React.useState<ReadingStatus | 'none'>('none');
  const [chapterSearch, setChapterSearch] = React.useState('');
  const [sortAsc, setSortAsc] = React.useState(false);

  React.useEffect(() => {
    if (!mangaId || !isOpen) return;
    setLoading(true);
    setActiveTab('overview');

    getMangaDetails(mangaId).then((data) => {
      setDetail(data);
      setLoading(false);
      if (data) {
        const prog = getMangaProgress(data.id);
        if (prog) {
          setReadingStatus(prog.status);
        } else {
          setReadingStatus('none');
        }
      }
    });
  }, [mangaId, isOpen]);

  if (!isOpen || !mangaId) return null;

  const handleStatusChange = (status: ReadingStatus | 'none') => {
    if (!detail) return;
    if (status === 'none') {
      removeFromLibrary(detail.id);
      setReadingStatus('none');
      onToast?.(`Removed "${detail.title}" from Library`);
    } else {
      updateMangaProgress(detail, status);
      setReadingStatus(status);
      onToast?.(`Updated status to "${status.replace('_', ' ')}"`, 'success');
    }
  };

  const isManhwa = detail?.format === 'manhwa';

  // Filter & sort chapters
  const filteredChapters = (detail?.chaptersList || [])
    .filter((ch) =>
      ch.title.toLowerCase().includes(chapterSearch.toLowerCase()) ||
      ch.chapterNumber.includes(chapterSearch)
    )
    .sort((a, b) => {
      const numA = parseFloat(a.chapterNumber) || 0;
      const numB = parseFloat(b.chapterNumber) || 0;
      return sortAsc ? numA - numB : numB - numA;
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-slate-950/80 hover:bg-purple-600 text-slate-300 hover:text-white transition-colors border border-slate-700/80 backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>

        {loading || !detail ? (
          <div className="p-20 text-center text-purple-400 font-bold space-y-3 my-auto">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-300">Fetching MangaVerse Metadata & Chapters...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Hero Backdrop Banner */}
            <div className="relative h-64 sm:h-80 w-full bg-slate-950 overflow-hidden">
              <img
                src={detail.bannerImage || detail.coverImage}
                alt={detail.title}
                className="w-full h-full object-cover filter brightness-50 scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

              {/* Banner Info */}
              <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider ${
                      isManhwa ? 'bg-cyan-500 text-cyan-950' : 'bg-purple-600 text-white'
                    }`}
                  >
                    {detail.format}
                  </span>
                  <span className="px-3 py-1 rounded-md text-xs font-bold bg-slate-950/80 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {detail.score ? detail.score.toFixed(2) : '9.0'}
                  </span>
                  <span className="px-3 py-1 rounded-md text-xs font-bold bg-slate-950/80 text-emerald-400 border border-emerald-500/30 capitalize">
                    {detail.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Poster & Main Header Information */}
            <div className="px-6 sm:px-8 pb-6 flex flex-col md:flex-row gap-6 -mt-24 relative z-10">
              {/* Cover Poster */}
              <div className="w-36 sm:w-48 aspect-[2/3] rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-700/80 shadow-2xl shrink-0">
                <img src={detail.coverImage} alt={detail.title} className="w-full h-full object-cover" />
              </div>

              {/* Title & Metadata */}
              <div className="flex-1 space-y-3 pt-2">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{detail.title}</h1>
                  {detail.japaneseTitle && (
                    <p className="text-xs text-slate-400 mt-0.5">{detail.japaneseTitle}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-300">
                  <p>
                    <strong className="text-slate-400">Author:</strong> {detail.authors?.[0]?.name || 'N/A'}
                  </p>
                  <p>
                    <strong className="text-slate-400">Serialization:</strong> {detail.serialization || 'MangaVerse'}
                  </p>
                  <p>
                    <strong className="text-slate-400">Year:</strong> {detail.year || 2020}
                  </p>
                  <p>
                    <strong className="text-slate-400">Demographic:</strong> {detail.demographic || 'Shounen'}
                  </p>
                </div>

                {/* Library Reading Status Picker */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 mr-1">Library Status:</span>
                  {(['favorites', 'reading', 'plan_to_read', 'completed', 'dropped'] as ReadingStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(readingStatus === st ? 'none' : st)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                        readingStatus === st
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="px-6 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: <BookOpen className="w-4 h-4" /> },
                { id: 'chapters', label: `Chapters (${detail.chaptersList?.length || 0})`, icon: <Layers className="w-4 h-4" /> },
                { id: 'characters', label: `Characters (${detail.characters?.length || 0})`, icon: <Users className="w-4 h-4" /> },
                { id: 'reviews', label: 'Reviews', icon: <MessageSquare className="w-4 h-4" /> },
                { id: 'related', label: 'Related', icon: <Sparkles className="w-4 h-4" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-3 font-bold text-xs flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="p-6">
              {/* 1. OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-2">Synopsis</h3>
                    <p className="text-sm text-slate-300 leading-relaxed font-normal">{detail.synopsis}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-2">Genres & Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {detail.genres?.map((g) => (
                        <span key={g} className="px-3 py-1 rounded-xl bg-purple-900/30 border border-purple-700/50 text-purple-200 text-xs font-semibold">
                          {g}
                        </span>
                      ))}
                      {detail.themes?.map((t) => (
                        <span key={t} className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* External Links */}
                  {detail.externalLinks && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-2">External Links</h3>
                      <div className="flex flex-wrap gap-3">
                        {detail.externalLinks.map((link) => (
                          <a
                            key={link.title}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                          >
                            <span>{link.title}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. CHAPTERS TAB */}
              {activeTab === 'chapters' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={chapterSearch}
                        onChange={(e) => setChapterSearch(e.target.value)}
                        placeholder="Filter chapter number or title..."
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <button
                      onClick={() => setSortAsc(!sortAsc)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                      <span>{sortAsc ? 'Oldest First' : 'Newest First'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-1">
                    {filteredChapters.map((ch) => (
                      <div
                        key={ch.id}
                        onClick={() => onOpenChapter(detail, ch)}
                        className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800/80 hover:border-purple-500/50 cursor-pointer flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-100 group-hover:text-purple-300">
                            Chapter {ch.chapterNumber}: {ch.title}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {ch.groupName} • {ch.releaseDate}
                          </p>
                        </div>
                        <button className="px-3 py-1 rounded-lg bg-purple-600/20 group-hover:bg-purple-600 text-purple-300 group-hover:text-white text-xs font-bold flex items-center gap-1 transition-colors">
                          <Play className="w-3 h-3 fill-current" />
                          <span>Read</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. CHARACTERS TAB */}
              {activeTab === 'characters' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {detail.characters?.map((char) => (
                    <div key={char.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                      <img src={char.image} alt={char.name} className="w-20 h-20 rounded-full object-cover mx-auto bg-slate-900 border border-slate-700" />
                      <div>
                        <h4 className="font-bold text-xs text-slate-100">{char.name}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/50 font-semibold inline-block mt-1">
                          {char.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 4. REVIEWS TAB */}
              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  {detail.reviews?.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src={rev.avatar} alt={rev.username} className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <span className="font-bold text-xs text-slate-200">{rev.username}</span>
                            <p className="text-[10px] text-slate-500">{rev.date}</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          {rev.score} / 10
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{rev.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* 5. RELATED TAB */}
              {activeTab === 'related' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {detail.recommendations?.map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => onSelectRelated(rel)}
                      className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 cursor-pointer space-y-2 transition-colors group"
                    >
                      <img src={rel.coverImage} alt={rel.title} className="w-full aspect-[2/3] object-cover rounded-lg" />
                      <p className="font-bold text-xs text-slate-200 group-hover:text-purple-300 line-clamp-1">{rel.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
