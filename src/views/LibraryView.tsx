import React from 'react';
import {
  Bookmark,
  Download,
  Upload,
  BookOpen,
  Trash2,
  Play,
  FileUp,
  FileText,
  Clock,
} from 'lucide-react';
import { MangaItem, ReadingStatus, UserProgress } from '../types/manga';
import {
  getLibrary,
  getRecentlyViewed,
  removeFromLibrary,
  exportLibraryData,
  importLibraryData,
} from '../services/storageService';
import {
  getUploadedMangaDocs,
  deleteUploadedMangaDoc,
  parsePdfFile,
  parseCbzFile,
  saveUploadedMangaDoc,
  UploadedMangaDocument,
} from '../services/pdfService';
import { CURATED_FEATURED } from '../services/mangaApi';

interface LibraryViewProps {
  onSelectManga: (manga: MangaItem) => void;
  onToast?: (msg: string, type?: 'success' | 'info') => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ onSelectManga, onToast }) => {
  const [activeTab, setActiveTab] = React.useState<ReadingStatus | 'recently_viewed' | 'uploaded_docs'>('favorites');
  const [libraryData, setLibraryData] = React.useState<Record<string, UserProgress>>({});
  const [recentData, setRecentData] = React.useState<MangaItem[]>([]);
  const [uploadedDocs, setUploadedDocs] = React.useState<UploadedMangaDocument[]>([]);
  const [mangaMap, setMangaMap] = React.useState<Record<string, MangaItem>>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const refreshLibrary = React.useCallback(() => {
    const lib = getLibrary();
    setLibraryData(lib);
    setRecentData(getRecentlyViewed());
    setUploadedDocs(getUploadedMangaDocs());

    // Map existing curated items
    const map: Record<string, MangaItem> = {};
    CURATED_FEATURED.forEach((m) => {
      map[m.id] = m;
    });

    // Populate remaining library items
    Object.keys(lib).forEach((id) => {
      if (!map[id]) {
        map[id] = {
          id,
          title: lib[id].mangaTitle,
          coverImage: lib[id].coverImage,
          format: 'manga',
          status: 'ongoing',
          score: 8.8,
          synopsis: 'Saved in Local Library',
          genres: ['Library Item'],
          authors: [{ id: 'a1', name: 'Author' }],
        };
      }
    });
    setMangaMap(map);
  }, []);

  React.useEffect(() => {
    refreshLibrary();
  }, [refreshLibrary]);

  const handleExport = () => {
    const jsonStr = exportLibraryData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MangaVerse_Library_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onToast?.('Library backup downloaded successfully!', 'success');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && importLibraryData(content)) {
        refreshLibrary();
        onToast?.('Library restored successfully!', 'success');
      } else {
        onToast?.('Failed to parse backup JSON file', 'info');
      }
    };
    reader.readAsText(file);
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onToast?.(`Processing ${file.name}...`, 'info');

    try {
      let pages: string[] = [];
      let coverImage = '';

      if (file.name.toLowerCase().endsWith('.pdf')) {
        const res = await parsePdfFile(file);
        pages = res.pages;
        coverImage = res.coverImage;
      } else if (/\.(cbz|zip)$/i.test(file.name)) {
        const res = await parseCbzFile(file);
        pages = res.pages;
        coverImage = res.coverImage;
      } else {
        onToast?.('Please select a valid .pdf or .cbz file', 'info');
        return;
      }

      if (pages.length > 0) {
        const doc: UploadedMangaDocument = {
          id: `doc-${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          fileName: file.name,
          fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
          fileType: file.name.endsWith('.pdf') ? 'pdf' : 'cbz',
          coverImage,
          pagesCount: pages.length,
          pages,
          uploadDate: new Date().toLocaleDateString(),
        };
        saveUploadedMangaDoc(doc);
        refreshLibrary();
        setActiveTab('uploaded_docs');
        onToast?.(`Added "${doc.title}" (${pages.length} pages) to PDF Library!`, 'success');
      }
    } catch (err) {
      console.error(err);
      onToast?.('Failed to parse file. Make sure it is a valid PDF or CBZ.', 'info');
    }
  };

  const filteredItems = (Object.values(libraryData) as UserProgress[]).filter((item) => item.status === activeTab);

  return (
    <div className="space-y-8 pb-16">
      <input type="file" ref={fileInputRef} onChange={handleDocUpload} accept=".pdf,.cbz,.zip" className="hidden" />

      {/* Header & Export/Import Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Bookmark className="w-8 h-8 text-purple-400 fill-purple-400/20" />
            <span>My Manga & PDF Library</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Read online titles or upload & view real local PDF / CBZ manga files
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-900/30 transition-all"
          >
            <FileUp className="w-4 h-4" />
            <span>Upload PDF / CBZ Manga</span>
          </button>

          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-purple-500 text-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Download className="w-4 h-4 text-purple-400" />
            <span>Backup</span>
          </button>

          <label className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            <span>Import</span>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {[
          { id: 'favorites', label: 'Favorites' },
          { id: 'reading', label: 'Reading' },
          { id: 'uploaded_docs', label: `Uploaded PDF & CBZ (${uploadedDocs.length})` },
          { id: 'plan_to_read', label: 'Plan to Read' },
          { id: 'completed', label: 'Completed' },
          { id: 'recently_viewed', label: 'Recently Viewed' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Uploaded PDF & CBZ Manga Tab */}
      {activeTab === 'uploaded_docs' ? (
        uploadedDocs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedDocs.map((doc) => {
              const docManga: MangaItem = {
                id: doc.id,
                title: doc.title,
                coverImage: doc.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
                format: doc.fileType === 'pdf' ? 'manga' : 'manhwa',
                status: 'completed',
                score: 9.9,
                synopsis: `Uploaded File: ${doc.fileName} (${doc.fileSize})`,
                genres: ['Uploaded File', doc.fileType.toUpperCase()],
                authors: [{ id: 'u1', name: 'User Upload' }],
              };

              return (
                <div
                  key={doc.id}
                  className="p-4 rounded-3xl glass-panel border border-slate-800 flex items-start gap-4 group hover:border-purple-500/50 transition-all"
                >
                  <img
                    src={doc.coverImage || docManga.coverImage}
                    alt={doc.title}
                    className="w-20 h-28 object-cover rounded-xl bg-slate-950 shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-2">
                    <span className="px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 text-[10px] font-extrabold uppercase tracking-wider">
                      {doc.fileType.toUpperCase()} • {doc.pagesCount} Pages
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-100 group-hover:text-purple-300 truncate">
                      {doc.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {doc.fileName} ({doc.fileSize})
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => onSelectManga(docManga)}
                        className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-purple-600/30"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Read PDF</span>
                      </button>

                      <button
                        onClick={() => {
                          deleteUploadedMangaDoc(doc.id);
                          refreshLibrary();
                          onToast?.(`Deleted "${doc.title}"`);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center text-slate-400 space-y-4 bg-slate-900/50 rounded-3xl border border-slate-800">
            <FileText className="w-12 h-12 text-purple-400/50 mx-auto" />
            <h3 className="font-extrabold text-base text-slate-200">No PDF or CBZ files uploaded yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Upload your own manga PDF, CBZ, or ZIP files to parse and read them offline right in MangaVerse!
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all inline-flex items-center gap-2"
            >
              <FileUp className="w-4 h-4" />
              <span>Select PDF or CBZ File</span>
            </button>
          </div>
        )
      ) : activeTab === 'recently_viewed' ? (
        recentData.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentData.map((manga) => (
              <div
                key={manga.id}
                onClick={() => onSelectManga(manga)}
                className="p-2 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 cursor-pointer space-y-2 group transition-all"
              >
                <img src={manga.coverImage} alt={manga.title} className="w-full aspect-[2/3] object-cover rounded-xl" />
                <h4 className="font-bold text-xs text-slate-100 group-hover:text-purple-300 line-clamp-1">{manga.title}</h4>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 text-xs font-medium bg-slate-900/50 rounded-3xl border border-slate-800">
            No recently viewed titles found. Explore titles from Home or Search!
          </div>
        )
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((prog) => {
            const manga = mangaMap[prog.mangaId] || {
              id: prog.mangaId,
              title: prog.mangaTitle,
              coverImage: prog.coverImage,
              format: 'manga',
              status: 'ongoing',
              score: 8.8,
              synopsis: '',
              genres: [],
              authors: [],
            };

            return (
              <div
                key={prog.mangaId}
                className="p-4 rounded-3xl glass-panel border border-slate-800 flex items-start gap-4 group hover:border-purple-500/50 transition-all"
              >
                <img
                  src={prog.coverImage}
                  alt={prog.mangaTitle}
                  className="w-20 h-28 object-cover rounded-xl bg-slate-950 shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-2">
                  <h3 className="font-extrabold text-sm text-slate-100 group-hover:text-purple-300 truncate">
                    {prog.mangaTitle}
                  </h3>
                  <p className="text-xs text-purple-400 font-semibold flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Last Read: Ch {prog.lastReadChapter}</span>
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Updated: {new Date(prog.lastReadDate).toLocaleDateString()}
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onSelectManga(manga)}
                      className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 shadow-md"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Continue</span>
                    </button>

                    <button
                      onClick={() => {
                        removeFromLibrary(prog.mangaId);
                        refreshLibrary();
                        onToast?.(`Removed "${prog.mangaTitle}"`);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition-colors"
                      title="Remove from library"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center text-slate-400 space-y-3 bg-slate-900/50 rounded-3xl border border-slate-800">
          <Bookmark className="w-10 h-10 text-purple-400/50 mx-auto" />
          <h3 className="font-extrabold text-base text-slate-200">No titles in "{activeTab.replace('_', ' ')}"</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the bookmark button on any manga card or detail page to add it to your personal reading list.
          </p>
        </div>
      )}
    </div>
  );
};
