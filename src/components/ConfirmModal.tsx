import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  confirmVariant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Delete',
  confirmVariant = 'danger',
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  const getButtonBg = () => {
    switch (confirmVariant) {
      case 'danger':
        return 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white border-rose-500/40 shadow-rose-900/30';
      case 'warning':
        return 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white border-amber-500/40 shadow-amber-900/30';
      case 'primary':
      default:
        return 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white border-teal-400/40 shadow-teal-900/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl max-w-md w-full p-6 space-y-5 transform-gpu transition-all text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${confirmVariant === 'danger' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-white text-base">{title}</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Please confirm your action</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-2xl text-xs transition border border-white/10"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex items-center gap-1.5 px-5 py-2.5 font-bold rounded-2xl text-xs shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all transform-gpu border ${getButtonBg()}`}
          >
            <Trash2 className="w-4 h-4" />
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

