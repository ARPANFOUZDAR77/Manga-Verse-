import React from 'react';
import {
  Sparkles,
  Search,
  BookOpen,
  Trophy,
  BarChart3,
  MessageSquare,
  Shuffle,
  Bookmark,
  Menu,
  X,
  Grid,
  Compass,
} from 'lucide-react';
import { getLibrary } from '../services/storageService';

export type ViewType =
  | 'home'
  | 'search'
  | 'browse'
  | 'rankings'
  | 'genres'
  | 'statistics'
  | 'community'
  | 'random'
  | 'library';

interface NavbarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  onOpenQuickSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenQuickSearch }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [libraryCount, setLibraryCount] = React.useState(0);

  React.useEffect(() => {
    const updateCount = () => {
      const lib = getLibrary();
      setLibraryCount(Object.keys(lib).length);
    };
    updateCount();
    const interval = setInterval(updateCount, 2000);
    return () => clearInterval(interval);
  }, [currentView]);

  const navItems: { id: ViewType; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'search', label: 'Search', icon: <Search className="w-4 h-4" /> },
    { id: 'browse', label: 'Browse', icon: <Compass className="w-4 h-4" /> },
    { id: 'rankings', label: 'Rankings', icon: <Trophy className="w-4 h-4" /> },
    { id: 'genres', label: 'Genres', icon: <Grid className="w-4 h-4" /> },
    { id: 'statistics', label: 'Stats', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'community', label: 'Reviews', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'random', label: 'Surprise', icon: <Shuffle className="w-4 h-4" /> },
    { id: 'library', label: 'Library', icon: <Bookmark className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div
          id="btn-nav-logo"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5 fill-current text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
              MangaVerse
            </span>
            <span className="hidden sm:block text-[10px] text-slate-400 font-medium tracking-widest uppercase">
              Manga & Manhwa
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1">
          {navItems.map((item) => {
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`btn-nav-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  active
                    ? 'text-white bg-purple-600/20 border border-purple-500/40 text-purple-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.id === 'library' && libraryCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-purple-600 text-white font-bold">
                    {libraryCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Quick Search Button & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <button
            id="btn-quick-search"
            onClick={onOpenQuickSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/60 hover:border-purple-500/60 text-slate-400 hover:text-slate-200 text-xs transition-all shadow-inner"
          >
            <Search className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-400 rounded border border-slate-700 font-mono">
              ⌘K
            </kbd>
          </button>

          <button
            id="btn-nav-library-mobile"
            onClick={() => onNavigate('library')}
            className="xl:hidden relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            <Bookmark className="w-5 h-5" />
            {libraryCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] font-bold flex items-center justify-center">
                {libraryCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            id="btn-mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-2xl px-4 py-3 space-y-1 animate-in slide-in-from-top duration-200">
          {navItems.map((item) => {
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
                  active
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.id === 'library' && libraryCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-purple-600 text-white font-bold">
                    {libraryCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
