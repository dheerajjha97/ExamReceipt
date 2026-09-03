import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  Search, 
  Download, 
  Filter, 
  IndianRupee, 
  CheckCircle2, 
  Calendar, 
  Receipt, 
  QrCode, 
  Wallet,
  Sparkles,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  PlusCircle,
  Printer,
  Trash2,
  Tag,
  Banknote,
  Clock,
  AlertCircle,
  Users,
  Building2,
  FileCheck
} from 'lucide-react';
import { Transaction, PaymentMode, InstituteSettings, Student } from '../types';
import financialWallet3d from '../assets/images/financial_wallet_3d_1787937095834.jpg';
import { ConfirmModal } from './ConfirmModal';
import { downloadCompleteTransactionLedgerPDF } from '../utils/pdfGenerator';
import { DailySettlementModal } from './DailySettlementModal';

interface TransactionHistoryProps {
  transactions: Transaction[];
  students?: Student[];
  settings?: InstituteSettings;
  onViewStudentReceipt?: (registrationNo: string) => void;
  onOpenRecordPayment?: (student: Student) => void;
  onOpenLogTransaction?: () => void;
  onDeleteTransaction?: (txnId: string) => void;
  onClearAllTransactions?: () => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  students = [],
  settings,
  onViewStudentReceipt,
  onOpenRecordPayment,
  onOpenLogTransaction,
  onDeleteTransaction,
  onClearAllTransactions,
}) => {
  // View Switcher: Transactions Log vs Dues & Outstanding Ledger
  const [activeLedgerView, setActiveLedgerView] = useState<'transactions' | 'dues'>('transactions');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [streamFilter, setStreamFilter] = useState<string>('ALL');

  // Date Filter Presets
  const [datePreset, setDatePreset] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Daily Settlement Modal
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);

  // Confirmation Modals State (Mistake Protection)
  const [txnToDelete, setTxnToDelete] = useState<Transaction | null>(null);
  const [showClearAllTxnsConfirm, setShowClearAllTxnsConfirm] = useState(false);

  // Quick Date Preset Change Handler
  const handleDatePresetChange = (preset: 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom') => {
    setDatePreset(preset);
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'yesterday') {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().slice(0, 10);
      setStartDate(yStr);
      setEndDate(yStr);
    } else if (preset === 'week') {
      const w = new Date(today);
      w.setDate(w.getDate() - 7);
      setStartDate(w.toISOString().slice(0, 10));
      setEndDate(todayStr);
    } else if (preset === 'month') {
      const m = new Date(today);
      m.setDate(1); // 1st of current month
      setStartDate(m.toISOString().slice(0, 10));
      setEndDate(todayStr);
    }
  };

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        txn.studentName.toLowerCase().includes(q) ||
        txn.registrationNo.toLowerCase().includes(q) ||
        txn.receiptNo.toLowerCase().includes(q) ||
        txn.transactionRef.toLowerCase().includes(q) ||
        txn.collectedBy.toLowerCase().includes(q) ||
        (txn.remarks && txn.remarks.toLowerCase().includes(q));

      const matchesMode = modeFilter === 'ALL' || txn.paymentMode === modeFilter;
      const matchesType = typeFilter === 'ALL' || (txn.transactionType || 'Board Exam Fee') === typeFilter;
      const matchesStream = streamFilter === 'ALL' || txn.classOrStream === streamFilter;

      let matchesDate = true;
      if (startDate || endDate) {
        const txnDateStr = txn.paymentDate.split(' ')[0];
        if (startDate && txnDateStr < startDate) matchesDate = false;
        if (endDate && txnDateStr > endDate) matchesDate = false;
      }

      return matchesSearch && matchesMode && matchesType && matchesStream && matchesDate;
    });
  }, [transactions, searchQuery, modeFilter, typeFilter, streamFilter, startDate, endDate]);

  // Outstanding Dues Students
  const duesStudents = useMemo(() => {
    return students.filter((s) => {
      const isDue = s.paymentStatus === 'UNPAID' || s.paymentStatus === 'PARTIAL' || (s.totalFee - s.paidAmount) > 0;
      if (!isDue) return false;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.studentName.toLowerCase().includes(q) ||
        s.registrationNo.toLowerCase().includes(q) ||
        s.fatherName.toLowerCase().includes(q);

      const matchesStream = streamFilter === 'ALL' || s.classOrStream === streamFilter;
      return matchesSearch && matchesStream;
    });
  }, [students, searchQuery, streamFilter]);

  // Overall Financial Analytics
  const summary = useMemo(() => {
    const totalCollected = filteredTransactions.reduce((acc, t) => acc + t.paidAmount, 0);
    const totalBaseFee = filteredTransactions.reduce((acc, t) => acc + t.baseFee, 0);
    const totalOnlineCharges = filteredTransactions.reduce((acc, t) => acc + (t.onlineCharges || 30), 0);

    // Payment Modes Breakdown
    const upiTxns = filteredTransactions.filter((t) => t.paymentMode === 'UPI' || t.paymentMode === 'QR_CODE');
    const upiAmount = upiTxns.reduce((acc, t) => acc + t.paidAmount, 0);

    const cashTxns = filteredTransactions.filter((t) => t.paymentMode === 'CASH');
    const cashAmount = cashTxns.reduce((acc, t) => acc + t.paidAmount, 0);

    const netBankingTxns = filteredTransactions.filter((t) => t.paymentMode === 'NET_BANKING' || t.paymentMode === 'CARD');
    const netBankingAmount = netBankingTxns.reduce((acc, t) => acc + t.paidAmount, 0);

    // Stream-wise breakdown
    const scienceTxns = filteredTransactions.filter((t) => t.classOrStream.includes('Science'));
    const scienceAmount = scienceTxns.reduce((acc, t) => acc + t.paidAmount, 0);

    const artsTxns = filteredTransactions.filter((t) => t.classOrStream.includes('Arts'));
    const artsAmount = artsTxns.reduce((acc, t) => acc + t.paidAmount, 0);

    const commerceTxns = filteredTransactions.filter((t) => t.classOrStream.includes('Commerce'));
    const commerceAmount = commerceTxns.reduce((acc, t) => acc + t.paidAmount, 0);

    const matricTxns = filteredTransactions.filter((t) => t.classOrStream.includes('Matric') || t.classOrStream.includes('10th'));
    const matricAmount = matricTxns.reduce((acc, t) => acc + t.paidAmount, 0);

    // Total Dues Calculation
    const totalOutstandingDue = duesStudents.reduce((acc, s) => {
      const fee = s.totalFee || (s.baseFee + (s.onlineCharges || 30));
      return acc + Math.max(0, fee - s.paidAmount);
    }, 0);

    return {
      totalCollected,
      totalBaseFee,
      totalOnlineCharges,
      upiCount: upiTxns.length,
      upiAmount,
      cashCount: cashTxns.length,
      cashAmount,
      netBankingCount: netBankingTxns.length,
      netBankingAmount,
      scienceCount: scienceTxns.length,
      scienceAmount,
      artsCount: artsTxns.length,
      artsAmount,
      commerceCount: commerceTxns.length,
      commerceAmount,
      matricCount: matricTxns.length,
      matricAmount,
      totalOutstandingDue,
      count: filteredTransactions.length,
    };
  }, [filteredTransactions, duesStudents]);

  // CSV Export
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;

    const headers = [
      'Txn ID',
      'Receipt No',
      'Transaction Type',
      'Student Name',
      'Registration No',
      'Class/Stream',
      'Base Fee (INR)',
      'Online Charges (INR)',
      'Total Amount (INR)',
      'Paid Amount (INR)',
      'Due Amount (INR)',
      'Payment Mode',
      'Transaction Ref/UTR',
      'Payment Date',
      'Collected By',
      'Remarks',
    ];

    const csvRows = [headers.join(',')];

    filteredTransactions.forEach((t) => {
      const row = [
        t.id,
        `"${t.receiptNo}"`,
        `"${t.transactionType || 'Board Exam Fee'}"`,
        `"${t.studentName}"`,
        `"${t.registrationNo}"`,
        `"${t.classOrStream}"`,
        t.baseFee,
        t.onlineCharges || 30,
        t.totalAmount,
        t.paidAmount,
        t.dueAmount,
        t.paymentMode,
        `"${t.transactionRef}"`,
        `"${t.paymentDate}"`,
        `"${t.collectedBy}"`,
        `"${t.remarks || ''}"`,
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Fee_Transactions_Statement_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dues List CSV Export
  const handleExportDuesCSV = () => {
    if (duesStudents.length === 0) return;

    const headers = [
      'S.No',
      'Registration No',
      'Student Name',
      'Father Name',
      'Class/Stream',
      'Category',
      'Total Fee (INR)',
      'Paid Amount (INR)',
      'Balance Due (INR)',
      'Payment Status',
    ];

    const csvRows = [headers.join(',')];

    duesStudents.forEach((s, idx) => {
      const fee = s.totalFee || (s.baseFee + (s.onlineCharges || 30));
      const due = Math.max(0, fee - s.paidAmount);
      const row = [
        idx + 1,
        `"${s.registrationNo}"`,
        `"${s.studentName}"`,
        `"${s.fatherName}"`,
        `"${s.classOrStream}"`,
        `"${s.casteCategory}"`,
        fee,
        s.paidAmount,
        due,
        s.paymentStatus,
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Pending_Fee_Dues_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Complete Multi-Page PDF Report
  const handleExportPDF = () => {
    const activeSettings: InstituteSettings = settings || {
      name: 'M.S. College, Motihari',
      subTitle: 'Constituent Unit of B.R.A. Bihar University, Muzaffarpur',
      address: 'Motihari, East Champaran, Bihar - 845401',
      code: '0108',
      academicYear: '2024-2026',
      defaultOnlineCharge: 30,
      upiId: 'college@upi',
    };

    const filterDesc = [
      modeFilter !== 'ALL' ? `Mode: ${modeFilter}` : '',
      typeFilter !== 'ALL' ? `Type: ${typeFilter}` : '',
      streamFilter !== 'ALL' ? `Stream: ${streamFilter}` : '',
      searchQuery ? `Search: "${searchQuery}"` : '',
      startDate ? `From: ${startDate}` : '',
      endDate ? `To: ${endDate}` : '',
    ].filter(Boolean).join(', ') || 'All Transactions';

    downloadCompleteTransactionLedgerPDF(filteredTransactions, activeSettings, filterDesc);
  };

  return (
    <div className="space-y-6 pb-28 sm:pb-12">
      
      {/* Top Banner with 3D Wallet Illustration */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#4A453E] to-[#3E3A33] text-white p-5 sm:p-6 rounded-3xl border border-white/20 shadow-xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#2E5B50]/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-white/30 shadow-2xl shrink-0 transform-gpu hover:scale-105 transition duration-300">
            <img 
              src={financialWallet3d} 
              alt="3D Wallet & Ledger" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-[#FDFCF8] tracking-tight">
                वित्तीय लेज़र एवं रोकड़ समाधान पंजी (Financial Ledger & Audit)
              </h2>
              <span className="bg-[#2E5B50]/80 backdrop-blur-md text-[#E2ECE9] text-[10px] px-2.5 py-0.5 rounded-full font-mono border border-[#3B6E62]">
                Real-time Audit Log
              </span>
            </div>
            <p className="text-xs text-[#C2BEB5] mt-1 max-w-xl">
              Date-wise collections, payment mode breakdown (Cash vs UPI), class-wise summary, and daily closing sheets.
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex flex-wrap items-center gap-2 relative z-10">
          <button
            onClick={() => setIsSettlementOpen(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-xl text-xs font-bold shadow-lg transition border border-[#6E6E4F]"
            title="Generate Cashier Day-End Settlement Sheet"
          >
            <FileCheck className="w-4 h-4" />
            <span>दैनिक रोकड़ पर्ची (Day Closing)</span>
          </button>

          {onOpenLogTransaction && (
            <button
              onClick={onOpenLogTransaction}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#2E5B50] hover:bg-[#254A41] text-white rounded-xl text-xs font-bold shadow-xl transition border border-[#3B6E62]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Log Payment</span>
            </button>
          )}
        </div>
      </div>

      {/* View Switcher: Transactions vs Dues Ledger */}
      <div className="flex items-center justify-between border-b border-[#E6E2D3] pb-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveLedgerView('transactions')}
            className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
              activeLedgerView === 'transactions'
                ? 'bg-[#2E5B50] text-white shadow-md'
                : 'bg-white text-[#787267] hover:bg-[#F7F5EE] border border-[#DDD8C5]'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>लेन-देन इतिहास (Transactions - {filteredTransactions.length})</span>
          </button>

          <button
            onClick={() => setActiveLedgerView('dues')}
            className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
              activeLedgerView === 'dues'
                ? 'bg-rose-700 text-white shadow-md'
                : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            <span>बकाया शुल्क पंजी (Dues Ledger - {duesStudents.length})</span>
          </button>
        </div>

        <div className="hidden sm:block text-[11px] text-[#787267]">
          {activeLedgerView === 'transactions' ? 'All recorded collection slips' : 'Pending & Partial unpaid students list'}
        </div>
      </div>

      {/* Financial Analytics Summary Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Collected */}
        <div className="bg-[#FDFCF8]/90 backdrop-blur-md p-4 rounded-2xl border border-[#E6E2D3] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#787267] text-xs font-bold">
            <span>कुल वसूली (Total Revenue)</span>
            <div className="p-1.5 bg-[#2E5B50]/10 text-[#2E5B50] rounded-xl">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black tracking-tight text-[#2E5B50]">
            ₹{summary.totalCollected.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#787267] font-medium">
            Across {summary.count} fee payment receipts
          </p>
        </div>

        {/* Payment Modes: Cash vs UPI */}
        <div className="bg-[#FDFCF8]/90 backdrop-blur-md p-4 rounded-2xl border border-[#E6E2D3] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#787267] text-xs font-bold">
            <span>भुगतान माध्यम (Cash vs UPI)</span>
            <div className="p-1.5 bg-[#8C5A2B]/10 text-[#8C5A2B] rounded-xl">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 font-bold text-xs">
            <span className="text-[#8C5E28]">Cash: ₹{summary.cashAmount.toLocaleString('en-IN')} ({summary.cashCount})</span>
            <span className="text-[#2E5B50]">UPI: ₹{summary.upiAmount.toLocaleString('en-IN')} ({summary.upiCount})</span>
          </div>
          <p className="text-[10px] text-[#787267] pt-1">
            Net Banking/Card: ₹{summary.netBankingAmount.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Fee Heads Breakdown */}
        <div className="bg-[#2E5B50] text-[#E2ECE9] p-4 rounded-2xl border border-[#254A41] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#E2ECE9] text-xs font-bold">
            <span>मद-वार वर्गीकरण (Fee Heads)</span>
            <div className="p-1.5 bg-white/10 text-[#A8D3C5] rounded-xl">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5 pt-1 text-xs font-bold">
            <div className="flex justify-between">
              <span className="text-white/80">Base Fee:</span>
              <span className="font-mono text-white">₹{summary.totalBaseFee.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A8D3C5]">Online Chg (+₹30):</span>
              <span className="font-mono text-[#A8D3C5]">₹{summary.totalOnlineCharges.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Pending Dues Card */}
        <div className="bg-[#FFF5F5] p-4 rounded-2xl border border-rose-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-rose-800 text-xs font-bold">
            <span>कुल बकाया राशि (Total Outstanding)</span>
            <div className="p-1.5 bg-rose-100 text-rose-700 rounded-xl">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-700 font-mono">
            ₹{summary.totalOutstandingDue.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-rose-600 font-medium">
            Pending across {duesStudents.length} students
          </p>
        </div>

      </div>

      {/* Class / Stream Revenue Breakdown Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#E6E2D3] shadow-xs text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="font-bold text-[#4A453E] flex items-center gap-1.5 shrink-0">
          <Building2 className="w-4 h-4 text-[#5A5A40]" />
          <span>कक्षा / संकाय-वार संग्रह (Class-wise Collection):</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-lg font-bold">
            10th Matric: ₹{summary.matricAmount.toLocaleString('en-IN')} ({summary.matricCount})
          </span>
          <span className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg font-bold">
            12th Science: ₹{summary.scienceAmount.toLocaleString('en-IN')} ({summary.scienceCount})
          </span>
          <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg font-bold">
            12th Arts: ₹{summary.artsAmount.toLocaleString('en-IN')} ({summary.artsCount})
          </span>
          <span className="px-2.5 py-1 bg-purple-50 border border-purple-200 text-purple-800 rounded-lg font-bold">
            12th Commerce: ₹{summary.commerceAmount.toLocaleString('en-IN')} ({summary.commerceCount})
          </span>
        </div>
      </div>

      {/* VIEW 1: TRANSACTIONS HISTORY LEDGER */}
      {activeLedgerView === 'transactions' && (
        <div className="space-y-4">
          {/* Filters Bar with Date-Range Chips */}
          <div className="bg-[#FDFCF8]/90 backdrop-blur-md p-4 rounded-2xl border border-[#E6E2D3] shadow-xs space-y-3">
            
            {/* Top Row: Date Presets & Export Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6E2D3] pb-3">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="font-bold text-[#4A453E] mr-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#5A5A40]" />
                  <span>तारीख (Date):</span>
                </span>
                
                <button
                  type="button"
                  onClick={() => handleDatePresetChange('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition text-[11px] ${
                    datePreset === 'all'
                      ? 'bg-[#5A5A40] text-white shadow-xs'
                      : 'bg-white text-[#787267] hover:bg-[#F7F5EE] border border-[#DDD8C5]'
                  }`}
                >
                  सब (All Time)
                </button>

                <button
                  type="button"
                  onClick={() => handleDatePresetChange('today')}
                  className={`px-3 py-1 rounded-lg font-bold transition text-[11px] ${
                    datePreset === 'today'
                      ? 'bg-[#2E5B50] text-white shadow-xs'
                      : 'bg-white text-[#787267] hover:bg-[#F7F5EE] border border-[#DDD8C5]'
                  }`}
                >
                  आज (Today)
                </button>

                <button
                  type="button"
                  onClick={() => handleDatePresetChange('yesterday')}
                  className={`px-3 py-1 rounded-lg font-bold transition text-[11px] ${
                    datePreset === 'yesterday'
                      ? 'bg-[#2E5B50] text-white shadow-xs'
                      : 'bg-white text-[#787267] hover:bg-[#F7F5EE] border border-[#DDD8C5]'
                  }`}
                >
                  कल (Yesterday)
                </button>

                <button
                  type="button"
                  onClick={() => handleDatePresetChange('week')}
                  className={`px-3 py-1 rounded-lg font-bold transition text-[11px] ${
                    datePreset === 'week'
                      ? 'bg-[#2E5B50] text-white shadow-xs'
                      : 'bg-white text-[#787267] hover:bg-[#F7F5EE] border border-[#DDD8C5]'
                  }`}
                >
                  इस सप्ताह (Week)
                </button>

                <button
                  type="button"
                  onClick={() => handleDatePresetChange('month')}
                  className={`px-3 py-1 rounded-lg font-bold transition text-[11px] ${
                    datePreset === 'month'
                      ? 'bg-[#2E5B50] text-white shadow-xs'
                      : 'bg-white text-[#787267] hover:bg-[#F7F5EE] border border-[#DDD8C5]'
                  }`}
                >
                  इस माह (Month)
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2E5B50] hover:bg-[#254A41] text-white font-bold rounded-xl shadow-xs transition text-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>PDF रिपोर्ट</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5A5A40] hover:bg-[#484833] text-white font-bold rounded-xl shadow-xs transition text-xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel / CSV</span>
                </button>

                {transactions.length > 0 && onClearAllTransactions && (
                  <button
                    onClick={() => setShowClearAllTxnsConfirm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F9E8E8] hover:bg-[#F2D6D6] text-[#8C2B2B] font-bold rounded-xl border border-[#E8B8B8] shadow-xs transition text-xs"
                    title="Clear all transaction history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Row: Search, Date Pickers, Mode & Stream */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#787267]" />
                <input
                  type="text"
                  placeholder="Search by student, receipt no, UTR, remarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-xl text-xs text-[#4A453E] placeholder-[#787267] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
                />
              </div>

              {/* Mode Filter */}
              <div>
                <select
                  value={modeFilter}
                  onChange={(e) => setModeFilter(e.target.value)}
                  className="w-full bg-[#FDFCF8] border border-[#DDD8C5] rounded-xl px-3 py-2 text-[#4A453E] font-medium focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
                >
                  <option value="ALL">All Payment Modes</option>
                  <option value="UPI">UPI (PhonePe / GPay)</option>
                  <option value="QR_CODE">QR Code Scan</option>
                  <option value="CASH">Counter Cash</option>
                  <option value="NET_BANKING">Net Banking</option>
                  <option value="CARD">Debit/Credit Card</option>
                </select>
              </div>

              {/* Stream Filter */}
              <div>
                <select
                  value={streamFilter}
                  onChange={(e) => setStreamFilter(e.target.value)}
                  className="w-full bg-[#FDFCF8] border border-[#DDD8C5] rounded-xl px-3 py-2 text-[#4A453E] font-medium focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
                >
                  <option value="ALL">All Streams / Classes</option>
                  <option value="Matriculation (10th)">Matriculation (10th)</option>
                  <option value="Intermediate Science (12th)">Science (12th)</option>
                  <option value="Intermediate Arts (12th)">Arts (12th)</option>
                  <option value="Intermediate Commerce (12th)">Commerce (12th)</option>
                </select>
              </div>

              {/* Custom Date Range Inputs */}
              <div className="flex items-center gap-1">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setDatePreset('custom');
                  }}
                  className="w-1/2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg px-2 py-1.5 text-[11px] text-[#4A453E]"
                  title="Start Date"
                />
                <span className="text-[#787267]">-</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setDatePreset('custom');
                  }}
                  className="w-1/2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg px-2 py-1.5 text-[11px] text-[#4A453E]"
                  title="End Date"
                />
              </div>

            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-[#FDFCF8] rounded-2xl border border-[#E6E2D3] shadow-xs overflow-hidden text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F7F5EE] text-[#4A453E] font-semibold border-b border-[#E6E2D3] uppercase tracking-wider text-[11px]">
                    <th className="p-3">Receipt No</th>
                    <th className="p-3">Student & Reg No</th>
                    <th className="p-3">Class / Stream</th>
                    <th className="p-3 text-right">Base Fee</th>
                    <th className="p-3 text-right">Online Chg</th>
                    <th className="p-3 text-right">Total Fee</th>
                    <th className="p-3 text-right">Paid</th>
                    <th className="p-3 text-center">Mode</th>
                    <th className="p-3">Txn Ref / UTR</th>
                    <th className="p-3">Date & Time</th>
                    <th className="p-3">Collector</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E2D3]">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="p-12 text-center text-[#787267]">
                        No transactions recorded matching your search filters.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-[#F7F5EE] transition">
                        
                        {/* Receipt No */}
                        <td className="p-3 font-mono font-bold text-[#5A5A40] whitespace-nowrap">
                          {txn.receiptNo}
                        </td>

                        {/* Student & Reg No */}
                        <td className="p-3">
                          <p className="font-bold text-[#4A453E]">{txn.studentName}</p>
                          <p className="font-mono text-[10px] text-[#787267]">{txn.registrationNo}</p>
                        </td>

                        {/* Class */}
                        <td className="p-3 text-[#4A453E] font-medium max-w-[140px] truncate">
                          {txn.classOrStream}
                        </td>

                        {/* Base Fee */}
                        <td className="p-3 text-right font-mono text-[#4A453E]">
                          ₹{txn.baseFee}
                        </td>

                        {/* Online Charge */}
                        <td className="p-3 text-right font-mono font-bold text-[#5A5A40]">
                          +₹{txn.onlineCharges || 30}
                        </td>

                        {/* Total Fee */}
                        <td className="p-3 text-right font-mono font-bold text-[#4A453E]">
                          ₹{txn.totalAmount}
                        </td>

                        {/* Paid Amount */}
                        <td className="p-3 text-right font-mono font-bold text-[#2E5B50]">
                          ₹{txn.paidAmount}
                        </td>

                        {/* Payment Mode */}
                        <td className="p-3 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                            txn.paymentMode === 'UPI' || txn.paymentMode === 'QR_CODE'
                              ? 'bg-[#E2ECE9] text-[#2E5B50] border border-[#3B6E62]'
                              : txn.paymentMode === 'CASH'
                              ? 'bg-[#F9F3E5] text-[#8C5E28] border border-[#E8D7B8]'
                              : 'bg-[#EFECE1] text-[#5A5A40] border border-[#DDD8C5]'
                          }`}>
                            {txn.paymentMode}
                          </span>
                        </td>

                        {/* Txn Ref */}
                        <td className="p-3 font-mono text-[11px] text-[#787267] truncate max-w-[130px]">
                          {txn.transactionRef || 'N/A'}
                        </td>

                        {/* Date */}
                        <td className="p-3 font-mono text-[#787267] whitespace-nowrap">
                          {txn.paymentDate}
                        </td>

                        {/* Collected By */}
                        <td className="p-3 text-[#4A453E] font-medium">
                          {txn.collectedBy || 'Counter'}
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {onViewStudentReceipt && (
                              <button
                                onClick={() => onViewStudentReceipt(txn.registrationNo)}
                                title="View / Print Receipt"
                                className="p-1.5 text-[#5A5A40] hover:text-[#4A453E] hover:bg-[#EFECE1] rounded-lg transition"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            )}
                            {onDeleteTransaction && (
                              <button
                                onClick={() => setTxnToDelete(txn)}
                                title="Delete Transaction Log"
                                className="p-1.5 text-[#8C2B2B] hover:text-red-700 hover:bg-[#F9EAEA] rounded-lg transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="bg-[#F7F5EE] px-4 py-3 border-t border-[#E6E2D3] flex justify-between items-center text-xs text-[#787267]">
              <div>
                Showing <strong>{filteredTransactions.length}</strong> transactions
              </div>
              <div>
                Total Revenue in Table: <strong className="text-[#2E5B50] font-mono font-bold">₹{summary.totalCollected.toLocaleString('en-IN')}</strong>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW 2: DUES & OUTSTANDING LEDGER */}
      {activeLedgerView === 'dues' && (
        <div className="space-y-4">
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <div>
                <h3 className="font-black text-rose-900 text-sm">
                  बकाया परीक्षा शुल्क पंजी (Outstanding Dues Register)
                </h3>
                <p className="text-rose-700">
                  Total {duesStudents.length} students pending. Total Outstanding: <strong className="font-mono text-rose-900">₹{summary.totalOutstandingDue.toLocaleString('en-IN')}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportDuesCSV}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl shadow-xs transition"
              >
                <Download className="w-4 h-4" />
                <span>Export Dues CSV</span>
              </button>
            </div>
          </div>

          {/* Dues Table */}
          <div className="bg-white rounded-2xl border border-rose-200 shadow-xs overflow-hidden text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-rose-100/50 text-rose-900 font-bold border-b border-rose-200 uppercase tracking-wider text-[11px]">
                    <th className="p-3 text-center w-10">क्र.</th>
                    <th className="p-3">पंजीकरण संख्या (Reg No)</th>
                    <th className="p-3">छात्र एवं पिता का नाम</th>
                    <th className="p-3">कक्षा / संकाय</th>
                    <th className="p-3 text-center">कोटि</th>
                    <th className="p-3 text-right">कुल शुल्क (₹)</th>
                    <th className="p-3 text-right">जमा राशि (₹)</th>
                    <th className="p-3 text-right font-black">बकाया राशि (Due ₹)</th>
                    <th className="p-3 text-center">स्थिति</th>
                    <th className="p-3 text-center">कार्रवाई</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-100">
                  {duesStudents.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-12 text-center text-slate-500">
                        बहुत बढ़िया! कोई भी छात्र बकाया शुल्क की सूची में नहीं है (All clear).
                      </td>
                    </tr>
                  ) : (
                    duesStudents.map((s, idx) => {
                      const fee = s.totalFee || (s.baseFee + (s.onlineCharges || 30));
                      const due = Math.max(0, fee - s.paidAmount);
                      return (
                        <tr key={s.id} className="hover:bg-rose-50/50 transition">
                          <td className="p-3 text-center font-mono text-slate-400">{idx + 1}</td>
                          <td className="p-3 font-mono font-bold text-slate-800">{s.registrationNo}</td>
                          <td className="p-3">
                            <p className="font-bold text-slate-900">{s.studentName}</p>
                            <p className="text-[10px] text-slate-500">{s.fatherName}</p>
                          </td>
                          <td className="p-3 text-slate-700">{s.classOrStream}</td>
                          <td className="p-3 text-center font-medium">{s.casteCategory}</td>
                          <td className="p-3 text-right font-mono">₹{fee}</td>
                          <td className="p-3 text-right font-mono text-emerald-700 font-bold">₹{s.paidAmount}</td>
                          <td className="p-3 text-right font-mono text-rose-700 font-black text-sm">₹{due}</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              {s.paymentStatus}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {onOpenRecordPayment && (
                              <button
                                onClick={() => onOpenRecordPayment(s)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition shadow-xs"
                              >
                                शुल्क जमा करें
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Daily Settlement Modal */}
      <DailySettlementModal
        isOpen={isSettlementOpen}
        transactions={transactions}
        settings={settings || {
          name: 'M.S. College, Motihari',
          subTitle: 'Constituent Unit of B.R.A. Bihar University, Muzaffarpur',
          address: 'Motihari, East Champaran, Bihar - 845401',
          code: '0108',
          academicYear: '2024-2026',
          defaultOnlineCharge: 30,
          upiId: 'college@upi',
        }}
        selectedDate={startDate || undefined}
        onClose={() => setIsSettlementOpen(false)}
      />

      {/* Confirmation Modals with Mistake Protection */}
      {/* 1. Single Transaction Delete */}
      <ConfirmModal
        isOpen={!!txnToDelete}
        title="Delete Transaction Receipt Log"
        message={`Are you sure you want to delete transaction receipt ${txnToDelete?.receiptNo} for ${txnToDelete?.studentName}? This will permanently remove it from financial records.`}
        confirmText="Delete Transaction"
        confirmVariant="danger"
        requireSafetyCheckbox={true}
        onConfirm={() => {
          if (txnToDelete && onDeleteTransaction) {
            onDeleteTransaction(txnToDelete.id);
            setTxnToDelete(null);
          }
        }}
        onClose={() => setTxnToDelete(null)}
      />

      {/* 2. Clear All Transactions */}
      <ConfirmModal
        isOpen={showClearAllTxnsConfirm}
        title="Wipe All Transaction History Logs"
        message="Are you sure you want to clear all transaction logs? All recorded payments and financial audit receipts will be deleted."
        confirmText="Clear All Logs"
        confirmVariant="danger"
        requireSafetyCode="WIPE ALL"
        requireSafetyCheckbox={true}
        onConfirm={() => {
          if (onClearAllTransactions) {
            onClearAllTransactions();
          }
          setShowClearAllTxnsConfirm(false);
        }}
        onClose={() => setShowClearAllTxnsConfirm(false)}
      />

    </div>
  );
};
