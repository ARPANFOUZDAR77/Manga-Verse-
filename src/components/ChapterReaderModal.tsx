import React from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  LayoutList,
  BookOpen,
  CheckCircle2,
  Loader2,
  Upload,
  RotateCw,
  Grid,
} from 'lucide-react';
import { Chapter, MangaItem } from '../types/manga';
import { getChapterPages } from '../services/mangaApi';
import { updateMangaProgress } from '../services/storageService';
import { parsePdfFile, parseCbzFile, saveUploadedMangaDoc, getUploadedMangaDocs } from '../services/pdfService';

interface ChapterReaderModalProps {
  isOpen: boolean;
  manga: MangaItem | null;
  chapter: Chapter | null;
  allChapters?: Chapter[];
  onClose: () => void;
  onSelectChapter?: (ch: Chapter) => void;
  onToast?: (msg: string, type?: 'success' | 'info') => void;
}

export const ChapterReaderModal: React.FC<ChapterReaderModalProps> = ({
  isOpen,
  manga,
  chapter,
  allChapters = [],
  onClose,
  onSelectChapter,
  onToast,
}) => {
  const [pages, setPages] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [parsingProgress, setParsingProgress] = React.useState<string | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = React.useState(0);
  const [readerMode, setReaderMode] = React.useState<'webtoon' | 'single'>('webtoon');
  const [zoomLevel, setZoomLevel] = React.useState(100);
  const [rotation, setRotation] = React.useState(0);
  const [showThumbnails, setShowThumbnails] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Load pages for selected chapter
  React.useEffect(() => {
    if (!chapter || !manga) return;
    setLoading(true);
    setParsingProgress(null);
    setCurrentPageIndex(0);

    // If this is an uploaded document (PDF/CBZ), load stored pages directly
    if (manga.id.startsWith('doc-')) {
      const uploadedDocs = getUploadedMangaDocs();
      const foundDoc = uploadedDocs.find((d) => d.id === manga.id);
      if (foundDoc && foundDoc.pages && foundDoc.pages.length > 0) {
        setPages(foundDoc.pages);
        setLoading(false);
        updateMangaProgress(manga, 'reading', '1', chapter.id);
        onToast?.(`Reading PDF Document: ${manga.title} (${foundDoc.pages.length} pages)`, 'info');
        return;
      }
    }

    getChapterPages(chapter.id, manga.title).then((p) => {
      setPages(p);
      setLoading(false);
      updateMangaProgress(manga, 'reading', chapter.chapterNumber, chapter.id);
      onToast?.(`Reading Chapter ${chapter.chapterNumber}`, 'info');
    });
  }, [chapter, manga]);

  if (!isOpen || !chapter || !manga) return null;

  // Handle local PDF or CBZ file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setParsingProgress('Reading file structure...');

    try {
      let parsedPages: string[] = [];
      let coverImage = '';

      if (file.name.toLowerCase().endsWith('.pdf')) {
        const res = await parsePdfFile(file, (rendered, total) => {
          setParsingProgress(`Parsing PDF page ${rendered} of ${total}...`);
        });
        parsedPages = res.pages;
        coverImage = res.coverImage;
      } else if (/\.(cbz|zip)$/i.test(file.name)) {
        const res = await parseCbzFile(file, (extracted, total) => {
          setParsingProgress(`Extracting image ${extracted} of ${total}...`);
        });
        parsedPages = res.pages;
        coverImage = res.coverImage;
      } else {
        onToast?.('Please upload a valid .pdf or .cbz file', 'info');
        setLoading(false);
        return;
      }

      if (parsedPages.length > 0) {
        setPages(parsedPages);
        setCurrentPageIndex(0);
        saveUploadedMangaDoc({
          id: `doc-${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          fileName: file.name,
          fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
          fileType: file.name.endsWith('.pdf') ? 'pdf' : 'cbz',
          coverImage,
          pagesCount: parsedPages.length,
          pages: parsedPages,
          uploadDate: new Date().toLocaleDateString(),
        });
        onToast?.(`Successfully loaded ${parsedPages.length} pages from ${file.name}!`, 'success');
      }
    } catch (err) {
      console.error('File parsing error:', err);
      onToast?.('Failed to parse document. Check format.', 'info');
    } finally {
      setLoading(false);
      setParsingProgress(null);
    }
  };

  const currentIndex = allChapters.findIndex((c) => c.id === chapter.id);
  const prevChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;
  const nextChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col overflow-hidden select-none animate-in fade-in duration-200">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf,.cbz,.zip"
        className="hidden"
      />

      {/* Top Controls Header */}
      <div className="h-14 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-20 shrink-0 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Close Reader"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-100 truncate">{manga.title}</h3>
            <p className="text-xs text-purple-400 font-semibold truncate">
              Chapter {chapter.chapterNumber}: {chapter.title}
            </p>
          </div>
        </div>

        {/* Middle Mode, Upload & Tools */}
        <div className="hidden md:flex items-center gap-2">
          {/* PDF / CBZ Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-900/20"
            title="Upload custom PDF or CBZ manga file"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Open PDF / CBZ File</span>
          </button>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setReaderMode('webtoon')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                readerMode === 'webtoon' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Webtoon</span>
            </button>
            <button
              onClick={() => setReaderMode('single')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                readerMode === 'single' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Single</span>
            </button>
          </div>

          {/* Rotation & Thumbnails */}
          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
            title="Rotate Page"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowThumbnails((t) => !t)}
            className={`p-1.5 rounded-xl border text-xs font-semibold transition-colors ${
              showThumbnails
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle Thumbnails Bar"
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* Zoom */}
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-xs text-slate-400">
            <button onClick={() => setZoomLevel((z) => Math.max(70, z - 15))} className="p-1 hover:text-white">
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-mono">{zoomLevel}%</span>
            <button onClick={() => setZoomLevel((z) => Math.min(150, z + 15))} className="p-1 hover:text-white">
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chapter Switcher */}
        <div className="flex items-center gap-2">
          {prevChapter && (
            <button
              onClick={() => onSelectChapter?.(prevChapter)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev Ch</span>
            </button>
          )}

          {nextChapter && (
            <button
              onClick={() => onSelectChapter?.(nextChapter)}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md shadow-purple-600/30"
            >
              <span className="hidden sm:inline">Next Ch</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Container with Optional Thumbnail Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Page Thumbnails Drawer */}
        {showThumbnails && pages.length > 0 && (
          <div className="w-48 bg-slate-900 border-r border-slate-800 p-2 overflow-y-auto space-y-2 shrink-0 animate-in slide-in-from-left duration-200">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
              Pages ({pages.length})
            </p>
            {pages.map((pUrl, pIdx) => (
              <button
                key={pIdx}
                onClick={() => {
                  setCurrentPageIndex(pIdx);
                  if (readerMode === 'webtoon') {
                    const el = document.getElementById(`manga-page-${pIdx}`);
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={`w-full p-1 rounded-lg border text-left transition-all ${
                  currentPageIndex === pIdx
                    ? 'border-purple-500 bg-purple-950/40'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950'
                }`}
              >
                <img src={pUrl} alt={`Thumbnail ${pIdx + 1}`} className="w-full h-24 object-cover rounded" />
                <span className="text-[10px] font-mono text-slate-400 mt-1 block text-center">
                  Page {pIdx + 1}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Main Canvas / Reading Area */}
        <div className="flex-1 overflow-y-auto bg-slate-950 p-2 sm:p-6 flex flex-col items-center">
          {loading ? (
            <div className="my-auto flex flex-col items-center gap-3 text-purple-400 max-w-sm text-center">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="text-sm font-semibold text-slate-200">
                {parsingProgress || 'Loading high-resolution chapter pages...'}
              </p>
            </div>
          ) : readerMode === 'webtoon' ? (
            /* Webtoon Continuous Scroll */
            <div
              className="flex flex-col items-center gap-2 transition-all"
              style={{ width: `${zoomLevel}%`, maxWidth: '900px' }}
            >
              {pages.map((pageUrl, idx) => (
                <div
                  key={idx}
                  id={`manga-page-${idx}`}
                  className="relative w-full shadow-2xl rounded-lg overflow-hidden bg-slate-900 border border-slate-800"
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  <img
                    src={pageUrl}
                    alt={`Page ${idx + 1}`}
                    className="w-full h-auto object-contain block"
                    loading="lazy"
                  />
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] text-slate-400 font-mono">
                    Page {idx + 1} / {pages.length}
                  </span>
                </div>
              ))}

              {/* Bottom Chapter Navigation Footer */}
              <div className="my-10 p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center max-w-md w-full space-y-4">
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Chapter {chapter.chapterNumber} Finished!</span>
                </div>
                <div className="flex justify-center gap-3">
                  {nextChapter ? (
                    <button
                      onClick={() => onSelectChapter?.(nextChapter)}
                      className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30"
                    >
                      Read Chapter {nextChapter.chapterNumber} →
                    </button>
                  ) : (
                    <button onClick={onClose} className="w-full py-3 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs">
                      Back to Details
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Single Page Mode */
            <div className="my-auto flex flex-col items-center gap-4 w-full">
              <div
                className="relative max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <img
                  src={pages[currentPageIndex] || pages[0]}
                  alt={`Page ${currentPageIndex + 1}`}
                  className="w-full h-auto max-h-[75vh] object-contain mx-auto"
                />
              </div>

              {/* Page Pager Controls */}
              <div className="flex items-center gap-4 bg-slate-900 px-4 py-2 rounded-2xl border border-slate-800 text-sm font-semibold">
                <button
                  disabled={currentPageIndex === 0}
                  onClick={() => setCurrentPageIndex((p) => Math.max(0, p - 1))}
                  className="p-2 rounded-lg hover:bg-slate-800 disabled:opacity-40"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-purple-300 font-mono">
                  Page {currentPageIndex + 1} of {pages.length}
                </span>
                <button
                  disabled={currentPageIndex === pages.length - 1}
                  onClick={() => setCurrentPageIndex((p) => Math.min(pages.length - 1, p + 1))}
                  className="p-2 rounded-lg hover:bg-slate-800 disabled:opacity-40"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
