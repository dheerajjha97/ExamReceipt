import React from 'react';
import { 
  Users, 
  UploadCloud, 
  CreditCard, 
  GitBranch, 
  Settings,
  PlusCircle,
  Receipt
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'students' | 'upload' | 'transactions' | 'github' | 'settings';
  setActiveTab: (tab: 'students' | 'upload' | 'transactions' | 'github' | 'settings') => void;
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
          className="p-3 bg-[#5A5A40] text-white rounded-full shadow-xl border border-[#737356] hover:scale-105 active:scale-95 transition transform-gpu flex items-center justify-center"
          title="Add New Student"
        >
          <Users className="w-5 h-5" />
        </button>

        {/* Primary FAB: Log Transaction */}
        <button
          onClick={onOpenLogTransaction}
          className="flex items-center gap-2 px-4 py-3 bg-[#2E5B50] text-white rounded-full shadow-2xl border border-[#3B6E62] hover:scale-105 active:scale-95 transition-all transform-gpu font-bold text-xs"
        >
          <PlusCircle className="w-5 h-5" />
          <span>+ Log Payment</span>
        </button>
      </div>

      {/* Mobile Bottom Navigation Bar (Glassmorphism & Material 3) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#FDFCF8]/90 backdrop-blur-xl border-t border-[#E6E2D3] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 flex justify-around items-center">
        
        {/* Students Tab */}
        <button
          onClick={() => setActiveTab('students')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all transform-gpu ${
            activeTab === 'students'
              ? 'bg-[#5A5A40] text-white shadow-md scale-105'
              : 'text-[#787267] hover:text-[#4A453E]'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Students</span>
        </button>

        {/* OCR / Excel Upload Tab */}
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all transform-gpu ${
            activeTab === 'upload'
              ? 'bg-[#5A5A40] text-white shadow-md scale-105'
              : 'text-[#787267] hover:text-[#4A453E]'
          }`}
        >
          <UploadCloud className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Import</span>
        </button>

        {/* Transaction History Tab */}
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all transform-gpu ${
            activeTab === 'transactions'
              ? 'bg-[#5A5A40] text-white shadow-md scale-105'
              : 'text-[#787267] hover:text-[#4A453E]'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Ledger</span>
        </button>

        {/* GitHub DB Sync Tab */}
        <button
          onClick={() => setActiveTab('github')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all transform-gpu ${
            activeTab === 'github'
              ? 'bg-[#5A5A40] text-white shadow-md scale-105'
              : 'text-[#787267] hover:text-[#4A453E]'
          }`}
        >
          <GitBranch className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">GitHub</span>
        </button>

        {/* Settings Tab */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all transform-gpu ${
            activeTab === 'settings'
              ? 'bg-[#5A5A40] text-white shadow-md scale-105'
              : 'text-[#787267] hover:text-[#4A453E]'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Settings</span>
        </button>

      </nav>
    </>
  );
};
