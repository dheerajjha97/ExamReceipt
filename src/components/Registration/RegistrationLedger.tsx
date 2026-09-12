import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  TrendingUp,
  FileSpreadsheet,
  Printer,
  Trash2,
  Clock,
  AlertCircle,
  Users,
  Building2,
  FileCheck,
  Send,
  Eye,
  RefreshCw,
  ChevronDown,
  FileText,
  Check
} from 'lucide-react';
import { RegistrationStudent, InstituteSettings, CasteCategory, isBSEBBoard } from '../../types';
import { printIsolatedElement, fallbackDirectPrint } from '../../utils/printHelper';
import { numberToWordsInINR } from '../../services/storageService';
import { downloadRegistrationLedgerPDF } from '../../utils/pdfGenerator';
import { 
  normalizeDateToYYYYMMDD, 
  getTodayLocalYYYYMMDD, 
  getYesterdayLocalYYYYMMDD, 
  getDaysAgoLocalYYYYMMDD, 
  getMonthStartLocalYYYYMMDD, 
  isDateInRange, 
  formatDateToDDMMYYYY 
} from '../../utils/dateHelper';

interface RegistrationLedgerProps {
  students: RegistrationStudent[];
  settings: InstituteSettings;
  onOpenReceipt: (student: RegistrationStudent) => void;
  onOpenRecordPayment: (student: RegistrationStudent) => void;
  onUpdateStudents: (students: RegistrationStudent[]) => void;
}

