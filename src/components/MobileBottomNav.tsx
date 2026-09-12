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
  BookOpen,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  Building2,
  DollarSign,
  ArrowRightLeft,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type ActiveModuleType = 'HUB' | 'EXAMINATION' | 'REGISTRATION' | 'LIFECYCLE';
export type ExamTabType = 'students' | 'upload' | 'transactions' | 'settings';
export type RegistrationTabType = 'students' | 'ledger' | 'doc_audit' | 'daybook' | 'overview';

interface MobileBottomNavProps {
  activeModule?: ActiveModuleType;
  setActiveModule?: (module: ActiveModuleType) => void;
  activeTab: ExamTabType;
  setActiveTab: (tab: ExamTabType) => void;
  activeRegistrationTab?: RegistrationTabType;
  setActiveRegistrationTab?: (tab: RegistrationTabType) => void;
  onOpenLogTransaction: () => void;
  onOpenAddStudent: () => void;
  onOpenDailySettlement?: () => void;
  onOpenSessionManager?: () => void;
  onOpenAddRegistrationStudent?: () => void;
  onOpenUploadRegistration?: () => void;
  onOpenDrawer?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeModule = 'HUB',
  setActiveModule,
  activeTab,
  setActiveTab,
  activeRegistrationTab = 'students',
  setActiveRegistrationTab,
  onOpenLogTransaction,
  onOpenAddStudent,
  onOpenDailySettlement,
  onOpenSessionManager,
  onOpenAddRegistrationStudent,
  onOpenUploadRegistration,
  onOpenDrawer,
}) => {
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);

  // ==========================================
  // 1. ITEMS FOR 12TH EXAMINATION MODULE
  // ==========================================
  const examNavItems = [
    {
      id: 'EXAM_STUDENTS',
      label: '12वीं छात्र',
      sub: 'Students',
      icon: GraduationCap,
      color: 'emerald',
      onClick: () => {
        setIsQuickMenuOpen(false);
        setActiveTab('students');
      },
      isActive: activeTab === 'students',
    },
    {
      id: 'EXAM_LEDGER',
      label: '12वीं लेज़र',
      sub: 'Fee Ledger',
      icon: Receipt,
      color: 'emerald',
      onClick: () => {
        setIsQuickMenuOpen(false);
        setActiveTab('transactions');
      },
      isActive: activeTab === 'transactions',
      badge: 'Ledger',
    },
    {
      id: 'EXAM_DAYBOOK',
      label: 'दैनिक रोकड़',
      sub: 'Day Book',
      icon: CreditCard,
      color: 'teal',
      onClick: () => {
        setIsQuickMenuOpen(false);
        if (onOpenDailySettlement) {
          onOpenDailySettlement();
        } else {
          setActiveTab('transactions');
        }
      },
      isActive: false,
    },
    {
      id: 'EXAM_SWITCH',
      label: 'हब / मेन्यू',
      sub: 'Hub',
      icon: Home,
      color: 'slate',
      onClick: () => {
        setIsQuickMenuOpen(false);
        if (setActiveModule) setActiveModule('HUB');
      },
      isActive: false,
    },
  ];

  // ==========================================
  // 2. ITEMS FOR 11TH REGISTRATION MODULE
  // ==========================================
  const regNavItems = [
    {
      id: 'REG_STUDENTS',
      label: '11वीं छात्र',
      sub: 'Directory',
      icon: BookOpen,
      color: 'teal',
      onClick: () => {
        setIsQuickMenuOpen(false);
        if (setActiveRegistrationTab) setActiveRegistrationTab('students');
      },
      isActive: activeRegistrationTab === 'students',
    },
    {
      id: 'REG_LEDGER',
      label: '11वीं लेज़र',
      sub: 'Reg Ledger',
      icon: CreditCard,
      color: 'emerald',
      onClick: () => {
        setIsQuickMenuOpen(false);
        if (setActiveRegistrationTab) setActiveRegistrationTab('ledger');
      },
      isActive: activeRegistrationTab === 'ledger',
      badge: 'Ledger',
    },
    {
      id: 'REG_AUDIT',
      label: 'दस्तावेज़ ऑडिट',
      sub: '5-Doc Audit',
      icon: ShieldCheck,
      color: 'amber',
      onClick: () => {
        setIsQuickMenuOpen(false);
        if (setActiveRegistrationTab) setActiveRegistrationTab('doc_audit');
      },
      isActive: activeRegistrationTab === 'doc_audit',
    },
    {
      id: 'REG_DAYBOOK',
      label: 'दैनिक रोकड़',
      sub: 'Day Settlement',
      icon: Receipt,
      color: 'purple',
      onClick: () => {
        setIsQuickMenuOpen(false);
        if (setActiveRegistrationTab) setActiveRegistrationTab('daybook');
      },
      isActive: activeRegistrationTab === 'daybook',
    },
  ];

  // ==========================================
  // 3. ITEMS FOR MAIN HUB / 4-STAGE LIFECYCLE
  // ==========================================
  const hubNavItems = [
    {
      id: 'HUB_HOME',
      label: 'मुख्य हब',
      sub: 'Home',
      icon: Home,
      color: 'indigo',
      onClick: () => {
        setIsQuickMenuOpen(false);
        if (setActiveModule) setActiveModule('HUB');
      },
      isActive: activeModule === 'HUB',
    },
    {
      id: 'HUB_EXAM',
      label: '12वीं परीक्षा',
      sub: 'Exam Module',
      icon: GraduationCap,
      color: 'emerald',
      onClick: () => {
        setIsQuickMenuOpen(false);
        if (setActiveModule) setActiveModule('EXAMINATION');
        setActiveTab('students');
      },
      isActive: activeModule === 'EXAMINATION',
    },
    {
      id: 'HUB_REG',
      label: '11वीं पंजीयन',
      sub: 'Reg Module',
      icon: ClipboardList,
      color: 'teal',
      onClick: () => {
        setIsQuickMenuOpen(false);
        if (setActiveModule) setActiveModule('REGISTRATION');
      },
      isActive: activeModule === 'REGISTRATION',
    },
    {
      id: 'HUB_LIFECYCLE',
      label: '4-चरण पासबुक',
      sub: 'Passbook',
      icon: Layers,
      color: 'purple',
      onClick: () => {
        setIsQuickMenuOpen(false);
        if (setActiveModule) setActiveModule('LIFECYCLE');
      },
      isActive: activeModule === 'LIFECYCLE',
    },
  ];

  // Pick the current navigation item list based on activeModule
  const currentNavItems = activeModule === 'EXAMINATION'
    ? examNavItems
    : activeModule === 'REGISTRATION'
      ? regNavItems
      : hubNavItems;

  const getModuleAccentColor = () => {
    switch (activeModule) {
      case 'EXAMINATION':
        return 'from-emerald-500 via-teal-500 to-indigo-600';
      case 'REGISTRATION':
        return 'from-teal-500 via-emerald-600 to-amber-500';
      case 'LIFECYCLE':
        return 'from-purple-500 via-fuchsia-500 to-indigo-600';
      default:
        return 'from-indigo-500 via-emerald-500 via-amber-500 to-rose-500';
    }
  };

  return (
    <>
      {/* Quick Action Bottom Sheet / Speed Dial */}
      <AnimatePresence>
        {isQuickMenuOpen && (
          <>
            {/* Backdrop */}
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
              className="fixed bottom-24 left-3 right-3 z-50 md:hidden bg-gradient-to-b from-white to-[#FDFCF8] rounded-3xl p-4 shadow-2xl border-2 border-indigo-100 print:hidden overflow-hidden max-h-[80vh] overflow-y-auto"
            >
              {/* Top Colorful Gradient Header Bar */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${getModuleAccentColor()}`} />

              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3 pt-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-800 tracking-tight">
                      {activeModule === 'EXAMINATION' && '12वीं परीक्षा त्वरित मेनू (Quick Actions)'}
                      {activeModule === 'REGISTRATION' && '11वीं पंजीयन त्वरित मेनू (Quick Actions)'}
                      {activeModule === 'LIFECYCLE' && '4-चरण पासबुक मेनू (Passbook Actions)'}
                      {activeModule === 'HUB' && 'मुख्य हब मेनू (Central Quick Hub)'}
                    </span>
                    <span className="text-[10px] text-slate-500 block -mt-0.5">कार्रवाई या मॉड्यूल का चयन करें</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsQuickMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Module-Specific Action Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* When in Examination Module */}
                {activeModule === 'EXAMINATION' && (
                  <>
                    <button
                      onClick={() => {
                        setIsQuickMenuOpen(false);
                        onOpenLogTransaction();
                      }}
                      className="flex flex-col items-center justify-center p-3.5 bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 text-emerald-950 rounded-2xl border border-emerald-200 transition text-center shadow-xs active:scale-95 group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mb-1 shadow-md shadow-emerald-600/30">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black text-emerald-950">12वीं फीस जमा करें</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">रसीद काटें</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsQuickMenuOpen(false);
                        onOpenAddStudent();
                      }}
                      className="flex flex-col items-center justify-center p-3.5 bg-gradient-to-br from-indigo-50 to-blue-50 hover:from-indigo-100 text-indigo-950 rounded-2xl border border-indigo-200 transition text-center shadow-xs active:scale-95 group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center mb-1 shadow-md shadow-indigo-600/30">
                        <UserPlus className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black text-indigo-950">नया 12वीं छात्र जोड़ें</span>
                      <span className="text-[10px] text-indigo-700 font-semibold">New Entry</span>
                    </button>

                    {onOpenDailySettlement && (
                      <button
                        onClick={() => {
                          setIsQuickMenuOpen(false);
                          onOpenDailySettlement();
                        }}
                        className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-teal-50 to-emerald-50 hover:from-teal-100 text-teal-950 rounded-2xl border border-teal-200 transition text-center shadow-xs active:scale-95 cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-600 text-white flex items-center justify-center mb-1 shadow-xs">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-teal-950">दैनिक रोकड़ पर्ची</span>
                        <span className="text-[10px] text-teal-700">Cash Settlement</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsQuickMenuOpen(false);
                        setActiveTab('transactions');
                      }}
                      className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-rose-50 to-amber-50 hover:from-rose-100 text-rose-950 rounded-2xl border border-rose-200 transition text-center shadow-xs active:scale-95 cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-600 text-white flex items-center justify-center mb-1 shadow-xs">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-rose-950">12वीं वित्तीय लेज़र</span>
                      <span className="text-[10px] text-rose-700">Audit & Dues</span>
                    </button>
                  </>
                )}

                {/* When in Registration Module */}
                {activeModule === 'REGISTRATION' && (
                  <>
                    <button
                      onClick={() => {
                        setIsQuickMenuOpen(false);
                        if (onOpenAddRegistrationStudent) {
                          onOpenAddRegistrationStudent();
                        } else if (setActiveRegistrationTab) {
                          setActiveRegistrationTab('students');
                        }
                      }}
                      className="flex flex-col items-center justify-center p-3.5 bg-gradient-to-br from-teal-50 to-emerald-50 hover:from-teal-100 text-teal-950 rounded-2xl border border-teal-200 transition text-center shadow-xs active:scale-95 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-700 to-emerald-600 text-white flex items-center justify-center mb-1 shadow-md shadow-teal-700/30">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black text-teal-950">11वीं नया पंजीयन</span>
                      <span className="text-[10px] text-teal-700 font-semibold">New 11th Reg</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsQuickMenuOpen(false);
                        if (setActiveRegistrationTab) setActiveRegistrationTab('ledger');
                      }}
                      className="flex flex-col items-center justify-center p-3.5 bg-gradient-to-br from-emerald-50 to-amber-50 hover:from-emerald-100 text-emerald-950 rounded-2xl border border-emerald-200 transition text-center shadow-xs active:scale-95 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 to-amber-600 text-white flex items-center justify-center mb-1 shadow-md shadow-emerald-700/30">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black text-emerald-950">11वीं रोकड़ लेज़र</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">₹515 / ₹715 Ledger</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsQuickMenuOpen(false);
                        if (setActiveRegistrationTab) setActiveRegistrationTab('doc_audit');
                      }}
                      className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 text-amber-950 rounded-2xl border border-amber-200 transition text-center shadow-xs active:scale-95 cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-600 text-white flex items-center justify-center mb-1 shadow-xs">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-amber-950">5-दस्तावेज़ ऑडिट</span>
                      <span className="text-[10px] text-amber-700">Missing Docs Matrix</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsQuickMenuOpen(false);
                        if (setActiveRegistrationTab) setActiveRegistrationTab('overview');
                      }}
                      className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-indigo-50 to-purple-50 hover:from-indigo-100 text-indigo-950 rounded-2xl border border-indigo-200 transition text-center shadow-xs active:scale-95 cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center mb-1 shadow-xs">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-indigo-950">सांख्यिकी सारांश</span>
                      <span className="text-[10px] text-indigo-700">Registration Analytics</span>
                    </button>
                  </>
                )}

                {/* When in Hub or Lifecycle */}
                {(activeModule === 'HUB' || activeModule === 'LIFECYCLE') && (
                  <>
                    <button
                      onClick={() => {
                        setIsQuickMenuOpen(false);
                        onOpenLogTransaction();
                      }}
                      className="flex flex-col items-center justify-center p-3.5 bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 text-emerald-900 rounded-2xl border border-emerald-200 transition text-center shadow-xs active:scale-95 group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mb-1 shadow-md shadow-emerald-600/30">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black text-emerald-950">12वीं फीस जमा करें</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">रसीद काटें</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsQuickMenuOpen(false);
                        onOpenAddStudent();
                      }}
                      className="flex flex-col items-center justify-center p-3.5 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 text-indigo-900 rounded-2xl border border-indigo-200 transition text-center shadow-xs active:scale-95 group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mb-1 shadow-md shadow-indigo-600/30">
                        <UserPlus className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black text-indigo-950">नया छात्र जोड़ें</span>
                      <span className="text-[10px] text-indigo-700 font-semibold">12th Entry</span>
                    </button>
                  </>
                )}

                {/* Cross-Module Quick Switch Row */}
                <div className="col-span-2 pt-2 border-t border-slate-100 mt-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                    मॉड्यूल स्विच करें (Switch Module)
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        setIsQuickMenuOpen(false);
                        if (setActiveModule) setActiveModule('HUB');
                      }}
                      className={`p-2 rounded-xl text-center border transition cursor-pointer flex flex-col items-center ${
                        activeModule === 'HUB'
                          ? 'bg-indigo-600 text-white border-indigo-700 font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Home className="w-4 h-4 mb-0.5" />
                      <span className="text-[10px]">मुख्य हब</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsQuickMenuOpen(false);
                        if (setActiveModule) setActiveModule('EXAMINATION');
                        setActiveTab('students');
                      }}
                      className={`p-2 rounded-xl text-center border transition cursor-pointer flex flex-col items-center ${
                        activeModule === 'EXAMINATION'
                          ? 'bg-emerald-700 text-white border-emerald-800 font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4 mb-0.5" />
                      <span className="text-[10px]">12वीं परीक्षा</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsQuickMenuOpen(false);
                        if (setActiveModule) setActiveModule('REGISTRATION');
                      }}
                      className={`p-2 rounded-xl text-center border transition cursor-pointer flex flex-col items-center ${
                        activeModule === 'REGISTRATION'
                          ? 'bg-teal-700 text-white border-teal-800 font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 mb-0.5" />
                      <span className="text-[10px]">11वीं पंजीयन</span>
                    </button>
                  </div>
                </div>

                {/* Session & Drawer Transition Option */}
                <div className="col-span-2 grid grid-cols-2 gap-2 mt-1">
                  {onOpenDrawer && (
                    <button
                      onClick={() => {
                        setIsQuickMenuOpen(false);
                        onOpenDrawer();
                      }}
                      className="flex items-center justify-center gap-2 p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 rounded-2xl border border-indigo-200 transition text-center shadow-2xs font-bold text-xs active:scale-95 cursor-pointer"
                    >
                      <Menu className="w-3.5 h-3.5 text-indigo-700" />
                      <span className="text-[11px] font-bold">मेनू ड्रॉवर खोलें</span>
                    </button>
                  )}
                  {onOpenSessionManager && (
                    <button
                      onClick={() => {
                        setIsQuickMenuOpen(false);
                        onOpenSessionManager();
                      }}
                      className="flex items-center justify-center gap-2 p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-950 rounded-2xl border border-amber-200 transition text-center shadow-2xs font-bold text-xs active:scale-95 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 text-amber-700" />
                      <span className="text-[11px] font-bold">सत्र नवीनीकरण</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modern Colorful Mobile Bottom Navigation Bar */}
      <nav 
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] px-1.5 py-1.5 flex justify-between items-center print:hidden select-none"
      >
        {/* Top vibrant module-themed hairline glow */}
        <div className={`absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r ${getModuleAccentColor()} shadow-xs`} />

        {/* Tab 1 */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={currentNavItems[0].onClick}
          className={`relative flex flex-col items-center justify-center py-1 px-1.5 rounded-2xl transition-all duration-200 min-w-[54px] ${
            currentNavItems[0].isActive ? 'text-emerald-800' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {currentNavItems[0].isActive && (
            <motion.div
              layoutId="activeBottomNavPill"
              className="absolute inset-0 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-2xs -z-10"
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
          )}
          <div className={`p-1 rounded-xl transition-all ${
            currentNavItems[0].isActive ? 'bg-emerald-700 text-white shadow-xs scale-105' : 'text-slate-500'
          }`}>
            {React.createElement(currentNavItems[0].icon, { className: 'w-4 h-4' })}
          </div>
          <span className={`text-[10px] tracking-tight mt-0.5 whitespace-nowrap ${
            currentNavItems[0].isActive ? 'font-black text-emerald-900' : 'font-semibold text-slate-600'
          }`}>
            {currentNavItems[0].label}
          </span>
        </motion.button>

        {/* Tab 2 (LEDGER MENU - Always highlighted & prominently placed!) */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={currentNavItems[1].onClick}
          className={`relative flex flex-col items-center justify-center py-1 px-1.5 rounded-2xl transition-all duration-200 min-w-[54px] ${
            currentNavItems[1].isActive ? 'text-emerald-900' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {currentNavItems[1].isActive && (
            <motion.div
              layoutId="activeBottomNavPill"
              className="absolute inset-0 bg-emerald-100/70 border border-emerald-300 rounded-2xl shadow-2xs -z-10"
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
          )}
          <div className={`p-1 rounded-xl transition-all ${
            currentNavItems[1].isActive ? 'bg-emerald-800 text-white shadow-xs scale-105' : 'text-slate-600'
          }`}>
            {React.createElement(currentNavItems[1].icon, { className: 'w-4 h-4' })}
          </div>
          <div className="flex items-center gap-0.5 mt-0.5">
            <span className={`text-[10px] tracking-tight whitespace-nowrap ${
              currentNavItems[1].isActive ? 'font-black text-emerald-950' : 'font-bold text-slate-700'
            }`}>
              {currentNavItems[1].label}
            </span>
          </div>
        </motion.button>

        {/* CENTER RADIANT FLOATING ACTION BUTTON (+ त्वरित मेनू) */}
        <div className="relative -mt-6 flex flex-col items-center shrink-0 px-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
            className={`w-13 h-13 rounded-2xl bg-gradient-to-tr ${getModuleAccentColor()} text-white shadow-lg border-2 border-white flex items-center justify-center transition-all ring-2 ring-emerald-200 cursor-pointer`}
            title="त्वरित मेन्यू (+ फीस / नया छात्र)"
            aria-label="Quick Actions"
          >
            <motion.div
              animate={{ rotate: isQuickMenuOpen ? 45 : 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Plus className="w-7 h-7 stroke-[2.8]" />
            </motion.div>
          </motion.button>
          <span className="text-[9px] font-black text-slate-800 mt-0.5 tracking-tight">
            + मेनू
          </span>
        </div>

        {/* Tab 3 */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={currentNavItems[2].onClick}
          className={`relative flex flex-col items-center justify-center py-1 px-1.5 rounded-2xl transition-all duration-200 min-w-[54px] ${
            currentNavItems[2].isActive ? 'text-teal-900' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {currentNavItems[2].isActive && (
            <motion.div
              layoutId="activeBottomNavPill"
              className="absolute inset-0 bg-teal-50 border border-teal-200 rounded-2xl shadow-2xs -z-10"
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
          )}
          <div className={`p-1 rounded-xl transition-all ${
            currentNavItems[2].isActive ? 'bg-teal-700 text-white shadow-xs scale-105' : 'text-slate-500'
          }`}>
            {React.createElement(currentNavItems[2].icon, { className: 'w-4 h-4' })}
          </div>
          <span className={`text-[10px] tracking-tight mt-0.5 whitespace-nowrap ${
            currentNavItems[2].isActive ? 'font-black text-teal-900' : 'font-semibold text-slate-600'
          }`}>
            {currentNavItems[2].label}
          </span>
        </motion.button>

        {/* Tab 4 */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={currentNavItems[3].onClick}
          className={`relative flex flex-col items-center justify-center py-1 px-1.5 rounded-2xl transition-all duration-200 min-w-[54px] ${
            currentNavItems[3].isActive ? 'text-indigo-900' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {currentNavItems[3].isActive && (
            <motion.div
              layoutId="activeBottomNavPill"
              className="absolute inset-0 bg-indigo-50 border border-indigo-200 rounded-2xl shadow-2xs -z-10"
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
          )}
          <div className={`p-1 rounded-xl transition-all ${
            currentNavItems[3].isActive ? 'bg-indigo-600 text-white shadow-xs scale-105' : 'text-slate-500'
          }`}>
            {React.createElement(currentNavItems[3].icon, { className: 'w-4 h-4' })}
          </div>
          <span className={`text-[10px] tracking-tight mt-0.5 whitespace-nowrap ${
            currentNavItems[3].isActive ? 'font-black text-indigo-900' : 'font-semibold text-slate-600'
          }`}>
            {currentNavItems[3].label}
          </span>
        </motion.button>

      </nav>
    </>
  );
};

