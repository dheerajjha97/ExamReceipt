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
        return 'bg-[#8C2B2B] hover:bg-[#722222] text-white border-[#A83838]';
      case 'warning':
        return 'bg-[#8C5A2B] hover:bg-[#734821] text-white border-[#A66C35]';
      case 'primary':
      default:
        return 'bg-[#2E5B50] hover:bg-[#254A41] text-white border-[#3B6E62]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-[#FDFCF8] rounded-3xl border border-[#E6E2D3] shadow-2xl max-w-md w-full p-6 space-y-5 transform-gpu transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#E6E2D3] pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${confirmVariant === 'danger' ? 'bg-[#F9E8E8] text-[#8C2B2B]' : 'bg-[#FAF0E6] text-[#8C5A2B]'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-[#4A453E] text-base">{title}</h3>
              <p className="text-xs text-[#787267] font-medium mt-0.5">Please confirm your action</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#787267] hover:text-[#4A453E] hover:bg-[#EFECE1] rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#4A453E] leading-relaxed bg-[#F7F5EE] p-4 rounded-2xl border border-[#E6E2D3]">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-[#EFECE1] hover:bg-[#E6E2D3] text-[#4A453E] font-bold rounded-2xl text-xs transition border border-[#DDD8C5]"
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
