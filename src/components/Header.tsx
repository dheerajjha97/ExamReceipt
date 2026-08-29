import React from 'react';
import { 
  Receipt, 
  Users, 
  UploadCloud, 
  CreditCard, 
  GitBranch, 
  Settings, 
  Plus, 
  CheckCircle2, 
  Clock, 
  IndianRupee,
  Sparkles,
  Layers
} from 'lucide-react';
import { GitHubConfig, InstituteSettings } from '../types';
import feeReceiptHero from '../assets/images/fee_receipt_hero_1787937064672.jpg';

interface HeaderProps {
  activeTab: 'students' | 'upload' | 'transactions' | 'github' | 'settings';
  setActiveTab: (tab: 'students' | 'upload' | 'transactions' | 'github' | 'settings') => void;
  totalStudentsCount: number;
  paidStudentsCount: number;
  totalCollected: number;
  totalOnlineCharges: number;
  githubConfig: GitHubConfig;
  onOpenAddStudent: () => void;
  onOpenUploadPdf: () => void;
  settings: InstituteSettings;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  totalStudentsCount,
  paidStudentsCount,
  totalCollected,
  totalOnlineCharges,
  githubConfig,
  onOpenAddStudent,
  onOpenUploadPdf,
  settings,
}) => {
  const unpaidCount = totalStudentsCount - paidStudentsCount;

  return (
    <header className="sticky top-0 z-30 bg-[#4A453E]/90 backdrop-blur-xl border-b border-white/10 text-white shadow-xl transition-all">
      {/* Top Glassmorphic Sub-bar */}
      <div className="bg-[#3E3A33]/80 backdrop-blur-md px-3 sm:px-4 py-1.5 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs">
          <div className="flex items-center gap-2">
            <span className="bg-[#8C5A2B]/40 backdrop-blur-xs text-[#E8D0B8] font-mono font-semibold px-2 py-0.5 rounded-full border border-[#8C5A2B]/50 shadow-xs">
              {settings.code ? `CODE: ${settings.code}` : 'EXAM CELL'}
            </span>
            <span className="text-[#DDD8C5] font-medium truncate max-w-[220px] sm:max-w-md">
              {settings.name} &bull; {settings.academicYear}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[#DDD8C5]">
            <span className="hidden sm:flex items-center gap-1.5 text-xs">
              <span className="inline-block w-2 h-2 rounded-full bg-[#A3C9A8] animate-pulse"></span>
              Online Fee Charge: <strong className="text-[#A3C9A8] font-bold">+₹{settings.defaultOnlineCharge}</strong>
            </span>

            {/* GitHub Sync Pill Status */}
            <button
              onClick={() => setActiveTab('github')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all transform-gpu hover:scale-105 active:scale-95 shadow-md ${
                githubConfig.token && githubConfig.repo
                  ? 'bg-[#2E5B50]/90 backdrop-blur-md text-[#E2ECE9] border border-[#B8D5CE]/40 hover:bg-[#254A41]'
                  : 'bg-[#8C5A2B]/60 backdrop-blur-md text-[#FAF0E6] border border-[#E8D0B8]/40 hover:bg-[#8C5A2B]/80'
              }`}
              title="GitHub Database Sync Status"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span className="truncate max-w-[130px] sm:max-w-none">
                {githubConfig.token && githubConfig.repo
                  ? `GitHub DB: ${githubConfig.owner}/${githubConfig.repo}`
                  : 'Setup GitHub DB'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Nav Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          
          {/* Brand Logo & Title with 3D Image Asset */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#5A5A40] to-[#3E3A33] border border-white/20 flex items-center justify-center text-white shadow-lg overflow-hidden transform-gpu group-hover:rotate-3 transition duration-300">
                <img 
                  src={feeReceiptHero} 
                  alt="3D Fee Receipt" 
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#2E5B50] border-2 border-[#4A453E] rounded-full shadow-xs"></span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-[#FDFCF8] drop-shadow-xs">
                  Matric & Inter Fee Receipt
                </h1>
                <span className="hidden sm:inline-block text-[10px] bg-white/10 backdrop-blur-md text-[#E6E2D3] border border-white/20 px-2.5 py-0.5 rounded-full font-bold">
                  Board Exam 2027
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#C2BEB5] font-medium">
                Material 3 Fee Ledger &bull; GitHub Database Sync
              </p>
            </div>
          </div>

          {/* Stat Pill Bar (Horizontal scroll on mobile) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-3 py-1.5 flex items-center gap-2.5 min-w-max shadow-md hover:bg-white/15 transition transform-gpu">
              <div className="p-1.5 bg-[#5A5A40]/50 text-[#E6E2D3] rounded-xl border border-white/10">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-[#C2BEB5] font-bold">Students</p>
                <p className="text-xs sm:text-sm font-black text-[#FDFCF8]">{totalStudentsCount}</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-3 py-1.5 flex items-center gap-2.5 min-w-max shadow-md hover:bg-white/15 transition transform-gpu">
              <div className="p-1.5 bg-[#2E5B50]/50 text-[#A3C9A8] rounded-xl border border-white/10">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-[#C2BEB5] font-bold">Paid</p>
                <p className="text-xs sm:text-sm font-black text-[#A3C9A8]">{paidStudentsCount} <span className="text-[10px] text-[#C2BEB5] font-normal">/ {totalStudentsCount}</span></p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-3 py-1.5 flex items-center gap-2.5 min-w-max shadow-md hover:bg-white/15 transition transform-gpu">
              <div className="p-1.5 bg-[#8C5A2B]/50 text-[#E8D0B8] rounded-xl border border-white/10">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-[#C2BEB5] font-bold">Unpaid</p>
                <p className="text-xs sm:text-sm font-black text-[#E8D0B8]">{unpaidCount}</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-3 py-1.5 flex items-center gap-2.5 min-w-max shadow-md hover:bg-white/15 transition transform-gpu">
              <div className="p-1.5 bg-[#2E5B50]/60 text-white rounded-xl border border-white/10">
                <IndianRupee className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-[#C2BEB5] font-bold">Collected</p>
                <p className="text-xs sm:text-sm font-black text-white font-mono">₹{totalCollected.toLocaleString('en-IN')}</p>
              </div>
            </div>

          </div>

          {/* Desktop Top Action Buttons */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenUploadPdf}
              className="flex items-center gap-1.5 bg-[#5A5A40] hover:bg-[#484833] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all transform-gpu border border-[#737356]"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Import Excel / PDF</span>
            </button>

            <button
              onClick={onOpenAddStudent}
              className="flex items-center gap-1.5 bg-[#2E5B50] hover:bg-[#254A41] text-white px-3 py-2 rounded-xl text-xs font-bold shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all transform-gpu border border-[#3B6E62]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Student</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Desktop & Tablet) */}
        <div className="hidden md:flex items-center gap-1 mt-3 pt-2 border-t border-white/10 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition transform-gpu ${
              activeTab === 'students'
                ? 'bg-white/20 text-white shadow-md border border-white/20 backdrop-blur-md scale-[1.02]'
                : 'text-[#C2BEB5] hover:text-white hover:bg-white/10'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Students List & Status</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition transform-gpu ${
              activeTab === 'upload'
                ? 'bg-white/20 text-white shadow-md border border-white/20 backdrop-blur-md scale-[1.02]'
                : 'text-[#C2BEB5] hover:text-white hover:bg-white/10'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span className="flex items-center gap-1.5">
              Import Excel / PDF
              <span className="bg-[#A3C9A8]/30 text-[#A3C9A8] text-[9px] px-1.5 py-0.2 rounded-full font-mono border border-[#A3C9A8]/40">Excel & AI</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition transform-gpu ${
              activeTab === 'transactions'
                ? 'bg-white/20 text-white shadow-md border border-white/20 backdrop-blur-md scale-[1.02]'
                : 'text-[#C2BEB5] hover:text-white hover:bg-white/10'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Transaction Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition transform-gpu ${
              activeTab === 'github'
                ? 'bg-white/20 text-white shadow-md border border-white/20 backdrop-blur-md scale-[1.02]'
                : 'text-[#C2BEB5] hover:text-white hover:bg-white/10'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>GitHub Database</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition transform-gpu ml-auto ${
              activeTab === 'settings'
                ? 'bg-white/20 text-white shadow-md border border-white/20 backdrop-blur-md scale-[1.02]'
                : 'text-[#C2BEB5] hover:text-white hover:bg-white/10'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>College Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};

