import React from 'react';
import { ArrowUp } from 'lucide-react';
import { Navbar, ViewType } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { QuickSearchModal } from './components/QuickSearchModal';
import { MangaDetailModal } from './components/MangaDetailModal';
import { ChapterReaderModal } from './components/ChapterReaderModal';
import { FAQModal } from './components/FAQModal';

import { HomeView } from './views/HomeView';
import { SearchView } from './views/SearchView';
import { BrowseView } from './views/BrowseView';
import { RankingsView } from './views/RankingsView';
import { GenresView } from './views/GenresView';
import { StatisticsView } from './views/StatisticsView';
import { CommunityView } from './views/CommunityView';
import { RandomDiscoveryView } from './views/RandomDiscoveryView';
import { LibraryView } from './views/LibraryView';

import { MangaItem, Chapter, ToastMessage } from './types/manga';
import { addRecentlyViewed } from './services/storageService';

export default function App() {
  const [currentView, setCurrentView] = React.useState<ViewType>('home');
  const [selectedMangaId, setSelectedMangaId] = React.useState<string | null>(null);

  // Chapter Reader State
  const [readerManga, setReaderManga] = React.useState<MangaItem | null>(null);
  const [readerChapter, setReaderChapter] = React.useState<Chapter | null>(null);

  // Modals & Search query
  const [quickSearchOpen, setQuickSearchOpen] = React.useState(false);
  const [faqOpen, setFaqOpen] = React.useState(false);
  const [searchInitialQuery, setSearchInitialQuery] = React.useState('');

  // Toast System
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);
  const [showBackToTop, setShowBackToTop] = React.useState(false);

  // Scroll listener for back-to-top
  React.useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const addToast = (title: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const newToast: ToastMessage = {
      id: String(Date.now()),
      title,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  };

  const handleSelectManga = (manga: MangaItem) => {
    if (manga.id.startsWith('doc-')) {
      setReaderManga(manga);
      setReaderChapter({
        id: `ch-${manga.id}`,
        chapterNumber: '1',
        title: manga.title,
        releaseDate: new Date().toISOString().split('T')[0],
        language: 'en',
        pagesCount: 20,
      });
      return;
    }
    addRecentlyViewed(manga);
    setSelectedMangaId(manga.id);
  };

  const handleOpenChapter = (manga: MangaItem, chapter: Chapter) => {
    setReaderManga(manga);
    setReaderChapter(chapter);
  };

  const handleGenreClick = (genreName: string) => {
    setSearchInitialQuery(genreName);
    setCurrentView('search');
  };

  const handleFullSearch = (query: string) => {
    setSearchInitialQuery(query);
    setCurrentView('search');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 font-sans selection:bg-purple-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenQuickSearch={() => setQuickSearchOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {currentView === 'home' && (
          <HomeView
            onSelectManga={handleSelectManga}
            onNavigate={setCurrentView}
            onToast={addToast}
          />
        )}

        {currentView === 'search' && (
          <SearchView
            initialQuery={searchInitialQuery}
            onSelectManga={handleSelectManga}
            onToast={addToast}
          />
        )}

        {currentView === 'browse' && (
          <BrowseView
            onSelectManga={handleSelectManga}
            onToast={addToast}
          />
        )}

        {currentView === 'rankings' && (
          <RankingsView
            onSelectManga={handleSelectManga}
            onToast={addToast}
          />
        )}

        {currentView === 'genres' && (
          <GenresView
            onSelectGenre={handleGenreClick}
          />
        )}

        {currentView === 'statistics' && <StatisticsView />}

        {currentView === 'community' && (
          <CommunityView onSelectManga={handleSelectManga} />
        )}

        {currentView === 'random' && (
          <RandomDiscoveryView
            onSelectManga={handleSelectManga}
            onToast={addToast}
          />
        )}

        {currentView === 'library' && (
          <LibraryView
            onSelectManga={handleSelectManga}
            onToast={addToast}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenFAQ={() => setFaqOpen(true)}
      />

      {/* Modals & Overlays */}
      <QuickSearchModal
        isOpen={quickSearchOpen}
        onClose={() => setQuickSearchOpen(false)}
        onSelectManga={handleSelectManga}
        onFullSearch={handleFullSearch}
      />

      <MangaDetailModal
        mangaId={selectedMangaId}
        isOpen={!!selectedMangaId}
        onClose={() => setSelectedMangaId(null)}
        onOpenChapter={handleOpenChapter}
        onSelectRelated={handleSelectManga}
        onToast={addToast}
      />

      <ChapterReaderModal
        isOpen={!!readerChapter && !!readerManga}
        manga={readerManga}
        chapter={readerChapter}
        onClose={() => {
          setReaderChapter(null);
          setReaderManga(null);
        }}
        onSelectChapter={setReaderChapter}
        onToast={addToast}
      />

      <FAQModal
        isOpen={faqOpen}
        onClose={() => setFaqOpen(false)}
      />

      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

      {/* Floating Back To Top */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 left-6 z-40 p-3 rounded-2xl bg-purple-600/90 hover:bg-purple-500 text-white shadow-xl shadow-purple-600/40 border border-purple-400/40 backdrop-blur-md transition-all hover:scale-110 active:scale-95"
          title="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
