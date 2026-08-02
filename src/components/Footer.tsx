import React from 'react';
import { BookOpen, Heart, HelpCircle, ShieldCheck } from 'lucide-react';
import { ViewType } from './Navbar';

interface FooterProps {
  onNavigate: (view: ViewType) => void;
  onOpenFAQ: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenFAQ }) => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800/80 mt-20 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white">
                <BookOpen className="w-4 h-4 fill-current" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">MangaVerse</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Modern Manga & Manhwa Explorer. Discover trending comics, track reading progress, and read your favorite titles in an interactive reader.
            </p>
          </div>

          {/* Quick Nav */}
          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider mb-3 text-[11px]">Explore</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-purple-400 transition-colors">
                  Home Page
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('rankings')} className="hover:text-purple-400 transition-colors">
                  Top Rankings
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('browse')} className="hover:text-purple-400 transition-colors">
                  Manhwa Directory
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('genres')} className="hover:text-purple-400 transition-colors">
                  Genre Categories
                </button>
              </li>
            </ul>
          </div>

          {/* Community & Stats */}
          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider mb-3 text-[11px]">Features</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('statistics')} className="hover:text-purple-400 transition-colors">
                  Interactive Stats
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('community')} className="hover:text-purple-400 transition-colors">
                  Reviews & Score
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('random')} className="hover:text-purple-400 transition-colors">
                  Random Generator
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('library')} className="hover:text-purple-400 transition-colors">
                  My Local Library
                </button>
              </li>
            </ul>
          </div>

          {/* Support & FAQ */}
          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider mb-3 text-[11px]">Help & Info</h4>
            <p className="text-slate-400 leading-relaxed text-xs mb-4">
              Have questions about reading modes, library sync, or file uploads? Check out our FAQ guide.
            </p>
            <button
              onClick={onOpenFAQ}
              className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 font-semibold text-xs"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>FAQ & User Guide</span>
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p className="flex items-center gap-1.5 text-slate-300 font-medium text-xs sm:text-sm">
            <span>made with</span>
            <span className="text-pink-500 text-sm">♥️</span>
            <span>by Arpan</span>
          </p>

          <div className="flex items-center gap-6 text-slate-500">
            <button onClick={onOpenFAQ} className="hover:text-slate-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Terms & Privacy</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
