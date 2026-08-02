import React from 'react';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';
import { ToastMessage } from '../types/manga';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto p-3.5 rounded-xl glass-panel border border-slate-700/80 shadow-2xl flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-200"
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-cyan-400 shrink-0" />}
          {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
          {toast.type === 'error' && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}

          <div className="flex-1">
            <p className="text-xs font-bold text-slate-100">{toast.title}</p>
            {toast.description && <p className="text-[11px] text-slate-400 mt-0.5">{toast.description}</p>}
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-500 hover:text-slate-200 p-0.5 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
