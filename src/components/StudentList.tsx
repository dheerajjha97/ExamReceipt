import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MessageSquare, 
  Edit3, 
  Trash2, 
  Download, 
  Plus, 
  IndianRupee, 
  Sparkles,
  Check,
  RefreshCw,
  FileText,
  ClipboardCheck,
  FileCheck,
  UploadCloud,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import { Student, PaymentStatus, CasteCategory, ExamType, FormIssueStatus, InstituteSettings, Transaction } from '../types';
import { ConfirmModal } from './ConfirmModal';
import { BulkStudentPrintModal } from './BulkStudentPrintModal';
import { FlutterDashboardOverview } from './FlutterDashboardOverview';

interface StudentListProps {
  students: Student[];
  transactions?: Transaction[];
  settings?: InstituteSettings;
  onSelectStudentReceipt: (student: Student) => void;
  onOpenRecordPayment: (student: Student) => void;
  onOpenLogTransaction?: () => void;
  onSwitchToLedger?: () => void;
  onOpenIssueForm?: (student: Student) => void;
  onBulkIssueForms?: (studentIds: string[], targetStatus?: FormIssueStatus) => void;
  onOpenWhatsAppShare: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onDeleteSelectedStudents?: (studentIds: string[]) => void;
  onClearAllStudents?: () => void;
  onOpenAddStudent: () => void;
  onOpenUploadPdf: () => void;
}

