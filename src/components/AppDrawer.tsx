import React from 'react';
import {
  X,
  School,
  GraduationCap,
  BookOpen,
  Settings,
  Users,
  CreditCard,
  UploadCloud,
  FileCheck2,
  Calendar,
  Layers,
  KeyRound,
  LogOut,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Building2,
  UserCheck,
  Receipt,
  FileSpreadsheet,
  ArrowRightLeft,
  LayoutDashboard,
  PlusCircle,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InstituteSettings } from '../types';
import { RegistrationSubTab } from './Registration/RegistrationModule';

export interface AppDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: InstituteSettings;
  activeModule: 'HUB' | 'EXAMINATION' | 'REGISTRATION' | 'LIFECYCLE';
  setActiveModule: (module: 'HUB' | 'EXAMINATION' | 'REGISTRATION' | 'LIFECYCLE') => void;
  activeTab: 'students' | 'upload' | 'transactions' | 'settings';
  setActiveTab: (tab: 'students' | 'upload' | 'transactions' | 'settings') => void;
  activeRegistrationTab: RegistrationSubTab;
  setActiveRegistrationTab: (tab: RegistrationSubTab) => void;
  onOpenAddStudent: () => void;
  onOpenUploadPdf: () => void;
  onOpenLogTransaction: () => void;
  onOpenDailySettlement: () => void;
  onOpenSettings: () => void;
  onOpenSessionManager: () => void;
  onOpenChangePassword: () => void;
  onLogout: () => void;
  onOpenAddRegistrationStudent?: () => void;
  onOpenUploadRegistration?: () => void;
  studentsCount?: number;
  registrationCount?: number;
}

