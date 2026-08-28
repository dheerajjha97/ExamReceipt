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
  RefreshCw
} from 'lucide-react';
import { Student, PaymentStatus, CasteCategory, ExamType } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface StudentListProps {
  students: Student[];
  onSelectStudentReceipt: (student: Student) => void;
  onOpenRecordPayment: (student: Student) => void;
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
  const [casteFilter, setCasteFilter] = useState<string>('ALL');
  const [examTypeFilter, setExamTypeFilter] = useState<string>('ALL');
  const [streamFilter, setStreamFilter] = useState<string>('ALL');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Confirmation Modals State
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

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
        statusFilter === 'ALL' || student.paymentStatus === statusFilter;

      const matchesCaste =
        casteFilter === 'ALL' || student.casteCategory === casteFilter;

      const matchesExam =
        examTypeFilter === 'ALL' || student.examType === examTypeFilter;

      const matchesStream =
        streamFilter === 'ALL' || student.classOrStream === streamFilter;

      return matchesSearch && matchesStatus && matchesCaste && matchesExam && matchesStream;
    });
  }, [students, searchQuery, statusFilter, casteFilter, examTypeFilter, streamFilter]);

  // Totals calculation
  const stats = useMemo(() => {
    const totalCount = filteredStudents.length;
    const paidCount = filteredStudents.filter((s) => s.paymentStatus === 'PAID').length;
    const unpaidCount = filteredStudents.filter((s) => s.paymentStatus === 'UNPAID').length;
    const partialCount = filteredStudents.filter((s) => s.paymentStatus === 'PARTIAL').length;

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
      <div className="bg-[#FDFCF8]/90 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-[#E6E2D3] shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#787267]" />
            <input
              type="text"
              placeholder="Search by name, reg. no (e.g. R-31337...), father name, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-16 py-2.5 bg-[#FDFCF8] border border-[#DDD8C5] rounded-2xl text-xs font-medium text-[#4A453E] placeholder-[#787267] focus:outline-none focus:ring-2 focus:ring-[#5A5A40] shadow-inner transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#8C857B] hover:text-[#4A453E] font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {selectedStudentIds.length > 0 && onDeleteSelectedStudents && (
              <button
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-white bg-[#8C2B2B] hover:bg-[#722222] rounded-2xl transition border border-[#A83838] shadow-md hover:-translate-y-0.5 active:translate-y-0 transform-gpu animate-fadeIn"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedStudentIds.length})</span>
              </button>
            )}

            {students.length > 0 && onClearAllStudents && (
              <button
                onClick={() => setShowClearAllConfirm(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-[#8C2B2B] bg-[#F9E8E8] hover:bg-[#F2D6D6] rounded-2xl transition border border-[#E8B8B8] shadow-xs hover:-translate-y-0.5 active:translate-y-0 transform-gpu"
                title="Wipe all dummy student data to start clean"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete All Dummy Data</span>
              </button>
            )}

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-[#4A453E] bg-[#EFECE1] hover:bg-[#E6E2D3] rounded-2xl transition border border-[#DDD8C5] shadow-xs hover:-translate-y-0.5 active:translate-y-0 transform-gpu"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV ({selectedStudentIds.length > 0 ? selectedStudentIds.length : filteredStudents.length})</span>
            </button>

            <button
              onClick={onOpenAddStudent}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[#5A5A40] hover:bg-[#484833] rounded-2xl shadow-md transition border border-[#484833] hover:-translate-y-0.5 active:translate-y-0 transform-gpu"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Student</span>
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#E6E2D3] text-xs">
          
          {/* Payment Status Filter */}
          <div>
            <label className="block font-bold text-[#787267] mb-1">Fee Payment Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#FDFCF8] border border-[#DDD8C5] rounded-xl px-3 py-2 text-[#4A453E] font-semibold focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
            >
              <option value="ALL">All Statuses ({students.length})</option>
              <option value="PAID">Paid Only</option>
              <option value="UNPAID">Unpaid Only</option>
              <option value="PARTIAL">Partial Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block font-bold text-[#787267] mb-1">Caste Category</label>
            <select
              value={casteFilter}
              onChange={(e) => setCasteFilter(e.target.value)}
              className="w-full bg-[#FDFCF8] border border-[#DDD8C5] rounded-xl px-3 py-2 text-[#4A453E] font-semibold focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
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
              className="w-full bg-[#FDFCF8] border border-[#DDD8C5] rounded-xl px-3 py-2 text-[#4A453E] font-semibold focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
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
              className="w-full bg-[#FDFCF8] border border-[#DDD8C5] rounded-xl px-3 py-2 text-[#4A453E] font-semibold focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
            >
              <option value="ALL">All Classes / Streams</option>
              <option value="Intermediate Science (12th)">Intermediate Science (12th)</option>
              <option value="Intermediate Arts (12th)">Intermediate Arts (12th)</option>
              <option value="Intermediate Commerce (12th)">Intermediate Commerce (12th)</option>
              <option value="Matriculation (10th)">Matriculation (10th)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Breakdown Bar (Glassmorphic 3D Card) */}
      <div className="bg-gradient-to-r from-[#4A453E] to-[#3E3A33] text-white rounded-3xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-white/20 backdrop-blur-xl">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto text-xs">
          <div>
            <p className="text-[#C2BEB5] font-semibold">Total Filtered</p>
            <p className="text-base font-black text-white">{stats.totalCount} Students</p>
          </div>
          <div>
            <p className="text-[#C2BEB5] font-semibold">Total Fee Target</p>
            <p className="text-base font-black text-[#FDFCF8]">₹{stats.totalFeeExpected.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-[#C2BEB5] font-semibold">Collected Revenue</p>
            <p className="text-base font-black text-[#A3C9A8]">₹{stats.totalFeeCollected.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-[#C2BEB5] font-semibold">Online Charges (+₹30)</p>
            <p className="text-base font-black text-[#E6E2D3]">₹{stats.totalOnlineChargesExpected.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {stats.totalFeeDue > 0 && (
          <div className="bg-[#8C5A2B]/40 backdrop-blur-md border border-[#E8D0B8]/40 rounded-2xl px-4 py-2.5 text-xs text-[#FAF0E6] flex items-center gap-2 w-full md:w-auto justify-center shadow-md">
            <AlertCircle className="w-4 h-4 text-[#E8D0B8] shrink-0" />
            <span>
              Pending Due Amount: <strong className="font-mono text-[#E8D0B8]">₹{stats.totalFeeDue.toLocaleString('en-IN')}</strong> ({stats.unpaidCount + stats.partialCount} students)
            </span>
          </div>
        )}
      </div>

      {/* Main Student Records Table */}
      <div className="bg-[#F7F5EE] rounded-xl border border-[#E6E2D3] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#EFECE1] text-[#4A453E] font-semibold border-b border-[#E6E2D3] uppercase tracking-wider">
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-[#DDD8C5] text-[#5A5A40] focus:ring-[#5A5A40]"
                  />
                </th>
                <th className="p-3 w-12 text-center">S.No</th>
                <th className="p-3">Registration No</th>
                <th className="p-3">Student & Parents Name</th>
                <th className="p-3">DOB / Category</th>
                <th className="p-3">Exam / Class</th>
                <th className="p-3 text-right">Fee Breakup (+₹30)</th>
                <th className="p-3 text-center">Payment Status</th>
                <th className="p-3 text-center">Action / Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E2D3]">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-[#787267]">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-[#EFECE1] flex items-center justify-center mx-auto text-[#8C857B]">
                        <Search className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-[#4A453E] text-sm">No student records found</p>
                      <p className="text-xs text-[#787267]">
                        Try adjusting your search keywords or upload a new PDF / image list to import students automatically.
                      </p>
                      <button
                        onClick={onOpenUploadPdf}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#5A5A40] text-white rounded-lg text-xs font-medium shadow"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Upload PDF List via AI</span>
                      </button>
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
                      className={`hover:bg-[#EAE6D8] transition ${
                        isSelected ? 'bg-[#EAE6D8]' : idx % 2 === 0 ? 'bg-[#FDFCF8]' : 'bg-[#F7F5EE]'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(student.id)}
                          className="rounded border-[#DDD8C5] text-[#5A5A40] focus:ring-[#5A5A40]"
                        />
                      </td>

                      {/* S.No */}
                      <td className="p-3 text-center font-mono text-[#787267]">
                        {student.sNo || idx + 1}
                      </td>

                      {/* Reg No */}
                      <td className="p-3 font-mono font-semibold text-[#4A453E]">
                        <div className="flex items-center gap-1.5">
                          <span>{student.registrationNo}</span>
                        </div>
                        {student.lastReceiptNo && (
                          <p className="text-[10px] text-[#5A5A40] font-sans">
                            Rcpt: {student.lastReceiptNo}
                          </p>
                        )}
                      </td>

                      {/* Student & Parents Name */}
                      <td className="p-3">
                        <p className="font-bold text-[#4A453E]">{student.studentName}</p>
                        <p className="text-[11px] text-[#787267]">
                          <span className="font-medium text-[#4A453E]">F:</span> {student.fatherName}
                        </p>
                        <p className="text-[10px] text-[#8C857B]">
                          <span className="font-medium text-[#787267]">M:</span> {student.motherName}
                        </p>
                      </td>

                      {/* DOB & Caste Category */}
                      <td className="p-3">
                        <p className="font-mono text-[#4A453E]">{student.dob || 'N/A'}</p>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EFECE1] text-[#4A453E] border border-[#DDD8C5]">
                          {student.casteCategory || 'General'}
                        </span>
                      </td>

                      {/* Exam / Class */}
                      <td className="p-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#EFECE1] text-[#5A5A40] border border-[#DDD8C5]">
                          {student.examType || 'REGULAR'}
                        </span>
                        <p className="text-[11px] text-[#787267] mt-0.5">
                          {student.classOrStream || 'Intermediate'}
                        </p>
                      </td>

                      {/* Fee Breakup */}
                      <td className="p-3 text-right font-mono">
                        <div className="text-xs text-[#4A453E] font-bold">
                          ₹{student.totalFee}
                        </div>
                        <div className="text-[10px] text-[#787267]">
                          Base: ₹{student.baseFee} + <span className="text-[#5A5A40] font-semibold">₹{onlineCharge} Online</span>
                        </div>
                      </td>

                      {/* Payment Status Pill */}
                      <td className="p-3 text-center">
                        {student.paymentStatus === 'PAID' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E2ECE9] text-[#2E5B50] border border-[#B8D5CE]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#2E5B50]" />
                            PAID (₹{student.paidAmount})
                          </span>
                        ) : student.paymentStatus === 'PARTIAL' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FAF0E6] text-[#8C5A2B] border border-[#E8D0B8]">
                            <Clock className="w-3.5 h-3.5 text-[#8C5A2B]" />
                            PARTIAL (₹{student.paidAmount})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F9E8E8] text-[#8C2B2B] border border-[#E8B8B8]">
                            <AlertCircle className="w-3.5 h-3.5 text-[#8C2B2B]" />
                            UNPAID
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Collect / Record Payment */}
                          {student.paymentStatus !== 'PAID' ? (
                            <button
                              onClick={() => onOpenRecordPayment(student)}
                              className="px-2.5 py-1 bg-[#2E5B50] hover:bg-[#254A41] text-white rounded text-[11px] font-medium shadow-sm transition flex items-center gap-1"
                              title="Record Fee Payment"
                            >
                              <IndianRupee className="w-3 h-3" />
                              <span>Collect Fee</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onSelectStudentReceipt(student)}
                              className="px-2.5 py-1 bg-[#5A5A40] hover:bg-[#484833] text-white rounded text-[11px] font-medium shadow-sm transition flex items-center gap-1"
                              title="View & Print Traditional School Receipt"
                            >
                              <Receipt className="w-3 h-3" />
                              <span>View Receipt</span>
                            </button>
                          )}

                          {/* WhatsApp Share Button */}
                          <button
                            onClick={() => onOpenWhatsAppShare(student)}
                            className="p-1.5 bg-[#E2ECE9] hover:bg-[#CDE3DC] text-[#2E5B50] border border-[#B8D5CE] rounded transition"
                            title="Send Receipt / Due Notice on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Student */}
                          <button
                            onClick={() => onEditStudent(student)}
                            className="p-1.5 bg-[#EFECE1] hover:bg-[#E6E2D3] text-[#4A453E] rounded transition border border-[#DDD8C5]"
                            title="Edit Student Info"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Student */}
                          <button
                            onClick={() => setStudentToDelete(student)}
                            className="p-1.5 bg-[#EFECE1] hover:bg-[#F9E8E8] text-[#787267] hover:text-[#8C2B2B] rounded transition border border-[#DDD8C5]"
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
        <div className="bg-[#EFECE1] px-4 py-3 border-t border-[#E6E2D3] flex flex-wrap items-center justify-between text-xs text-[#787267]">
          <div>
            Showing <strong className="text-[#4A453E]">{filteredStudents.length}</strong> of{' '}
            <strong className="text-[#4A453E]">{students.length}</strong> total registered students
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2E5B50]"></span> Paid: {stats.paidCount}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8C5A2B]"></span> Partial: {stats.partialCount}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8C2B2B]"></span> Unpaid: {stats.unpaidCount}
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

      {/* 3. Delete All Dummy Data */}
      <ConfirmModal
        isOpen={showClearAllConfirm}
        title="Wipe All Dummy Student Data"
        message="Are you sure you want to clear all dummy student records? This will leave your student database completely blank so you can upload your real PDF/Image list or add new students."
        confirmText="Wipe All Dummy Data"
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
    </div>
  );
};
