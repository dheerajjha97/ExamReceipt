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
import { motion } from 'motion/react';
import { InstituteSettings } from '../types';
import feeReceiptHero from '../assets/images/fee_receipt_hero_1787937064672.jpg';
import { PWAInstallButton } from './PWA/PWAInstallButton';

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

  const navTabs = [
    { id: 'students' as const, label: 'छात्र सूची (Directory)', icon: Users },
    { id: 'upload' as const, label: 'इम्पोर्ट (AI OCR)', icon: UploadCloud, badge: 'AI OCR' },
    { id: 'transactions' as const, label: 'लेज़र रिपोर्ट (Ledger)', icon: CreditCard },
    { id: 'settings' as const, label: 'कॉलेज सेटिंग्स', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 text-slate-800 shadow-sm transition-all">
      {/* Top Tonal System Bar */}
      <div className="bg-slate-900 text-white px-4 py-1.5 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/30 text-indigo-300 font-mono font-bold px-2.5 py-0.5 rounded-full border border-indigo-400/30 text-[11px] shadow-2xs">
              {settings.code ? `BSEB CODE: ${settings.code}` : 'EXAM CELL'}
            </span>
            <span className="text-slate-200 font-semibold truncate max-w-[220px] sm:max-w-md">
              {settings.name} &bull; {settings.academicYear}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-slate-300">
            <span className="hidden sm:flex items-center gap-1 text-xs">
              <span className="text-slate-400">पोर्टल चार्ज:</span>
              <strong className="text-emerald-400 font-bold">+₹{settings.defaultOnlineCharge || 30}</strong>
            </span>

            {/* Cloud Sync Status Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>क्लाउड सक्रिय</span>
            </div>

            {/* User Cashier Badge & Actions */}
            <div className="flex items-center gap-1.5 border-l border-slate-700 pl-2.5">
              <span className="hidden md:inline-flex text-[11px] font-medium text-slate-300">
                {settings.cashierName || 'Admin'}
              </span>

              <button
                onClick={onChangePasswordClick}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-medium flex items-center gap-1 transition border border-slate-700 shadow-2xs"
                title="पासवर्ड बदलें"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">पासवर्ड</span>
              </button>

              <button
                onClick={onLogoutClick}
                className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl text-xs font-medium flex items-center gap-1 transition border border-rose-500/30"
                title="लॉगआउट"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">लॉगआउट</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Material 3 App Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-md overflow-hidden transform-gpu group-hover:scale-105 transition duration-300">
                <img 
                  src={feeReceiptHero} 
                  alt="College Fee Logo" 
                  className="w-full h-full object-cover rounded-[14px]" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-2xs"></span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 font-heading">
                  Matric & Inter Fee Portal
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full font-bold shadow-2xs">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  BSEB Exam 2026
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                बिहार विद्यालय परीक्षा समिति &bull; लाइव परीक्षा काउंटर &bull; डिजिटल लेज़र
              </p>
            </div>
          </div>

          {/* Quick Stat Chips Bar in Header */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 flex items-center gap-2.5 min-w-max shadow-2xs">
              <div className="w-7 h-7 rounded-xl bg-slate-200/80 text-slate-700 flex items-center justify-center">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">छात्र (Total)</p>
                <p className="text-xs font-black text-slate-900">{totalStudentsCount}</p>
              </div>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl px-3 py-1.5 flex items-center gap-2.5 min-w-max shadow-2xs">
              <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-emerald-800 font-bold">जमा (Paid)</p>
                <p className="text-xs font-black text-emerald-700">{paidStudentsCount} <span className="text-[10px] text-slate-500 font-normal">/ {totalStudentsCount}</span></p>
              </div>
            </div>

            <div className="bg-rose-50/70 border border-rose-200 rounded-2xl px-3 py-1.5 flex items-center gap-2.5 min-w-max shadow-2xs">
              <div className="w-7 h-7 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-rose-800 font-bold">बकाया (Due)</p>
                <p className="text-xs font-black text-rose-700">{unpaidCount}</p>
              </div>
            </div>

            <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl px-3 py-1.5 flex items-center gap-2.5 min-w-max shadow-2xs">
              <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <IndianRupee className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-indigo-800 font-bold">राजस्व (Revenue)</p>
                <p className="text-xs font-black text-indigo-700 font-mono">₹{totalCollected.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <PWAInstallButton />

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenUploadPdf}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-2xl text-xs font-bold border border-slate-200 shadow-sm transition"
            >
              <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
              <span>Import List</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenAddStudent}
              className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-3.5 py-2 rounded-2xl text-xs font-bold shadow-md shadow-indigo-500/20 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Student</span>
            </motion.button>
          </div>
        </div>

        {/* Material 3 Segmented Navigation Bar (Desktop/Tablet) */}
        <div className="hidden md:flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-slate-200/80 text-xs">
          <div className="bg-slate-100/80 p-1 rounded-2xl border border-slate-200 flex items-center gap-1">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-4 py-1.5 rounded-xl font-bold transition-colors ${
                    isActive ? 'text-indigo-700' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeHeaderNavPill"
                      className="absolute inset-0 bg-white rounded-xl shadow-xs border border-slate-200"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="bg-indigo-100 text-indigo-700 text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold">
                        {tab.badge}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};



