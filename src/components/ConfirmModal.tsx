import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert, CheckSquare } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  confirmVariant?: 'danger' | 'warning' | 'primary';
  requireSafetyCode?: string;
  requireSafetyCheckbox?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Delete',
  confirmVariant = 'danger',
  requireSafetyCode,
  requireSafetyCheckbox = false,
  onConfirm,
  onClose,
}) => {
  const [typedCode, setTypedCode] = useState('');
  const [isCheckConfirmed, setIsCheckConfirmed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTypedCode('');
      setIsCheckConfirmed(!requireSafetyCheckbox);
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, requireSafetyCheckbox, onClose]);

  if (!isOpen) return null;

  const isCodeValid = !requireSafetyCode || typedCode.trim().toUpperCase() === requireSafetyCode.toUpperCase();
  const canProceed = isCodeValid && isCheckConfirmed;

  const getButtonBg = () => {
    if (!canProceed) {
      return 'bg-slate-700 text-slate-400 border-slate-600 cursor-not-allowed opacity-50';
    }
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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-white/15 shadow-2xl max-w-md w-full p-6 space-y-5 transform-gpu transition-all text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${confirmVariant === 'danger' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-black text-white text-base">{title}</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                  🛡️ ग़लती से सुरक्षा (Safe)
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">आगे बढ़ने से पहले विवरण की पुष्टि करें</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition"
            title="रद्द करें (Close)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Accidental Tap Friendly Reassurance Banner */}
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-2.5 leading-relaxed">
          <span className="text-base leading-none">⚠️</span>
          <div>
            <strong className="block font-semibold text-amber-100">गलती से टैप हो गया? घबराएं नहीं!</strong>
            <span className="text-[11px] text-amber-200/90">
              अभी कुछ भी डिलीट नहीं हुआ है। अगर आप हटाना नहीं चाहते हैं, तो सीधे नीचे <strong>&quot;रद्द करें / वापस जाएं&quot;</strong> पर टैप करें।
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3.5 rounded-2xl border border-white/5 whitespace-pre-line">
          {message}
        </p>

        {requireSafetyCode && (
          <div className="space-y-1.5 bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-2xl">
            <label className="block text-[11px] font-bold text-rose-300">
              हटाने की पुष्टि के लिए <span className="underline font-mono uppercase bg-rose-950/50 px-1.5 py-0.5 rounded">{requireSafetyCode}</span> टाइप करें:
            </label>
            <input
              type="text"
              value={typedCode}
              onChange={(e) => setTypedCode(e.target.value)}
              placeholder={`Type "${requireSafetyCode}"`}
              className="w-full px-3 py-2 bg-slate-950 border border-rose-500/40 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 uppercase"
            />
          </div>
        )}

        {requireSafetyCheckbox && (
          <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 cursor-pointer select-none hover:bg-white/10 transition">
            <input
              type="checkbox"
              checked={isCheckConfirmed}
              onChange={(e) => setIsCheckConfirmed(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 text-rose-600 focus:ring-rose-500 bg-slate-800 w-4 h-4 cursor-pointer"
            />
            <span className="text-[11px] text-slate-300 leading-snug">
              हाँ, मैंने विवरण की जाँच कर ली है और मैं इसे हटाना चाहता हूँ (Confirm Delete).
            </span>
          </label>
        )}

        <div className="flex items-center justify-between gap-3 pt-2">
          {/* Prominent Safe Cancel Button */}
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs transition border border-white/15 text-center shadow"
          >
            ← रद्द करें / वापस जाएं (Cancel)
          </button>

          <button
            disabled={!canProceed}
            onClick={() => {
              if (canProceed) {
                onConfirm();
                onClose();
              }
            }}
            className={`flex items-center justify-center gap-1.5 px-5 py-2.5 font-bold rounded-2xl text-xs shadow-lg transition-all transform-gpu border ${getButtonBg()}`}
          >
            <Trash2 className="w-4 h-4" />
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

