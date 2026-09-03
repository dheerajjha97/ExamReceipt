import React from 'react';
import { 
  Users, 
  IndianRupee, 
  CheckCircle2, 
  AlertCircle, 
  ClipboardCheck, 
  Plus, 
  UploadCloud, 
  CreditCard, 
  FileSpreadsheet, 
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Printer
} from 'lucide-react';
import { motion } from 'motion/react';
import { Student, Transaction, InstituteSettings } from '../types';

interface FlutterDashboardOverviewProps {
  students: Student[];
  transactions: Transaction[];
  settings: InstituteSettings;
  onOpenAddStudent: () => void;
  onOpenLogPayment: () => void;
  onOpenUploadPdf: () => void;
  onSwitchToLedger: () => void;
  onFilterPendingDues?: () => void;
  onOpenBulkPrint?: () => void;
}

export const FlutterDashboardOverview: React.FC<FlutterDashboardOverviewProps> = ({
  students,
  transactions,
  settings,
  onOpenAddStudent,
  onOpenLogPayment,
  onOpenUploadPdf,
  onSwitchToLedger,
  onFilterPendingDues,
  onOpenBulkPrint,
}) => {
  const totalStudents = students.length;
  const paidStudents = students.filter((s) => s.paymentStatus === 'PAID').length;
  const partialStudents = students.filter((s) => s.paymentStatus === 'PARTIAL').length;
  const unpaidStudents = students.filter((s) => s.paymentStatus === 'UNPAID').length;

  // Forms pipeline
  const formsSubmitted = students.filter((s) => s.formIssueStatus === 'SUBMITTED').length;
  const formsIssued = students.filter((s) => s.formIssueStatus === 'ISSUED').length;
  const formsNotIssued = students.filter((s) => !s.formIssueStatus || s.formIssueStatus === 'NOT_ISSUED').length;

  // Financial calculations
  const totalExpectedFee = students.reduce((acc, s) => acc + (s.totalFee || (s.baseFee + (s.onlineCharges || 30))), 0);
  const totalCollectedFee = students.reduce((acc, s) => acc + s.paidAmount, 0);
  const totalPendingDues = Math.max(0, totalExpectedFee - totalCollectedFee);
  const collectionRate = totalExpectedFee > 0 ? Math.round((totalCollectedFee / totalExpectedFee) * 100) : 0;
  const formSubmissionRate = totalStudents > 0 ? Math.round((formsSubmitted / totalStudents) * 100) : 0;

  // Stream counts
  const scienceCount = students.filter((s) => s.classOrStream?.includes('Science')).length;
  const artsCount = students.filter((s) => s.classOrStream?.includes('Arts')).length;
  const commerceCount = students.filter((s) => s.classOrStream?.includes('Commerce')).length;

  return (
    <div className="space-y-4 mb-6">
      {/* Flutter Bento KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: Total Enrollment (Flutter Tonal Surface) */}
        <motion.div 
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="bg-white rounded-3xl p-5 border border-[#E8E4D5] shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#787267] block">
                Total Enrolled (छात्र)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-[#2D2A26] font-mono tracking-tight">
                  {totalStudents}
                </span>
                <span className="text-xs font-semibold text-[#5A5A40]">विद्यार्थी</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#F4F1EA] border border-[#E2DDD0] text-[#5A5A40] flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F0ECE1] flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E2ECE9] text-[#2E5B50]">
              Sci: {scienceCount}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAE8DD] text-[#5A5A40]">
              Arts: {artsCount}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5EEDC] text-[#8C6D23]">
              Com: {commerceCount}
            </span>
          </div>
        </motion.div>

        {/* Card 2: Fee Revenue Collected (Flutter Emerald Tonal Card) */}
        <motion.div 
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="bg-white rounded-3xl p-5 border border-[#D5E5E0] shadow-[0_4px_20px_rgba(46,91,80,0.04)] flex flex-col justify-between relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#2E5B50] block">
                Fee Collected (कुल जमा)
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-[#2E5B50] font-mono tracking-tight">
                  ₹{totalCollectedFee.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#E2ECE9] border border-[#C5DDD6] text-[#2E5B50] flex items-center justify-center shadow-xs">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E8F2EF] flex items-center justify-between text-xs">
            <span className="text-[11px] text-[#487368] font-medium">
              पूर्ण भुगतान: <strong className="font-bold text-[#2E5B50]">{paidStudents}</strong>/{totalStudents}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E2ECE9] text-[#2E5B50] font-mono">
              {collectionRate}% जमा
            </span>
          </div>
        </motion.div>

        {/* Card 3: Collection Rate & Progress Bar (Flutter Progress Card) */}
        <motion.div 
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="bg-white rounded-3xl p-5 border border-[#E8E4D5] shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#787267] block">
                Pending Dues (बकाया)
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-amber-800 font-mono tracking-tight">
                  ₹{totalPendingDues.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            <button
              onClick={onFilterPendingDues}
              title="बकाया छात्रों की सूची देखें"
              className="w-11 h-11 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center shadow-xs transition"
            >
              <AlertCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3 space-y-1.5">
            {/* Flutter Rounded Linear Progress Bar */}
            <div className="h-2 w-full bg-[#F0ECE1] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${collectionRate}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-[#2E5B50] rounded-full"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#787267]">
              <span>बकाया छात्र: <strong>{unpaidStudents + partialStudents}</strong></span>
              <button 
                onClick={onFilterPendingDues}
                className="text-[#2E5B50] font-bold hover:underline inline-flex items-center gap-0.5"
              >
                <span>देखें</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Card 4: Examination Forms Pipeline */}
        <motion.div 
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="bg-white rounded-3xl p-5 border border-[#E8E4D5] shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#787267] block">
                Exam Forms (परीक्षा फॉर्म)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-[#5A5A40] font-mono tracking-tight">
                  {formsSubmitted}
                </span>
                <span className="text-xs font-semibold text-[#787267]">/ {totalStudents} जमा</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#EAE8DD] border border-[#DDD8C5] text-[#5A5A40] flex items-center justify-center shadow-xs">
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F0ECE1] flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[#4A453E] font-semibold">जारी: {formsIssued + formsSubmitted}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="text-[#787267]">लंबित: {formsNotIssued}</span>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Flutter Style Quick Action Chips (ActionChip Row) */}
      <div className="bg-[#F8F6F0] p-3 rounded-2xl border border-[#E8E4D5] flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[11px] font-bold text-[#787267] uppercase tracking-wider px-2 shrink-0 hidden sm:inline">
          त्वरित कार्य:
        </span>

        {/* Quick Action: Log Payment */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={onOpenLogPayment}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2E5B50] hover:bg-[#254A41] text-white rounded-xl text-xs font-bold shadow-xs transition shrink-0"
        >
          <IndianRupee className="w-3.5 h-3.5 text-emerald-200" />
          <span>+ फीस जमा (Log Payment)</span>
        </motion.button>

        {/* Quick Action: Add Student */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={onOpenAddStudent}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#FDFCF8] text-[#4A453E] rounded-xl text-xs font-bold border border-[#DDD8C5] shadow-xs transition shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-[#5A5A40]" />
          <span>+ नया छात्र (Add Student)</span>
        </motion.button>

        {/* Quick Action: Import PDF */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={onOpenUploadPdf}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#FDFCF8] text-[#4A453E] rounded-xl text-xs font-bold border border-[#DDD8C5] shadow-xs transition shrink-0"
        >
          <UploadCloud className="w-3.5 h-3.5 text-teal-600" />
          <span>OCR / Excel Import</span>
        </motion.button>

        {/* Quick Action: Financial Ledger */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={onSwitchToLedger}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#FDFCF8] text-[#4A453E] rounded-xl text-xs font-bold border border-[#DDD8C5] shadow-xs transition shrink-0"
        >
          <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
          <span>लेज़र रिपोर्ट (Ledger)</span>
        </motion.button>

        {/* Quick Action: Filter Pending */}
        {onFilterPendingDues && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={onFilterPendingDues}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold border border-amber-200 transition shrink-0 ml-auto"
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>केवल बकाया छात्र ({unpaidStudents + partialStudents})</span>
          </motion.button>
        )}
      </div>
    </div>
  );
};
