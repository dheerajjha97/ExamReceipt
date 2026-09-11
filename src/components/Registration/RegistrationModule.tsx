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
  FileCheck,
  Check,
  TrendingUp,
  X
} from 'lucide-react';
import { 
  RegistrationStudent, 
  InstituteSettings, 
  CasteCategory, 
  PaymentStatus,
  RegistrationDocStatus,
  RegistrationDocuments,
  calculateRegistrationFee,
  isBSEBBoard,
  normalizeStream,
  isStreamMatching
} from '../../types';
import { AddEditRegistrationModal } from './AddEditRegistrationModal';
import { RegistrationFeeReceiptModal } from './RegistrationFeeReceiptModal';
import { RegistrationUploadModal } from './RegistrationUploadModal';
import { RegistrationDocAuditModal } from './RegistrationDocAuditModal';
import { FormSubmitDocChecklistModal } from '../FormSubmitDocChecklistModal';
import { RegistrationRecordPaymentModal } from './RegistrationRecordPaymentModal';
import { RegistrationLedger } from './RegistrationLedger';
import { RegistrationDashboardOverview } from './RegistrationDashboardOverview';
import { RegistrationDailySettlement } from './RegistrationDailySettlement';
import { PWAInstallButton } from '../PWA/PWAInstallButton';

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
  // Navigation Sub-tab State
  const [activeRegistrationTab, setActiveRegistrationTab] = useState<'students' | 'ledger' | 'audit' | 'daybook' | 'overview'>('students');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStream, setSelectedStream] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('ALL');
  const [selectedDocFilter, setSelectedDocFilter] = useState<string>('ALL');
  const [selectedFormStatus, setSelectedFormStatus] = useState<string>('ALL');

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

  // Document Verification Checklist Popup State
  const [isDocChecklistOpen, setIsDocChecklistOpen] = useState(false);
  const [docChecklistStudent, setDocChecklistStudent] = useState<RegistrationStudent | null>(null);


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
      if (selectedStream !== 'ALL' && !isStreamMatching(stu.stream, selectedStream)) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL' && stu.casteCategory !== selectedCategory) {
        return false;
      }

      // Payment Status filter
      if (selectedPaymentStatus === 'PAID' && stu.paymentStatus !== 'PAID') {
        return false;
      }
      if (selectedPaymentStatus === 'PAID_515') {
        const isBsebOr515 = isBSEBBoard(stu.boardName || stu.matricBoard) || stu.registrationFee === 515 || (stu.feeBreakup?.totalFee === 515);
        if (stu.paymentStatus !== 'PAID' || !isBsebOr515) {
          return false;
        }
      }
      if (selectedPaymentStatus === 'PAID_715') {
        const isOtherOr715 = !isBSEBBoard(stu.boardName || stu.matricBoard) || stu.registrationFee === 715 || (stu.feeBreakup?.totalFee === 715);
        if (stu.paymentStatus !== 'PAID' || !isOtherOr715) {
          return false;
        }
      }
      if (selectedPaymentStatus === 'UNPAID' && stu.paymentStatus === 'PAID') {
        return false;
      }

      // Form Status filter (फॉर्म लिया / फॉर्म जमा)
      if (selectedFormStatus === 'ISSUED' && !stu.isFormIssued) {
        return false;
      }
      if (selectedFormStatus === 'NOT_ISSUED' && stu.isFormIssued) {
        return false;
      }
      if (selectedFormStatus === 'SUBMITTED' && !stu.isFormSubmitted) {
        return false;
      }
      if (selectedFormStatus === 'NOT_SUBMITTED' && stu.isFormSubmitted) {
        return false;
      }
      if (selectedFormStatus === 'PENDING_SUBMIT' && (!stu.isFormIssued || stu.isFormSubmitted)) {
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
  }, [students, searchTerm, selectedStream, selectedCategory, selectedPaymentStatus, selectedDocFilter, selectedFormStatus]);

  // Key metrics calculation
  const totalCount = students.length;
  const paidCount = students.filter(s => s.paymentStatus === 'PAID').length;
  const unpaidCount = totalCount - paidCount;
  const totalCollectedFee = students.reduce((sum, s) => {
    if (s.paymentStatus === 'PAID') {
      const fee = s.paidAmount > 0 ? s.paidAmount : (s.registrationFee || (isBSEBBoard(s.boardName || s.matricBoard) ? 515 : 715));
      return sum + fee;
    }
    return sum;
  }, 0);
  const totalPendingFee = students.reduce((sum, s) => {
    if (s.paymentStatus !== 'PAID') {
      const fee = s.registrationFee || (isBSEBBoard(s.boardName || s.matricBoard) ? 515 : 715);
      return sum + fee;
    }
    return sum;
  }, 0);

  const missingTcCount = students.filter(s => s.documents?.transferCertificate?.status !== 'SUBMITTED').length;
  const missingApaarCount = students.filter(s => s.documents?.apaar?.status !== 'SUBMITTED').length;
  const missingCasteCount = students.filter(s => {
    const req = s.casteCategory === 'EBC' || s.casteCategory === 'SC' || s.casteCategory === 'ST';
    return req && s.documents?.casteCertificate?.status !== 'SUBMITTED';
  }).length;

  const formIssuedCount = students.filter(s => s.isFormIssued).length;
  const formSubmittedCount = students.filter(s => s.isFormSubmitted).length;
  const formPendingSubmitCount = students.filter(s => s.isFormIssued && !s.isFormSubmitted).length;

  // Stream counts (Robust stream classification)
  const scienceCount = students.filter(s => isStreamMatching(s.stream, 'Science')).length;
  const artsCount = students.filter(s => isStreamMatching(s.stream, 'Arts')).length;
  const commerceCount = students.filter(s => isStreamMatching(s.stream, 'Commerce')).length;
  const vocationalCount = students.filter(s => isStreamMatching(s.stream, 'Vocational')).length;

  // Fee counts by board rate
  const paid515Count = students.filter(s => s.paymentStatus === 'PAID' && (isBSEBBoard(s.boardName || s.matricBoard) || s.registrationFee === 515 || (s.feeBreakup?.totalFee === 515))).length;
  const paid715Count = students.filter(s => s.paymentStatus === 'PAID' && (!isBSEBBoard(s.boardName || s.matricBoard) || s.registrationFee === 715 || (s.feeBreakup?.totalFee === 715))).length;

  // Handlers
  const handleStreamChange = (studentId: string, newStream: string) => {
    const updatedList = students.map((stu) => {
      if (stu.id !== studentId) return stu;
      return {
        ...stu,
        stream: normalizeStream(newStream),
        updatedAt: new Date().toISOString(),
      };
    });
    onUpdateStudents(updatedList);
  };

  const handleToggleFormIssued = (studentId: string) => {
    const updatedList = students.map((stu) => {
      if (stu.id !== studentId) return stu;
      const nextIssued = !stu.isFormIssued;
      return {
        ...stu,
        isFormIssued: nextIssued,
        formIssuedDate: nextIssued ? (stu.formIssuedDate || new Date().toLocaleDateString('en-GB')) : undefined,
        // If un-issuing form, automatically un-submit
        isFormSubmitted: nextIssued ? stu.isFormSubmitted : false,
        formSubmittedDate: nextIssued ? stu.formSubmittedDate : undefined,
        updatedAt: new Date().toISOString(),
      };
    });
    onUpdateStudents(updatedList);
  };

  const handleOpenDocChecklistForSubmit = (student: RegistrationStudent) => {
    setDocChecklistStudent(student);
    setIsDocChecklistOpen(true);
  };

  const handleConfirmDocChecklistSubmit = (
    verifiedDocs: Record<string, { submitted: boolean; docNumber?: string; remarks?: string }>,
    submissionDate: string
  ) => {
    if (!docChecklistStudent) return;

    const isEbcScSt =
      docChecklistStudent.casteCategory === 'EBC' ||
      docChecklistStudent.casteCategory === 'SC' ||
      docChecklistStudent.casteCategory === 'ST';

    const updatedDocs: RegistrationDocuments = {
      aadhar: {
        ...(docChecklistStudent.documents?.aadhar || { status: 'PENDING' }),
        status: verifiedDocs.aadhar?.submitted ? 'SUBMITTED' : 'PENDING',
        verified: verifiedDocs.aadhar?.submitted,
        docNumber: verifiedDocs.aadhar?.docNumber || docChecklistStudent.documents?.aadhar?.docNumber,
        remarks: verifiedDocs.aadhar?.remarks,
      },
      apaar: {
        ...(docChecklistStudent.documents?.apaar || { status: 'PENDING' }),
        status: verifiedDocs.apaar?.submitted ? 'SUBMITTED' : 'PENDING',
        verified: verifiedDocs.apaar?.submitted,
        docNumber: verifiedDocs.apaar?.docNumber || docChecklistStudent.documents?.apaar?.docNumber,
        remarks: verifiedDocs.apaar?.remarks,
      },
      transferCertificate: {
        ...(docChecklistStudent.documents?.transferCertificate || { status: 'PENDING' }),
        status: verifiedDocs.transferCertificate?.submitted ? 'SUBMITTED' : 'PENDING',
        verified: verifiedDocs.transferCertificate?.submitted,
        docNumber: verifiedDocs.transferCertificate?.docNumber || docChecklistStudent.documents?.transferCertificate?.docNumber,
        remarks: verifiedDocs.transferCertificate?.remarks,
      },
      casteCertificate: {
        ...(docChecklistStudent.documents?.casteCertificate || { status: 'PENDING' }),
        status: isEbcScSt ? (verifiedDocs.casteCertificate?.submitted ? 'SUBMITTED' : 'PENDING') : 'EXEMPTED',
        verified: isEbcScSt ? verifiedDocs.casteCertificate?.submitted : true,
        docNumber: verifiedDocs.casteCertificate?.docNumber || docChecklistStudent.documents?.casteCertificate?.docNumber,
        remarks: verifiedDocs.casteCertificate?.remarks,
      },
      matricMarksheet: {
        ...(docChecklistStudent.documents?.matricMarksheet || { status: 'PENDING' }),
        status: verifiedDocs.matricMarksheet?.submitted ? 'SUBMITTED' : 'PENDING',
        verified: verifiedDocs.matricMarksheet?.submitted,
        docNumber: verifiedDocs.matricMarksheet?.docNumber || docChecklistStudent.documents?.matricMarksheet?.docNumber,
        remarks: verifiedDocs.matricMarksheet?.remarks,
      },
      photoSign: {
        status: verifiedDocs.photoSign?.submitted ? 'SUBMITTED' : 'PENDING',
        verified: verifiedDocs.photoSign?.submitted,
        remarks: verifiedDocs.photoSign?.remarks,
      },
    };

    const allMandatoryDone =
      updatedDocs.aadhar.status === 'SUBMITTED' &&
      updatedDocs.transferCertificate.status === 'SUBMITTED' &&
      updatedDocs.matricMarksheet.status === 'SUBMITTED' &&
      (!isEbcScSt || updatedDocs.casteCertificate.status === 'SUBMITTED');

    let regStatus = docChecklistStudent.registrationStatus;
    if (allMandatoryDone && docChecklistStudent.paymentStatus === 'PAID') {
      regStatus = 'COMPLETED';
    } else if (allMandatoryDone) {
      regStatus = 'DOCS_VERIFIED';
    } else {
      regStatus = 'PENDING_DOCS';
    }

    const updatedList = students.map((stu) => {
      if (stu.id !== docChecklistStudent.id) return stu;
      return {
        ...stu,
        isFormIssued: true,
        formIssuedDate: stu.formIssuedDate || submissionDate.split(' ')[0] || new Date().toLocaleDateString('en-GB'),
        isFormSubmitted: true,
        formSubmittedDate: submissionDate,
        documents: updatedDocs,
        registrationStatus: regStatus,
        updatedAt: new Date().toISOString(),
      };
    });

    onUpdateStudents(updatedList);
    setIsDocChecklistOpen(false);
    setDocChecklistStudent(null);
  };

  const handleToggleFormSubmitted = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    if (!student.isFormSubmitted) {
      // Opening Document Checklist Popup before submitting form
      handleOpenDocChecklistForSubmit(student);
    } else {
      // Direct untoggle if already submitted
      const updatedList = students.map((stu) => {
        if (stu.id !== studentId) return stu;
        return {
          ...stu,
          isFormSubmitted: false,
          formSubmittedDate: undefined,
          updatedAt: new Date().toISOString(),
        };
      });
      onUpdateStudents(updatedList);
    }
  };

  const handleCategoryChange = (studentId: string, newCategory: CasteCategory) => {
    const updatedList = students.map((stu) => {
      if (stu.id !== studentId) return stu;

      const isEbcScSt = newCategory === 'EBC' || newCategory === 'SC' || newCategory === 'ST';
      const existingCasteDoc = stu.documents?.casteCertificate;
      
      let newCasteDocStatus: RegistrationDocStatus = existingCasteDoc?.status || 'PENDING';
      if (!isEbcScSt) {
        newCasteDocStatus = 'EXEMPTED';
      } else if (newCasteDocStatus === 'EXEMPTED') {
        newCasteDocStatus = 'PENDING';
      }

      const updatedDocs: RegistrationDocuments = {
        aadhar: stu.documents?.aadhar || { status: 'PENDING' },
        apaar: stu.documents?.apaar || { status: 'PENDING' },
        transferCertificate: stu.documents?.transferCertificate || { status: 'PENDING' },
        matricMarksheet: stu.documents?.matricMarksheet || { status: 'PENDING' },
        ...stu.documents,
        casteCertificate: {
          ...(existingCasteDoc || { status: 'PENDING' }),
          status: newCasteDocStatus,
          verified: newCasteDocStatus === 'SUBMITTED',
        },
      };

      const allMandatoryDone =
        updatedDocs.aadhar.status === 'SUBMITTED' &&
        updatedDocs.transferCertificate.status === 'SUBMITTED' &&
        updatedDocs.matricMarksheet.status === 'SUBMITTED' &&
        (!isEbcScSt || updatedDocs.casteCertificate.status === 'SUBMITTED');

      let regStatus = stu.registrationStatus;
      if (allMandatoryDone && stu.paymentStatus === 'PAID') {
        regStatus = 'COMPLETED';
      } else if (allMandatoryDone) {
        regStatus = 'DOCS_VERIFIED';
      } else {
        regStatus = 'PENDING_DOCS';
      }

      return {
        ...stu,
        casteCategory: newCategory,
        documents: updatedDocs,
        registrationStatus: regStatus,
        updatedAt: new Date().toISOString(),
      };
    });

    onUpdateStudents(updatedList);
  };

  const handleSetAllStudentsDocsNo = () => {
    if (students.length === 0) return;
    if (!window.confirm('क्या आप वाकई सभी पंजीकृत छात्रों के आवश्यक दस्तावेजों और फॉर्म स्थिति (लिया/जमा) को "NO" (लंबित) स्थिति में रीसेट करना चाहते हैं?')) {
      return;
    }
    const updatedList = students.map((stu) => {
      const isEbcScSt = stu.casteCategory === 'EBC' || stu.casteCategory === 'SC' || stu.casteCategory === 'ST';
      const updatedDocs: RegistrationDocuments = {
        aadhar: { ...(stu.documents?.aadhar || { status: 'PENDING' }), status: 'PENDING', verified: false },
        apaar: { ...(stu.documents?.apaar || { status: 'PENDING' }), status: 'PENDING', verified: false },
        transferCertificate: { ...(stu.documents?.transferCertificate || { status: 'PENDING' }), status: 'PENDING', verified: false },
        casteCertificate: {
          ...(stu.documents?.casteCertificate || { status: 'PENDING' }),
          status: isEbcScSt ? 'PENDING' : 'EXEMPTED',
          verified: false,
        },
        matricMarksheet: { ...(stu.documents?.matricMarksheet || { status: 'PENDING' }), status: 'PENDING', verified: false },
      };

      return {
        ...stu,
        isFormIssued: false,
        formIssuedDate: undefined,
        isFormSubmitted: false,
        formSubmittedDate: undefined,
        documents: updatedDocs,
        registrationStatus: 'PENDING_DOCS',
        updatedAt: new Date().toISOString(),
      };
    });

    onUpdateStudents(updatedList);
  };

  const handleToggleDocStatus = (
    studentId: string,
    docKey: 'aadhar' | 'apaar' | 'transferCertificate' | 'casteCertificate' | 'matricMarksheet'
  ) => {
    const updatedList = students.map((stu) => {
      if (stu.id !== studentId) return stu;

      const currentDoc = stu.documents?.[docKey] || { status: 'PENDING' };
      const currentStatus = currentDoc.status;
      const newStatus: RegistrationDocStatus = currentStatus === 'SUBMITTED' ? 'PENDING' : 'SUBMITTED';

      const updatedDocs: RegistrationDocuments = {
        aadhar: stu.documents?.aadhar || { status: 'PENDING' },
        apaar: stu.documents?.apaar || { status: 'PENDING' },
        transferCertificate: stu.documents?.transferCertificate || { status: 'PENDING' },
        casteCertificate: stu.documents?.casteCertificate || { status: 'PENDING' },
        matricMarksheet: stu.documents?.matricMarksheet || { status: 'PENDING' },
        ...stu.documents,
        [docKey]: {
          ...currentDoc,
          status: newStatus,
          verified: newStatus === 'SUBMITTED',
        },
      };

      const isEbcScSt = stu.casteCategory === 'EBC' || stu.casteCategory === 'SC' || stu.casteCategory === 'ST';
      const allMandatoryDone =
        updatedDocs.aadhar.status === 'SUBMITTED' &&
        updatedDocs.transferCertificate.status === 'SUBMITTED' &&
        updatedDocs.matricMarksheet.status === 'SUBMITTED' &&
        (!isEbcScSt || updatedDocs.casteCertificate.status === 'SUBMITTED');

      let regStatus = stu.registrationStatus;
      if (allMandatoryDone && stu.paymentStatus === 'PAID') {
        regStatus = 'COMPLETED';
      } else if (allMandatoryDone) {
        regStatus = 'DOCS_VERIFIED';
      } else {
        regStatus = 'PENDING_DOCS';
      }

      return {
        ...stu,
        documents: updatedDocs,
        registrationStatus: regStatus,
        updatedAt: new Date().toISOString(),
      };
    });

    onUpdateStudents(updatedList);
  };

  const handleMarkAllDocs = (studentId: string, markSubmitted: boolean) => {
    const updatedList = students.map((stu) => {
      if (stu.id !== studentId) return stu;
      const targetStatus: RegistrationDocStatus = markSubmitted ? 'SUBMITTED' : 'PENDING';
      const isEbcScSt = stu.casteCategory === 'EBC' || stu.casteCategory === 'SC' || stu.casteCategory === 'ST';

      const updatedDocs: RegistrationDocuments = {
        aadhar: { ...(stu.documents?.aadhar || { status: 'PENDING' }), status: targetStatus, verified: markSubmitted },
        apaar: { ...(stu.documents?.apaar || { status: 'PENDING' }), status: targetStatus, verified: markSubmitted },
        transferCertificate: { ...(stu.documents?.transferCertificate || { status: 'PENDING' }), status: targetStatus, verified: markSubmitted },
        casteCertificate: {
          ...(stu.documents?.casteCertificate || { status: 'PENDING' }),
          status: isEbcScSt ? targetStatus : 'EXEMPTED',
          verified: isEbcScSt ? markSubmitted : true,
        },
        matricMarksheet: { ...(stu.documents?.matricMarksheet || { status: 'PENDING' }), status: targetStatus, verified: markSubmitted },
      };

      return {
        ...stu,
        documents: updatedDocs,
        registrationStatus: markSubmitted ? (stu.paymentStatus === 'PAID' ? 'COMPLETED' : 'DOCS_VERIFIED') : 'PENDING_DOCS',
        updatedAt: new Date().toISOString(),
      };
    });

    onUpdateStudents(updatedList);
  };

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
                इंटरमीडिएट पंजीकरण एवं शुल्क प्रबंधन
              </h1>
            </div>
            <p className="text-xs text-[#5A5A40]">
              {settings.name} &bull; सत्र 2026-2027 (BSEB: ₹515 &bull; अन्य बोर्ड: ₹715)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <PWAInstallButton />

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

      {/* 11th Registration Dedicated Sub-Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-xl p-2 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => setActiveRegistrationTab('students')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeRegistrationTab === 'students'
                ? 'bg-[#2E5B50] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>11वीं छात्र पंजीयन सूची</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeRegistrationTab === 'students' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {totalCount}
            </span>
          </button>

          <button
            onClick={() => setActiveRegistrationTab('ledger')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeRegistrationTab === 'ledger'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>11वीं रोकड़ लेज़र (Ledger)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeRegistrationTab === 'ledger' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              ₹{totalCollectedFee.toLocaleString('en-IN')}
            </span>
          </button>

          <button
            onClick={() => setActiveRegistrationTab('doc_audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeRegistrationTab === 'doc_audit'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>5 दस्तावेज़ ऑडिट</span>
            {(missingTcCount + missingApaarCount + missingCasteCount) > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeRegistrationTab === 'doc_audit' ? 'bg-amber-900 text-white' : 'bg-amber-100 text-amber-900'
              }`}>
                {missingTcCount + missingApaarCount + missingCasteCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveRegistrationTab('daybook')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeRegistrationTab === 'daybook'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>दैनिक रोकड़ पर्ची (Day-Book)</span>
          </button>

          <button
            onClick={() => setActiveRegistrationTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeRegistrationTab === 'overview'
                ? 'bg-indigo-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>सांख्यिकी सारांश (Analytics)</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Student List / Directory */}
      {activeRegistrationTab === 'students' && (
        <div className="space-y-6">
      {/* Glassmorphic Metric Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Registered */}
        <div className="bg-white/70 backdrop-blur-xl p-5 rounded-3xl border border-white/60 shadow-md flex items-center justify-between">
          <div>
            <div className="text-xs text-[#5A5A40] font-semibold">कुल पंजीकृत छात्र</div>
            <div className="text-2xl font-black text-[#2E5B50] mt-1">{totalCount}</div>
            <div className="flex items-center gap-1.5 flex-wrap mt-2">
              <button
                type="button"
                onClick={() => setSelectedStream('ALL')}
                className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition cursor-pointer ${
                  selectedStream === 'ALL'
                    ? 'bg-[#2E5B50] text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="सभी संकाय देखें"
              >
                सभी: {totalCount}
              </button>
              <button
                type="button"
                onClick={() => setSelectedStream('Arts')}
                className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition cursor-pointer ${
                  selectedStream === 'Arts'
                    ? 'bg-orange-600 text-white shadow-2xs'
                    : 'bg-orange-50 text-orange-900 border border-orange-200 hover:bg-orange-100'
                }`}
                title="केवल कला (Arts) छात्र फ़िल्टर करें"
              >
                कला: {artsCount}
              </button>
              <button
                type="button"
                onClick={() => setSelectedStream('Science')}
                className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition cursor-pointer ${
                  selectedStream === 'Science'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100'
                }`}
                title="केवल विज्ञान (Science) छात्र फ़िल्टर करें"
              >
                विज्ञान: {scienceCount}
              </button>
              <button
                type="button"
                onClick={() => setSelectedStream('Commerce')}
                className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition cursor-pointer ${
                  selectedStream === 'Commerce'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                }`}
                title="केवल वाणिज्य (Commerce) छात्र फ़िल्टर करें"
              >
                वाणिज्य: {commerceCount}
              </button>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#2E5B50] shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Total Fee Collected */}
        <div className="bg-white/70 backdrop-blur-xl p-5 rounded-3xl border border-white/60 shadow-md flex items-center justify-between">
          <div>
            <div className="text-xs text-[#5A5A40] font-semibold">कुल संकलित पंजीकरण शुल्क</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">₹{totalCollectedFee.toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-emerald-800 mt-1 font-medium flex items-center gap-1.5 flex-wrap">
              <span>{paidCount} पूर्ण भुगतान</span>
              <span>&bull;</span>
              <span className="font-bold text-[#2E5B50] bg-emerald-100/80 px-1.5 py-0.5 rounded-md">₹515 (BSEB): {paid515Count}</span>
              <span>&bull;</span>
              <span className="font-bold text-blue-900 bg-blue-100/80 px-1.5 py-0.5 rounded-md">₹715 (अन्य बोर्ड): {paid715Count}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-3 relative">
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

          {/* Form Status Filter (फॉर्म लिया / फॉर्म जमा) */}
          <div className="md:col-span-2">
            <select
              value={selectedFormStatus}
              onChange={(e) => setSelectedFormStatus(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/90 rounded-2xl border border-blue-300 text-xs font-bold text-blue-900 focus:ring-2 focus:ring-[#2E5B50]"
            >
              <option value="ALL">फॉर्म स्थिति (All)</option>
              <option value="ISSUED">✓ फॉर्म लिया (Issued)</option>
              <option value="NOT_ISSUED">✗ फॉर्म नहीं लिया (Not Issued)</option>
              <option value="SUBMITTED">✓ फॉर्म जमा किया (Submitted)</option>
              <option value="NOT_SUBMITTED">✗ फॉर्म जमा नहीं (Not Submitted)</option>
              <option value="PENDING_SUBMIT">⚠️ फॉर्म लिया पर जमा बाकी</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="md:col-span-1.5">
            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/90 rounded-2xl border border-[#DDD8C5] text-xs font-semibold text-gray-700 focus:ring-2 focus:ring-[#2E5B50]"
            >
              <option value="ALL">शुल्क स्थिति (All)</option>
              <option value="PAID">✓ सभी पूर्ण प्राप्त ({paidCount})</option>
              <option value="PAID_515">₹515 प्राप्त (BSEB)</option>
              <option value="PAID_715">₹715 प्राप्त (अन्य बोर्ड / CBSE)</option>
              <option value="UNPAID">✗ बकाया ({unpaidCount})</option>
            </select>
          </div>

          {/* Doc Compliance Filter */}
          <div className="md:col-span-1.5">
            <select
              value={selectedDocFilter}
              onChange={(e) => setSelectedDocFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/90 rounded-2xl border border-amber-300 text-xs font-bold text-amber-900 focus:ring-2 focus:ring-[#2E5B50]"
            >
              <option value="ALL">दस्तावेज फ़िल्टर</option>
              <option value="MISSING_TC">लंबित TC</option>
              <option value="MISSING_APAAR">अनुपलब्ध APAAR</option>
              <option value="MISSING_CASTE">लंबित जाति प्रमाण</option>
            </select>
          </div>
        </div>

        {/* Quick Audit Bar & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-[#E8E4D5] text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#5A5A40] font-semibold whitespace-nowrap">
              दर्शाए गए छात्र: <strong className="text-[#2E5B50]">{filteredStudents.length}</strong> / {totalCount}
            </span>
            {/* Form stats pill */}
            <span className="px-2.5 py-1 bg-blue-50 text-blue-900 rounded-xl font-bold text-[11px] border border-blue-200 whitespace-nowrap">
              फॉर्म लिया: {formIssuedCount} &bull; फॉर्म जमा: {formSubmittedCount} &bull; बाकी: {formPendingSubmitCount}
            </span>
            {selectedFormStatus !== 'ALL' && (
              <span className="px-2.5 py-1 bg-blue-100 text-blue-900 rounded-xl font-bold text-[10.5px] whitespace-nowrap">
                फॉर्म फ़िल्टर सक्रिय
              </span>
            )}
            {selectedDocFilter !== 'ALL' && (
              <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-xl font-bold text-[10.5px] whitespace-nowrap">
                दस्तावेज फ़िल्टर सक्रिय
              </span>
            )}
            {selectedPaymentStatus !== 'ALL' && (
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-xl font-bold text-[10.5px] whitespace-nowrap">
                शुल्क फ़िल्टर सक्रिय
              </span>
            )}
            {selectedCategory !== 'ALL' && (
              <span className="px-2.5 py-1 bg-purple-100 text-purple-900 rounded-xl font-bold text-[10.5px] whitespace-nowrap">
                कोटि: {selectedCategory}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
            {students.length > 0 && (
              <button
                type="button"
                onClick={handleSetAllStudentsDocsNo}
                className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-800 font-bold text-xs flex items-center gap-1.5 transition shadow-2xs whitespace-nowrap cursor-pointer"
                title="सभी छात्रों के आवश्यक दस्तावेजों को 'NO' (लंबित) पर सेट करें"
              >
                <X className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span>सबको No करें</span>
              </button>
            )}
            {students.length > 0 && (
              <button
                type="button"
                onClick={() => setIsConfirmClearAllOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition shadow-2xs whitespace-nowrap cursor-pointer"
                title="सभी पंजीकरण रिकॉर्ड हटाएं (Clear All Data)"
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                <span>सभी हटाएं ({students.length})</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsAuditOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1.5 transition shadow-2xs whitespace-nowrap cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>दस्तावेज ऑडिट रिपोर्ट</span>
            </button>
            <button
              type="button"
              onClick={handlePrintRegister}
              className="px-3 py-1.5 rounded-xl bg-[#FAF9F5] hover:bg-[#EFECE1] border border-[#DDD8C5] text-[#2E5B50] font-bold text-xs flex items-center gap-1.5 transition shadow-2xs whitespace-nowrap cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 shrink-0" />
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
                <th className="p-3.5">OFSS NO.</th>
                <th className="p-3.5">NAME (छात्र का नाम)</th>
                <th className="p-3.5">FATHER NAME</th>
                <th className="p-3.5">MOTHER NAME</th>
                <th className="p-3.5">DOB</th>
                <th className="p-3.5">BOARD NAME</th>
                <th className="p-3.5">CATEGORY</th>
                <th className="p-3.5">संकाय (Stream)</th>
                <th className="p-3.5">फॉर्म ट्रैकिंग (लिया / जमा)</th>
                <th className="p-3.5">आवश्यक दस्तावेज (Documents - Yes/No)</th>
                <th className="p-3.5 text-center">शुल्क (Fee)</th>
                <th className="p-3.5 text-right">कार्रवाई (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4D5]">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-12 text-center text-gray-500">
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
                            <span>+ नया पंजीकरण जोड़ें</span>
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
                  const expectedFee = stu.registrationFee || (stu.paidAmount > 0 ? stu.paidAmount : (isBSEBBoard(stu.boardName || stu.matricBoard) ? 515 : 715));

                  return (
                    <tr key={stu.id} className="hover:bg-amber-50/30 transition">
                      {/* S.No */}
                      <td className="p-3.5 font-mono text-gray-500 font-bold">{index + 1}</td>

                      {/* OFSS NO. */}
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-[#2E5B50] bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 whitespace-nowrap block">
                          {stu.ofssNo || stu.formNo}
                        </span>
                        {stu.bsebUniqueId && (
                          <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                            UID: {stu.bsebUniqueId}
                          </div>
                        )}
                      </td>

                      {/* NAME */}
                      <td className="p-3.5">
                        <strong className="text-sm font-bold text-gray-900 block uppercase">
                          {stu.studentName}
                        </strong>
                        {stu.mobile && (
                          <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                            📞 {stu.mobile}
                          </div>
                        )}
                      </td>

                      {/* FATHER NAME */}
                      <td className="p-3.5">
                        <span className="font-medium text-gray-800 uppercase block">
                          {stu.fatherName}
                        </span>
                      </td>

                      {/* MOTHER NAME */}
                      <td className="p-3.5">
                        <span className="font-medium text-gray-700 uppercase block">
                          {stu.motherName || '—'}
                        </span>
                      </td>

                      {/* DOB */}
                      <td className="p-3.5">
                        <span className="font-mono font-medium text-gray-700 whitespace-nowrap">
                          {stu.dob || '—'}
                        </span>
                      </td>

                      {/* BOARD NAME */}
                      <td className="p-3.5">
                        <span className="px-2 py-1 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg font-bold text-[11px] whitespace-nowrap">
                          {stu.boardName || stu.matricBoard || 'BSEB PATNA'}
                        </span>
                      </td>

                      {/* CATEGORY (Directly Editable in Table) */}
                      <td className="p-3.5">
                        <div className="flex flex-col gap-1 min-w-[110px]">
                          <select
                            value={stu.casteCategory}
                            onChange={(e) => handleCategoryChange(stu.id, e.target.value as CasteCategory)}
                            className={`px-2 py-1 rounded-lg text-xs font-black border transition cursor-pointer shadow-2xs focus:ring-2 focus:ring-[#2E5B50] focus:outline-hidden ${
                              stu.casteCategory === 'General'
                                ? 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100'
                                : stu.casteCategory === 'BC'
                                ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                                : stu.casteCategory === 'EBC'
                                ? 'bg-purple-50 border-purple-300 text-purple-900 hover:bg-purple-100'
                                : stu.casteCategory === 'SC'
                                ? 'bg-rose-50 border-rose-300 text-rose-900 hover:bg-rose-100'
                                : 'bg-teal-50 border-teal-300 text-teal-900 hover:bg-teal-100'
                            }`}
                            title="छात्र की कोटि (Category) बदलें - जाति प्रमाण पत्र की आवश्यकता तुरंत अपडेट होगी"
                          >
                            <option value="General">General</option>
                            <option value="BC">BC</option>
                            <option value="EBC">EBC</option>
                            <option value="SC">SC</option>
                            <option value="ST">ST</option>
                          </select>
                          <span className="text-[9.5px] text-gray-500 font-medium">
                            {stu.casteCategory === 'EBC' || stu.casteCategory === 'SC' || stu.casteCategory === 'ST' 
                              ? '⚠️ जाति प्रमाण अनिवार्य' 
                              : '✓ जाति प्रमाण छूट'}
                          </span>
                        </div>
                      </td>

                      {/* STREAM (Directly Editable in Table) */}
                      <td className="p-3.5">
                        <div className="flex flex-col gap-1 min-w-[125px]">
                          <select
                            value={normalizeStream(stu.stream)}
                            onChange={(e) => handleStreamChange(stu.id, e.target.value)}
                            className={`px-2 py-1 rounded-lg text-xs font-bold border transition cursor-pointer shadow-2xs focus:ring-2 focus:ring-[#2E5B50] focus:outline-hidden ${
                              isStreamMatching(stu.stream, 'Commerce')
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100'
                                : isStreamMatching(stu.stream, 'Science')
                                ? 'bg-blue-50 border-blue-300 text-blue-900 hover:bg-blue-100'
                                : isStreamMatching(stu.stream, 'Arts')
                                ? 'bg-orange-50 border-orange-300 text-orange-900 hover:bg-orange-100'
                                : 'bg-purple-50 border-purple-300 text-purple-900 hover:bg-purple-100'
                            }`}
                            title="संकाय (Stream) बदलें - Arts, Science, Commerce"
                          >
                            <option value="Arts (I.A)">कला • Arts (I.A)</option>
                            <option value="Science (I.Sc)">विज्ञान • Science (I.Sc)</option>
                            <option value="Commerce (I.Com)">वाणिज्य • Commerce (I.Com)</option>
                            <option value="Vocational">व्यावसायिक • Vocational</option>
                          </select>
                        </div>
                      </td>

                      {/* FORM TRACKING (फॉर्म लिया / फॉर्म जमा - YES/NO Toggles) */}
                      <td className="p-3.5">
                        <div className="flex flex-col gap-1.5 min-w-[195px]">
                          {/* 1. Form Issued Toggle */}
                          <div className={`flex items-center justify-between gap-1 px-2 py-1 rounded-xl border transition ${
                            stu.isFormIssued 
                              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
                              : 'bg-rose-50/60 border-rose-200 text-rose-900'
                          }`}>
                            <span className="text-[11px] font-bold">1. फॉर्म लिया:</span>
                            <button
                              type="button"
                              onClick={() => handleToggleFormIssued(stu.id)}
                              className={`px-2 py-0.5 rounded-lg text-xs font-black shadow-2xs transition flex items-center gap-0.5 cursor-pointer ${
                                stu.isFormIssued
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  : 'bg-rose-600 hover:bg-rose-700 text-white'
                              }`}
                              title="क्लिक करके Yes/No बदलें (क्या छात्र ने फॉर्म लिया है?)"
                            >
                              <span>{stu.isFormIssued ? 'YES ✓' : 'NO ✗'}</span>
                            </button>
                          </div>

                          {/* 2. Form Submitted Toggle */}
                          <div className={`flex items-center justify-between gap-1 px-2 py-1 rounded-xl border transition ${
                            stu.isFormSubmitted 
                              ? 'bg-blue-50/80 border-blue-200 text-blue-900' 
                              : 'bg-rose-50/60 border-rose-200 text-rose-900'
                          }`}>
                            <span className="text-[11px] font-bold">2. फॉर्म जमा:</span>
                            <button
                              type="button"
                              onClick={() => handleToggleFormSubmitted(stu.id)}
                              className={`px-2 py-0.5 rounded-lg text-xs font-black shadow-2xs transition flex items-center gap-0.5 cursor-pointer ${
                                stu.isFormSubmitted
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                  : 'bg-rose-600 hover:bg-rose-700 text-white'
                              }`}
                              title="क्लिक करके Yes/No बदलें (क्या छात्र ने फॉर्म जमा किया है?)"
                            >
                              <span>{stu.isFormSubmitted ? 'YES ✓' : 'NO ✗'}</span>
                            </button>
                          </div>

                          {/* Date summary tags if set */}
                          {(stu.isFormIssued || stu.isFormSubmitted) && (
                            <div className="flex items-center justify-between text-[9.5px] font-mono text-gray-500 px-0.5">
                              {stu.isFormIssued && <span>लिया: {stu.formIssuedDate || 'आज'}</span>}
                              {stu.isFormSubmitted && <span>जमा: {stu.formSubmittedDate || 'आज'}</span>}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Required Documents Toggle Buttons (Yes / No) */}
                      <td className="p-3.5">
                        {(() => {
                          const isAadharSubmitted = stu.documents?.aadhar?.status === 'SUBMITTED';
                          const isApaarSubmitted = stu.documents?.apaar?.status === 'SUBMITTED';
                          const isTcSubmitted = stu.documents?.transferCertificate?.status === 'SUBMITTED';
                          const isMarksheetSubmitted = stu.documents?.matricMarksheet?.status === 'SUBMITTED';
                          const isCasteReq = stu.casteCategory === 'EBC' || stu.casteCategory === 'SC' || stu.casteCategory === 'ST';
                          const isCasteSubmitted = stu.documents?.casteCertificate?.status === 'SUBMITTED';

                          const submittedDocsCount = 
                            (isAadharSubmitted ? 1 : 0) +
                            (isApaarSubmitted ? 1 : 0) +
                            (isTcSubmitted ? 1 : 0) +
                            (isMarksheetSubmitted ? 1 : 0) +
                            (isCasteReq ? (isCasteSubmitted ? 1 : 0) : 1);
                          const totalReqDocs = isCasteReq ? 5 : 4;
                          const allDone = submittedDocsCount >= totalReqDocs;

                          return (
                            <div className="flex flex-col gap-1.5 min-w-[280px]">
                              {/* Summary header, Category quick changer & Quick All Yes/No buttons */}
                              <div className="flex items-center justify-between text-[11px] pb-1 border-b border-gray-100 gap-1 flex-wrap">
                                <span className="flex items-center gap-1.5 font-bold">
                                  <span className={`w-2 h-2 rounded-full ${allDone ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-amber-500'}`} />
                                  <span className={allDone ? 'text-emerald-800' : 'text-amber-800'}>
                                    {submittedDocsCount}/{totalReqDocs} जमा
                                  </span>
                                </span>

                                <div className="flex items-center gap-1">
                                  {/* Quick category select right here inside document panel */}
                                  <div className="flex items-center gap-0.5 bg-gray-50 px-1 py-0.5 rounded border border-gray-200" title="कोटि (Category) बदलें">
                                    <span className="text-[9.5px] text-gray-500 font-bold">कोटि:</span>
                                    <select
                                      value={stu.casteCategory}
                                      onChange={(e) => handleCategoryChange(stu.id, e.target.value as CasteCategory)}
                                      className="text-[10px] font-black bg-white border border-gray-300 rounded px-1 py-0.2 text-gray-800 focus:outline-hidden cursor-pointer"
                                    >
                                      <option value="General">GEN</option>
                                      <option value="BC">BC</option>
                                      <option value="EBC">EBC</option>
                                      <option value="SC">SC</option>
                                      <option value="ST">ST</option>
                                    </select>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleMarkAllDocs(stu.id, true)}
                                    className="px-1.5 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold transition flex items-center gap-0.5 shadow-2xs cursor-pointer"
                                    title="सभी आवश्यक दस्तावेज एक साथ YES (जमा) करें"
                                  >
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span>सब Yes</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMarkAllDocs(stu.id, false)}
                                    className="px-1.5 py-0.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold transition flex items-center gap-0.5 shadow-2xs cursor-pointer"
                                    title="सभी दस्तावेज एक साथ NO (लंबित) करें"
                                  >
                                    <X className="w-3 h-3 text-rose-600" />
                                    <span>No</span>
                                  </button>
                                </div>
                              </div>

                              {/* Document Toggle Buttons */}
                              <div className="flex flex-wrap items-center gap-1">
                                {/* 1. आधार (Aadhaar) */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleDocStatus(stu.id, 'aadhar')}
                                  className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold border transition flex items-center gap-1 shadow-2xs cursor-pointer ${
                                    isAadharSubmitted
                                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
                                      : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300'
                                  }`}
                                  title="आधार कार्ड: क्लिक करके Yes/No बदलें"
                                >
                                  <span>आधार:</span>
                                  <span className={`px-1 py-0.2 rounded text-[9.5px] font-black ${isAadharSubmitted ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                                    {isAadharSubmitted ? 'YES ✓' : 'NO ✗'}
                                  </span>
                                </button>

                                {/* 2. अपार (APAAR) */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleDocStatus(stu.id, 'apaar')}
                                  className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold border transition flex items-center gap-1 shadow-2xs cursor-pointer ${
                                    isApaarSubmitted
                                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
                                      : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                                  }`}
                                  title="अपार आईडी: क्लिक करके Yes/No बदलें"
                                >
                                  <span>अपार:</span>
                                  <span className={`px-1 py-0.2 rounded text-[9.5px] font-black ${isApaarSubmitted ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
                                    {isApaarSubmitted ? 'YES ✓' : 'NO ✗'}
                                  </span>
                                </button>

                                {/* 3. मूल TC (SLC/TC) */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleDocStatus(stu.id, 'transferCertificate')}
                                  className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold border transition flex items-center gap-1 shadow-2xs cursor-pointer ${
                                    isTcSubmitted
                                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
                                      : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300'
                                  }`}
                                  title="मूल TC / SLC: क्लिक करके Yes/No बदलें"
                                >
                                  <span>मूल TC:</span>
                                  <span className={`px-1 py-0.2 rounded text-[9.5px] font-black ${isTcSubmitted ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                                    {isTcSubmitted ? 'YES ✓' : 'NO ✗'}
                                  </span>
                                </button>

                                {/* 4. जाति प्रमाण पत्र (Caste Certificate) */}
                                {isCasteReq ? (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleDocStatus(stu.id, 'casteCertificate')}
                                    className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold border transition flex items-center gap-1 shadow-2xs cursor-pointer ${
                                      isCasteSubmitted
                                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
                                        : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300'
                                    }`}
                                    title={`${stu.casteCategory} जाति प्रमाण पत्र: क्लिक करके Yes/No बदलें`}
                                  >
                                    <span>जाति:</span>
                                    <span className={`px-1 py-0.2 rounded text-[9.5px] font-black ${isCasteSubmitted ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                                      {isCasteSubmitted ? 'YES ✓' : 'NO ✗'}
                                    </span>
                                  </button>
                                ) : (
                                  <span 
                                    className="px-2 py-0.5 rounded-lg text-[10.5px] font-medium bg-gray-100 text-gray-500 border border-gray-200 flex items-center gap-1"
                                    title="सामान्य / पिछड़ा वर्ग (छूट)"
                                  >
                                    <span>जाति:</span>
                                    <span className="text-[9.5px] font-semibold text-gray-400">छूट (N/A)</span>
                                  </span>
                                )}

                                {/* 5. अंकपत्र (10th Marksheet) */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleDocStatus(stu.id, 'matricMarksheet')}
                                  className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold border transition flex items-center gap-1 shadow-2xs cursor-pointer ${
                                    isMarksheetSubmitted
                                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
                                      : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300'
                                  }`}
                                  title="10वीं मैट्रिक अंकपत्र: क्लिक करके Yes/No बदलें"
                                >
                                  <span>अंकपत्र:</span>
                                  <span className={`px-1 py-0.2 rounded text-[9.5px] font-black ${isMarksheetSubmitted ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                                    {isMarksheetSubmitted ? 'YES ✓' : 'NO ✗'}
                                  </span>
                                </button>
                              </div>

                              {/* Direct Checklist Popup Trigger Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenDocChecklistForSubmit(stu)}
                                className="w-full py-1 px-2 mt-0.5 rounded-lg bg-gradient-to-r from-[#2E5B50]/10 to-teal-50 hover:from-[#2E5B50]/20 hover:to-teal-100 text-[#2E5B50] font-bold text-[10.5px] border border-[#2E5B50]/30 flex items-center justify-center gap-1 transition cursor-pointer"
                                title="दस्तावेज़ सूची का पॉपअप खोलें और Yes/No करके फॉर्म जमा करें"
                              >
                                <FileCheck className="w-3.5 h-3.5 text-[#2E5B50]" />
                                <span>दस्तावेज़ सूची पॉपअप / फॉर्म जमा</span>
                              </button>
                            </div>
                          );

                        })()}
                      </td>

                      {/* Registration Fee Status */}
                      <td className="p-3.5 text-center">
                        {isPaid ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 font-bold rounded-full text-xs border border-emerald-300 flex items-center gap-1 shadow-2xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>₹{expectedFee} प्राप्त</span>
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
                              <span>₹{expectedFee} स्वीकारें</span>
                            </button>
                            <span className="text-[10px] text-rose-700 font-semibold mt-0.5">
                              शुल्क बकाया
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
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
      </div>
      )}

      {/* Tab 2: Dedicated 11th Registration Financial Ledger */}
      {activeRegistrationTab === 'ledger' && (
        <RegistrationLedger
          students={students}
          settings={settings}
          onOpenReceipt={handleOpenReceipt}
          onOpenRecordPayment={(stu) => {
            setPaymentStudent(stu);
            setIsPaymentOpen(true);
          }}
          onUpdateStudents={onUpdateStudents}
        />
      )}

      {/* Tab 3: Dedicated 11th Document Verification Audit Matrix */}
      {activeRegistrationTab === 'doc_audit' && (
        <RegistrationDocAuditModal
          isOpen={true}
          students={students}
          settings={settings}
          onClose={() => setActiveRegistrationTab('students')}
          onSelectStudent={(stu) => {
            setEditingStudent(stu);
            setIsAddEditOpen(true);
          }}
        />
      )}

      {/* Tab 4: Dedicated 11th Registration Daily Settlement Day Book */}
      {activeRegistrationTab === 'daybook' && (
        <RegistrationDailySettlement
          students={students}
          settings={settings}
        />
      )}

      {/* Tab 5: Dedicated 11th Statistics & Analytics Dashboard */}
      {activeRegistrationTab === 'overview' && (
        <RegistrationDashboardOverview
          students={students}
          settings={settings}
          onNavigateTab={(tab) => setActiveRegistrationTab(tab)}
        />
      )}

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

      {isDocChecklistOpen && docChecklistStudent && (
        <FormSubmitDocChecklistModal
          isOpen={isDocChecklistOpen}
          student={docChecklistStudent}
          instituteName={settings.instituteName}
          onClose={() => {
            setIsDocChecklistOpen(false);
            setDocChecklistStudent(null);
          }}
          onConfirmSubmit={handleConfirmDocChecklistSubmit}
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
