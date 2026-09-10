import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  FileText, 
  CreditCard, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  Info,
  Calendar,
  Phone,
  BookOpen,
  School,
  IdCard
} from 'lucide-react';
import { 
  RegistrationStudent, 
  InstituteSettings, 
  CasteCategory, 
  PaymentMode,
  RegistrationDocStatus,
  calculateRegistrationFee,
  isBSEBBoard
} from '../../types';
import { getNextRegistrationReceiptNumber } from '../../services/storageService';

interface AddEditRegistrationModalProps {
  isOpen: boolean;
  studentToEdit: RegistrationStudent | null;
  settings: InstituteSettings;
  onClose: () => void;
  onSave: (student: RegistrationStudent) => void;
  totalExistingCount: number;
}

const APAAR_REASONS = [
  'Aadhaar DOB/Name Mismatch (Under Correction at CSC)',
  'Parental Consent Letter Pending',
  'Previous Institution Server/Portal Outage',
  'DigiLocker / APAAR Portal Technical Error',
  'Not Generated Yet (Will submit within 7 days)',
  'Other'
];

export const AddEditRegistrationModal: React.FC<AddEditRegistrationModalProps> = ({
  isOpen,
  studentToEdit,
  settings,
  onClose,
  onSave,
  totalExistingCount,
}) => {
  const isEditing = Boolean(studentToEdit);

  // Basic Info
  const [ofssNo, setOfssNo] = useState(studentToEdit?.ofssNo || '');
  const [formNo, setFormNo] = useState(
    studentToEdit?.formNo || `REG-2026-${(totalExistingCount + 1).toString().padStart(3, '0')}`
  );
  const [studentName, setStudentName] = useState(studentToEdit?.studentName || '');
  const [fatherName, setFatherName] = useState(studentToEdit?.fatherName || '');
  const [motherName, setMotherName] = useState(studentToEdit?.motherName || '');
  const [dob, setDob] = useState(studentToEdit?.dob || '2008-05-15');
  const [boardName, setBoardName] = useState(studentToEdit?.boardName || studentToEdit?.matricBoard || 'BSEB PATNA');
  const [gender, setGender] = useState<string>(studentToEdit?.gender || 'MALE');
  const [casteCategory, setCasteCategory] = useState<CasteCategory>(
    (studentToEdit?.casteCategory as CasteCategory) || 'BC'
  );
  const [stream, setStream] = useState<string>(
    studentToEdit?.stream || 'Science (I.Sc)'
  );
  const [mobile, setMobile] = useState(studentToEdit?.mobile || '');
  const [email, setEmail] = useState(studentToEdit?.email || '');
  const [bsebUniqueId, setBsebUniqueId] = useState(studentToEdit?.bsebUniqueId || '');

  // Matric info
  const [matricRollCode, setMatricRollCode] = useState(studentToEdit?.matricRollCode || settings.code || '31337');
  const [matricRollNo, setMatricRollNo] = useState(studentToEdit?.matricRollNo || '');
  const [matricPassingYear, setMatricPassingYear] = useState(studentToEdit?.matricPassingYear || '2024');
  const [prevSchoolName, setPrevSchoolName] = useState(studentToEdit?.prevSchoolName || '');
  const [address, setAddress] = useState(studentToEdit?.address || '');

  // Calculate dynamic registration fee based on Board (BSEB: ₹515 [485+30], Other Boards: ₹715 [685+30])
  const feeInfo = calculateRegistrationFee(boardName, settings.defaultOnlineCharge || 30);

  // Fee Details
  const [isFeePaid, setIsFeePaid] = useState<boolean>(
    studentToEdit ? studentToEdit.paidAmount > 0 : true
  );
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(
    studentToEdit?.paymentMode || 'CASH'
  );
  const [transactionRef, setTransactionRef] = useState(
    studentToEdit?.transactionRef || (paymentMode === 'CASH' ? 'CASH-REG' : `UPI-${Date.now().toString().slice(-6)}`)
  );

  // Documents State
  const [aadharStatus, setAadharStatus] = useState<RegistrationDocStatus>(
    studentToEdit?.documents?.aadhar?.status || 'SUBMITTED'
  );
  const [aadharNumber, setAadharNumber] = useState(
    studentToEdit?.documents?.aadhar?.docNumber || ''
  );

  const [apaarStatus, setApaarStatus] = useState<RegistrationDocStatus>(
    studentToEdit?.documents?.apaar?.status || 'SUBMITTED'
  );
  const [apaarNumber, setApaarNumber] = useState(
    studentToEdit?.documents?.apaar?.docNumber || ''
  );
  const [apaarReason, setApaarReason] = useState(
    studentToEdit?.documents?.apaar?.notAvailableReason || APAAR_REASONS[0]
  );
  const [customApaarReason, setCustomApaarReason] = useState('');

  const [tcStatus, setTcStatus] = useState<RegistrationDocStatus>(
    studentToEdit?.documents?.transferCertificate?.status || 'SUBMITTED'
  );
  const [tcNumber, setTcNumber] = useState(
    studentToEdit?.documents?.transferCertificate?.docNumber || ''
  );
  const [tcIssueDate, setTcIssueDate] = useState(
    studentToEdit?.documents?.transferCertificate?.issueDate || ''
  );

  const isCasteCertMandatory = casteCategory === 'EBC' || casteCategory === 'SC' || casteCategory === 'ST';
  const [casteStatus, setCasteStatus] = useState<RegistrationDocStatus>(
    studentToEdit?.documents?.casteCertificate?.status || (isCasteCertMandatory ? 'SUBMITTED' : 'EXEMPTED')
  );
  const [casteNumber, setCasteNumber] = useState(
    studentToEdit?.documents?.casteCertificate?.docNumber || ''
  );

  const [marksheetStatus, setMarksheetStatus] = useState<RegistrationDocStatus>(
    studentToEdit?.documents?.matricMarksheet?.status || 'SUBMITTED'
  );

  const [remarks, setRemarks] = useState(studentToEdit?.remarks || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentName.trim() || !fatherName.trim()) {
      alert('कृपया छात्र और पिता का नाम अनिवार्य रूप से भरें।');
      return;
    }

    const now = new Date();
    const dateStr = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}`;

    let receiptNo = studentToEdit?.receiptNo;
    if (isFeePaid && !receiptNo) {
      receiptNo = getNextRegistrationReceiptNumber();
    }

    const effectiveApaarReason = apaarStatus === 'NOT_AVAILABLE' 
      ? (apaarReason === 'Other' ? (customApaarReason || 'Other Reason') : apaarReason) 
      : undefined;

    const newStudent: RegistrationStudent = {
      id: studentToEdit?.id || `REG-${Date.now()}`,
      sNo: studentToEdit?.sNo || totalExistingCount + 1,
      ofssNo: ofssNo.trim() || formNo.trim(),
      formNo: formNo.trim(),
      bsebUniqueId: bsebUniqueId.trim(),
      studentName: studentName.trim().toUpperCase(),
      fatherName: fatherName.trim().toUpperCase(),
      motherName: motherName.trim().toUpperCase(),
      dob,
      boardName: boardName.trim(),
      gender,
      casteCategory,
      stream,
      mobile: mobile.trim(),
      email: email.trim(),
      matricRollCode: matricRollCode.trim(),
      matricRollNo: matricRollNo.trim(),
      matricPassingYear: matricPassingYear.trim(),
      prevSchoolName: prevSchoolName.trim(),
      address: address.trim(),
      baseFee: feeInfo.baseFee,
      serviceCharge: feeInfo.serviceCharge,
      registrationFee: feeInfo.totalFee,
      paidAmount: isFeePaid ? feeInfo.totalFee : 0,
      paymentStatus: isFeePaid ? 'PAID' : 'UNPAID',
      paymentMode: isFeePaid ? paymentMode : undefined,
      paymentDate: isFeePaid ? (studentToEdit?.paymentDate || dateStr) : undefined,
      receiptNo: isFeePaid ? receiptNo : undefined,
      transactionRef: isFeePaid ? transactionRef : undefined,
      documents: {
        aadhar: {
          status: aadharStatus,
          docNumber: aadharNumber.trim(),
          verified: aadharStatus === 'SUBMITTED',
        },
        apaar: {
          status: apaarStatus,
          docNumber: apaarStatus === 'SUBMITTED' ? apaarNumber.trim() : undefined,
          notAvailableReason: effectiveApaarReason,
          verified: apaarStatus === 'SUBMITTED',
        },
        transferCertificate: {
          status: tcStatus,
          docNumber: tcNumber.trim(),
          issueDate: tcIssueDate,
          schoolName: prevSchoolName.trim(),
          verified: tcStatus === 'SUBMITTED',
        },
        casteCertificate: {
          status: casteStatus,
          docNumber: casteNumber.trim(),
          verified: casteStatus === 'SUBMITTED',
          remarks: isCasteCertMandatory ? 'Required for Category' : 'Exempted / General',
        },
        matricMarksheet: {
          status: marksheetStatus,
          rollNo: matricRollNo.trim(),
          verified: marksheetStatus === 'SUBMITTED',
        },
      },
      registrationStatus: isFeePaid 
        ? (tcStatus === 'SUBMITTED' && (casteStatus === 'SUBMITTED' || !isCasteCertMandatory) ? 'COMPLETED' : 'FEE_PAID')
        : 'PENDING_DOCS',
      remarks: remarks.trim(),
      createdAt: studentToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newStudent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white/90 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-5 bg-linear-to-r from-[#2E5B50] via-[#3B6E62] to-[#2E5B50] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <UserPlus className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {isEditing ? 'पंजीकरण विवरण संपादित करें (Edit Registration)' : 'नया इंटरमीडिएट पंजीकरण (New Inter Registration)'}
              </h2>
              <p className="text-xs text-emerald-100/90">
                सत्र 2026-2027 &bull; निर्धारित पंजीकरण शुल्क: <strong>₹515</strong> (सभी संकाय)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Basic Student & Stream Info */}
          <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#E8E4D5] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#4A453E] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#2E5B50]" />
                <span>1. छात्र का विवरण एवं संकाय (Student & Stream)</span>
              </h3>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 font-mono font-bold rounded-full text-xs border ${
                  feeInfo.isBseb 
                    ? 'bg-emerald-100 text-[#2E5B50] border-emerald-300' 
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}>
                  {feeInfo.isBseb ? 'BSEB शुल्क: ₹515' : 'अन्य बोर्ड शुल्क: ₹715'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
              <div>
                <label className="block text-[#5A5A40] font-semibold mb-1">
                  10वीं बोर्ड (Matric Board) *
                </label>
                <select
                  value={
                    boardName.toUpperCase().includes('BSEB') || boardName.toUpperCase().includes('BIHAR')
                      ? 'BSEB PATNA'
                      : boardName.toUpperCase().includes('CBSE')
                      ? 'CBSE'
                      : boardName.toUpperCase().includes('ICSE')
                      ? 'ICSE'
                      : boardName.toUpperCase().includes('NIOS')
                      ? 'NIOS'
                      : 'OTHER'
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'BSEB PATNA') setBoardName('BSEB PATNA');
                    else if (val === 'CBSE') setBoardName('CBSE');
                    else if (val === 'ICSE') setBoardName('ICSE');
                    else if (val === 'NIOS') setBoardName('NIOS');
                    else setBoardName('OTHER BOARD');
                  }}
                  className={`w-full px-3 py-2 bg-white rounded-xl border font-bold text-xs ${
                    feeInfo.isBseb 
                      ? 'border-[#2E5B50] text-[#2E5B50]' 
                      : 'border-amber-500 text-amber-900 bg-amber-50/50'
                  }`}
                >
                  <option value="BSEB PATNA">BSEB PATNA (बिहार बोर्ड) • ₹515 (485+30)</option>
                  <option value="CBSE">CBSE (Central Board) • ₹715 (685+30)</option>
                  <option value="ICSE">ICSE / CISCE • ₹715 (685+30)</option>
                  <option value="NIOS">NIOS (Open Board) • ₹715 (685+30)</option>
                  <option value="OTHER">अन्य बोर्ड (Other State Board) • ₹715 (685+30)</option>
                </select>
                <input
                  type="text"
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  placeholder="बोर्ड का पूरा नाम (e.g. BSEB PATNA or CBSE)"
                  className="w-full mt-1.5 px-3 py-1 bg-white rounded-lg border border-[#DDD8C5] text-[11px]"
                />
              </div>

              <div>
                <label className="block text-[#5A5A40] font-semibold mb-1">
                  पंजीकरण फॉर्म सं. (Form No.) *
                </label>
                <input
                  type="text"
                  value={formNo}
                  onChange={(e) => setFormNo(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#DDD8C5] focus:outline-hidden focus:ring-2 focus:ring-[#2E5B50] font-mono font-bold text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[#5A5A40] font-semibold mb-1">
                  संकाय (Stream / Faculty) *
                </label>
                <select
                  value={stream}
                  onChange={(e) => setStream(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#DDD8C5] focus:outline-hidden focus:ring-2 focus:ring-[#2E5B50] font-semibold text-xs text-[#2E5B50]"
                >
                  <option value="Science (I.Sc)">विज्ञान संकाय • Science (I.Sc)</option>
                  <option value="Arts (I.A)">कला संकाय • Arts (I.A)</option>
                  <option value="Commerce (I.Com)">वाणिज्य संकाय • Commerce (I.Com)</option>
                  <option value="Vocational">व्यावसायिक • Vocational</option>
                </select>
              </div>

              <div>
                <label className="block text-[#5A5A40] font-semibold mb-1">
                  जाति कोटि (Caste Category) *
                </label>
                <select
                  value={casteCategory}
                  onChange={(e) => {
                    const newCat = e.target.value as CasteCategory;
                    setCasteCategory(newCat);
                    if (newCat === 'EBC' || newCat === 'SC' || newCat === 'ST') {
                      setCasteStatus('SUBMITTED');
                    } else {
                      setCasteStatus('EXEMPTED');
                    }
                  }}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#DDD8C5] focus:outline-hidden focus:ring-2 focus:ring-[#2E5B50] font-semibold text-xs"
                >
                  <option value="General">General (सामान्य)</option>
                  <option value="BC">BC (पिछड़ा वर्ग - BC-II)</option>
                  <option value="EBC">EBC (अत्यंत पिछड़ा वर्ग - BC-I) [प्रमाणपत्र अनिवार्य]</option>
                  <option value="SC">SC (अनुसूचित जाति) [प्रमाणपत्र अनिवार्य]</option>
                  <option value="ST">ST (अनुसूचित जनजाति) [प्रमाणपत्र अनिवार्य]</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[#5A5A40] font-semibold mb-1">
                  छात्र/छात्रा का नाम (Student Full Name) *
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value.toUpperCase())}
                  placeholder="e.g. ADITYA RAJ"
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#DDD8C5] focus:outline-hidden focus:ring-2 focus:ring-[#2E5B50] font-bold text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[#5A5A40] font-semibold mb-1">लिंग (Gender)</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#DDD8C5] focus:outline-hidden focus:ring-2 focus:ring-[#2E5B50] text-xs"
                >
                  <option value="MALE">पुरुष (Male)</option>
                  <option value="FEMALE">महिला (Female)</option>
                  <option value="OTHER">अन्य (Other)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#5A5A40] font-semibold mb-1">
                  पिता का नाम (Father Name) *
                </label>
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value.toUpperCase())}
                  placeholder="e.g. SURESH PRASAD"
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#DDD8C5] focus:outline-hidden focus:ring-2 focus:ring-[#2E5B50] text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[#5A5A40] font-semibold mb-1">
                  माता का नाम (Mother Name)
                </label>
                <input
                  type="text"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value.toUpperCase())}
                  placeholder="e.g. SUNITA DEVI"
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#DDD8C5] focus:outline-hidden focus:ring-2 focus:ring-[#2E5B50] text-xs"
                />
              </div>

              <div>
                <label className="block text-[#5A5A40] font-semibold mb-1">
                  जन्म तिथि (Date of Birth)
                </label>
                <input
                  type="text"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  placeholder="DD-MM-YYYY (e.g. 14-04-2009)"
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#DDD8C5] focus:outline-hidden focus:ring-2 focus:ring-[#2E5B50] text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[#5A5A40] font-semibold mb-1">
                  मोबाइल नंबर (Mobile No)
                </label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="10-digit mobile"
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#DDD8C5] focus:outline-hidden focus:ring-2 focus:ring-[#2E5B50] text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[#5A5A40] font-semibold mb-1">
                  मैट्रिक रोल कोड (Matric Roll Code)
                </label>
                <input
                  type="text"
                  value={matricRollCode}
                  onChange={(e) => setMatricRollCode(e.target.value)}
                  placeholder="e.g. 31337"
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#DDD8C5] focus:outline-hidden focus:ring-2 focus:ring-[#2E5B50] text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[#5A5A40] font-semibold mb-1">
                  मैट्रिक रोल नं. (Matric Roll No)
                </label>
                <input
                  type="text"
                  value={matricRollNo}
                  onChange={(e) => setMatricRollNo(e.target.value)}
                  placeholder="e.g. 2400101"
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#DDD8C5] focus:outline-hidden focus:ring-2 focus:ring-[#2E5B50] text-xs font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[#5A5A40] font-semibold mb-1">
                  पूर्व विद्यालय (Previous Institution / School for TC)
                </label>
                <input
                  type="text"
                  value={prevSchoolName}
                  onChange={(e) => setPrevSchoolName(e.target.value)}
                  placeholder="e.g. High School Berua, Gaayghat"
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#DDD8C5] focus:outline-hidden focus:ring-2 focus:ring-[#2E5B50] text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Mandatory Document Collection Checklist */}
          <div className="bg-white/80 p-5 rounded-2xl border border-emerald-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E4D5] pb-2">
              <h3 className="text-sm font-bold text-[#2E5B50] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>2. आवश्यक दस्तावेज संकलन (Mandatory Documents Checklist)</span>
              </h3>
              <span className="text-[11px] text-[#5A5A40]">
                आधार, अपार (APAAR), टीसी (TC), जाति (Caste)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Doc 1: AADHAR */}
              <div className="p-3.5 bg-[#FAF9F5] rounded-xl border border-[#E8E4D5] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#4A453E] flex items-center gap-1.5">
                    <IdCard className="w-3.5 h-3.5 text-blue-600" />
                    <span>1. आधार कार्ड (AADHAR Card)</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </span>
                  <select
                    value={aadharStatus}
                    onChange={(e) => setAadharStatus(e.target.value as RegistrationDocStatus)}
                    className="px-2 py-1 bg-white rounded-lg border border-[#DDD8C5] font-semibold text-[11px]"
                  >
                    <option value="SUBMITTED">जमा किया गया (Submitted)</option>
                    <option value="PENDING">लंबित (Pending)</option>
                  </select>
                </div>
                <input
                  type="text"
                  value={aadharNumber}
                  onChange={(e) => setAadharNumber(e.target.value)}
                  placeholder="12-अंकीय आधार नंबर (e.g. 7458 9201 3345)"
                  className="w-full px-3 py-1.5 bg-white rounded-lg border border-[#DDD8C5] font-mono text-xs"
                />
              </div>

              {/* Doc 2: APAAR ID with Reason */}
              <div className="p-3.5 bg-[#FAF9F5] rounded-xl border border-[#E8E4D5] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#4A453E] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>2. अपार आईडी (APAAR / EduID)</span>
                  </span>
                  <select
                    value={apaarStatus}
                    onChange={(e) => setApaarStatus(e.target.value as RegistrationDocStatus)}
                    className="px-2 py-1 bg-white rounded-lg border border-[#DDD8C5] font-semibold text-[11px]"
                  >
                    <option value="SUBMITTED">उपलब्ध है (Submitted)</option>
                    <option value="NOT_AVAILABLE">उपलब्ध नहीं है (Not Available)</option>
                    <option value="PENDING">लंबित (Pending)</option>
                  </select>
                </div>

                {apaarStatus === 'SUBMITTED' ? (
                  <input
                    type="text"
                    value={apaarNumber}
                    onChange={(e) => setApaarNumber(e.target.value)}
                    placeholder="12-अंकीय APAAR आईडी (e.g. 9102 4458 1190)"
                    className="w-full px-3 py-1.5 bg-white rounded-lg border border-[#DDD8C5] font-mono text-xs"
                  />
                ) : (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-amber-800">
                      उपलब्ध न होने का कारण (Mandatory Reason if Not Available):
                    </label>
                    <select
                      value={apaarReason}
                      onChange={(e) => setApaarReason(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-amber-50 text-amber-900 rounded-lg border border-amber-300 text-[11px] font-medium"
                    >
                      {APAAR_REASONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    {apaarReason === 'Other' && (
                      <input
                        type="text"
                        value={customApaarReason}
                        onChange={(e) => setCustomApaarReason(e.target.value)}
                        placeholder="विशिष्ट कारण लिखें..."
                        className="w-full px-3 py-1 bg-white rounded-lg border border-amber-300 text-xs"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Doc 3: TRANSFER CERTIFICATE (TC / SLC) from all */}
              <div className="p-3.5 bg-[#FAF9F5] rounded-xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#2E5B50] flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5 text-[#2E5B50]" />
                    <span>3. स्थानांतरण प्रमाण पत्र (TC / SLC)</span>
                    <span className="bg-emerald-100 text-[#2E5B50] text-[10px] px-1.5 py-0.5 rounded font-bold">
                      सभी के लिए अनिवार्य
                    </span>
                  </span>
                  <select
                    value={tcStatus}
                    onChange={(e) => setTcStatus(e.target.value as RegistrationDocStatus)}
                    className="px-2 py-1 bg-white rounded-lg border border-[#DDD8C5] font-semibold text-[11px]"
                  >
                    <option value="SUBMITTED">मूल TC जमा (Submitted)</option>
                    <option value="PENDING">लंबित (Pending Submission)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={tcNumber}
                    onChange={(e) => setTcNumber(e.target.value)}
                    placeholder="TC क्रमांक (e.g. TC/2024/045)"
                    className="px-3 py-1.5 bg-white rounded-lg border border-[#DDD8C5] text-xs font-mono"
                  />
                  <input
                    type="text"
                    value={tcIssueDate}
                    onChange={(e) => setTcIssueDate(e.target.value)}
                    placeholder="जारी तिथि (DD-MM-YYYY)"
                    className="px-3 py-1.5 bg-white rounded-lg border border-[#DDD8C5] text-xs font-mono"
                  />
                </div>
              </div>

              {/* Doc 4: CASTE CERTIFICATE (EBC, SC, ST) */}
              <div className={`p-3.5 rounded-xl border space-y-2 ${
                isCasteCertMandatory ? 'bg-amber-50/70 border-amber-300' : 'bg-[#FAF9F5] border-[#E8E4D5]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#4A453E] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-purple-600" />
                    <span>4. जाति प्रमाण पत्र (Caste Certificate)</span>
                    {isCasteCertMandatory && (
                      <span className="bg-amber-200 text-amber-900 text-[10px] px-1.5 py-0.5 rounded font-bold">
                        {casteCategory} हेतु अनिवार्य
                      </span>
                    )}
                  </span>
                  <select
                    value={casteStatus}
                    onChange={(e) => setCasteStatus(e.target.value as RegistrationDocStatus)}
                    className="px-2 py-1 bg-white rounded-lg border border-[#DDD8C5] font-semibold text-[11px]"
                  >
                    <option value="SUBMITTED">जमा किया गया (Submitted)</option>
                    <option value="PENDING">लंबित (Pending)</option>
                    <option value="EXEMPTED">लागू नहीं (Exempted - Gen/BC)</option>
                  </select>
                </div>
                <input
                  type="text"
                  value={casteNumber}
                  onChange={(e) => setCasteNumber(e.target.value)}
                  placeholder="प्रमाण पत्र क्रमांक (e.g. BICC/2024/99120)"
                  className="w-full px-3 py-1.5 bg-white rounded-lg border border-[#DDD8C5] text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Registration Fee Collection (₹515 for BSEB / ₹715 for Other Boards) */}
          <div className={`p-5 rounded-2xl border space-y-3 ${
            feeInfo.isBseb 
              ? 'bg-linear-to-r from-emerald-50 to-teal-50 border-emerald-200' 
              : 'bg-linear-to-r from-amber-50 to-orange-50 border-amber-300'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className={`w-5 h-5 ${feeInfo.isBseb ? 'text-[#2E5B50]' : 'text-amber-800'}`} />
                <div>
                  <h3 className={`text-sm font-bold ${feeInfo.isBseb ? 'text-[#2E5B50]' : 'text-amber-900'}`}>
                    3. पंजीकरण शुल्क रसीद (Registration Fee ₹{feeInfo.totalFee})
                  </h3>
                  <p className="text-[11px] text-gray-600">
                    {feeInfo.isBseb 
                      ? 'BSEB बिहार बोर्ड: ₹485 (मूल शुल्क) + ₹30 (ऑनलाइन शुल्क) = ₹515' 
                      : `${boardName || 'अन्य बोर्ड'}: ₹685 (मूल शुल्क) + ₹30 (ऑनलाइन शुल्क) = ₹715`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-2xl font-black ${feeInfo.isBseb ? 'text-[#2E5B50]' : 'text-amber-900'}`}>
                  ₹{feeInfo.totalFee}
                </span>
                <span className="text-[10px] text-gray-600 block">
                  {feeInfo.isBseb ? 'BSEB शुल्क' : 'अन्य बोर्ड शुल्क'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div>
                <label className="block text-[#5A5A40] font-semibold mb-1">भुगतान स्थिति</label>
                <div className="flex items-center gap-2">
                  <label className={`flex items-center gap-1.5 px-3 py-2 bg-white rounded-xl border font-bold cursor-pointer ${
                    feeInfo.isBseb 
                      ? 'border-emerald-300 text-[#2E5B50]' 
                      : 'border-amber-300 text-amber-900'
                  }`}>
                    <input
                      type="checkbox"
                      checked={isFeePaid}
                      onChange={(e) => setIsFeePaid(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span>₹{feeInfo.totalFee} प्राप्त (Fee Paid)</span>
                  </label>
                </div>
              </div>

              {isFeePaid && (
                <>
                  <div>
                    <label className="block text-[#5A5A40] font-semibold mb-1">भुगतान माध्यम</label>
                    <select
                      value={paymentMode}
                      onChange={(e) => {
                        const mode = e.target.value as PaymentMode;
                        setPaymentMode(mode);
                        if (mode === 'CASH') setTransactionRef('CASH-REG');
                        else if (mode === 'UPI') setTransactionRef(`UPI-${Date.now().toString().slice(-6)}`);
                      }}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-emerald-200 text-xs font-bold text-[#2E5B50]"
                    >
                      <option value="CASH">नकद (Cash Counter)</option>
                      <option value="UPI">UPI / QR कोड (GPay/PhonePe)</option>
                      <option value="NET_BANKING">Net Banking / Challan</option>
                      <option value="CARD">Debit / POS Card</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#5A5A40] font-semibold mb-1">रिफरेंस / UTR सं.</label>
                    <input
                      type="text"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="e.g. UPI/2609090123"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-emerald-200 font-mono text-xs"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-[#5A5A40] font-semibold text-xs mb-1">
              अतिरिक्त टिप्पणी (Remarks / Notes)
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. All documents verified, TC submitted in original."
              className="w-full px-3 py-2 bg-white rounded-xl border border-[#DDD8C5] text-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E4D5]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#DDD8C5] bg-[#FAF8F2] hover:bg-[#EFECE1] text-[#5A5A40] font-semibold text-xs transition"
            >
              रद्द करें (Cancel)
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#2E5B50] hover:bg-[#23463E] text-white font-bold text-xs shadow-md transition flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEditing ? 'पंजीकरण अपडेट करें' : `पंजीकरण सुरक्षित करें एवं ₹${feeInfo.totalFee} रसीद बनाएं`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
