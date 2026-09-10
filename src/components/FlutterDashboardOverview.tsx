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
  Printer,
  Banknote
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
  onOpenDailySettlement?: () => void;
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
  onOpenDailySettlement,
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
      {/* Material 3 Bento KPI Grid with Vibrant Gradient Accents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: Total Enrollment */}
        <motion.div 
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Total Enrolled (कुल छात्र)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-slate-900 font-mono tracking-tight font-heading">
                  {totalStudents}
                </span>
                <span className="text-xs font-semibold text-slate-600">छात्र</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Sci: {scienceCount}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Arts: {artsCount}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Com: {commerceCount}
            </span>
          </div>
        </motion.div>

        {/* Card 2: Fee Revenue Collected */}
        <motion.div 
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="bg-white rounded-3xl p-5 border border-emerald-200 shadow-xl shadow-emerald-500/10 flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                Fee Collected (कुल जमा)
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono tracking-tight font-heading">
                  ₹{totalCollectedFee.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-xs">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-emerald-900 font-medium">
              पूर्ण भुगतान: <strong className="font-bold text-emerald-700">{paidStudents}</strong>/{totalStudents}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono">
              {collectionRate}% जमा
            </span>
          </div>
        </motion.div>

        {/* Card 3: Collection Rate & Pending Dues */}
        <motion.div 
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="bg-white rounded-3xl p-5 border border-rose-200 shadow-xl shadow-rose-500/10 flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-amber-500" />
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 block">
                Pending Dues (बकाया)
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-rose-700 font-mono tracking-tight font-heading">
                  ₹{totalPendingDues.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            <button
              onClick={onFilterPendingDues}
              title="बकाया छात्रों की सूची देखें"
              className="w-11 h-11 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center shadow-xs transition"
            >
              <AlertCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3 space-y-1.5">
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${collectionRate}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span>बकाया छात्र: <strong>{unpaidStudents + partialStudents}</strong></span>
              <button 
                onClick={onFilterPendingDues}
                className="text-rose-600 font-bold hover:underline inline-flex items-center gap-0.5"
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
          className="bg-white rounded-3xl p-5 border border-indigo-200 shadow-xl shadow-indigo-500/10 flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600" />
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Exam Forms (परीक्षा फॉर्म)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-indigo-700 font-mono tracking-tight font-heading">
                  {formsSubmitted}
                </span>
                <span className="text-xs font-semibold text-slate-600">/ {totalStudents} जमा</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shadow-xs">
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-slate-800 font-semibold">जारी: {formsIssued + formsSubmitted}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="text-slate-600">लंबित: {formsNotIssued}</span>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Material 3 Action Chip Ribbon */}
      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center gap-2 overflow-x-auto scrollbar-none shadow-xs">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2 shrink-0 hidden sm:inline">
          त्वरित कार्य:
        </span>

        {/* Quick Action: Log Payment */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={onOpenLogPayment}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/20 transition shrink-0"
        >
          <IndianRupee className="w-3.5 h-3.5 text-emerald-200" />
          <span>+ फीस जमा (Log Payment)</span>
        </motion.button>

        {/* Quick Action: Add Student */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={onOpenAddStudent}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shadow-xs transition shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-600" />
          <span>+ नया छात्र (Add Student)</span>
        </motion.button>

        {/* Quick Action: Import PDF */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={onOpenUploadPdf}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shadow-xs transition shrink-0"
        >
          <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
          <span>OCR / Excel Import</span>
        </motion.button>

        {/* Quick Action: Financial Ledger */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={onSwitchToLedger}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shadow-xs transition shrink-0"
        >
          <CreditCard className="w-3.5 h-3.5 text-purple-600" />
          <span>लेज़र रिपोर्ट (Ledger)</span>
        </motion.button>

        {/* Quick Action: Cashier Day Closing / Day Book */}
        {onOpenDailySettlement && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenDailySettlement}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 shadow-xs transition shrink-0"
          >
            <Banknote className="w-3.5 h-3.5 text-emerald-600" />
            <span>दैनिक रोकड़ (Day Book)</span>
          </motion.button>
        )}

        {/* Quick Action: Filter Pending */}
        {onFilterPendingDues && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={onFilterPendingDues}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-xl text-xs font-bold border border-rose-200 transition shrink-0 ml-auto"
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>केवल बकाया छात्र ({unpaidStudents + partialStudents})</span>
          </motion.button>
        )}
      </div>
    </div>
  );
};