export const StudentList: React.FC<StudentListProps> = ({
  students,
  transactions = [],
  settings,
  onSelectStudentReceipt,
  onOpenRecordPayment,
  onOpenLogTransaction,
  onSwitchToLedger,
  onOpenIssueForm,
  onBulkIssueForms,
  onOpenWhatsAppShare,
  onEditStudent,
  onDeleteStudent,
  onDeleteSelectedStudents,
  onClearAllStudents,
  onOpenAddStudent,
  onOpenUploadPdf,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [formFilter, setFormFilter] = useState<string>('ALL');
  const [casteFilter, setCasteFilter] = useState<string>('ALL');
  const [examTypeFilter, setExamTypeFilter] = useState<string>('ALL');
  const [streamFilter, setStreamFilter] = useState<string>('ALL');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Confirmation Modals State (Protect from mistake)
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [showBulkIssueConfirm, setShowBulkIssueConfirm] = useState(false);
  const [isBulkPrintOpen, setIsBulkPrintOpen] = useState(false);

  // Filter logic
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        student.studentName.toLowerCase().includes(q) ||
        student.registrationNo.toLowerCase().includes(q) ||
        student.fatherName.toLowerCase().includes(q) ||
        student.motherName.toLowerCase().includes(q) ||
        (student.phone && student.phone.includes(q)) ||
        (student.lastReceiptNo && student.lastReceiptNo.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'ALL' || 
        (statusFilter === 'PENDING' ? student.paymentStatus !== 'PAID' : student.paymentStatus === statusFilter);

      const matchesForm =
        formFilter === 'ALL' || (student.formIssueStatus || 'NOT_ISSUED') === formFilter;

      const matchesCaste =
        casteFilter === 'ALL' || student.casteCategory === casteFilter;

      const matchesExam =
        examTypeFilter === 'ALL' || student.examType === examTypeFilter;

      const matchesStream =
        streamFilter === 'ALL' || student.classOrStream === streamFilter;

      return matchesSearch && matchesStatus && matchesForm && matchesCaste && matchesExam && matchesStream;
    });
  }, [students, searchQuery, statusFilter, formFilter, casteFilter, examTypeFilter, streamFilter]);

  // Totals calculation
  const stats = useMemo(() => {
    const totalCount = filteredStudents.length;
    const paidCount = filteredStudents.filter((s) => s.paymentStatus === 'PAID').length;
    const unpaidCount = filteredStudents.filter((s) => s.paymentStatus === 'UNPAID').length;
    const partialCount = filteredStudents.filter((s) => s.paymentStatus === 'PARTIAL').length;

    // Exam Form Distribution Counts
    const formsSubmittedCount = filteredStudents.filter((s) => s.formIssueStatus === 'SUBMITTED').length;
    const formsIssuedCount = filteredStudents.filter((s) => s.formIssueStatus === 'ISSUED').length;
    const formsNotIssuedCount = filteredStudents.filter((s) => !s.formIssueStatus || s.formIssueStatus === 'NOT_ISSUED').length;

    const totalBaseFeeExpected = filteredStudents.reduce((acc, s) => acc + s.baseFee, 0);
    const totalOnlineChargesCollected = filteredStudents.reduce((acc, s) => acc + (s.paidAmount > 0 ? (s.onlineCharges || 30) : 0), 0);
    const totalFeeExpected = filteredStudents.reduce((acc, s) => acc + s.totalFee, 0);
    const totalFeeCollected = filteredStudents.reduce((acc, s) => acc + s.paidAmount, 0);
    const totalFeeDue = totalFeeExpected - totalFeeCollected;

    return {
      totalCount,
      paidCount,
      unpaidCount,
      partialCount,
      formsSubmittedCount,
      formsIssuedCount,
      formsNotIssuedCount,
      totalBaseFeeExpected,
      totalOnlineChargesCollected,
      totalFeeExpected,
      totalFeeCollected,
      totalFeeDue,
    };
  }, [filteredStudents]);

  // Bulk Selection
  const toggleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s) => s.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter((item) => item !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const rowsToExport = selectedStudentIds.length > 0
      ? students.filter((s) => selectedStudentIds.includes(s.id))
      : filteredStudents;

    if (rowsToExport.length === 0) return;

    const headers = [
      'S.No',
      'Registration No',
      'Student Name',
      'Father Name',
      'Mother Name',
      'DOB',
      'Caste Category',
      'Exam Type',
      'Class/Stream',
      'Base Fee (INR)',
      'Online Charges (INR)',
      'Total Fee (INR)',
      'Paid Amount (INR)',
      'Payment Status',
      'Payment Mode',
      'Last Receipt No',
      'Transaction Ref',
      'Form Issue Status',
      'Form No',
      'Form Issue Date',
      'Form Submission Date',
    ];

    const csvRows = [headers.join(',')];

    rowsToExport.forEach((s) => {
      const row = [
        s.sNo,
        `"${s.registrationNo}"`,
        `"${s.studentName}"`,
        `"${s.fatherName}"`,
        `"${s.motherName}"`,
        `"${s.dob}"`,
        `"${s.casteCategory}"`,
        `"${s.examType}"`,
        `"${s.classOrStream}"`,
        s.baseFee,
        s.onlineCharges || 30,
        s.totalFee,
        s.paidAmount,
        s.paymentStatus,
        `"${s.paymentMode || ''}"`,
        `"${s.lastReceiptNo || ''}"`,
        `"${s.transactionRef || ''}"`,
        `"${s.formIssueStatus || 'NOT_ISSUED'}"`,
        `"${s.formNo || ''}"`,
        `"${s.formIssueDate || ''}"`,
        `"${s.formSubmissionDate || ''}"`,
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Student_Fee_Records_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Flutter Material 3 Dashboard Overview */}
      <FlutterDashboardOverview
        students={students}
        transactions={transactions}
        settings={settings || {
          code: '31337',
          name: 'College Examination Cell',
          academicYear: '2025-2027',
          defaultOnlineCharge: 30,
          cashierName: 'Admin',
          headerTitle: 'EXAM FEE RECEIPT'
        }}
        onOpenAddStudent={onOpenAddStudent}
        onOpenLogPayment={onOpenLogTransaction || (() => onOpenRecordPayment(students[0] || {} as Student))}
        onOpenUploadPdf={onOpenUploadPdf}
        onSwitchToLedger={onSwitchToLedger}
        onFilterPendingDues={() => setStatusFilter('PENDING')}
      />

      {/* Search & Filter Bar (Flutter Material 3 Surface) */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E8E4D5] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Flutter SearchBar */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8A80]" />
            <input
              type="text"
              placeholder="Search by student name, reg no, father name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-16 py-2.5 bg-[#FAF9F5] border border-[#E2DDD0] rounded-2xl text-xs font-medium text-[#2D2A26] placeholder-[#8E8A80] focus:outline-none focus:ring-2 focus:ring-[#2E5B50]/30 focus:border-[#2E5B50] transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#8E8A80] hover:text-[#2D2A26] font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Action Buttons (Flutter Tonal & Filled Buttons) */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {selectedStudentIds.length > 0 && (
              <button
                onClick={() => setIsBulkPrintOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-white bg-[#2E5B50] hover:bg-[#254A41] rounded-2xl transition border border-[#2E5B50] shadow-sm hover:-translate-y-0.5 active:translate-y-0"
                title="चयनित छात्रों का रिकॉर्ड एवं रसीदें प्रिंट करें (Print selected student records / slips)"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-100" />
                <span>Print Selected ({selectedStudentIds.length})</span>
              </button>
            )}

            {selectedStudentIds.length > 0 && onBulkIssueForms && (
              <button
                onClick={() => setShowBulkIssueConfirm(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-[#2E5B50] bg-[#E2ECE9] hover:bg-[#D3E3DF] rounded-2xl transition border border-[#C5DDD6] shadow-2xs hover:-translate-y-0.5 active:translate-y-0"
                title="Activate & issue blank examination forms to selected students"
              >
                <ClipboardCheck className="w-3.5 h-3.5 text-[#2E5B50]" />
                <span>Issue Form to Selected ({selectedStudentIds.length})</span>
              </button>
            )}

            {selectedStudentIds.length > 0 && onDeleteSelectedStudents && (
              <button
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-2xl transition border border-rose-200 shadow-2xs hover:-translate-y-0.5 active:translate-y-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedStudentIds.length})</span>
              </button>
            )}

            {students.length > 0 && onClearAllStudents && (
              <button
                onClick={() => setShowClearAllConfirm(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-2xl transition border border-rose-200/80 shadow-2xs hover:-translate-y-0.5 active:translate-y-0"
                title="Wipe all dummy student data"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Data</span>
              </button>
            )}

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-[#5A5A40] bg-[#FAF9F5] hover:bg-[#F2EFE8] rounded-2xl transition border border-[#DDD8C5] shadow-2xs hover:-translate-y-0.5 active:translate-y-0"
            >
              <Download className="w-3.5 h-3.5 text-[#787267]" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onOpenUploadPdf}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-[#2E5B50] bg-[#E2ECE9] hover:bg-[#D3E3DF] rounded-2xl shadow-2xs transition border border-[#C5DDD6] hover:-translate-y-0.5 active:translate-y-0"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Import List</span>
            </button>

            <button
              onClick={onOpenAddStudent}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[#2E5B50] hover:bg-[#254A41] rounded-2xl shadow-sm transition hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>Manual Entry</span>
            </button>
          </div>
        </div>

        {/* Flutter Quick ChoiceChips (Material 3 Filter Chips) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F0ECE1]">
          <span className="text-[11px] font-bold text-[#787267] uppercase tracking-wider mr-1">त्वरित फ़िल्टर:</span>
          
          <button
            type="button"
            onClick={() => { setStatusFilter('ALL'); setFormFilter('ALL'); }}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition border ${
              statusFilter === 'ALL' && formFilter === 'ALL'
                ? 'bg-[#2E5B50] text-white border-[#2E5B50] shadow-2xs'
                : 'bg-[#FAF9F5] text-[#5A5A40] border-[#E2DDD0] hover:bg-[#F2EFE8]'
            }`}
          >
            सभी छात्र ({students.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('PAID')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition border ${
              statusFilter === 'PAID'
                ? 'bg-[#E2ECE9] text-[#2E5B50] border-[#B8D5CD] font-bold shadow-2xs'
                : 'bg-[#FAF9F5] text-[#5A5A40] border-[#E2DDD0] hover:bg-[#F2EFE8]'
            }`}
          >
            जमा (Paid: {stats.paidCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition border ${
              statusFilter === 'PENDING'
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold shadow-2xs'
                : 'bg-[#FAF9F5] text-[#5A5A40] border-[#E2DDD0] hover:bg-[#F2EFE8]'
            }`}
          >
            बकाया (Pending: {stats.unpaidCount + stats.partialCount})
          </button>

          <button
            type="button"
            onClick={() => setFormFilter('ISSUED')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition border ${
              formFilter === 'ISSUED'
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold shadow-2xs'
                : 'bg-[#FAF9F5] text-[#5A5A40] border-[#E2DDD0] hover:bg-[#F2EFE8]'
            }`}
          >
            फॉर्म जारी (Issued: {stats.formsIssuedCount})
          </button>

          <button
            type="button"
            onClick={() => setFormFilter('SUBMITTED')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition border ${
              formFilter === 'SUBMITTED'
                ? 'bg-[#E2ECE9] text-[#2E5B50] border-[#B8D5CD] font-bold shadow-2xs'
                : 'bg-[#FAF9F5] text-[#5A5A40] border-[#E2DDD0] hover:bg-[#F2EFE8]'
            }`}
          >
            फॉर्म जमा (Submitted: {stats.formsSubmittedCount})
          </button>
        </div>

        {/* Detailed Filters Grid (Flutter Tonal Form Fields) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs">
          {/* Payment Status Filter */}
          <div>
            <label className="block font-bold text-[#787267] mb-1">Fee Payment Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#FAF9F5] border border-[#E2DDD0] rounded-xl px-3 py-2 text-[#4A453E] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E5B50]/30"
            >
              <option value="ALL">All Statuses ({students.length})</option>
              <option value="PAID">Paid Only</option>
              <option value="UNPAID">Unpaid Only</option>
              <option value="PARTIAL">Partial Only</option>
              <option value="PENDING">Pending (Unpaid + Partial)</option>
            </select>
          </div>

          {/* Form Stage Filter */}
          <div>
            <label className="block font-bold text-[#2E5B50] mb-1">Exam Form Stage</label>
            <select
              value={formFilter}
              onChange={(e) => setFormFilter(e.target.value)}
              className="w-full bg-[#FAF9F5] border border-[#C5DDD6] rounded-xl px-3 py-2 text-[#2E5B50] font-bold focus:outline-none focus:ring-2 focus:ring-[#2E5B50]/30"
            >
              <option value="ALL">All Form Stages</option>
              <option value="NOT_ISSUED">1. Not Collected ({stats.formsNotIssuedCount})</option>
              <option value="ISSUED">2. Form Issued ({stats.formsIssuedCount})</option>
              <option value="SUBMITTED">3. Submitted ({stats.formsSubmittedCount})</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block font-bold text-[#787267] mb-1">Caste Category</label>
            <select
              value={casteFilter}
              onChange={(e) => setCasteFilter(e.target.value)}
              className="w-full bg-[#FAF9F5] border border-[#E2DDD0] rounded-xl px-3 py-2 text-[#4A453E] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E5B50]/30"
            >
              <option value="ALL">All Categories</option>
              <option value="General">General (Fee ₹1400)</option>
              <option value="BC">BC (Fee ₹1400)</option>
              <option value="EBC">EBC (Fee ₹1140)</option>
              <option value="SC">SC (Fee ₹1140)</option>
              <option value="ST">ST (Fee ₹1140)</option>
            </select>
          </div>

          {/* Exam Type Filter */}
          <div>
            <label className="block font-bold text-[#787267] mb-1">Exam Type</label>
            <select
              value={examTypeFilter}
              onChange={(e) => setExamTypeFilter(e.target.value)}
              className="w-full bg-[#FAF9F5] border border-[#E2DDD0] rounded-xl px-3 py-2 text-[#4A453E] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E5B50]/30"
            >
              <option value="ALL">All Exam Types</option>
              <option value="REGULAR">REGULAR</option>
              <option value="EX-REGULAR">EX-REGULAR</option>
              <option value="IMPROVEMENT">IMPROVEMENT</option>
              <option value="COMPARTMENTAL">COMPARTMENTAL</option>
            </select>
          </div>

          {/* Class / Stream Filter */}
          <div>
            <label className="block font-bold text-[#787267] mb-1">Class / Stream</label>
            <select
              value={streamFilter}
              onChange={(e) => setStreamFilter(e.target.value)}
              className="w-full bg-[#FAF9F5] border border-[#E2DDD0] rounded-xl px-3 py-2 text-[#4A453E] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E5B50]/30"
            >
              <option value="ALL">All Classes / Streams</option>
              <option value="Intermediate Science (12th)">Science (12th)</option>
              <option value="Intermediate Arts (12th)">Arts (12th)</option>
              <option value="Intermediate Commerce (12th)">Commerce (12th)</option>
              <option value="Matriculation (10th)">Matriculation (10th)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Student Records Table (Flutter Material 3 Surface) */}
      <div className="bg-white rounded-3xl border border-[#E8E4D5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F5F2E8] text-[#5A5A40] font-bold border-b border-[#E8E4D5] uppercase tracking-wider text-[11px]">
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-[#C5DDD6] text-[#2E5B50] focus:ring-[#2E5B50]"
                  />
                </th>
                <th className="p-3.5 w-12 text-center">S.No</th>
                <th className="p-3.5">Registration No</th>
                <th className="p-3.5">Student & Parents Name</th>
                <th className="p-3.5">DOB / Category</th>
                <th className="p-3.5">Exam / Class</th>
                <th className="p-3.5 text-right">Fee Breakup (+₹30)</th>
                <th className="p-3.5 text-center">Payment Status</th>
                <th className="p-3.5 text-center">Exam Form</th>
                <th className="p-3.5 text-center">Action / Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0ECE1]">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-[#787267]">
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="w-14 h-14 rounded-3xl bg-[#E2ECE9] border border-[#C5DDD6] flex items-center justify-center mx-auto text-[#2E5B50]">
                        <UploadCloud className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="font-bold text-[#2D2A26] text-base">No Students Found</p>
                        <p className="text-xs text-[#787267] mt-1">
                          Import your student list directly via Excel sheet (.xlsx, .csv), PDF or image scan.
                        </p>
                      </div>
                      <div className="pt-2">
                        <button
                          onClick={onOpenUploadPdf}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2E5B50] hover:bg-[#254A41] text-white rounded-2xl text-xs font-bold shadow-sm transition"
                        >
                          <UploadCloud className="w-4 h-4" />
                          <span>Import Student List</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const isSelected = selectedStudentIds.includes(student.id);
                  const onlineCharge = student.onlineCharges || 30;

                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-[#FAF9F5] transition ${
                        isSelected ? 'bg-[#F2EFE8]' : idx % 2 === 0 ? 'bg-white' : 'bg-[#FDFCF9]'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(student.id)}
                          className="rounded border-[#C5DDD6] text-[#2E5B50] focus:ring-[#2E5B50]"
                        />
                      </td>

                      {/* S.No */}
                      <td className="p-3 text-center font-mono text-[#8E8A80] font-semibold">
                        {student.sNo || idx + 1}
                      </td>

                      {/* Reg No */}
                      <td className="p-3 font-mono font-bold text-[#2D2A26]">
                        <div className="flex items-center gap-1.5">
                          <span>{student.registrationNo}</span>
                        </div>
                        {student.lastReceiptNo && (
                          <p className="text-[10px] text-[#2E5B50] font-sans font-medium">
                            Rcpt: {student.lastReceiptNo}
                          </p>
                        )}
                      </td>

                      {/* Student & Parents Name with Flutter Avatar */}
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-2xl bg-[#E2ECE9] text-[#2E5B50] font-bold text-xs flex items-center justify-center shrink-0 border border-[#C5DDD6]">
                            {student.studentName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-[#2D2A26]">{student.studentName}</p>
                            <p className="text-[11px] text-[#787267]">
                              <span className="font-medium text-[#5A5A40]">F:</span> {student.fatherName}
                            </p>
                            <p className="text-[10px] text-[#8E8A80]">
                              <span className="font-medium text-[#8E8A80]">M:</span> {student.motherName}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* DOB & Caste Category */}
                      <td className="p-3">
                        <p className="font-mono text-[#4A453E] font-medium">{student.dob || 'N/A'}</p>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FAF9F5] text-[#5A5A40] border border-[#E2DDD0]">
                          {student.casteCategory || 'General'}
                        </span>
                      </td>

                      {/* Exam / Class */}
                      <td className="p-3">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E2ECE9] text-[#2E5B50] border border-[#C5DDD6]">
                          {student.examType || 'REGULAR'}
                        </span>
                        <p className="text-[11px] text-[#787267] mt-0.5">
                          {student.classOrStream || 'Intermediate'}
                        </p>
                      </td>

                      {/* Fee Breakup */}
                      <td className="p-3 text-right font-mono">
                        <div className="text-xs text-[#2D2A26] font-bold">
                          ₹{student.totalFee}
                        </div>
                        <div className="text-[10px] text-[#787267]">
                          Base: ₹{student.baseFee} + <span className="text-[#2E5B50] font-semibold">₹{onlineCharge} Online</span>
                        </div>
                      </td>

                      {/* Payment Status Pill (Flutter Tonal Pill) */}
                      <td className="p-3 text-center">
                        {student.paymentStatus === 'PAID' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-[#E2ECE9] text-[#2E5B50] border border-[#C5DDD6]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#2E5B50]" />
                            PAID (₹{student.paidAmount})
                          </span>
                        ) : student.paymentStatus === 'PARTIAL' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            PARTIAL (₹{student.paidAmount})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            UNPAID
                          </span>
                        )}
                      </td>

                      {/* Exam Form Stage Cell */}
                      <td className="p-3 text-center">
                        {student.formIssueStatus === 'SUBMITTED' ? (
                          <button
                            onClick={() => onOpenIssueForm && onOpenIssueForm(student)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-[#E2ECE9] text-[#2E5B50] border border-[#C5DDD6] hover:bg-[#D3E3DF] transition shadow-2xs"
                            title="Form & Fee submitted"
                          >
                            <FileCheck className="w-3.5 h-3.5 text-[#2E5B50]" />
                            <span>Submitted</span>
                          </button>
                        ) : student.formIssueStatus === 'ISSUED' ? (
                          <button
                            onClick={() => onOpenIssueForm && onOpenIssueForm(student)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition shadow-2xs"
                            title="Blank form issued"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5 text-amber-600" />
                            <span>Form Issued</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onOpenIssueForm && onOpenIssueForm(student)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-medium bg-[#FAF9F5] text-[#5A5A40] border border-[#E2DDD0] hover:bg-[#F2EFE8] transition"
                            title="Issue blank form"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#8E8A80]" />
                            <span>Issue Form</span>
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Collect / Record Payment */}
                          {student.paymentStatus !== 'PAID' ? (
                            <button
                              onClick={() => onOpenRecordPayment(student)}
                              className="px-3 py-1.5 bg-[#2E5B50] hover:bg-[#254A41] text-white rounded-xl text-[11px] font-bold shadow-2xs transition flex items-center gap-1"
                              title="Record Fee Payment"
                            >
                              <IndianRupee className="w-3 h-3" />
                              <span>Collect Fee</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onSelectStudentReceipt(student)}
                              className="px-3 py-1.5 bg-[#FAF9F5] hover:bg-[#F2EFE8] text-[#2E5B50] border border-[#C5DDD6] rounded-xl text-[11px] font-bold shadow-2xs transition flex items-center gap-1"
                              title="View & Print Receipt"
                            >
                              <Receipt className="w-3 h-3 text-[#2E5B50]" />
                              <span>View Receipt</span>
                            </button>
                          )}

                          {/* WhatsApp Share Button */}
                          <button
                            onClick={() => onOpenWhatsAppShare(student)}
                            className="p-1.5 bg-[#E2ECE9] hover:bg-[#D3E3DF] text-[#2E5B50] border border-[#C5DDD6] rounded-xl transition shadow-2xs"
                            title="Send Receipt / Due Notice on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Student */}
                          <button
                            onClick={() => onEditStudent(student)}
                            className="p-1.5 bg-[#FAF9F5] hover:bg-[#F2EFE8] text-[#5A5A40] rounded-xl transition border border-[#E2DDD0]"
                            title="Edit Student Info"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Student */}
                          <button
                            onClick={() => setStudentToDelete(student)}
                            className="p-1.5 bg-[#FAF9F5] hover:bg-rose-50 text-[#8E8A80] hover:text-rose-600 rounded-xl transition border border-[#E2DDD0]"
                            title="Delete Student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-800">{filteredStudents.length}</strong> of{' '}
            <strong className="text-slate-800">{students.length}</strong> total registered students
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Paid: {stats.paidCount}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Partial: {stats.partialCount}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Unpaid: {stats.unpaidCount}
            </span>
          </div>
        </div>
      </div>

      {/* Floating Bottom Batch Action Bar for Selected Students */}
      {selectedStudentIds.length > 0 && (
        <div className="fixed bottom-20 sm:bottom-6 left-3 right-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 bg-[#2D2A26]/95 backdrop-blur-md text-white px-3.5 sm:px-5 py-2.5 rounded-2xl shadow-2xl border border-white/20 flex flex-wrap items-center justify-between sm:justify-start gap-2.5 sm:gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-[#5A5A40] rounded-full flex items-center justify-center text-xs font-bold font-mono">
              {selectedStudentIds.length}
            </span>
            <span className="text-xs font-bold text-slate-200 hidden sm:inline">Students Selected</span>
          </div>

          <div className="h-4 w-px bg-white/20"></div>

          <button
            onClick={() => setIsBulkPrintOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2E5B50] hover:bg-[#254A41] text-white text-xs font-bold rounded-xl transition shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Records / Slips</span>
          </button>

          {onBulkIssueForms && (
            <button
              onClick={() => setShowBulkIssueConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold rounded-xl transition"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Issue Forms</span>
            </button>
          )}

          {onDeleteSelectedStudents && (
            <button
              onClick={() => setShowBulkDeleteConfirm(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition"
              title="Delete selected students"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Delete</span>
            </button>
          )}

          <button
            onClick={() => setSelectedStudentIds([])}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 transition font-medium"
          >
            Clear
          </button>
        </div>
      )}

      {/* Bulk Student Print Modal */}
      <BulkStudentPrintModal
        isOpen={isBulkPrintOpen}
        selectedStudents={students.filter((s) => selectedStudentIds.includes(s.id))}
        settings={settings || {
          name: 'M.S. College, Motihari',
          subTitle: 'Constituent Unit of B.R.A. Bihar University, Muzaffarpur',
          address: 'Motihari, East Champaran, Bihar - 845401',
          code: '0108',
          academicYear: '2024-2026',
          defaultOnlineCharge: 30,
          upiId: 'college@upi',
        }}
        onClose={() => setIsBulkPrintOpen(false)}
      />

      {/* Confirmation Modals with Mistake Protection */}
      {/* 1. Single Student Delete */}
      <ConfirmModal
        isOpen={!!studentToDelete}
        title="छात्र रिकॉर्ड हटाएं (Delete Student)"
        message={`क्या आप वाकई "${studentToDelete?.studentName}" (पंजीकरण सं: ${studentToDelete?.registrationNo}, कक्षा: ${studentToDelete?.classOrStream}) का रिकॉर्ड हटाना चाहते हैं?\n\n💡 ध्यान दें: गलती से डिलीट होने पर भी आपको नीचे 'पूर्ववत करें (Undo)' का विकल्प मिलेगा जिससे आप इसे तुरंत वापस ला सकेंगे।`}
        confirmText="छात्र हटाएं (Delete)"
        confirmVariant="danger"
        requireSafetyCheckbox={true}
        onConfirm={() => {
          if (studentToDelete) {
            onDeleteStudent(studentToDelete.id);
            setStudentToDelete(null);
          }
        }}
        onClose={() => setStudentToDelete(null)}
      />

      {/* 2. Bulk Delete Selected Students */}
      <ConfirmModal
        isOpen={showBulkDeleteConfirm}
        title="चुने गए छात्र हटाएं (Delete Selected)"
        message={`क्या आप चुने गए ${selectedStudentIds.length} छात्र रिकॉर्ड्स को हटाना चाहते हैं?\n\nसुरक्षा हेतु नीचे 'DELETE' टाइप करें और पुष्टि चेकबॉक्स को टिक करें।`}
        confirmText={`Delete ${selectedStudentIds.length} Student(s)`}
        confirmVariant="danger"
        requireSafetyCode="DELETE"
        requireSafetyCheckbox={true}
        onConfirm={() => {
          if (onDeleteSelectedStudents) {
            onDeleteSelectedStudents(selectedStudentIds);
            setSelectedStudentIds([]);
          }
          setShowBulkDeleteConfirm(false);
        }}
        onClose={() => setShowBulkDeleteConfirm(false)}
      />

      {/* 3. Delete All Data */}
      <ConfirmModal
        isOpen={showClearAllConfirm}
        title="Wipe All Student Data"
        message="Are you sure you want to clear all student records from the database? This is an irreversible reset operation."
        confirmText="Wipe All Data"
        confirmVariant="danger"
        requireSafetyCode="WIPE ALL"
        requireSafetyCheckbox={true}
        onConfirm={() => {
          if (onClearAllStudents) {
            onClearAllStudents();
            setSelectedStudentIds([]);
          }
          setShowClearAllConfirm(false);
        }}
        onClose={() => setShowClearAllConfirm(false)}
      />

      {/* 4. Bulk Issue Examination Forms */}
      <ConfirmModal
        isOpen={showBulkIssueConfirm}
        title="Activate & Issue Forms"
        message={`Are you sure you want to issue examination forms for ${selectedStudentIds.length} selected student(s)? This will mark their form issue status as 'ISSUED' and save to the database.`}
        confirmText={`Issue Form to ${selectedStudentIds.length} Student(s)`}
        confirmVariant="primary"
        onConfirm={() => {
          if (onBulkIssueForms) {
            onBulkIssueForms(selectedStudentIds, 'ISSUED');
            setSelectedStudentIds([]);
          }
          setShowBulkIssueConfirm(false);
        }}
        onClose={() => setShowBulkIssueConfirm(false)}
      />
    </div>
  );
};