export const RegistrationLedger: React.FC<RegistrationLedgerProps> = ({
  students,
  settings,
  onOpenReceipt,
  onOpenRecordPayment,
  onUpdateStudents,
}) => {
  // View Switcher: Paid Transactions Log vs Outstanding Dues Ledger
  const [activeTab, setActiveTab] = useState<'transactions' | 'dues'>('transactions');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState<string>('ALL');
  const [streamFilter, setStreamFilter] = useState<string>('ALL');
  const [boardRateFilter, setBoardRateFilter] = useState<string>('ALL'); // BSEB 515 vs OTHER 715
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Date Filter Presets
  const [datePreset, setDatePreset] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Selected students for bulk operations
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Menu Dropdown states
  const [isPrintMenuOpen, setIsPrintMenuOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const printMenuRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (printMenuRef.current && !printMenuRef.current.contains(event.target as Node)) {
        setIsPrintMenuOpen(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quick Date Preset Change Handler
  const handleDatePresetChange = (preset: 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom') => {
    setDatePreset(preset);
    const todayStr = getTodayLocalYYYYMMDD();

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'yesterday') {
      const yStr = getYesterdayLocalYYYYMMDD();
      setStartDate(yStr);
      setEndDate(yStr);
    } else if (preset === 'week') {
      const wStr = getDaysAgoLocalYYYYMMDD(7);
      setStartDate(wStr);
      setEndDate(todayStr);
    } else if (preset === 'month') {
      const mStr = getMonthStartLocalYYYYMMDD();
      setStartDate(mStr);
      setEndDate(todayStr);
    }
  };

  // 1. Paid Students (Transactions)
  const paidStudents = useMemo(() => {
    return students.filter(s => s.paymentStatus === 'PAID');
  }, [students]);

  // 2. Unpaid / Dues Students
  const unpaidStudents = useMemo(() => {
    return students.filter(s => s.paymentStatus !== 'PAID');
  }, [students]);

  // Filtered Transactions
  const filteredPaidStudents = useMemo(() => {
    return paidStudents.filter((stu) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mName = stu.studentName.toLowerCase().includes(q);
        const mFather = (stu.fatherName || '').toLowerCase().includes(q);
        const mForm = (stu.formNo || '').toLowerCase().includes(q);
        const mOfss = (stu.ofssReferenceNo || '').toLowerCase().includes(q);
        const mUtr = (stu.utrNumber || '').toLowerCase().includes(q);
        const mMobile = (stu.mobile || '').includes(q);
        if (!mName && !mFather && !mForm && !mOfss && !mUtr && !mMobile) return false;
      }

      // Stream
      if (streamFilter !== 'ALL' && stu.stream !== streamFilter) return false;

      // Category
      if (categoryFilter !== 'ALL' && stu.casteCategory !== categoryFilter) return false;

      // Mode Filter
      if (modeFilter !== 'ALL' && (stu.paymentMode || 'CASH') !== modeFilter) return false;

      // Board Rate
      if (boardRateFilter === 'BSEB_515') {
        const isBseb = isBSEBBoard(stu.boardName || stu.matricBoard) || stu.registrationFee === 515;
        if (!isBseb) return false;
      } else if (boardRateFilter === 'OTHER_715') {
        const isOther = !isBSEBBoard(stu.boardName || stu.matricBoard) || stu.registrationFee === 715;
        if (!isOther) return false;
      }

      // Date Range Match using normalized ISO dates
      if (startDate || endDate) {
        const rawDate = stu.paymentDate || stu.updatedAt || stu.createdAt;
        if (!isDateInRange(rawDate, startDate, endDate)) {
          return false;
        }
      }

      return true;
    });
  }, [paidStudents, searchQuery, streamFilter, categoryFilter, modeFilter, boardRateFilter, startDate, endDate]);

  // Filtered Dues Students
  const filteredDuesStudents = useMemo(() => {
    return unpaidStudents.filter((stu) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mName = stu.studentName.toLowerCase().includes(q);
        const mFather = (stu.fatherName || '').toLowerCase().includes(q);
        const mForm = (stu.formNo || '').toLowerCase().includes(q);
        const mOfss = (stu.ofssReferenceNo || '').toLowerCase().includes(q);
        if (!mName && !mFather && !mForm && !mOfss) return false;
      }
      if (streamFilter !== 'ALL' && stu.stream !== streamFilter) return false;
      if (categoryFilter !== 'ALL' && stu.casteCategory !== categoryFilter) return false;
      return true;
    });
  }, [unpaidStudents, searchQuery, streamFilter, categoryFilter]);

  // Metrics Calculations
  const totalPaidCount = paidStudents.length;
  const totalUnpaidCount = unpaidStudents.length;

  const totalCollectedAmount = paidStudents.reduce((acc, s) => {
    const fee = s.paidAmount > 0 ? s.paidAmount : (s.registrationFee || (isBSEBBoard(s.boardName || s.matricBoard) ? 515 : 715));
    return acc + fee;
  }, 0);

  const totalOutstandingAmount = unpaidStudents.reduce((acc, s) => {
    const fee = s.registrationFee || (isBSEBBoard(s.boardName || s.matricBoard) ? 515 : 715);
    return acc + fee;
  }, 0);

  const cashCollected = paidStudents
    .filter(s => (s.paymentMode || 'CASH') === 'CASH')
    .reduce((acc, s) => acc + (s.paidAmount || (isBSEBBoard(s.boardName || s.matricBoard) ? 515 : 715)), 0);

  const upiCollected = paidStudents
    .filter(s => s.paymentMode === 'UPI' || s.paymentMode === 'QR_CODE')
    .reduce((acc, s) => acc + (s.paidAmount || (isBSEBBoard(s.boardName || s.matricBoard) ? 515 : 715)), 0);

  const bankCollected = paidStudents
    .filter(s => s.paymentMode === 'BANK_TRANSFER' || s.paymentMode === 'CHALLAN' || s.paymentMode === 'NEFT_RTGS')
    .reduce((acc, s) => acc + (s.paidAmount || (isBSEBBoard(s.boardName || s.matricBoard) ? 515 : 715)), 0);

  // Export to CSV (support mode: 'all' | 'filtered' | 'today')
  const handleExportCSV = (scope: 'filtered' | 'all' | 'today' = 'filtered') => {
    let dataToExport: RegistrationStudent[] = [];
    let scopeLabel = 'CurrentView';

    if (scope === 'all') {
      dataToExport = activeTab === 'transactions' ? paidStudents : unpaidStudents;
      scopeLabel = 'All';
    } else if (scope === 'today') {
      const todayStr = getTodayLocalYYYYMMDD();
      dataToExport = (activeTab === 'transactions' ? paidStudents : unpaidStudents).filter(s => {
        const rawDate = s.paymentDate || s.updatedAt || s.createdAt;
        return normalizeDateToYYYYMMDD(rawDate) === todayStr;
      });
      scopeLabel = 'Today';
    } else {
      dataToExport = activeTab === 'transactions' ? filteredPaidStudents : filteredDuesStudents;
      scopeLabel = 'FilteredView';
    }

    if (dataToExport.length === 0) {
      alert('निर्यात करने के लिए कोई रिकॉर्ड उपलब्ध नहीं है।');
      return;
    }

    let headers = '';
    let rows = '';

    if (activeTab === 'transactions') {
      headers = 'Sl No,Form No,OFSS Ref No,Student Name,Father Name,Stream,Category,Matric Board,Fee Amount (INR),Payment Mode,Payment Date,UTR/Ref No,Cashier/Operator\n';
      rows = dataToExport.map((s, idx) => {
        const fee = s.paidAmount || (isBSEBBoard(s.boardName || s.matricBoard) ? 515 : 715);
        return `${idx + 1},"${s.formNo || ''}","${s.ofssReferenceNo || ''}","${s.studentName}","${s.fatherName || ''}","${s.stream}","${s.casteCategory}","${s.boardName || s.matricBoard || 'BSEB'}",${fee},"${s.paymentMode || 'CASH'}","${s.paymentDate || ''}","${s.utrNumber || ''}","${s.cashierName || 'Counter 1'}"`;
      }).join('\n');
    } else {
      headers = 'Sl No,Form No,OFSS Ref No,Student Name,Father Name,Stream,Category,Matric Board,Payable Fee (INR),Payment Status,Mobile\n';
      rows = dataToExport.map((s, idx) => {
        const fee = s.registrationFee || (isBSEBBoard(s.boardName || s.matricBoard) ? 515 : 715);
        return `${idx + 1},"${s.formNo || ''}","${s.ofssReferenceNo || ''}","${s.studentName}","${s.fatherName || ''}","${s.stream}","${s.casteCategory}","${s.boardName || s.matricBoard || 'BSEB'}",${fee},"UNPAID","${s.mobile || ''}"`;
      }).join('\n');
    }

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `11th_Registration_Ledger_${activeTab}_${scopeLabel}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportMenuOpen(false);
  };

  // Export to PDF Document
  const handleExportPDF = (scope: 'filtered' | 'all' | 'today' = 'filtered') => {
    let dataToExport: RegistrationStudent[] = [];
    let filterDesc = 'Current Filtered View';

    if (scope === 'all') {
      dataToExport = activeTab === 'transactions' ? paidStudents : unpaidStudents;
      filterDesc = 'Complete Database (All Records)';
    } else if (scope === 'today') {
      const todayStr = getTodayLocalYYYYMMDD();
      dataToExport = (activeTab === 'transactions' ? paidStudents : unpaidStudents).filter(s => {
        const rawDate = s.paymentDate || s.updatedAt || s.createdAt;
        return normalizeDateToYYYYMMDD(rawDate) === todayStr;
      });
      filterDesc = `Today's Transactions (${formatDateToDDMMYYYY(todayStr)})`;
    } else {
      dataToExport = activeTab === 'transactions' ? filteredPaidStudents : filteredDuesStudents;
      const parts = [];
      if (streamFilter !== 'ALL') parts.push(`Stream: ${streamFilter}`);
      if (categoryFilter !== 'ALL') parts.push(`Cat: ${categoryFilter}`);
      if (startDate || endDate) parts.push(`Date: ${formatDateToDDMMYYYY(startDate) || 'Start'} to ${formatDateToDDMMYYYY(endDate) || 'End'}`);
      if (modeFilter !== 'ALL') parts.push(`Mode: ${modeFilter}`);
      filterDesc = parts.length > 0 ? parts.join(' | ') : 'Filtered View';
    }

    if (dataToExport.length === 0) {
      alert('PDF तैयार करने के लिए कोई रिकॉर्ड उपलब्ध नहीं है।');
      return;
    }

    downloadRegistrationLedgerPDF(dataToExport, settings, activeTab, filterDesc);
    setIsExportMenuOpen(false);
  };

  // Print 11th Ledger (A4 Landscape / Isolated Print)
  const handlePrintLedger = (scope: 'filtered' | 'all' | 'today' = 'filtered') => {
    let list: RegistrationStudent[] = [];
    let titleScope = '';

    if (scope === 'all') {
      list = activeTab === 'transactions' ? paidStudents : unpaidStudents;
      titleScope = '(सभी रिकॉर्ड्स / All Records)';
    } else if (scope === 'today') {
      const todayStr = getTodayLocalYYYYMMDD();
      list = (activeTab === 'transactions' ? paidStudents : unpaidStudents).filter(s => {
        const rawDate = s.paymentDate || s.updatedAt || s.createdAt;
        return normalizeDateToYYYYMMDD(rawDate) === todayStr;
      });
      titleScope = `(आज का विवरण / ${formatDateToDDMMYYYY(todayStr)})`;
    } else {
      list = activeTab === 'transactions' ? filteredPaidStudents : filteredDuesStudents;
      titleScope = '(फ़िल्टर किया हुआ दृश्य / Filtered View)';
    }

    if (list.length === 0) {
      alert('प्रिंट करने के लिए कोई रिकॉर्ड उपलब्ध नहीं है।');
      return;
    }

    const totalAmount = list.reduce((acc, s) => {
      const fee = activeTab === 'transactions' 
        ? (s.paidAmount || (isBSEBBoard(s.boardName || s.matricBoard) ? 515 : 715))
        : (s.registrationFee || (isBSEBBoard(s.boardName || s.matricBoard) ? 515 : 715));
      return acc + fee;
    }, 0);

    const ledgerHtml = `
      <div style="font-family: sans-serif; color: #1e293b; padding: 10px;">
        <div style="text-align: center; border-bottom: 2px solid #0f766e; padding-bottom: 8px; margin-bottom: 12px;">
          <h2 style="margin: 0; font-size: 18px; color: #0f766e; text-transform: uppercase;">${settings.name}</h2>
          <p style="margin: 2px 0 0; font-size: 11px; color: #475569;">${settings.subTitle || 'इंटरमीडिएट संभाग (कला, विज्ञान, वाणिज्य)'}</p>
          <p style="margin: 2px 0 0; font-size: 11px; color: #475569;">संस्थान कोड: <strong>${settings.code}</strong> | सत्र: <strong>2026-2028 (11वीं सूचीकरण / पंजीयन)</strong></p>
          <h3 style="margin: 8px 0 0; font-size: 14px; color: #0f172a; text-transform: uppercase;">
            ${activeTab === 'transactions' ? '11वीं सूचीकरण शुल्क प्राप्ति लेज़र पंजी (Receipt Ledger)' : '11वीं सूचीकरण बकाया शुल्क लेज़र सूची (Outstanding Dues)'} ${titleScope}
          </h3>
        </div>

        <table style="width: 100%; margin-bottom: 12px; font-size: 11px; border-collapse: collapse;">
          <tr>
            <td>कुल छात्र: <strong>${list.length}</strong></td>
            <td>कुल राशि: <strong>₹${totalAmount.toLocaleString('en-IN')}</strong></td>
            <td>मुद्रण तिथि: <strong>${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</strong></td>
          </tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #1e293b;">
          <thead>
            <tr style="background: #f1f5f9;">
              <th style="border: 1px solid #1e293b; padding: 4px; text-align: center; width: 25px;">क्र.</th>
              <th style="border: 1px solid #1e293b; padding: 4px; text-align: left;">फॉर्म नं / OFSS</th>
              <th style="border: 1px solid #1e293b; padding: 4px; text-align: left;">छात्र का नाम (Student)</th>
              <th style="border: 1px solid #1e293b; padding: 4px; text-align: left;">पिता का नाम (Father)</th>
              <th style="border: 1px solid #1e293b; padding: 4px; text-align: center;">संकाय</th>
              <th style="border: 1px solid #1e293b; padding: 4px; text-align: center;">कोटि</th>
              <th style="border: 1px solid #1e293b; padding: 4px; text-align: center;">बोर्ड दर</th>
              <th style="border: 1px solid #1e293b; padding: 4px; text-align: right;">राशि (₹)</th>
              <th style="border: 1px solid #1e293b; padding: 4px; text-align: center;">माध्यम / UTR</th>
              <th style="border: 1px solid #1e293b; padding: 4px; text-align: center;">दिनांक</th>
            </tr>
          </thead>
          <tbody>
            ${list.map((s, idx) => {
              const fee = activeTab === 'transactions' 
                ? (s.paidAmount || (isBSEBBoard(s.boardName || s.matricBoard) ? 515 : 715))
                : (s.registrationFee || (isBSEBBoard(s.boardName || s.matricBoard) ? 515 : 715));
              const isBseb = isBSEBBoard(s.boardName || s.matricBoard) || fee === 515;
              return `
                <tr>
                  <td style="border: 1px solid #1e293b; padding: 4px; text-align: center;">${idx + 1}</td>
                  <td style="border: 1px solid #1e293b; padding: 4px; font-family: monospace;">${s.formNo || s.ofssReferenceNo || '—'}</td>
                  <td style="border: 1px solid #1e293b; padding: 4px; font-weight: bold;">${s.studentName}</td>
                  <td style="border: 1px solid #1e293b; padding: 4px;">${s.fatherName || '—'}</td>
                  <td style="border: 1px solid #1e293b; padding: 4px; text-align: center;">${s.stream}</td>
                  <td style="border: 1px solid #1e293b; padding: 4px; text-align: center;">${s.casteCategory}</td>
                  <td style="border: 1px solid #1e293b; padding: 4px; text-align: center;">${isBseb ? 'BSEB (₹515)' : 'Other (₹715)'}</td>
                  <td style="border: 1px solid #1e293b; padding: 4px; text-align: right; font-weight: bold;">₹${fee}</td>
                  <td style="border: 1px solid #1e293b; padding: 4px; text-align: center;">${s.paymentMode || 'CASH'}${s.utrNumber ? `<br/><small>${s.utrNumber}</small>` : ''}</td>
                  <td style="border: 1px solid #1e293b; padding: 4px; text-align: center;">${s.paymentDate || '—'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
          <tfoot>
            <tr style="background: #f8fafc; font-weight: bold;">
              <td colspan="7" style="border: 1px solid #1e293b; padding: 6px; text-align: right;">कुल योग (Grand Total):</td>
              <td style="border: 1px solid #1e293b; padding: 6px; text-align: right; font-size: 11px;">₹${totalAmount.toLocaleString('en-IN')}</td>
              <td colspan="2" style="border: 1px solid #1e293b; padding: 6px;"></td>
            </tr>
          </tfoot>
        </table>

        <div style="display: flex; justify-content: space-between; margin-top: 35px; font-size: 11px;">
          <div style="text-align: center;">
            <div style="width: 140px; border-bottom: 1px solid #1e293b; margin-bottom: 3px;"></div>
            <strong>काउंटर कैशियर हस्ताक्षर</strong>
          </div>
          <div style="text-align: center;">
            <div style="width: 160px; border-bottom: 1px solid #1e293b; margin-bottom: 3px;"></div>
            <strong>लेखापाल / प्राचार्य मुहर</strong>
          </div>
        </div>
      </div>
    `;

    printIsolatedElement(ledgerHtml, {
      documentTitle: `11th_Registration_Ledger_${activeTab}_${scope}`,
      landscape: true,
      pageMargin: '6mm 6mm 6mm 6mm'
    });
    setIsPrintMenuOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Collected */}
        <div className="bg-gradient-to-br from-emerald-800 to-teal-950 text-white p-5 rounded-3xl shadow-md border border-emerald-700/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-200 font-bold uppercase tracking-wider">कुल प्राप्त सूचीकरण शुल्क</span>
            <div className="p-2 bg-emerald-500/20 rounded-xl">
              <IndianRupee className="w-5 h-5 text-emerald-300" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black mt-2">
            ₹{totalCollectedAmount.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{totalPaidCount} छात्रों का पूर्ण भुगतान</span>
          </div>
        </div>

        {/* Metric 2: Total Outstanding */}
        <div className="bg-gradient-to-br from-rose-800 to-red-950 text-white p-5 rounded-3xl shadow-md border border-rose-700/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-200 font-bold uppercase tracking-wider">कुल बकाया राशि</span>
            <div className="p-2 bg-rose-500/20 rounded-xl">
              <Clock className="w-5 h-5 text-rose-300" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black mt-2">
            ₹{totalOutstandingAmount.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-rose-200">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{totalUnpaidCount} छात्रों का शुल्क लंबित</span>
          </div>
        </div>

        {/* Metric 3: Cash vs UPI Breakdown */}
        <div className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl shadow-sm border border-slate-200/80">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">माध्यमवार संकलन</div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-amber-600" /> नकद (Cash):
              </span>
              <strong className="text-slate-900 font-mono">₹{cashCollected.toLocaleString('en-IN')}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-blue-600" /> UPI / QR:
              </span>
              <strong className="text-slate-900 font-mono">₹{upiCollected.toLocaleString('en-IN')}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-purple-600" /> बैंक ट्रांसफर:
              </span>
              <strong className="text-slate-900 font-mono">₹{bankCollected.toLocaleString('en-IN')}</strong>
            </div>
          </div>
        </div>

        {/* Metric 4: Board Rate Split (₹515 vs ₹715) */}
        <div className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl shadow-sm border border-slate-200/80">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">बोर्ड दर वर्गीकरण</div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-1.5 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-emerald-900 font-bold">BSEB दर (₹515):</span>
              <strong className="text-emerald-800">
                {paidStudents.filter(s => isBSEBBoard(s.boardName || s.matricBoard) || s.registrationFee === 515).length} छात्र
              </strong>
            </div>
            <div className="flex items-center justify-between p-1.5 bg-amber-50 rounded-xl border border-amber-100">
              <span className="text-amber-900 font-bold">अन्य बोर्ड (₹715):</span>
              <strong className="text-amber-800">
                {paidStudents.filter(s => !isBSEBBoard(s.boardName || s.matricBoard) || s.registrationFee === 715).length} छात्र
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Ledger Controls & Tabs */}
      <div className="bg-white/80 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        {/* Top bar: Tab Switcher & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Sub Tab Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 w-fit">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'transactions'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>शुल्क प्राप्ति लेज़र ({filteredPaidStudents.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('dues')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'dues'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>बकाया शुल्क सूची ({filteredDuesStudents.length})</span>
            </button>
          </div>

          {/* Export & Print Dropdown Action Menus */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* 1. Print Dropdown Menu */}
            <div className="relative" ref={printMenuRef}>
              <button
                onClick={() => {
                  setIsPrintMenuOpen(!isPrintMenuOpen);
                  setIsExportMenuOpen(false);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-2 transition shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-400" />
                <span>लेज़र प्रिंट (Print A4)</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isPrintMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isPrintMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    प्रिंट विकल्प (Print Menu)
                  </div>

                  <button
                    onClick={() => handlePrintLedger('filtered')}
                    className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Filter className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-bold">वर्तमान फ़िल्टर दृश्य प्रिंट करें</div>
                      <div className="text-[10px] text-slate-500">Active Search / Date Filter ({activeTab === 'transactions' ? filteredPaidStudents.length : filteredDuesStudents.length} छात्र)</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handlePrintLedger('all')}
                    className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2.5 transition cursor-pointer border-t border-slate-50"
                  >
                    <Printer className="w-4 h-4 text-indigo-600" />
                    <div>
                      <div className="font-bold">सभी रिकॉर्ड्स प्रिंट करें (Print All)</div>
                      <div className="text-[10px] text-slate-500">संपूर्ण डेटाबेस ({activeTab === 'transactions' ? paidStudents.length : unpaidStudents.length} छात्र)</div>
                    </div>
                  </button>

                  {activeTab === 'transactions' && (
                    <button
                      onClick={() => handlePrintLedger('today')}
                      className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2.5 transition cursor-pointer border-t border-slate-50"
                    >
                      <Calendar className="w-4 h-4 text-amber-600" />
                      <div>
                        <div className="font-bold">आज का लेज़र प्रिंट करें (Today Only)</div>
                        <div className="text-[10px] text-slate-500">आज दिनांक {new Date().toLocaleDateString('en-IN')} का संकलन</div>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 2. Export Dropdown Menu */}
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => {
                  setIsExportMenuOpen(!isExportMenuOpen);
                  setIsPrintMenuOpen(false);
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-2 transition shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-200" />
                <span>एक्सपोर्ट मेनू (Export)</span>
                <ChevronDown className={`w-3.5 h-3.5 text-emerald-200 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isExportMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Excel / CSV / PDF डाउनलोड
                  </div>

                  {/* CSV Export Options */}
                  <button
                    onClick={() => handleExportCSV('filtered')}
                    className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-bold">Excel / CSV (वर्तमान फ़िल्टर)</div>
                      <div className="text-[10px] text-slate-500">{activeTab === 'transactions' ? filteredPaidStudents.length : filteredDuesStudents.length} रिकॉर्ड्स</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleExportCSV('all')}
                    className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2.5 transition cursor-pointer border-t border-slate-50"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-teal-600" />
                    <div>
                      <div className="font-bold">Excel / CSV (सभी {activeTab === 'transactions' ? paidStudents.length : unpaidStudents.length} रिकॉर्ड्स)</div>
                      <div className="text-[10px] text-slate-500">संपूर्ण 11वीं सूचीकरण डेटा</div>
                    </div>
                  </button>

                  {/* PDF Export Options */}
                  <div className="my-1 border-t border-slate-100"></div>

                  <button
                    onClick={() => handleExportPDF('filtered')}
                    className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-rose-600" />
                    <div>
                      <div className="font-bold">PDF रिपोर्ट डाउनलोड (फ़िल्टर दृश्य)</div>
                      <div className="text-[10px] text-slate-500">A4 लैंडस्केप ऑफिशियल ऑडिट PDF</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleExportPDF('all')}
                    className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2.5 transition cursor-pointer border-t border-slate-50"
                  >
                    <FileText className="w-4 h-4 text-purple-600" />
                    <div>
                      <div className="font-bold">PDF रिपोर्ट डाउनलोड (Complete PDF)</div>
                      <div className="text-[10px] text-slate-500">सभी {activeTab === 'transactions' ? paidStudents.length : unpaidStudents.length} छात्रों का फुल लेज़र</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="नाम, फॉर्म नं, OFSS, UTR खोजें..."
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
            />
          </div>

          {/* Stream Filter */}
          <div>
            <select
              value={streamFilter}
              onChange={(e) => setStreamFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-bold text-slate-700"
            >
              <option value="ALL">सभी संकाय (All Streams)</option>
              <option value="Arts">Arts (कला)</option>
              <option value="Science">Science (विज्ञान)</option>
              <option value="Commerce">Commerce (वाणिज्य)</option>
              <option value="Vocational">Vocational</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-bold text-slate-700"
            >
              <option value="ALL">सभी कोटि (All Categories)</option>
              <option value="General">General</option>
              <option value="BC">BC / OBC</option>
              <option value="EBC">EBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
            </select>
          </div>

          {/* Payment Mode (only for Transactions) */}
          {activeTab === 'transactions' && (
            <div>
              <select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-bold text-slate-700"
              >
                <option value="ALL">सभी भुगतान माध्यम</option>
                <option value="CASH">नकद (Cash)</option>
                <option value="UPI">UPI / QR</option>
                <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
              </select>
            </div>
          )}

          {/* Board Rate Filter */}
          <div>
            <select
              value={boardRateFilter}
              onChange={(e) => setBoardRateFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-bold text-slate-700"
            >
              <option value="ALL">सभी बोर्ड दर (BSEB + Other)</option>
              <option value="BSEB_515">BSEB छात्र (₹515)</option>
              <option value="OTHER_715">अन्य बोर्ड (₹715)</option>
            </select>
          </div>
        </div>

        {/* Date Filter Bar */}
        {activeTab === 'transactions' && (
          <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
            <span className="text-slate-500 font-bold">दिनांक फ़िल्टर:</span>
            <button
              onClick={() => handleDatePresetChange('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                datePreset === 'all' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              सभी (All)
            </button>
            <button
              onClick={() => handleDatePresetChange('today')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                datePreset === 'today' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              आज (Today)
            </button>
            <button
              onClick={() => handleDatePresetChange('yesterday')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                datePreset === 'yesterday' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              कल (Yesterday)
            </button>
            <button
              onClick={() => handleDatePresetChange('week')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                datePreset === 'week' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              इस सप्ताह
            </button>
            <button
              onClick={() => handleDatePresetChange('month')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                datePreset === 'month' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              इस माह
            </button>

            <div className="flex items-center gap-1.5 ml-auto">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDatePreset('custom');
                }}
                className="px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white"
              />
              <span className="text-slate-400">से</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDatePreset('custom');
                }}
                className="px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {activeTab === 'transactions' ? (
          /* Paid Transactions Table */
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-12 text-center whitespace-nowrap">क्र.</th>
                  <th className="py-3 px-4 whitespace-nowrap">फॉर्म नं / OFSS</th>
                  <th className="py-3 px-4 whitespace-nowrap">छात्र का नाम (Student)</th>
                  <th className="py-3 px-4 whitespace-nowrap">पिता का नाम</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">संकाय</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">कोटि</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">बोर्ड</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">प्राप्त राशि</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">माध्यम</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">दिनांक व समय</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">कार्रवाई</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredPaidStudents.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 px-4 text-center">
                      <div className="max-w-md mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800">
                            {startDate || endDate || datePreset !== 'all'
                              ? 'चयनित दिनांक / फ़िल्टर में कोई शुल्क प्राप्ति रिकॉर्ड नहीं मिला'
                              : 'अभी तक कोई शुल्क प्राप्ति रिकॉर्ड दर्ज नहीं है'}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {paidStudents.length > 0
                              ? `डेटाबेस में कुल ${paidStudents.length} भुगतान रिकॉर्ड मौजूद हैं। सभी देखने के लिए दिनांक फ़िल्टर रीसेट करें।`
                              : `कुल ${unpaidStudents.length} छात्रों का शुल्क बकाया है। शुल्क जमा करने के लिए 'बकाया शुल्क सूची' टैब पर जाएं।`}
                          </p>
                        </div>
                        <div className="flex items-center justify-center gap-2 pt-1">
                          {(startDate || endDate || datePreset !== 'all') && (
                            <button
                              type="button"
                              onClick={() => handleDatePresetChange('all')}
                              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs flex items-center gap-1.5"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>सभी तिथियों का लेज़र देखें (Show All)</span>
                            </button>
                          )}
                          {unpaidStudents.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setActiveTab('dues')}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer border border-slate-200"
                            >
                              <span>बकाया सूची देखें ({unpaidStudents.length})</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPaidStudents.map((stu, idx) => {
                    const fee = stu.paidAmount || (isBSEBBoard(stu.boardName || stu.matricBoard) ? 515 : 715);
                    const isBseb = isBSEBBoard(stu.boardName || stu.matricBoard) || fee === 515;
                    return (
                      <tr key={stu.id} className="hover:bg-emerald-50/40 transition">
                        <td className="py-3 px-4 text-center text-slate-400 font-bold">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-slate-900">{stu.formNo || '—'}</div>
                          {stu.ofssReferenceNo && (
                            <div className="text-[10px] text-slate-400 font-mono">OFSS: {stu.ofssReferenceNo}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {stu.studentName}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{stu.fatherName || '—'}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700 text-[10.5px]">
                            {stu.stream}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px]">
                            {stu.casteCategory}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            isBseb ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isBseb ? 'BSEB (₹515)' : 'Other (₹715)'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-bold font-mono text-emerald-800 text-sm">
                            ₹{fee}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg text-[10.5px]">
                            {stu.paymentMode === 'UPI' || stu.paymentMode === 'QR_CODE' ? (
                              <QrCode className="w-3 h-3 text-blue-600" />
                            ) : (
                              <Wallet className="w-3 h-3 text-amber-600" />
                            )}
                            {stu.paymentMode || 'CASH'}
                          </span>
                          {stu.utrNumber && (
                            <div className="text-[9.5px] text-slate-400 font-mono mt-0.5">UTR: {stu.utrNumber}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-500 font-mono text-[11px]">
                          {stu.paymentDate || '—'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onOpenReceipt(stu)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <Receipt className="w-3 h-3" />
                            <span>रसीद</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Outstanding Dues Table */
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-12 text-center whitespace-nowrap">क्र.</th>
                  <th className="py-3 px-4 whitespace-nowrap">फॉर्म नं / OFSS</th>
                  <th className="py-3 px-4 whitespace-nowrap">छात्र का नाम (Student)</th>
                  <th className="py-3 px-4 whitespace-nowrap">पिता का नाम</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">संकाय</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">कोटि</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">बोर्ड</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">देय शुल्क (Payable)</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">दस्तावेज़ स्थिति</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">कार्रवाई</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredDuesStudents.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-emerald-600 font-bold">
                      🎉 सभी पंजीकृत छात्रों का शुल्क जमा हो चुका है!
                    </td>
                  </tr>
                ) : (
                  filteredDuesStudents.map((stu, idx) => {
                    const payableFee = stu.registrationFee || (isBSEBBoard(stu.boardName || stu.matricBoard) ? 515 : 715);
                    const isBseb = isBSEBBoard(stu.boardName || stu.matricBoard) || payableFee === 515;
                    return (
                      <tr key={stu.id} className="hover:bg-rose-50/30 transition">
                        <td className="py-3 px-4 text-center text-slate-400 font-bold">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-slate-900">{stu.formNo || '—'}</div>
                          {stu.ofssReferenceNo && (
                            <div className="text-[10px] text-slate-400 font-mono">OFSS: {stu.ofssReferenceNo}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {stu.studentName}
                          {stu.mobile && (
                            <div className="text-[10px] text-slate-400 font-normal">📱 {stu.mobile}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{stu.fatherName || '—'}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700 text-[10.5px]">
                            {stu.stream}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px]">
                            {stu.casteCategory}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            isBseb ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isBseb ? 'BSEB (₹515)' : 'Other (₹715)'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-bold font-mono text-rose-700 text-sm">
                            ₹{payableFee}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            stu.registrationStatus === 'DOCS_VERIFIED' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {stu.registrationStatus === 'DOCS_VERIFIED' ? 'दस्तावेज़ सत्यापित' : 'दस्तावेज़ लंबित'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onOpenRecordPayment(stu)}
                            className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 ml-auto cursor-pointer shadow-2xs"
                          >
                            <IndianRupee className="w-3 h-3" />
                            <span>शुल्क जमा करें</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
