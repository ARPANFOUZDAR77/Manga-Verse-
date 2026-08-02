import React from 'react';
import { X, HelpCircle, Database, ShieldCheck, Zap } from 'lucide-react';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FAQModal: React.FC<FAQModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const faqs = [
    {
      q: 'Where does MangaVerse get its manga & manhwa collection?',
      a: 'MangaVerse integrates rich data across thousands of popular Japanese manga and Korean manhwa series. We combine chapter feeds, ratings, metadata, and character details seamlessly in real-time.',
    },
    {
      q: 'Is an account required to use MangaVerse?',
      a: 'No account or login is required! Your reading history, chapter bookmarks, favorites, and custom reading status (Reading, Plan to Read, Completed, Dropped) are stored locally in your web browser.',
    },
    {
      q: 'How do I backup or transfer my manga library?',
      a: 'Navigate to the "Library" tab and click the "Export Library" button. This downloads a file containing all your saved titles and reading progress, which you can easily import on any other device.',
    },
    {
      q: 'Can I read chapters directly on MangaVerse?',
      a: 'Yes! MangaVerse includes an interactive built-in Chapter Reader with support for both standard Single Page mode and Continuous Webtoon scrolling mode with full zoom and page tracking.',
    },
    {
      q: 'Is MangaVerse free to use?',
      a: 'Yes, MangaVerse is 100% free. We respect your privacy and store your reading preferences locally in your browser.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-purple-400">
            <HelpCircle className="w-5 h-5" />
            <h3 className="font-extrabold text-lg text-slate-100">Frequently Asked Questions</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="my-4 overflow-y-auto space-y-4 pr-1">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <h4 className="font-bold text-sm text-purple-300 mb-1.5">{faq.q}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-colors"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