export const AppDrawer: React.FC<AppDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  activeModule,
  setActiveModule,
  activeTab,
  setActiveTab,
  activeRegistrationTab,
  setActiveRegistrationTab,
  onOpenAddStudent,
  onOpenUploadPdf,
  onOpenLogTransaction,
  onOpenDailySettlement,
  onOpenSettings,
  onOpenSessionManager,
  onOpenChangePassword,
  onLogout,
  onOpenAddRegistrationStudent,
  onOpenUploadRegistration,
  studentsCount = 0,
  registrationCount = 0,
}) => {
  // Close drawer on ESC key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleNavClick = (callback: () => void) => {
    callback();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex overflow-hidden">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Slide-out Drawer Panel */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="relative w-full max-w-sm sm:max-w-md bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden border-r border-slate-200 text-slate-800"
          >
            {/* ========================================================
                1. TOP SECTION: USER & INSTITUTION DETAILS
               ======================================================== */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 shrink-0 relative overflow-hidden border-b border-indigo-900/50">
              {/* Background Glow Decors */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-36 h-36 bg-teal-500/15 rounded-full blur-2xl pointer-events-none -ml-12 -mb-12" />

              {/* Close Button Header */}
              <div className="flex items-center justify-between relative z-10 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-400">
                    BSEB PORTAL &bull; ONLINE
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition focus:outline-none focus:ring-2 focus:ring-white/40"
                  title="बंद करें (Close)"
                  aria-label="Close drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Avatar + Cashier Info */}
              <div className="flex items-start gap-3.5 relative z-10">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-teal-400 p-0.5 shadow-lg shrink-0">
                  <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                    <School className="w-6 h-6 text-indigo-300" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-black text-white truncate">
                      {settings.cashierName || 'प्रशासन / Cashier'}
                    </h3>
                    <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 text-[10px] font-mono font-bold shrink-0">
                      ADMIN
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium truncate mt-0.5">
                    {settings.name || 'कॉलेज / विद्यालय पोर्टल'}
                  </p>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    <span className="px-2 py-0.5 rounded-lg bg-white/10 text-white font-mono text-[10.5px] font-bold border border-white/15">
                      CODE: {settings.code || 'BSEB-CODE'}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-teal-500/20 text-teal-300 text-[10.5px] font-bold border border-teal-400/30">
                      सत्र: {settings.academicYear || '2025-2027'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Switch to Main Hub */}
              <button
                onClick={() => handleNavClick(() => setActiveModule('HUB'))}
                className={`mt-4 w-full p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold transition ${
                  activeModule === 'HUB'
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-slate-100 border-white/15'
                }`}
              >
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-indigo-300" />
                  <span>मुख्य डैशबोर्ड (Main Central Hub)</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>
            </div>

            {/* ========================================================
                DRAWER SCROLLABLE CONTENT (Exam, Registration, Settings)
               ======================================================== */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">

              {/* ========================================================
                  2. EXAM MODULE (12th Examination Form 2025-2027)
                 ======================================================== */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs">
                      12
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 tracking-wide uppercase">
                        12वीं परीक्षा प्रपत्र (Exam Module)
                      </h4>
                      <span className="text-[10.5px] text-slate-500 font-medium">सत्र 2025-2027 &bull; {studentsCount} छात्र</span>
                    </div>
                  </div>
                  {activeModule === 'EXAMINATION' && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[10px]">
                      सक्रिय (Active)
                    </span>
                  )}
                </div>

                <div className="bg-slate-50/80 rounded-2xl p-1.5 border border-slate-200/80 space-y-1">
                  {/* Exam Students List */}
                  <button
                    onClick={() =>
                      handleNavClick(() => {
                        setActiveModule('EXAMINATION');
                        setActiveTab('students');
                      })
                    }
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold transition ${
                      activeModule === 'EXAMINATION' && activeTab === 'students'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-white hover:text-indigo-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>12वीं छात्र सूची (Student Directory)</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded-md bg-black/10 font-mono text-[11px]">
                      {studentsCount}
                    </span>
                  </button>

                  {/* Exam Fee Ledger */}
                  <button
                    onClick={() =>
                      handleNavClick(() => {
                        setActiveModule('EXAMINATION');
                        setActiveTab('transactions');
                      })
                    }
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold transition ${
                      activeModule === 'EXAMINATION' && activeTab === 'transactions'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-white hover:text-indigo-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Receipt className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>12वीं शुल्क लेज़र (Fee Ledger)</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  {/* Daily Settlement (Day Book) */}
                  <button
                    onClick={() => handleNavClick(onOpenDailySettlement)}
                    className="w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-white hover:text-teal-900 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>दैनिक रोकड़ पर्ची (Daily Cash Book)</span>
                    </div>
                    <span className="text-[10px] text-teal-700 font-bold bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded">
                      Day Sheet
                    </span>
                  </button>

                  {/* AI OCR Upload */}
                  <button
                    onClick={() => handleNavClick(onOpenUploadPdf)}
                    className="w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-white hover:text-indigo-900 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <UploadCloud className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>AI PDF/फोटो से छात्र आयात (OCR)</span>
                    </div>
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                      AI OCR
                    </span>
                  </button>

                  {/* Add 12th Student */}
                  <button
                    onClick={() => handleNavClick(onOpenAddStudent)}
                    className="w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-white hover:text-emerald-900 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <PlusCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>+ नया 12वीं छात्र जोड़ें</span>
                    </div>
                  </button>

                  {/* Log Offline Payment */}
                  <button
                    onClick={() => handleNavClick(onOpenLogTransaction)}
                    className="w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-white hover:text-amber-900 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>ऑफ़लाइन रसीद दर्ज करें (Log Txn)</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* ========================================================
                  3. REGISTRATION MODULE (11th Registration 2026-2028)
                 ======================================================== */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                      11
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 tracking-wide uppercase">
                        11वीं सूचीकरण (Registration Module)
                      </h4>
                      <span className="text-[10.5px] text-slate-500 font-medium">सत्र 2026-2028 &bull; {registrationCount} छात्र</span>
                    </div>
                  </div>
                  {activeModule === 'REGISTRATION' && (
                    <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold text-[10px]">
                      सक्रिय (Active)
                    </span>
                  )}
                </div>

                <div className="bg-teal-50/50 rounded-2xl p-1.5 border border-teal-200/60 space-y-1">
                  {/* Registration Student List */}
                  <button
                    onClick={() =>
                      handleNavClick(() => {
                        setActiveModule('REGISTRATION');
                        setActiveRegistrationTab('students');
                      })
                    }
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold transition ${
                      activeModule === 'REGISTRATION' && activeRegistrationTab === 'students'
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-white hover:text-teal-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>11वीं छात्र पंजीयन सूची (List)</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded-md bg-black/10 font-mono text-[11px]">
                      {registrationCount}
                    </span>
                  </button>

                  {/* Registration Overview */}
                  <button
                    onClick={() =>
                      handleNavClick(() => {
                        setActiveModule('REGISTRATION');
                        setActiveRegistrationTab('overview');
                      })
                    }
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold transition ${
                      activeModule === 'REGISTRATION' && activeRegistrationTab === 'overview'
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-white hover:text-teal-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>पंजीयन डैशबोर्ड अवलोकन (Overview)</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  {/* Registration Ledger */}
                  <button
                    onClick={() =>
                      handleNavClick(() => {
                        setActiveModule('REGISTRATION');
                        setActiveRegistrationTab('ledger');
                      })
                    }
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold transition ${
                      activeModule === 'REGISTRATION' && activeRegistrationTab === 'ledger'
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-white hover:text-teal-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Receipt className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>11वीं रोकड़ लेज़र (Fee Ledger)</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                      ₹515 / ₹715
                    </span>
                  </button>

                  {/* Registration Document Audit */}
                  <button
                    onClick={() =>
                      handleNavClick(() => {
                        setActiveModule('REGISTRATION');
                        setActiveRegistrationTab('doc_audit');
                      })
                    }
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold transition ${
                      activeModule === 'REGISTRATION' && activeRegistrationTab === 'doc_audit'
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-white hover:text-teal-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileCheck2 className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>दस्तावेज़ जाँच व SLC/APAAR (Audit)</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  {/* Registration Daily Daybook */}
                  <button
                    onClick={() =>
                      handleNavClick(() => {
                        setActiveModule('REGISTRATION');
                        setActiveRegistrationTab('daybook');
                      })
                    }
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold transition ${
                      activeModule === 'REGISTRATION' && activeRegistrationTab === 'daybook'
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-white hover:text-teal-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>11वीं दैनिक रोकड़ पर्ची (Day-Book)</span>
                    </div>
                  </button>

                  {/* Add 11th Registration Student */}
                  {onOpenAddRegistrationStudent && (
                    <button
                      onClick={() => handleNavClick(onOpenAddRegistrationStudent)}
                      className="w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-white hover:text-teal-900 transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <PlusCircle className="w-4 h-4 text-teal-600 shrink-0" />
                        <span>+ नया 11वीं छात्र जोड़ें</span>
                      </div>
                    </button>
                  )}

                  {/* Bulk Upload 11th Registration */}
                  {onOpenUploadRegistration && (
                    <button
                      onClick={() => handleNavClick(onOpenUploadRegistration)}
                      className="w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-white hover:text-blue-900 transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <UploadCloud className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>11वीं Excel/PDF आयात</span>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* 4-Stage Lifecycle Passbook Quick Link */}
              <div className="bg-purple-50 rounded-2xl p-2.5 border border-purple-200/80">
                <button
                  onClick={() => handleNavClick(() => setActiveModule('LIFECYCLE'))}
                  className={`w-full p-2 rounded-xl flex items-center justify-between text-xs font-bold transition ${
                    activeModule === 'LIFECYCLE'
                      ? 'bg-purple-700 text-white shadow-sm'
                      : 'text-purple-900 hover:bg-purple-100/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>4-चरणीय छात्र पासबुक (Lifecycle)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-70" />
                </button>
              </div>

              {/* ========================================================
                  4. SETTINGS & ADMINISTRATION
                 ======================================================== */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="px-1 flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-slate-500" />
                  <h4 className="text-xs font-black text-slate-800 tracking-wide uppercase">
                    सिस्टम सेटिंग्स व प्रशासन (Settings)
                  </h4>
                </div>

                <div className="bg-slate-50/80 rounded-2xl p-1.5 border border-slate-200/80 space-y-1">
                  {/* General Institute Settings */}
                  <button
                    onClick={() => handleNavClick(onOpenSettings)}
                    className="w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-white hover:text-indigo-900 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>कॉलेज व शुल्क सेटिंग्स (Fee Rates)</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  {/* Academic Session Manager */}
                  <button
                    onClick={() => handleNavClick(onOpenSessionManager)}
                    className="w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-white hover:text-purple-900 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>सत्र प्रबंधन (Session Manager)</span>
                    </div>
                    <span className="text-[10.5px] font-mono text-purple-700 font-bold bg-purple-100 px-1.5 py-0.5 rounded">
                      {settings.academicYear || '2025-27'}
                    </span>
                  </button>

                  {/* Change Password */}
                  <button
                    onClick={() => handleNavClick(onOpenChangePassword)}
                    className="w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-white hover:text-amber-900 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>लॉगिन पासवर्ड बदलें (Change Password)</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* ========================================================
                DRAWER FOOTER: SECURE LOGOUT & CLOUD STATUS
               ======================================================== */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium truncate">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">256-Bit SSL Secured</span>
              </div>

              <button
                onClick={() => handleNavClick(onLogout)}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>लॉगआउट (Exit)</span>
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
