import React from 'react';
import { BarChart3, PieChart as PieIcon, TrendingUp, BookOpen, Layers } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { getLibrary } from '../services/storageService';
import { CURATED_FEATURED } from '../services/mangaApi';

export const StatisticsView: React.FC = () => {
  const library = getLibrary();
  const libraryItems = Object.values(library);

  // 1. Calculate Library Status Breakdown
  const statusCounts = {
    favorites: 0,
    reading: 0,
    plan_to_read: 0,
    completed: 0,
    dropped: 0,
  };

  libraryItems.forEach((item) => {
    if (statusCounts[item.status] !== undefined) {
      statusCounts[item.status]++;
    }
  });

  const libraryChartData = [
    { name: 'Favorites', value: statusCounts.favorites, color: '#ec4899' },
    { name: 'Reading', value: statusCounts.reading, color: '#8b5cf6' },
    { name: 'Plan to Read', value: statusCounts.plan_to_read, color: '#06b6d4' },
    { name: 'Completed', value: statusCounts.completed, color: '#10b981' },
    { name: 'Dropped', value: statusCounts.dropped, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  // Fallback demo data if user library is empty
  const demoLibraryData = [
    { name: 'Favorites', value: 8, color: '#ec4899' },
    { name: 'Reading', value: 14, color: '#8b5cf6' },
    { name: 'Plan to Read', value: 22, color: '#06b6d4' },
    { name: 'Completed', value: 12, color: '#10b981' },
  ];

  // 2. Genre Distribution Data
  const genreDistribution = [
    { name: 'Action', count: 48 },
    { name: 'Fantasy', count: 42 },
    { name: 'Adventure', count: 35 },
    { name: 'Supernatural', count: 28 },
    { name: 'Comedy', count: 24 },
    { name: 'Romance', count: 20 },
    { name: 'Psychological', count: 16 },
    { name: 'Sci-Fi', count: 14 },
  ];

  // 3. Top Scores Bar Data
  const scoreData = CURATED_FEATURED.map((m) => ({
    title: m.title.length > 12 ? m.title.slice(0, 12) + '...' : m.title,
    score: m.score,
  }));

  const COLORS = ['#8b5cf6', '#06b6d4', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

  return (
    <div className="space-y-8 pb-16">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-cyan-400" />
          <span>MangaVerse Analytics & Reading Stats</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Visual insights into global genre popularity and your personal reading history
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-purple-500/30 space-y-2">
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Saved Titles</span>
            <BookOpen className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-white">{libraryItems.length}</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between text-cyan-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Currently Reading</span>
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-white">{statusCounts.reading}</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-pink-500/30 space-y-2">
          <div className="flex items-center justify-between text-pink-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Favorites Count</span>
            <Layers className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-white">{statusCounts.favorites}</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-emerald-500/30 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Finished Series</span>
            <BarChart3 className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-white">{statusCounts.completed}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Local Library Breakdown */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
          <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-purple-400" />
            <span>My Library Reading Distribution</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={libraryChartData.length > 0 ? libraryChartData : demoLibraryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(libraryChartData.length > 0 ? libraryChartData : demoLibraryData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Top Titles Score Comparison */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
          <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <span>Featured Titles Score Rating</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="title" stroke="#64748b" fontSize={10} />
                <YAxis domain={[8, 10]} stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Bar dataKey="score" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Genre Popularity Breakdown */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4 lg:col-span-2">
          <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <span>Genre Popularity Distribution Across MangaDex & Jikan</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genreDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
