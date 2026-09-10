import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Upload, 
  Printer, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  FileText, 
  UserCheck, 
  Trash2, 
  Edit3, 
  ArrowLeft, 
  Sparkles, 
  School, 
  Download, 
  Share2,
  BookOpen,
  Info,
  ChevronRight,
  Receipt,
  FileCheck
} from 'lucide-react';
import { 
  RegistrationStudent, 
  InstituteSettings, 
  CasteCategory, 
  PaymentStatus 
} from '../../types';
import { AddEditRegistrationModal } from './AddEditRegistrationModal';
import { RegistrationFeeReceiptModal } from './RegistrationFeeReceiptModal';
import { RegistrationUploadModal } from './RegistrationUploadModal';
import { RegistrationDocAuditModal } from './RegistrationDocAuditModal';
import { RegistrationRecordPaymentModal } from './RegistrationRecordPaymentModal';

interface RegistrationModuleProps {
  students: RegistrationStudent[];
  settings: InstituteSettings;
  onUpdateStudents: (students: RegistrationStudent[]) => void;
  onDeleteStudent?: (id: string) => void;
  onClearAll?: () => void;
  onBackToDashboard: () => void;
  onSwitchToExamination: () => void;
}

export const RegistrationModule: React.FC<RegistrationModuleProps> = ({
  students,
  settings,
  onUpdateStudents,
  onDeleteStudent,
  onClearAll,
  onBackToDashboard,
  onSwitchToExamination,
}) => {
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStream, setSelectedStream] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('ALL');
  const [selectedDocFilter, setSelectedDocFilter] = useState<string>('ALL');

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<RegistrationStudent | null>(null);

  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptStudent, setReceiptStudent] = useState<RegistrationStudent | null>(null);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentStudent, setPaymentStudent] = useState<RegistrationStudent | null>(null);

  // Custom Deletion Confirmation States (No window.confirm!)
  const [studentToDelete, setStudentToDelete] = useState<{ id: string; name: string; formNo?: string } | null>(null);
  const [isConfirmClearAllOpen, setIsConfirmClearAllOpen] = useState(false);

  // Filtered student list
  const filteredStudents = useMemo(() => {
    return students.filter((stu) => {
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = stu.studentName.toLowerCase().includes(query);
        const matchesFather = stu.fatherName.toLowerCase().includes(query);
        const matchesForm = stu.formNo.toLowerCase().includes(query);
        const matchesMobile = (stu.mobile || '').includes(query);
        const matchesAadhar = (stu.documents?.aadhar?.docNumber || '').includes(query);
        if (!matchesName && !matchesFather && !matchesForm && !matchesMobile && !matchesAadhar) {
          return false;
        }
      }

      // Stream filter
      if (selectedStream !== 'ALL' && !stu.stream.includes(selectedStream)) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL' && stu.casteCategory !== selectedCategory) {
        return false;
      }

      // Payment Status filter
      if (selectedPaymentStatus !== 'ALL' && stu.paymentStatus !== selectedPaymentStatus) {
        return false;
      }

      // Document compliance filter
      if (selectedDocFilter === 'MISSING_TC' && stu.documents?.transferCertificate?.status !== 'SUBMITTED') {
        return true;
      }
      if (selectedDocFilter === 'MISSING_APAAR' && stu.documents?.apaar?.status !== 'SUBMITTED') {
        return true;
      }
      if (selectedDocFilter === 'MISSING_CASTE') {
        const isCasteMandatory = stu.casteCategory === 'EBC' || stu.casteCategory === 'SC' || stu.casteCategory === 'ST';
        return isCasteMandatory && stu.documents?.casteCertificate?.status !== 'SUBMITTED';
      }
      if (selectedDocFilter !== 'ALL') {
        return false;
      }

      return true;
    });
  }, [students, searchTerm, selectedStream, selectedCategory, selectedPaymentStatus, selectedDocFilter]);

  // Key metrics calculation
  const totalCount = students.length;
  const paidCount = students.filter(s => s.paymentStatus === 'PAID').length;
  const unpaidCount = totalCount - paidCount;
  const totalCollectedFee = paidCount * 515;
  const totalPendingFee = unpaidCount * 515;

  const missingTcCount = students.filter(s => s.documents?.transferCertificate?.status !== 'SUBMITTED').length;
  const missingApaarCount = students.filter(s => s.documents?.apaar?.status !== 'SUBMITTED').length;
  const missingCasteCount = students.filter(s => {
    const req = s.casteCategory === 'EBC' || s.casteCategory === 'SC' || s.casteCategory === 'ST';
    return req && s.documents?.casteCertificate?.status !== 'SUBMITTED';
  }).length;

  // Handlers
  const handleSaveStudent = (studentToSave: RegistrationStudent) => {
    if (editingStudent) {
      onUpdateStudents(students.map(s => s.id === studentToSave.id ? studentToSave : s));
    } else {
      onUpdateStudents([studentToSave, ...students]);
    }
  };

  const handleConfirmDeleteSingle = () => {
    if (!studentToDelete) return;
    if (onDeleteStudent) {
      onDeleteStudent(studentToDelete.id);
    } else {
      onUpdateStudents(students.filter(s => s.id !== studentToDelete.id));
    }
    setStudentToDelete(null);
  };

  const handleConfirmClearAll = () => {
    if (onClearAll) {
      onClearAll();
    } else {
      onUpdateStudents([]);
    }
    setIsConfirmClearAllOpen(false);
  };

  const handleBulkImport = (importedList: RegistrationStudent[]) => {
    onUpdateStudents([...importedList, ...students]);
  };

  const handleOpenReceipt = (stu: RegistrationStudent) => {
    setReceiptStudent(stu);
    setIsReceiptOpen(true);
  };

  const handlePrintRegister = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Glassmorphic Top Navigation & Breadcrumbs */}
      <div className="bg-white/70 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/60 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="p-2.5 rounded-2xl bg-[#FAF9F5] hover:bg-[#EFECE1] border border-[#E8E4D5] text-[#2E5B50] font-bold text-xs flex items-center gap-1.5 transition shadow-xs group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition" />
            <span>मुख्य डैशबोर्ड (Main Dashboard)</span>
          </button>
          <div className="h-6 w-px bg-gray-300 hidden sm:block" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#2E5B50] border border-emerald-300">
                मॉड्यूल 2 &bull; पंजीकरण
              </span>
              <h1 className="text-base sm:text-lg font-black text-[#2E5B50] tracking-tight">
                इंटरमीडिएट पंजीकरण एवं शुल्क प्रबंधन (₹515)
              </h1>
            </div>
            <p className="text-xs text-[#5A5A40]">
              {settings.name} &bull; सत्र 2026-2027 (I.Sc, I.A, I.Com, Vocational)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onSwitchToExamination}
            className="px-3.5 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
          >
            <School className="w-4 h-4 text-amber-700" />
            <span>🎓 परीक्षा मॉड्यूल पर जाएं (Examination)</span>
          </button>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2 rounded-2xl bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-md"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>स्मार्ट अपलोड (Image / PDF / Text)</span>
          </button>

          <button
            onClick={() => {
              setEditingStudent(null);
              setIsAddEditOpen(true);
            }}
            className="px-4 py-2 rounded-2xl bg-[#2E5B50] hover:bg-[#23463E] text-white font-bold text-xs flex items-center gap-1.5 transition shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>+ नया पंजीकरण (New)</span>
          </button>
        </div>
      </div>

      {/* Glassmorphic Metric Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Registered */}
        <div className="bg-white/70 backdrop-blur-xl p-5 rounded-3xl border border-white/60 shadow-md flex items-center justify-between">
          <div>
            <div className="text-xs text-[#5A5A40] font-semibold">कुल पंजीकृत छात्र</div>
            <div className="text-2xl font-black text-[#2E5B50] mt-1">{totalCount}</div>
            <div className="text-[11px] text-gray-500 mt-0.5 font-medium">
              विज्ञान: {students.filter(s => s.stream.includes('Science')).length} &bull; कला: {students.filter(s => s.stream.includes('Arts')).length} &bull; वाणिज्य: {students.filter(s => s.stream.includes('Commerce')).length}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#2E5B50]">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Total ₹515 Fee Collected */}
        <div className="bg-white/70 backdrop-blur-xl p-5 rounded-3xl border border-white/60 shadow-md flex items-center justify-between">
          <div>
            <div className="text-xs text-[#5A5A40] font-semibold">कुल संकलित शुल्क (₹515 दर)</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">₹{totalCollectedFee.toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-emerald-800 mt-0.5 font-medium">
              {paidCount} छात्रों द्वारा पूर्ण भुगतान
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Pending Fee */}
        <div className="bg-white/70 backdrop-blur-xl p-5 rounded-3xl border border-white/60 shadow-md flex items-center justify-between">
          <div>
            <div className="text-xs text-[#5A5A40] font-semibold">बकाया पंजीकरण शुल्क</div>
            <div className="text-2xl font-black text-rose-600 mt-1">₹{totalPendingFee.toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-rose-800 mt-0.5 font-medium">
              {unpaidCount} छात्रों का शुल्क बकाया
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Document Audit Alert */}
        <div 
          onClick={() => setIsAuditOpen(true)}
          className="bg-white/70 backdrop-blur-xl p-5 rounded-3xl border border-white/60 shadow-md flex items-center justify-between cursor-pointer hover:bg-amber-50/60 transition group"
        >
          <div>
            <div className="text-xs text-amber-900 font-semibold flex items-center gap-1">
              <span>दस्तावेज अनुपालन ऑडिट</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
            <div className="text-2xl font-black text-amber-700 mt-1">
              {missingTcCount + missingApaarCount + missingCasteCount}
            </div>
            <div className="text-[10px] text-amber-800 mt-0.5">
              लंबित: TC ({missingTcCount}) &bull; APAAR कारण ({missingApaarCount}) &bull; जाति ({missingCasteCount})
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/70 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/60 shadow-lg space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="नाम, पिता का नाम, फॉर्म सं., मोबाइल, आधार से खोजें..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/90 rounded-2xl border border-[#DDD8C5] focus:outline-hidden focus:ring-2 focus:ring-[#2E5B50] text-xs font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Stream Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/90 rounded-2xl border border-[#DDD8C5] text-xs font-semibold text-[#2E5B50] focus:ring-2 focus:ring-[#2E5B50]"
            >
              <option value="ALL">सभी संकाय (All Streams)</option>
              <option value="Science">विज्ञान (Science - I.Sc)</option>
              <option value="Arts">कला (Arts - I.A)</option>
              <option value="Commerce">वाणिज्य (Commerce - I.Com)</option>
              <option value="Vocational">व्यावसायिक (Vocational)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/90 rounded-2xl border border-[#DDD8C5] text-xs font-semibold text-gray-700 focus:ring-2 focus:ring-[#2E5B50]"
            >
              <option value="ALL">सभी कोटि (All Categories)</option>
              <option value="General">General (सामान्य)</option>
              <option value="BC">BC (पिछड़ा वर्ग)</option>
              <option value="EBC">EBC (अत्यंत पिछड़ा वर्ग)</option>
              <option value="SC">SC (अनुसूचित जाति)</option>
              <option value="ST">ST (अनुसूचित जनजाति)</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/90 rounded-2xl border border-[#DDD8C5] text-xs font-semibold text-gray-700 focus:ring-2 focus:ring-[#2E5B50]"
            >
              <option value="ALL">शुल्क स्थिति (All)</option>
              <option value="PAID">₹515 प्राप्त (Paid)</option>
              <option value="UNPAID">बकाया (Unpaid)</option>
            </select>
          </div>

          {/* Doc Compliance Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedDocFilter}
              onChange={(e) => setSelectedDocFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/90 rounded-2xl border border-amber-300 text-xs font-bold text-amber-900 focus:ring-2 focus:ring-[#2E5B50]"
            >
              <option value="ALL">दस्तावेज फ़िल्टर (All)</option>
              <option value="MISSING_TC">लंबित TC (Mandatory)</option>
              <option value="MISSING_APAAR">अनुपलब्ध APAAR</option>
              <option value="MISSING_CASTE">लंबित जाति प्रमाण</option>
            </select>
          </div>
        </div>

        {/* Quick Audit Bar & Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#E8E4D5] text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#5A5A40] font-medium">
              दर्शाए गए छात्र: <strong>{filteredStudents.length}</strong> / {totalCount}
            </span>
            {selectedDocFilter !== 'ALL' && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full font-bold text-[10px]">
                दस्तावेज फ़िल्टर सक्रिय
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {students.length > 0 && (
              <button
                onClick={() => setIsConfirmClearAllOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center gap-1 transition shadow-2xs"
                title="सभी पंजीकरण रिकॉर्ड हटाएं (Clear All Data)"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>सभी हटाएं ({students.length})</span>
              </button>
            )}
            <button
              onClick={() => setIsAuditOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>दस्तावेज ऑडिट रिपोर्ट</span>
            </button>
            <button
              onClick={handlePrintRegister}
              className="px-3 py-1.5 rounded-xl bg-[#FAF9F5] hover:bg-[#EFECE1] border border-[#DDD8C5] text-[#2E5B50] font-bold text-xs flex items-center gap-1 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>रजिस्टर प्रिंट</span>
            </button>
          </div>
        </div>
      </div>

      {/* Student List Table & Cards */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF9F5] text-[#5A5A40] border-b border-[#E8E4D5] uppercase font-bold tracking-wider">
              <tr>
                <th className="p-3.5">क्र.</th>
                <th className="p-3.5">फॉर्म सं.</th>
                <th className="p-3.5">छात्र का नाम & माता-पिता</th>
                <th className="p-3.5">संकाय & कोटि</th>
                <th className="p-3.5">आवश्यक दस्तावेज स्थिति (AADHAR / APAAR / TC / CASTE)</th>
                <th className="p-3.5 text-center">शुल्क (₹515)</th>
                <th className="p-3.5 text-right">कार्रवाई (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4D5]">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-500">
                    <div className="max-w-md mx-auto py-4">
                      <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-[#2E5B50] border border-emerald-200 flex items-center justify-center mx-auto mb-3 shadow-sm">
                        <BookOpen className="w-8 h-8" />
                      </div>
                      <span className="font-bold text-base block text-gray-800">
                        {students.length === 0 ? 'कोई पंजीकरण डाटा उपलब्ध नहीं है (No Data)' : 'फ़िल्टर के अनुसार कोई छात्र नहीं मिला'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1 mb-5">
                        {students.length === 0 
                          ? 'इंटरमीडिएट 11वीं/12वीं सत्र के नए छात्रों का पंजीकरण करने या लिस्ट अपलोड करने के लिए नीचे दिए गए विकल्प चुनें।'
                          : 'कृपया अपने सर्च या फ़िल्टर विकल्प को रीसेट करें।'}
                      </p>
                      
                      {students.length === 0 && (
                        <div className="flex items-center justify-center gap-3 flex-wrap">
                          <button
                            onClick={() => {
                              setEditingStudent(null);
                              setIsAddEditOpen(true);
                            }}
                            className="px-4 py-2.5 bg-[#2E5B50] hover:bg-[#23463E] text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-md transition"
                          >
                            <Plus className="w-4 h-4" />
                            <span>+ नया पंजीकरण जोड़ें (₹515)</span>
                          </button>
                          <button
                            onClick={() => setIsUploadOpen(true)}
                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-md transition"
                          >
                            <Sparkles className="w-4 h-4 text-emerald-200" />
                            <span>📤 स्मार्ट OCR अपलोड (PDF/Image/Text)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu, index) => {
                  const isPaid = stu.paymentStatus === 'PAID';
                  const isCasteReq = stu.casteCategory === 'EBC' || stu.casteCategory === 'SC' || stu.casteCategory === 'ST';

                  return (
                    <tr key={stu.id} className="hover:bg-amber-50/30 transition">
                      {/* S.No */}
                      <td className="p-3.5 font-mono text-gray-500 font-bold">{index + 1}</td>

                      {/* Form No */}
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-[#2E5B50] bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                          {stu.formNo}
                        </span>
                        {stu.bsebUniqueId && (
                          <div className="text-[10px] text-gray-500 font-mono mt-1">
                            UID: {stu.bsebUniqueId}
                          </div>
                        )}
                      </td>

                      {/* Name & Parents */}
                      <td className="p-3.5">
                        <strong className="text-sm font-bold text-gray-900 block uppercase">
                          {stu.studentName}
                        </strong>
                        <div className="text-gray-600 text-[11px] uppercase">
                          पिता: {stu.fatherName}
                        </div>
                        {stu.motherName && (
                          <div className="text-gray-500 text-[10px] uppercase">
                            माता: {stu.motherName}
                          </div>
                        )}
                        {stu.mobile && (
                          <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                            📞 {stu.mobile}
                          </div>
                        )}
                      </td>

                      {/* Stream & Category */}
                      <td className="p-3.5">
                        <span className="font-bold text-[#2E5B50] block">
                          {stu.stream}
                        </span>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-[11px] font-bold text-gray-800">
                            {stu.casteCategory}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {stu.gender === 'FEMALE' ? 'छात्रा' : 'छात्र'}
                          </span>
                        </div>
                      </td>

                      {/* Mandatory Document Checklist Status */}
                      <td className="p-3.5 max-w-[320px]">
                        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                          {/* Aadhaar */}
                          <div className={`p-1.5 rounded-lg border flex items-center justify-between ${
                            stu.documents?.aadhar?.status === 'SUBMITTED' ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                          }`}>
                            <span className="font-semibold">आधार (Aadhaar):</span>
                            <span className="font-bold">
                              {stu.documents?.aadhar?.status === 'SUBMITTED' ? '✓ जमा' : '✗ लंबित'}
                            </span>
                          </div>

                          {/* APAAR */}
                          <div className={`p-1.5 rounded-lg border flex items-center justify-between ${
                            stu.documents?.apaar?.status === 'SUBMITTED' ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-300 text-amber-900'
                          }`} title={stu.documents?.apaar?.notAvailableReason}>
                            <span className="font-semibold">अपार (APAAR):</span>
                            <span className="font-bold truncate max-w-[80px]">
                              {stu.documents?.apaar?.status === 'SUBMITTED' ? '✓ उपलब्ध' : '! कारण दर्ज'}
                            </span>
                          </div>

                          {/* TC / SLC (Mandatory for all) */}
                          <div className={`p-1.5 rounded-lg border flex items-center justify-between ${
                            stu.documents?.transferCertificate?.status === 'SUBMITTED' ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'
                          }`}>
                            <span className="font-semibold">स्थानांतरण (TC):</span>
                            <span className="font-bold">
                              {stu.documents?.transferCertificate?.status === 'SUBMITTED' ? '✓ मूल जमा' : '✗ लंबित (अनिवार्य)'}
                            </span>
                          </div>

                          {/* Caste Certificate (Mandatory for EBC, SC, ST) */}
                          <div className={`p-1.5 rounded-lg border flex items-center justify-between ${
                            !isCasteReq 
                              ? 'bg-gray-50 border-gray-200 text-gray-500' 
                              : (stu.documents?.casteCertificate?.status === 'SUBMITTED' ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' : 'bg-purple-50 border-purple-300 text-purple-900')
                          }`}>
                            <span className="font-semibold">जाति प्रमाण:</span>
                            <span className="font-bold">
                              {!isCasteReq 
                                ? '— लागू नहीं' 
                                : (stu.documents?.casteCertificate?.status === 'SUBMITTED' ? '✓ जमा' : '✗ लंबित')}
                            </span>
                          </div>
                        </div>

                        {/* APAAR reason tooltip callout if not available */}
                        {stu.documents?.apaar?.status === 'NOT_AVAILABLE' && stu.documents?.apaar?.notAvailableReason && (
                          <div className="mt-1 text-[9px] text-amber-800 bg-amber-50/90 px-1.5 py-0.5 rounded border border-amber-200 truncate">
                            <strong>APAAR कारण:</strong> {stu.documents.apaar.notAvailableReason}
                          </div>
                        )}
                      </td>

                      {/* Registration Fee Status (₹515) */}
                      <td className="p-3.5 text-center">
                        {isPaid ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 font-bold rounded-full text-xs border border-emerald-300 flex items-center gap-1 shadow-2xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>₹515 प्राप्त</span>
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono mt-0.5">
                              {stu.paymentMode || 'CASH'} &bull; {stu.receiptNo || 'REC'}
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex flex-col items-center">
                            <button
                              onClick={() => {
                                setPaymentStudent(stu);
                                setIsPaymentOpen(true);
                              }}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-full text-xs shadow-xs transition flex items-center gap-1"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>₹515 स्वीकारें</span>
                            </button>
                            <span className="text-[10px] text-rose-700 font-semibold mt-0.5">
                              शुल्क बकाया
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right space-x-1">
                        {isPaid && (
                          <button
                            onClick={() => handleOpenReceipt(stu)}
                            className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition"
                            title="रसीद देखें एवं प्रिंट करें"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingStudent(stu);
                            setIsAddEditOpen(true);
                          }}
                          className="p-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 transition"
                          title="संपादित करें"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setStudentToDelete({ id: stu.id, name: stu.studentName, formNo: stu.formNo })}
                          className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
                          title="हटाएं"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal: Delete Single Student */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">पंजीकरण रिकॉर्ड हटाएं?</h3>
            <p className="text-sm text-gray-600 mt-2">
              क्या आप छात्र <strong className="text-gray-900 uppercase font-bold">{studentToDelete.name}</strong> (फॉर्म: {studentToDelete.formNo || '—'}) का पंजीकरण रिकॉर्ड हमेशा के लिए हटाना चाहते हैं?
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 rounded-xl text-gray-700 hover:bg-gray-100 font-bold text-xs transition"
              >
                रद्द करें (Cancel)
              </button>
              <button
                onClick={handleConfirmDeleteSingle}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>हाँ, हटाएं (Delete)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Clear All Students */}
      {isConfirmClearAllOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-rose-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-rose-900">⚠️ सभी पंजीकरण डेटा हटाएं?</h3>
            <p className="text-sm text-gray-700 mt-2">
              यह क्रिया सभी <strong>{students.length}</strong> पंजीकरण रिकॉर्ड्स को स्थानीय और क्लाउड डाटाबेस से पूरी तरह खाली कर देगी।
            </p>
            <p className="text-xs text-gray-500 mt-2 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              💡 हटाने के बाद 10 सेकंड तक आप स्क्रीन के नीचे <strong>पूर्ववत (Undo)</strong> दबाकर इसे वापस ला सकते हैं।
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setIsConfirmClearAllOpen(false)}
                className="px-4 py-2 rounded-xl text-gray-700 hover:bg-gray-100 font-bold text-xs transition"
              >
                रद्द करें (Cancel)
              </button>
              <button
                onClick={handleConfirmClearAll}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>हाँ, सभी {students.length} रिकॉर्ड हटाएं</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {isAddEditOpen && (
        <AddEditRegistrationModal
          isOpen={isAddEditOpen}
          studentToEdit={editingStudent}
          settings={settings}
          onClose={() => {
            setIsAddEditOpen(false);
            setEditingStudent(null);
          }}
          onSave={handleSaveStudent}
          totalExistingCount={students.length}
        />
      )}

      {isReceiptOpen && receiptStudent && (
        <RegistrationFeeReceiptModal
          isOpen={isReceiptOpen}
          student={receiptStudent}
          settings={settings}
          onClose={() => {
            setIsReceiptOpen(false);
            setReceiptStudent(null);
          }}
        />
      )}

      {isUploadOpen && (
        <RegistrationUploadModal
          isOpen={isUploadOpen}
          settings={settings}
          onClose={() => setIsUploadOpen(false)}
          onImport={handleBulkImport}
          currentTotalStudents={students.length}
        />
      )}

      {isAuditOpen && (
        <RegistrationDocAuditModal
          isOpen={isAuditOpen}
          students={students}
          settings={settings}
          onClose={() => setIsAuditOpen(false)}
          onSelectStudent={(stu) => {
            setEditingStudent(stu);
            setIsAddEditOpen(true);
          }}
        />
      )}

      {isPaymentOpen && paymentStudent && (
        <RegistrationRecordPaymentModal
          isOpen={isPaymentOpen}
          student={paymentStudent}
          settings={settings}
          onClose={() => {
            setIsPaymentOpen(false);
            setPaymentStudent(null);
          }}
          onSavePayment={(updatedStu) => {
            onUpdateStudents(students.map(s => s.id === updatedStu.id ? updatedStu : s));
            handleOpenReceipt(updatedStu);
          }}
        />
      )}
    </div>
  );
};
