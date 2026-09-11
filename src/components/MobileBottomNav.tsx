import React, { useState } from 'react';
import { 
  Home,
  GraduationCap,
  ClipboardList,
  Layers,
  Receipt,
  Plus,
  UserPlus,
  Calendar,
  X,
  Sparkles,
  CreditCard,
  UploadCloud,
  Settings,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MobileBottomNavProps {
  activeModule?: 'HUB' | 'EXAMINATION' | 'REGISTRATION' | 'LIFECYCLE';
  setActiveModule?: (module: 'HUB' | 'EXAMINATION' | 'REGISTRATION' | 'LIFECYCLE') => void;
  activeTab: 'students' | 'upload' | 'transactions' | 'settings';
  setActiveTab: (tab: 'students' | 'upload' | 'transactions' | 'settings') => void;
  onOpenLogTransaction: () => void;
  onOpenAddStudent: () => void;
  onOpenDailySettlement?: () => void;
  onOpenSessionManager?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeModule = 'HUB',
  setActiveModule,
  activeTab,
  setActiveTab,
  onOpenLogTransaction,
  onOpenAddStudent,
  onOpenDailySettlement,
  onOpenSessionManager,
}) => {
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);

  // Define tabs with vibrant color themes
  const navItems = [
    {
      id: 'HUB',
      label: 'मुख्य हब',
      sub: 'Home',
      icon: Home,
      color: 'indigo',
      activeGradient: 'from-indigo-600 via-indigo-500 to-blue-600',
      activeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-indigo-100',
      activeText: 'text-indigo-600',
      badgeBg: 'bg-indigo-600',
      onClick: () => {
        setIsQuickMenuOpen(false);
        if (setActiveModule) setActiveModule('HUB');
      },
      isActive: activeModule === 'HUB',
    },
    {
      id: 'EXAM',
      label: '12वीं परीक्षा',
      sub: 'Exam',
      icon: GraduationCap,
      color: 'emerald',
      activeGradient: 'from-emerald-600 via-teal-600 to-cyan-600',
      activeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100',
      activeText: 'text-emerald-600',
      badgeBg: 'bg-emerald-600',
      onClick: () => {
        setIsQuickMenuOpen(false);
        if (setActiveModule) setActiveModule('EXAMINATION');
        setActiveTab('students');
      },
      isActive: activeModule === 'EXAMINATION' && activeTab === 'students',
    },
    {
      id: 'REG',
      label: '11वीं पंजीयन',
      sub: 'Reg',
      icon: ClipboardList,
      color: 'amber',
      activeGradient: 'from-amber-500 via-orange-500 to-amber-600',
      activeBg: 'bg-amber-50 text-amber-800 border-amber-200 shadow-amber-100',
      activeText: 'text-amber-600',
      badgeBg: 'bg-amber-500',
      onClick: () => {
        setIsQuickMenuOpen(false);
        if (setActiveModule) setActiveModule('REGISTRATION');
      },
      isActive: activeModule === 'REGISTRATION',
    },
    {
      id: 'PASSBOOK',
      label: '4-चरण पासबुक',
      sub: 'Lifecycle',
      icon: Layers,
      color: 'purple',
      activeGradient: 'from-purple-600 via-fuchsia-600 to-indigo-600',
      activeBg: 'bg-purple-50 text-purple-700 border-purple-200 shadow-purple-100',
      activeText: 'text-purple-600',
      badgeBg: 'bg-purple-600',
      onClick: () => {
        setIsQuickMenuOpen(false);
        if (setActiveModule) setActiveModule('LIFECYCLE');
      },
      isActive: activeModule === 'LIFECYCLE',
    },
    {
      id: 'DAYBOOK',
      label: 'रोकड़ लेज़र',
      sub: 'Day Book',
      icon: Receipt,
      color: 'rose',
      activeGradient: 'from-rose-500 via-pink-600 to-red-600',
      activeBg: 'bg-rose-50 text-rose-700 border-rose-200 shadow-rose-100',
      activeText: 'text-rose-600',
      badgeBg: 'bg-rose-500',
      onClick: () => {
        setIsQuickMenuOpen(false);
        if (onOpenDailySettlement) {
          onOpenDailySettlement();
        } else {
          if (setActiveModule) setActiveModule('EXAMINATION');
          setActiveTab('transactions');
        }
      },
      isActive: activeModule === 'EXAMINATION' && activeTab === 'transactions',
    },
  ];

  return (
    <>
      {/* Quick Action Bottom Sheet / Speed Dial (Opens when center button is tapped) */}
      <AnimatePresence>
        {isQuickMenuOpen && (
          <>
            {/* Backdrop with slight blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsQuickMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 md:hidden print:hidden"
            />

            {/* Quick Action Modal Menu */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              className="fixed bottom-24 left-3 right-3 z-50 md:hidden bg-gradient-to-b from-white to-[#FDFCF8] rounded-3xl p-4 shadow-2xl border-2 border-indigo-100 print:hidden overflow-hidden"
            >
              {/* Top Colorful Gradient Header Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-500 via-purple-500 to-rose-500" />

              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3 pt-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-800 tracking-tight">त्वरित मेन्यू (Quick Actions)</span>
                    <span className="text-[10px] text-slate-500 block -mt-0.5">कार्रवाई का चयन करें</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsQuickMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* 1. Log Payment */}
                <button
                  onClick={() => {
                    setIsQuickMenuOpen(false);
                    onOpenLogTransaction();
                  }}
                  className="flex flex-col items-center justify-center p-3.5 bg-gradient-to-br from-emerald-50 to-teal-50/80 hover:from-emerald-100 hover:to-teal-100 text-emerald-900 rounded-2xl border border-emerald-200/80 transition text-center shadow-xs active:scale-95 group"
                >
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mb-1.5 shadow-md shadow-emerald-600/30 group-hover:scale-110 transition">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-emerald-950">फीस जमा करें</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">रसीद काटें</span>
                </button>

                {/* 2. Add Student */}
                <button
                  onClick={() => {
                    setIsQuickMenuOpen(false);
                    onOpenAddStudent();
                  }}
                  className="flex flex-col items-center justify-center p-3.5 bg-gradient-to-br from-blue-50 to-indigo-50/80 hover:from-blue-100 hover:to-indigo-100 text-indigo-900 rounded-2xl border border-indigo-200/80 transition text-center shadow-xs active:scale-95 group"
                >
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mb-1.5 shadow-md shadow-indigo-600/30 group-hover:scale-110 transition">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-indigo-950">नया छात्र जोड़ें</span>
                  <span className="text-[10px] text-indigo-700 font-semibold">12th Entry</span>
                </button>

                {/* 3. 4-Stage Student Lifecycle Passbook */}
                <button
                  onClick={() => {
                    setIsQuickMenuOpen(false);
                    if (setActiveModule) setActiveModule('LIFECYCLE');
                  }}
                  className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-purple-50 to-fuchsia-50/80 hover:from-purple-100 hover:to-fuchsia-100 text-purple-900 rounded-2xl border border-purple-200/80 transition text-center shadow-xs active:scale-95 group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-fuchsia-600 text-white flex items-center justify-center mb-1 shadow-md shadow-purple-600/30 group-hover:scale-110 transition">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-purple-950">4-चरण पासबुक</span>
                  <span className="text-[10px] text-purple-700 font-semibold">Lifecycle Details</span>
                </button>

                {/* 4. Day Book Report */}
                {onOpenDailySettlement && (
                  <button
                    onClick={() => {
                      setIsQuickMenuOpen(false);
                      onOpenDailySettlement();
                    }}
                    className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-rose-50 to-pink-50/80 hover:from-rose-100 hover:to-pink-100 text-rose-900 rounded-2xl border border-rose-200/80 transition text-center shadow-xs active:scale-95 group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 text-white flex items-center justify-center mb-1 shadow-md shadow-rose-600/30 group-hover:scale-110 transition">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black text-rose-950">दैनिक रोकड़ पर्ची</span>
                    <span className="text-[10px] text-rose-700 font-semibold">Day Settlement</span>
                  </button>
                )}

                {/* 5. Session Transition / Reset */}
                {onOpenSessionManager && (
                  <button
                    onClick={() => {
                      setIsQuickMenuOpen(false);
                      onOpenSessionManager();
                    }}
                    className="col-span-2 flex items-center justify-center gap-2.5 p-3 bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-red-500/15 hover:from-amber-500/25 hover:to-red-500/25 text-amber-950 rounded-2xl border border-amber-300/80 transition text-center shadow-xs font-bold text-xs active:scale-95"
                  >
                    <div className="p-1.5 rounded-lg bg-amber-500 text-white">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="font-black block text-amber-950">सत्र नवीनीकरण एवं नया सत्र</span>
                      <span className="text-[10px] text-amber-800 font-medium block">पुराना डेटा हटाएं & नया सत्र जोड़ें</span>
                    </div>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Colorful Mobile Bottom Navigation Bar */}
      <nav 
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] px-1.5 py-1.5 flex justify-between items-center print:hidden select-none"
      >
        {/* Top vibrant rainbow hairline glow */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-indigo-500 via-emerald-500 via-amber-500 via-purple-500 to-rose-500 shadow-xs" />

        {/* Tab 1: Hub */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={navItems[0].onClick}
          className={`relative flex flex-col items-center justify-center py-1 px-1.5 rounded-2xl transition-all duration-200 min-w-[54px] ${
            navItems[0].isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {navItems[0].isActive && (
            <motion.div
              layoutId="activeBottomNavPill"
              className="absolute inset-0 bg-gradient-to-b from-indigo-50 to-blue-50/80 border border-indigo-200 rounded-2xl shadow-xs -z-10"
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
          )}
          <div className={`p-1 rounded-xl transition-all ${
            navItems[0].isActive ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 scale-105' : 'text-slate-500'
          }`}>
            <Home className="w-4 h-4" />
          </div>
          <span className={`text-[10px] tracking-tight mt-0.5 whitespace-nowrap ${
            navItems[0].isActive ? 'font-black text-indigo-700' : 'font-semibold text-slate-600'
          }`}>
            हब
          </span>
        </motion.button>

        {/* Tab 2: 12th Exam */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={navItems[1].onClick}
          className={`relative flex flex-col items-center justify-center py-1 px-1.5 rounded-2xl transition-all duration-200 min-w-[54px] ${
            navItems[1].isActive ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {navItems[1].isActive && (
            <motion.div
              layoutId="activeBottomNavPill"
              className="absolute inset-0 bg-gradient-to-b from-emerald-50 to-teal-50/80 border border-emerald-200 rounded-2xl shadow-xs -z-10"
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
          )}
          <div className={`p-1 rounded-xl transition-all ${
            navItems[1].isActive ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 scale-105' : 'text-slate-500'
          }`}>
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className={`text-[10px] tracking-tight mt-0.5 whitespace-nowrap ${
            navItems[1].isActive ? 'font-black text-emerald-800' : 'font-semibold text-slate-600'
          }`}>
            12वीं परीक्षा
          </span>
        </motion.button>

        {/* CENTER RADIANT FLOATING ACTION BUTTON (+ फीस / मेनू) */}
        <div className="relative -mt-6 flex flex-col items-center shrink-0 px-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
            className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/40 border-2 border-white flex items-center justify-center transition-all ring-2 ring-indigo-200"
            title="त्वरित मेन्यू (+ फीस जमा / नया छात्र)"
            aria-label="Quick Actions"
          >
            <motion.div
              animate={{ rotate: isQuickMenuOpen ? 45 : 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Plus className="w-7 h-7 stroke-[2.8]" />
            </motion.div>
          </motion.button>
          <span className="text-[9px] font-black bg-gradient-to-r from-emerald-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent mt-0.5 tracking-tight">
            + मेन्यू
          </span>
        </div>

        {/* Tab 3: 11th Registration */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={navItems[2].onClick}
          className={`relative flex flex-col items-center justify-center py-1 px-1.5 rounded-2xl transition-all duration-200 min-w-[54px] ${
            navItems[2].isActive ? 'text-amber-800' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {navItems[2].isActive && (
            <motion.div
              layoutId="activeBottomNavPill"
              className="absolute inset-0 bg-gradient-to-b from-amber-50 to-orange-50/80 border border-amber-200 rounded-2xl shadow-xs -z-10"
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
          )}
          <div className={`p-1 rounded-xl transition-all ${
            navItems[2].isActive ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30 scale-105' : 'text-slate-500'
          }`}>
            <ClipboardList className="w-4 h-4" />
          </div>
          <span className={`text-[10px] tracking-tight mt-0.5 whitespace-nowrap ${
            navItems[2].isActive ? 'font-black text-amber-900' : 'font-semibold text-slate-600'
          }`}>
            11वीं पंजीयन
          </span>
        </motion.button>

        {/* Tab 4: 4-Stage Lifecycle Passbook */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={navItems[3].onClick}
          className={`relative flex flex-col items-center justify-center py-1 px-1.5 rounded-2xl transition-all duration-200 min-w-[54px] ${
            navItems[3].isActive ? 'text-purple-700' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {navItems[3].isActive && (
            <motion.div
              layoutId="activeBottomNavPill"
              className="absolute inset-0 bg-gradient-to-b from-purple-50 to-fuchsia-50/80 border border-purple-200 rounded-2xl shadow-xs -z-10"
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
          )}
          <div className={`p-1 rounded-xl transition-all ${
            navItems[3].isActive ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30 scale-105' : 'text-slate-500'
          }`}>
            <Layers className="w-4 h-4" />
          </div>
          <span className={`text-[10px] tracking-tight mt-0.5 whitespace-nowrap ${
            navItems[3].isActive ? 'font-black text-purple-800' : 'font-semibold text-slate-600'
          }`}>
            पासबुक
          </span>
        </motion.button>

      </nav>
    </>
  );
};
