import React from 'react';
import { 
  Users, 
  UploadCloud, 
  CreditCard, 
  Settings, 
  Plus, 
  CheckCircle2, 
  Clock, 
  IndianRupee,
  KeyRound,
  LogOut,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { InstituteSettings } from '../types';
import feeReceiptHero from '../assets/images/fee_receipt_hero_1787937064672.jpg';

interface HeaderProps {
  activeTab: 'students' | 'upload' | 'transactions' | 'settings';
  setActiveTab: (tab: 'students' | 'upload' | 'transactions' | 'settings') => void;
  totalStudentsCount: number;
  paidStudentsCount: number;
  totalCollected: number;
  totalOnlineCharges: number;
  onOpenAddStudent: () => void;
  onOpenUploadPdf: () => void;
  settings: InstituteSettings;
  onChangePasswordClick: () => void;
  onLogoutClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  totalStudentsCount,
  paidStudentsCount,
  totalCollected,
  totalOnlineCharges,
  onOpenAddStudent,
  onOpenUploadPdf,
  settings,
  onChangePasswordClick,
  onLogoutClick,
}) => {
  const unpaidCount = totalStudentsCount - paidStudentsCount;

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-white/10 text-white shadow-2xl transition-all">
      {/* Top Glassmorphic Sub-bar */}
      <div className="bg-slate-950/60 backdrop-blur-md px-4 py-2 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="bg-teal-500/20 text-teal-300 font-mono font-bold px-2.5 py-0.5 rounded-full border border-teal-500/30 text-[11px] shadow-xs">
              {settings.code ? `CODE: ${settings.code}` : 'EXAM CELL'}
            </span>
            <span className="text-slate-300 font-medium truncate max-w-[220px] sm:max-w-md">
              {settings.name} &bull; {settings.academicYear}
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Online Fee Charge: <strong className="text-emerald-400 font-bold">+₹{settings.defaultOnlineCharge}</strong>
            </span>

            {/* Cloud Sync Status Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cloud DB Active ({settings.code || '31337'})</span>
            </div>

            {/* Password Change and Logout Controls */}
            <div className="flex items-center gap-1.5 border-l border-white/15 pl-2.5">
              <button
                onClick={onChangePasswordClick}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition border border-white/10 shadow-xs"
                title="पासवर्ड बदलें"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">पासवर्ड</span>
              </button>
              <button
                onClick={onLogoutClick}
                className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 hover:text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition border border-rose-500/30"
                title="लॉगआउट"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-300" />
                <span className="hidden sm:inline">लॉगआउट</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Nav Container */}
      <div className="max-w-7xl mx-auto px-4 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3.5">
            <div className="relative group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 to-indigo-600 p-0.5 shadow-lg shadow-teal-500/20 overflow-hidden transform-gpu group-hover:scale-105 transition duration-300">
                <div className="w-full h-full rounded-[14px] overflow-hidden bg-slate-900">
                  <img 
                    src={feeReceiptHero} 
                    alt="Fee Receipt Logo" 
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition" 
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full shadow-xs"></span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white drop-shadow-xs">
                  Matric & Inter Fee Ledger
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-teal-500/15 text-teal-300 border border-teal-500/30 px-2.5 py-0.5 rounded-full font-bold">
                  <Sparkles className="w-3 h-3" />
                  Board 2027
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Modern Glassmorphic Ledger &bull; Real-time Cloud Sync
              </p>
            </div>
          </div>

          {/* Stat Pill Bar */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl px-3.5 py-2 flex items-center gap-3 min-w-max shadow-lg hover:bg-white/15 transition transform-gpu">
              <div className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Students</p>
                <p className="text-sm font-black text-white">{totalStudentsCount}</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl px-3.5 py-2 flex items-center gap-3 min-w-max shadow-lg hover:bg-white/15 transition transform-gpu">
              <div className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Paid</p>
                <p className="text-sm font-black text-emerald-300">{paidStudentsCount} <span className="text-[10px] text-slate-400 font-normal">/ {totalStudentsCount}</span></p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl px-3.5 py-2 flex items-center gap-3 min-w-max shadow-lg hover:bg-white/15 transition transform-gpu">
              <div className="p-1.5 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Unpaid</p>
                <p className="text-sm font-black text-amber-300">{unpaidCount}</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl px-3.5 py-2 flex items-center gap-3 min-w-max shadow-lg hover:bg-white/15 transition transform-gpu">
              <div className="p-1.5 bg-teal-500/20 text-teal-300 rounded-xl border border-teal-500/30">
                <IndianRupee className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Collected</p>
                <p className="text-sm font-black text-white font-mono">₹{totalCollected.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenUploadPdf}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-2xl text-xs font-bold border border-white/20 backdrop-blur-md shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all transform-gpu"
            >
              <UploadCloud className="w-4 h-4 text-teal-300" />
              <span>Import List</span>
            </button>

            <button
              onClick={onOpenAddStudent}
              className="flex items-center gap-1.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-lg shadow-teal-500/25 hover:-translate-y-0.5 active:translate-y-0 transition-all transform-gpu border border-teal-400/40"
            >
              <Plus className="w-4 h-4" />
              <span>Add Student</span>
            </button>
          </div>
        </div>

        {/* Glass Pill Navigation Bar */}
        <div className="hidden md:flex items-center gap-1.5 mt-3 pt-3 border-t border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold transition transform-gpu ${
              activeTab === 'students'
                ? 'bg-gradient-to-r from-teal-500/30 to-emerald-500/30 text-white shadow-lg border border-teal-400/40 backdrop-blur-md scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Users className="w-4 h-4 text-teal-300" />
            <span>Students Directory</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold transition transform-gpu ${
              activeTab === 'upload'
                ? 'bg-gradient-to-r from-teal-500/30 to-emerald-500/30 text-white shadow-lg border border-teal-400/40 backdrop-blur-md scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-emerald-300" />
            <span className="flex items-center gap-1.5">
              Import Excel / PDF
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-mono border border-emerald-500/30">AI OCR</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold transition transform-gpu ${
              activeTab === 'transactions'
                ? 'bg-gradient-to-r from-teal-500/30 to-emerald-500/30 text-white shadow-lg border border-teal-400/40 backdrop-blur-md scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <CreditCard className="w-4 h-4 text-indigo-300" />
            <span>Transaction Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold transition transform-gpu ml-auto ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-teal-500/30 to-emerald-500/30 text-white shadow-lg border border-teal-400/40 backdrop-blur-md scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-300" />
            <span>College Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};



