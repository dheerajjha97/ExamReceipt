import React, { useState } from 'react';
import { 
  Users, 
  UploadCloud, 
  CreditCard, 
  Settings,
  Plus,
  UserPlus,
  Receipt,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);

  return (
    <>
      {/* Quick Action Bottom Sheet / Speed Dial (Opens when center button is tapped) */}
      <AnimatePresence>
        {isQuickMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsQuickMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 md:hidden print:hidden"
            />

            {/* Flutter Material 3 Quick Action Sheet */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              className="fixed bottom-20 left-4 right-4 z-50 md:hidden bg-[#FDFCF8] rounded-3xl p-4 shadow-2xl border border-[#E6E2D3] print:hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#EFECE1] mb-3">
                <span className="text-xs font-bold text-[#4A453E] uppercase tracking-wider">त्वरित कार्रवाई (Quick Actions)</span>
                <button 
                  onClick={() => setIsQuickMenuOpen(false)}
                  className="p-1 text-[#787267] hover:text-[#4A453E] rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    setIsQuickMenuOpen(false);
                    onOpenLogTransaction();
                  }}
                  className="flex flex-col items-center justify-center p-3.5 bg-[#E2ECE9] hover:bg-[#D5E3DF] text-[#2E5B50] rounded-2xl border border-[#2E5B50]/20 transition text-center shadow-xs"
                >
                  <div className="w-9 h-9 rounded-full bg-[#2E5B50] text-white flex items-center justify-center mb-1.5 shadow-sm">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold">फीस जमा करें</span>
                  <span className="text-[10px] text-[#2E5B50]/80">Log Payment</span>
                </button>

                <button
                  onClick={() => {
                    setIsQuickMenuOpen(false);
                    onOpenAddStudent();
                  }}
                  className="flex flex-col items-center justify-center p-3.5 bg-[#F5F2E8] hover:bg-[#EAE8DD] text-[#5A5A40] rounded-2xl border border-[#DDD8C5] transition text-center shadow-xs"
                >
                  <div className="w-9 h-9 rounded-full bg-[#5A5A40] text-white flex items-center justify-center mb-1.5 shadow-sm">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold">नया छात्र जोड़ें</span>
                  <span className="text-[10px] text-[#5A5A40]/80">Add Student</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar - Flutter Material 3 Docked Bar (No Overlapping FAB) */}
      <nav 
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#FDFCF8]/98 backdrop-blur-xl border-t border-[#E6E2D3] shadow-[0_-4px_24px_rgba(0,0,0,0.08)] px-2 py-1.5 flex justify-around items-center print:hidden"
      >
        {/* Tab 1: Students */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => {
            setIsQuickMenuOpen(false);
            setActiveTab('students');
          }}
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-colors min-w-[58px] ${
            activeTab === 'students' ? 'text-[#2E5B50]' : 'text-[#787267] hover:text-[#4A453E]'
          }`}
        >
          {activeTab === 'students' && (
            <motion.div
              layoutId="activeBottomNavPill"
              className="absolute inset-0 bg-[#E2ECE9] border border-[#2E5B50]/20 rounded-2xl shadow-xs -z-10"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <Users className="w-5 h-5" />
          <span className={`text-[10px] tracking-tight mt-0.5 whitespace-nowrap ${
            activeTab === 'students' ? 'font-black text-[#2E5B50]' : 'font-semibold text-[#787267]'
          }`}>
            छात्र
          </span>
        </motion.button>

        {/* Tab 2: Import */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => {
            setIsQuickMenuOpen(false);
            setActiveTab('upload');
          }}
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-colors min-w-[58px] ${
            activeTab === 'upload' ? 'text-[#2E5B50]' : 'text-[#787267] hover:text-[#4A453E]'
          }`}
        >
          {activeTab === 'upload' && (
            <motion.div
              layoutId="activeBottomNavPill"
              className="absolute inset-0 bg-[#E2ECE9] border border-[#2E5B50]/20 rounded-2xl shadow-xs -z-10"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <UploadCloud className="w-5 h-5" />
          <span className={`text-[10px] tracking-tight mt-0.5 whitespace-nowrap ${
            activeTab === 'upload' ? 'font-black text-[#2E5B50]' : 'font-semibold text-[#787267]'
          }`}>
            इम्पोर्ट
          </span>
        </motion.button>

        {/* CENTER DOCKED ACTION BUTTON (+ फीस जमा / Quick Actions) */}
        <div className="relative -mt-5 flex flex-col items-center shrink-0">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
            className="w-12 h-12 rounded-full bg-[#2E5B50] hover:bg-[#254A41] text-white shadow-xl shadow-[#2E5B50]/30 border-4 border-[#FDFCF8] flex items-center justify-center transition-transform"
            title="त्वरित कार्रवाई (+ फीस जमा / नया छात्र)"
            aria-label="Quick Actions"
          >
            <motion.div
              animate={{ rotate: isQuickMenuOpen ? 45 : 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </motion.div>
          </motion.button>
          <span className="text-[9px] font-bold text-[#2E5B50] mt-0.5 tracking-tight">
            + कार्रवाई
          </span>
        </div>

        {/* Tab 3: Ledger */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => {
            setIsQuickMenuOpen(false);
            setActiveTab('transactions');
          }}
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-colors min-w-[58px] ${
            activeTab === 'transactions' ? 'text-[#2E5B50]' : 'text-[#787267] hover:text-[#4A453E]'
          }`}
        >
          {activeTab === 'transactions' && (
            <motion.div
              layoutId="activeBottomNavPill"
              className="absolute inset-0 bg-[#E2ECE9] border border-[#2E5B50]/20 rounded-2xl shadow-xs -z-10"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <CreditCard className="w-5 h-5" />
          <span className={`text-[10px] tracking-tight mt-0.5 whitespace-nowrap ${
            activeTab === 'transactions' ? 'font-black text-[#2E5B50]' : 'font-semibold text-[#787267]'
          }`}>
            लेज़र
          </span>
        </motion.button>

        {/* Tab 4: Settings */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => {
            setIsQuickMenuOpen(false);
            setActiveTab('settings');
          }}
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-colors min-w-[58px] ${
            activeTab === 'settings' ? 'text-[#2E5B50]' : 'text-[#787267] hover:text-[#4A453E]'
          }`}
        >
          {activeTab === 'settings' && (
            <motion.div
              layoutId="activeBottomNavPill"
              className="absolute inset-0 bg-[#E2ECE9] border border-[#2E5B50]/20 rounded-2xl shadow-xs -z-10"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <Settings className="w-5 h-5" />
          <span className={`text-[10px] tracking-tight mt-0.5 whitespace-nowrap ${
            activeTab === 'settings' ? 'font-black text-[#2E5B50]' : 'font-semibold text-[#787267]'
          }`}>
            सेटिंग्स
          </span>
        </motion.button>
      </nav>
    </>
  );
};



