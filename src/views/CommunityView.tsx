import React from 'react';
import { MessageSquare, Star, ThumbsUp, Heart, Sparkles, Filter } from 'lucide-react';
import { MangaItem } from '../types/manga';
import { CURATED_FEATURED } from '../services/mangaApi';

interface CommunityViewProps {
  onSelectManga: (manga: MangaItem) => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({ onSelectManga }) => {
  const [filterTag, setFilterTag] = React.useState<string>('All');

  const discussions = [
    {
      id: 'd1',
      title: 'Solo Leveling Chapter 200 ending discussion - Was it peak fiction?',
      author: 'SungJinWooFan',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      mangaTitle: 'Solo Leveling',
      likes: 420,
      replies: 88,
      time: '2 hours ago',
      tags: ['Manhwa', 'Spoilers', 'Ending'],
    },
    {
      id: 'd2',
      title: 'Why Berserk remains the unshakeable titan of Dark Fantasy manga',
      author: 'GutsGrit',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      mangaTitle: 'Berserk',
      likes: 650,
      replies: 142,
      time: '5 hours ago',
      tags: ['Analysis', 'Classic'],
    },
    {
      id: 'd3',
      title: 'Frieren: Beyond Journey\'s End - The philosophical depth of immortal elves',
      author: 'ElvenMage',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
      mangaTitle: 'Sousou no Frieren',
      likes: 310,
      replies: 45,
      time: '1 day ago',
      tags: ['Fantasy', 'Review'],
    },
    {
      id: 'd4',
      title: 'Top 5 Manhwa recommendations for beginners jumping from Anime',
      author: 'WebtoonOracle',
      avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&auto=format&fit=crop&q=80',
      mangaTitle: 'Omniscient Reader',
      likes: 290,
      replies: 62,
      time: '2 days ago',
      tags: ['Recommendations', 'Guide'],
    },
  ];

  const tagsList = ['All', 'Manhwa', 'Analysis', 'Review', 'Spoilers', 'Recommendations'];

  const filteredDiscussions = filterTag === 'All'
    ? discussions
    : discussions.filter((d) => d.tags.includes(filterTag));

  return (
    <div className="space-y-8 pb-16">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <MessageSquare className="w-8 h-8 text-pink-400" />
          <span>Community Discussions & Reviews</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Trending threads, chapter theories, and reviews from fellow manga and manhwa readers
        </p>
      </div>

      {/* Filter Tags */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        <Filter className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
        {tagsList.map((tag) => (
          <button
            key={tag}
            onClick={() => setFilterTag(tag)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filterTag === tag
                ? 'bg-pink-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Discussions List */}
      <div className="space-y-4">
        {filteredDiscussions.map((disc) => (
          <div
            key={disc.id}
            className="p-6 rounded-3xl glass-panel glass-panel-hover border border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={disc.avatar} alt={disc.author} className="w-10 h-10 rounded-full object-cover border border-purple-500/40" />
                <div>
                  <h4 className="font-bold text-xs text-slate-200">{disc.author}</h4>
                  <p className="text-[10px] text-slate-500">{disc.time} • Discussing <span className="text-purple-400 font-semibold">{disc.mangaTitle}</span></p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {disc.tags.map((t) => (
                  <span key={t} className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800/50">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <h3 className="font-extrabold text-base text-slate-100 hover:text-pink-400 cursor-pointer transition-colors">
              {disc.title}
            </h3>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 hover:text-pink-400 cursor-pointer">
                  <ThumbsUp className="w-4 h-4 text-pink-500" />
                  <span>{disc.likes} Likes</span>
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <span>{disc.replies} Replies</span>
                </span>
              </div>

              <span className="text-purple-400 font-semibold cursor-pointer hover:underline">
                Read Thread →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
