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
  FileSpreadsheet
} from 'lucide-react';
import { Student, PaymentStatus, CasteCategory, ExamType, FormIssueStatus } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface StudentListProps {
  students: Student[];
  onSelectStudentReceipt: (student: Student) => void;
  onOpenRecordPayment: (student: Student) => void;
  onOpenIssueForm?: (student: Student) => void;
  onBulkIssueForms?: (studentIds: string[], targetStatus?: FormIssueStatus) => void;
  onRestoreOfficialData?: () => void;
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
  onSelectStudentReceipt,
  onOpenRecordPayment,
  onOpenIssueForm,
  onBulkIssueForms,
  onRestoreOfficialData,
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
  const [showRestoreOfficialConfirm, setShowRestoreOfficialConfirm] = useState(false);

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
    const totalOnlineChargesExpected = filteredStudents.reduce((acc, s) => acc + (s.onlineCharges || 30), 0);
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
      totalOnlineChargesExpected,
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
      {/* Search & Filter Bar (Glassmorphism & Material 3) */}
      <div className="bg-white/70 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/80 shadow-xl shadow-slate-200/50 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, reg no, father name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-16 py-2.5 bg-white/80 border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 shadow-xs transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {selectedStudentIds.length > 0 && onBulkIssueForms && (
              <button
                onClick={() => setShowBulkIssueConfirm(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 rounded-2xl transition border border-teal-400/30 shadow-lg shadow-teal-500/20 hover:-translate-y-0.5 active:translate-y-0 transform-gpu"
                title="Activate & issue blank examination forms to selected students"
              >
                <ClipboardCheck className="w-3.5 h-3.5 text-teal-200" />
                <span>Issue Form to Selected ({selectedStudentIds.length})</span>
              </button>
            )}

            {selectedStudentIds.length > 0 && onDeleteSelectedStudents && (
              <button
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-2xl transition border border-rose-500 shadow-md hover:-translate-y-0.5 active:translate-y-0 transform-gpu"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedStudentIds.length})</span>
              </button>
            )}

            {onRestoreOfficialData && (
              <button
                onClick={() => setShowRestoreOfficialConfirm(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100/80 rounded-2xl transition border border-teal-200/80 shadow-xs hover:-translate-y-0.5 active:translate-y-0 transform-gpu"
                title="Restore 48 official students from Arts, Science, Commerce PDF ledgers"
              >
                <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
                <span>Restore 48 Official PDF Students</span>
              </button>
            )}

            {students.length > 0 && onClearAllStudents && (
              <button
                onClick={() => setShowClearAllConfirm(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-2xl transition border border-rose-200/80 shadow-xs hover:-translate-y-0.5 active:translate-y-0 transform-gpu"
                title="Wipe all dummy student data"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Data</span>
              </button>
            )}

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 rounded-2xl transition border border-slate-200 shadow-xs hover:-translate-y-0.5 active:translate-y-0 transform-gpu"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onOpenUploadPdf}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 rounded-2xl shadow-lg shadow-teal-500/20 transition border border-teal-400/30 hover:-translate-y-0.5 active:translate-y-0 transform-gpu"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Import List</span>
            </button>

            <button
              onClick={onOpenAddStudent}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 rounded-2xl shadow-xs transition border border-slate-200 hover:-translate-y-0.5 active:translate-y-0 transform-gpu"
            >
              <Plus className="w-3.5 h-3.5 text-teal-600" />
              <span>Manual Entry</span>
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-200/60 text-xs">
          
          {/* Payment Status Filter */}
          <div>
            <label className="block font-bold text-slate-500 mb-1">Fee Payment Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white/80 border border-slate-200/80 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/50"
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
            <label className="block font-bold text-teal-700 mb-1">Exam Form Stage</label>
            <select
              value={formFilter}
              onChange={(e) => setFormFilter(e.target.value)}
              className="w-full bg-white/80 border border-teal-500/30 rounded-xl px-3 py-2 text-teal-800 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            >
              <option value="ALL">All Form Stages</option>
              <option value="NOT_ISSUED">1. Not Collected ({stats.formsNotIssuedCount})</option>
              <option value="ISSUED">2. Form Issued ({stats.formsIssuedCount})</option>
              <option value="SUBMITTED">3. Submitted ({stats.formsSubmittedCount})</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block font-bold text-slate-500 mb-1">Caste Category</label>
            <select
              value={casteFilter}
              onChange={(e) => setCasteFilter(e.target.value)}
              className="w-full bg-white/80 border border-slate-200/80 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/50"
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
            <label className="block font-bold text-slate-500 mb-1">Exam Type</label>
            <select
              value={examTypeFilter}
              onChange={(e) => setExamTypeFilter(e.target.value)}
              className="w-full bg-white/80 border border-slate-200/80 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/50"
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
            <label className="block font-bold text-slate-500 mb-1">Class / Stream</label>
            <select
              value={streamFilter}
              onChange={(e) => setStreamFilter(e.target.value)}
              className="w-full bg-white/80 border border-slate-200/80 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/50"
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

      {/* Stats Breakdown Bar (Glassmorphic 3D Card) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-white/10 backdrop-blur-xl">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full text-xs">
          <button 
            type="button"
            onClick={() => { setStatusFilter('ALL'); setFormFilter('ALL'); setCasteFilter('ALL'); setExamTypeFilter('ALL'); setStreamFilter('ALL'); }}
            className="text-left cursor-pointer hover:bg-white/10 rounded-xl p-2 -m-2 transition focus:outline-none focus:ring-2 focus:ring-teal-500/50"
          >
            <p className="text-slate-400 font-semibold">Total Filtered</p>
            <p className="text-base font-black text-white">{stats.totalCount} Students</p>
          </button>
          <button 
            type="button"
            onClick={() => { setFormFilter('ISSUED'); setStatusFilter('ALL'); setCasteFilter('ALL'); setExamTypeFilter('ALL'); setStreamFilter('ALL'); }}
            className="text-left cursor-pointer hover:bg-white/10 rounded-xl p-2 -m-2 transition focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <p className="text-amber-300/80 font-semibold">Blank Form Issued</p>
            <p className="text-base font-black text-amber-300">{stats.formsIssuedCount} Students</p>
          </button>
          <button 
            type="button"
            onClick={() => { setFormFilter('SUBMITTED'); setStatusFilter('ALL'); setCasteFilter('ALL'); setExamTypeFilter('ALL'); setStreamFilter('ALL'); }}
            className="text-left cursor-pointer hover:bg-white/10 rounded-xl p-2 -m-2 transition focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <p className="text-emerald-300/80 font-semibold">Form & Fee Submitted</p>
            <p className="text-base font-black text-emerald-300">{stats.formsSubmittedCount} Complete</p>
          </button>
          <div className="p-2 -m-2">
            <p className="text-teal-300/80 font-semibold">Revenue Collected</p>
            <p className="text-base font-black text-emerald-300">₹{stats.totalFeeCollected.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-2 -m-2">
            <p className="text-slate-400 font-semibold">Online Charges (+₹30)</p>
            <p className="text-base font-black text-slate-200">₹{stats.totalOnlineChargesExpected.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {stats.totalFeeDue > 0 && (
          <button 
            type="button"
            onClick={() => { setStatusFilter('PENDING'); setFormFilter('ALL'); setCasteFilter('ALL'); setExamTypeFilter('ALL'); setStreamFilter('ALL'); }}
            className="bg-amber-500/20 hover:bg-amber-500/30 backdrop-blur-md border border-amber-500/30 rounded-2xl px-4 py-2.5 text-xs text-amber-200 flex items-center gap-2 shrink-0 shadow-md transition cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <AlertCircle className="w-4 h-4 text-amber-300 shrink-0" />
            <span>
              Pending Due Amount: <strong className="font-mono text-amber-300">₹{stats.totalFeeDue.toLocaleString('en-IN')}</strong> ({stats.unpaidCount + stats.partialCount} students)
            </span>
          </button>
        )}
      </div>

      {/* Main Student Records Table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/80 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-slate-200 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-700 text-teal-500 focus:ring-teal-500 bg-slate-800"
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
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-slate-500">
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="w-14 h-14 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto text-teal-600">
                        <UploadCloud className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-base">No Students Found</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Import your student list directly via Excel sheet (.xlsx, .csv), PDF or image scan.
                        </p>
                      </div>
                      <div className="pt-2">
                        <button
                          onClick={onOpenUploadPdf}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-teal-500/20 transition transform-gpu hover:-translate-y-0.5"
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
                      className={`hover:bg-slate-50/80 transition ${
                        isSelected ? 'bg-teal-50/40' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(student.id)}
                          className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                        />
                      </td>

                      {/* S.No */}
                      <td className="p-3 text-center font-mono text-slate-400 font-semibold">
                        {student.sNo || idx + 1}
                      </td>

                      {/* Reg No */}
                      <td className="p-3 font-mono font-bold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <span>{student.registrationNo}</span>
                        </div>
                        {student.lastReceiptNo && (
                          <p className="text-[10px] text-teal-700 font-sans font-medium">
                            Rcpt: {student.lastReceiptNo}
                          </p>
                        )}
                      </td>

                      {/* Student & Parents Name */}
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{student.studentName}</p>
                        <p className="text-[11px] text-slate-500">
                          <span className="font-medium text-slate-700">F:</span> {student.fatherName}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          <span className="font-medium text-slate-500">M:</span> {student.motherName}
                        </p>
                      </td>

                      {/* DOB & Caste Category */}
                      <td className="p-3">
                        <p className="font-mono text-slate-700 font-medium">{student.dob || 'N/A'}</p>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {student.casteCategory || 'General'}
                        </span>
                      </td>

                      {/* Exam / Class */}
                      <td className="p-3">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                          {student.examType || 'REGULAR'}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {student.classOrStream || 'Intermediate'}
                        </p>
                      </td>

                      {/* Fee Breakup */}
                      <td className="p-3 text-right font-mono">
                        <div className="text-xs text-slate-900 font-bold">
                          ₹{student.totalFee}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Base: ₹{student.baseFee} + <span className="text-teal-700 font-semibold">₹{onlineCharge} Online</span>
                        </div>
                      </td>

                      {/* Payment Status Pill */}
                      <td className="p-3 text-center">
                        {student.paymentStatus === 'PAID' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            PAID (₹{student.paidAmount})
                          </span>
                        ) : student.paymentStatus === 'PARTIAL' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-700 border border-amber-500/30">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            PARTIAL (₹{student.paidAmount})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-700 border border-rose-500/30">
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
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition shadow-2xs"
                            title="Form & Fee submitted"
                          >
                            <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
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
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition"
                            title="Issue blank form"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
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
                              className="px-3 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white rounded-xl text-[11px] font-bold shadow-md shadow-teal-500/20 transition flex items-center gap-1"
                              title="Record Fee Payment"
                            >
                              <IndianRupee className="w-3 h-3" />
                              <span>Collect Fee</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onSelectStudentReceipt(student)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[11px] font-bold shadow-sm transition flex items-center gap-1"
                              title="View & Print Receipt"
                            >
                              <Receipt className="w-3 h-3 text-teal-300" />
                              <span>View Receipt</span>
                            </button>
                          )}

                          {/* WhatsApp Share Button */}
                          <button
                            onClick={() => onOpenWhatsAppShare(student)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl transition shadow-2xs"
                            title="Send Receipt / Due Notice on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Student */}
                          <button
                            onClick={() => onEditStudent(student)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition border border-slate-200"
                            title="Edit Student Info"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Student */}
                          <button
                            onClick={() => setStudentToDelete(student)}
                            className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition border border-slate-200"
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

      {/* Confirmation Modals */}
      {/* 1. Single Student Delete */}
      <ConfirmModal
        isOpen={!!studentToDelete}
        title="Delete Student Record"
        message={`Are you sure you want to permanently delete record for "${studentToDelete?.studentName}" (Reg No: ${studentToDelete?.registrationNo})?`}
        confirmText="Delete Student"
        confirmVariant="danger"
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
        title="Delete Selected Students"
        message={`Are you sure you want to delete ${selectedStudentIds.length} selected student record(s)? This action cannot be undone.`}
        confirmText={`Delete ${selectedStudentIds.length} Student(s)`}
        confirmVariant="danger"
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
        message="Are you sure you want to clear all student records from the database?"
        confirmText="Wipe All Data"
        confirmVariant="danger"
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

      {/* 5. Restore 48 Official PDF Students */}
      <ConfirmModal
        isOpen={showRestoreOfficialConfirm}
        title="Restore Official 48 Student Records"
        message="Are you sure you want to restore the official student dataset containing all 48 students from the Arts, Science, and Commerce PDF registers?"
        confirmText="Restore 48 Official Students"
        confirmVariant="primary"
        onConfirm={() => {
          if (onRestoreOfficialData) {
            onRestoreOfficialData();
            setSelectedStudentIds([]);
          }
          setShowRestoreOfficialConfirm(false);
        }}
        onClose={() => setShowRestoreOfficialConfirm(false)}
      />
    </div>
  );
};
