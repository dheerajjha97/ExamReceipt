import React from 'react';
import { 
  Users, 
  UploadCloud, 
  CreditCard, 
  Settings,
  PlusCircle
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'students' | 'upload' | 'transactions' | 'settings';
  setActiveTab: (tab: 'students' | 'upload' | 'transactions' | 'settings') => void;
  onOpenLogTransaction: () => void;
  onOpenAddStudent: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenLogTransaction,
  onOpenAddStudent,
}) => {
  return (
    <>
      {/* Mobile Floating Action Button (FAB) */}
      <div className="fixed bottom-20 right-4 z-40 md:hidden flex flex-col gap-2.5 items-end">
        {/* Secondary Quick Action: Add Student */}
        <button
          onClick={onOpenAddStudent}
          className="p-3.5 bg-slate-800/90 text-teal-300 rounded-full shadow-xl border border-white/20 hover:scale-105 active:scale-95 transition transform-gpu flex items-center justify-center backdrop-blur-md"
          title="Add New Student"
        >
          <Users className="w-5 h-5" />
        </button>

        {/* Primary FAB: Log Transaction */}
        <button
          onClick={onOpenLogTransaction}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-full shadow-2xl border border-teal-400/40 hover:scale-105 active:scale-95 transition-all transform-gpu font-bold text-xs shadow-teal-500/30"
        >
          <PlusCircle className="w-5 h-5" />
          <span>+ Log Payment</span>
        </button>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-slate-900/95 backdrop-blur-2xl border-t border-white/10 shadow-2xl px-3 py-2 flex justify-around items-center">
        {/* Students Tab */}
        <button
          onClick={() => setActiveTab('students')}
          className={`flex flex-col items-center justify-center py-1.5 px-3.5 rounded-2xl transition-all transform-gpu ${
            activeTab === 'students'
              ? 'bg-gradient-to-r from-teal-500/30 to-emerald-500/30 text-white border border-teal-400/40 shadow-lg scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Students</span>
        </button>

        {/* OCR / Excel Upload Tab */}
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex flex-col items-center justify-center py-1.5 px-3.5 rounded-2xl transition-all transform-gpu ${
            activeTab === 'upload'
              ? 'bg-gradient-to-r from-teal-500/30 to-emerald-500/30 text-white border border-teal-400/40 shadow-lg scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UploadCloud className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Import</span>
        </button>

        {/* Transaction History Tab */}
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center justify-center py-1.5 px-3.5 rounded-2xl transition-all transform-gpu ${
            activeTab === 'transactions'
              ? 'bg-gradient-to-r from-teal-500/30 to-emerald-500/30 text-white border border-teal-400/40 shadow-lg scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Ledger</span>
        </button>

        {/* Settings Tab */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center py-1.5 px-3.5 rounded-2xl transition-all transform-gpu ${
            activeTab === 'settings'
              ? 'bg-gradient-to-r from-teal-500/30 to-emerald-500/30 text-white border border-teal-400/40 shadow-lg scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Settings</span>
        </button>
      </nav>
    </>
  );
};


