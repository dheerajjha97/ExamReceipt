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
    <header className="sticky top-0 z-30 bg-[#FDFCF8]/95 backdrop-blur-xl border-b border-[#E6E2D3] text-[#4A453E] shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all">
      {/* Top Flutter Tonal System Bar */}
      <div className="bg-[#F5F2E8] px-4 py-1.5 border-b border-[#E8E4D5]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="bg-[#EAE8DD] text-[#5A5A40] font-mono font-bold px-2.5 py-0.5 rounded-full border border-[#DDD8C5] text-[11px] shadow-2xs">
              {settings.code ? `CODE: ${settings.code}` : 'EXAM CELL'}
            </span>
            <span className="text-[#5A5A40] font-semibold truncate max-w-[220px] sm:max-w-md">
              {settings.name} &bull; {settings.academicYear}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-[#5A5A40]">
            <span className="hidden sm:flex items-center gap-1 text-xs text-[#787267]">
              <span>Online Portal Charge:</span>
              <strong className="text-[#2E5B50] font-bold">+₹{settings.defaultOnlineCharge || 30}</strong>
            </span>

            {/* Cloud Sync Status Pill (Flutter Status Badge) */}
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E2ECE9] text-[#2E5B50] border border-[#C5DDD6] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Cloud Active</span>
            </div>

            {/* User Cashier Badge & Actions */}
            <div className="flex items-center gap-1.5 border-l border-[#DDD8C5] pl-2.5">
              <span className="hidden md:inline-flex text-[11px] font-medium text-[#787267]">
                {settings.cashierName || 'Admin'}
              </span>

              <button
                onClick={onChangePasswordClick}
                className="px-2 py-1 bg-white hover:bg-[#FAF9F5] text-[#5A5A40] rounded-xl text-xs font-medium flex items-center gap-1 transition border border-[#DDD8C5] shadow-2xs"
                title="पासवर्ड बदलें"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">पासवर्ड</span>
              </button>

              <button
                onClick={onLogoutClick}
                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-medium flex items-center gap-1 transition border border-rose-200"
                title="लॉगआउट"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span className="hidden sm:inline">लॉगआउट</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Flutter App Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          
          {/* Brand Logo & Title with Flutter Squircle */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="w-11 h-11 rounded-2xl bg-white p-0.5 shadow-sm border border-[#DDD8C5] overflow-hidden transform-gpu group-hover:scale-105 transition duration-300">
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
                <h1 className="text-base sm:text-lg font-black tracking-tight text-[#2D2A26]">
                  Matric & Inter Fee Portal
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-[#E2ECE9] text-[#2E5B50] border border-[#C5DDD6] px-2.5 py-0.5 rounded-full font-bold">
                  <Sparkles className="w-3 h-3" />
                  BSEB Exam 2026
                </span>
              </div>
              <p className="text-xs text-[#787267] font-medium">
                Constituent Unit &bull; B.R.A. Bihar University &bull; Live Ledger
              </p>
            </div>
          </div>

          {/* Quick Stat Chips Bar in Header */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <div className="bg-white border border-[#E6E2D3] rounded-2xl px-3 py-1.5 flex items-center gap-2.5 min-w-max shadow-2xs">
              <div className="w-7 h-7 rounded-xl bg-[#EAE8DD] text-[#5A5A40] flex items-center justify-center">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-[#787267] font-bold">छात्र (Total)</p>
                <p className="text-xs font-black text-[#2D2A26]">{totalStudentsCount}</p>
              </div>
            </div>

            <div className="bg-white border border-[#D5E5E0] rounded-2xl px-3 py-1.5 flex items-center gap-2.5 min-w-max shadow-2xs">
              <div className="w-7 h-7 rounded-xl bg-[#E2ECE9] text-[#2E5B50] flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-[#2E5B50] font-bold">जमा (Paid)</p>
                <p className="text-xs font-black text-[#2E5B50]">{paidStudentsCount} <span className="text-[10px] text-[#787267] font-normal">/ {totalStudentsCount}</span></p>
              </div>
            </div>

            <div className="bg-white border border-amber-200 rounded-2xl px-3 py-1.5 flex items-center gap-2.5 min-w-max shadow-2xs">
              <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-amber-800 font-bold">बकाया (Due)</p>
                <p className="text-xs font-black text-amber-800">{unpaidCount}</p>
              </div>
            </div>

            <div className="bg-white border border-[#D5E5E0] rounded-2xl px-3 py-1.5 flex items-center gap-2.5 min-w-max shadow-2xs">
              <div className="w-7 h-7 rounded-xl bg-[#E2ECE9] text-[#2E5B50] flex items-center justify-center">
                <IndianRupee className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-[#787267] font-bold">राजस्व (Revenue)</p>
                <p className="text-xs font-black text-[#2E5B50] font-mono">₹{totalCollected.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons (Flutter FilledButton & Tonal Button) */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenUploadPdf}
              className="flex items-center gap-1.5 bg-white hover:bg-[#FAF9F5] text-[#4A453E] px-3.5 py-2 rounded-2xl text-xs font-bold border border-[#DDD8C5] shadow-xs transition"
            >
              <UploadCloud className="w-3.5 h-3.5 text-teal-600" />
              <span>Import List</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenAddStudent}
              className="flex items-center gap-1.5 bg-[#2E5B50] hover:bg-[#254A41] text-white px-3.5 py-2 rounded-2xl text-xs font-bold shadow-sm shadow-[#2E5B50]/20 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Student</span>
            </motion.button>
          </div>
        </div>

        {/* Flutter Material 3 Segmented Navigation Bar (Desktop/Tablet) */}
        <div className="hidden md:flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-[#EAE6D9] text-xs">
          <div className="bg-[#F4F1EA] p-1 rounded-2xl border border-[#E2DDD0] flex items-center gap-1">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-4 py-1.5 rounded-xl font-bold transition-colors ${
                    isActive ? 'text-[#2E5B50]' : 'text-[#787267] hover:text-[#2D2A26]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeHeaderNavPill"
                      className="absolute inset-0 bg-white rounded-xl shadow-xs border border-[#DDD8C5]"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#2E5B50]' : 'text-[#787267]'}`} />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="bg-[#E2ECE9] text-[#2E5B50] text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold">
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



