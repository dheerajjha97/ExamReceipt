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
  IdCard, 
  FileCheck,
  Building,
  Camera,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import { 
  RegistrationStudent, 
  InstituteSettings, 
  CasteCategory, 
  PaymentMode,
  RegistrationDocStatus,
  calculateRegistrationFee,
  isBSEBBoard,
  normalizeStream
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
    normalizeStream(studentToEdit?.stream || 'Science (I.Sc)')
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

  // 4 Required Documents State for 11th Registration
  // 1. AADHAR CARD
  const [aadharStatus, setAadharStatus] = useState<RegistrationDocStatus>(
    studentToEdit?.documents?.aadhar?.status || 'PENDING'
  );
  const [aadharNumber, setAadharNumber] = useState(
    studentToEdit?.documents?.aadhar?.docNumber || ''
  );

  // 2. BANK PASSBOOK
  const [bankPassbookStatus, setBankPassbookStatus] = useState<RegistrationDocStatus>(
    studentToEdit?.documents?.bankPassbook?.status || 'PENDING'
  );
  const [bankAccountNumber, setBankAccountNumber] = useState(
    studentToEdit?.documents?.bankPassbook?.accountNumber || studentToEdit?.documents?.bankPassbook?.docNumber || ''
  );
  const [bankIfscCode, setBankIfscCode] = useState(
    studentToEdit?.documents?.bankPassbook?.ifscCode || ''
  );
  const [bankName, setBankName] = useState(
    studentToEdit?.documents?.bankPassbook?.bankName || ''
  );

  // 3. CASTE CERTIFICATE
  const isCasteCertMandatory = casteCategory === 'EBC' || casteCategory === 'SC' || casteCategory === 'ST' || casteCategory === 'BC';
  const [casteStatus, setCasteStatus] = useState<RegistrationDocStatus>(
    studentToEdit?.documents?.casteCertificate?.status || (casteCategory === 'General' ? 'EXEMPTED' : 'PENDING')
  );
  const [casteNumber, setCasteNumber] = useState(
    studentToEdit?.documents?.casteCertificate?.docNumber || ''
  );

  // 4. PHOTO
  const [photoStatus, setPhotoStatus] = useState<RegistrationDocStatus>(
    studentToEdit?.documents?.photo?.status || studentToEdit?.documents?.photoSign?.status || 'PENDING'
  );
  const [photoPreview, setPhotoPreview] = useState<string>(
    studentToEdit?.documents?.photo?.fileData || studentToEdit?.documents?.photoSign?.fileData || ''
  );
  const [photoRemarks, setPhotoRemarks] = useState(
    studentToEdit?.documents?.photo?.remarks || ''
  );

  // Optional Secondary Docs
  const [apaarStatus, setApaarStatus] = useState<RegistrationDocStatus>(
    studentToEdit?.documents?.apaar?.status || 'PENDING'
  );
  const [apaarNumber, setApaarNumber] = useState(
    studentToEdit?.documents?.apaar?.docNumber || ''
  );
  const [apaarReason, setApaarReason] = useState(
    studentToEdit?.documents?.apaar?.notAvailableReason || APAAR_REASONS[0]
  );
  const [customApaarReason, setCustomApaarReason] = useState('');

  const [tcStatus, setTcStatus] = useState<RegistrationDocStatus>(
    studentToEdit?.documents?.transferCertificate?.status || 'PENDING'
  );
  const [tcNumber, setTcNumber] = useState(
    studentToEdit?.documents?.transferCertificate?.docNumber || ''
  );
  const [tcIssueDate, setTcIssueDate] = useState(
    studentToEdit?.documents?.transferCertificate?.issueDate || ''
  );

  const [marksheetStatus, setMarksheetStatus] = useState<RegistrationDocStatus>(
    studentToEdit?.documents?.matricMarksheet?.status || 'PENDING'
  );

  // Form Issue & Submission Status (Default NO / false)
  const [isFormIssued, setIsFormIssued] = useState<boolean>(
    studentToEdit?.isFormIssued || false
  );
  const [formIssuedDate, setFormIssuedDate] = useState<string>(
    studentToEdit?.formIssuedDate || ''
  );
  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(
    studentToEdit?.isFormSubmitted || false
  );
  const [formSubmittedDate, setFormSubmittedDate] = useState<string>(
    studentToEdit?.formSubmittedDate || ''
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
        // 4 Required Documents
        aadhar: {
          status: aadharStatus,
          docNumber: aadharNumber.trim(),
          verified: aadharStatus === 'SUBMITTED',
        },
        bankPassbook: {
          status: bankPassbookStatus,
          accountNumber: bankAccountNumber.trim(),
          ifscCode: bankIfscCode.trim().toUpperCase(),
          bankName: bankName.trim().toUpperCase(),
          docNumber: bankAccountNumber.trim(),
          verified: bankPassbookStatus === 'SUBMITTED',
        },
        casteCertificate: {
          status: casteStatus,
          docNumber: casteNumber.trim(),
          verified: casteStatus === 'SUBMITTED' || casteStatus === 'EXEMPTED',
          remarks: isCasteCertMandatory ? 'Required for Reserved Category' : 'Exempted / General',
        },
        photo: {
          status: photoStatus,
          fileData: photoPreview || undefined,
          remarks: photoRemarks.trim() || undefined,
          verified: photoStatus === 'SUBMITTED',
        },
        // Secondary / Legacy fields
        photoSign: {
          status: photoStatus,
          fileData: photoPreview || undefined,
          verified: photoStatus === 'SUBMITTED',
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
        matricMarksheet: {
          status: marksheetStatus,
          rollNo: matricRollNo.trim(),
          verified: marksheetStatus === 'SUBMITTED',
        },
      },
      registrationStatus: isFeePaid 
        ? (aadharStatus === 'SUBMITTED' && bankPassbookStatus === 'SUBMITTED' && (casteStatus === 'SUBMITTED' || casteStatus === 'EXEMPTED' || !isCasteCertMandatory) && photoStatus === 'SUBMITTED' ? 'COMPLETED' : 'FEE_PAID')
        : 'PENDING_DOCS',
      // Form Track Status (Default NO / false)
      isFormIssued,
      formIssuedDate: isFormIssued ? (formIssuedDate || dateStr.slice(0, 10)) : undefined,
      isFormSubmitted,
      formSubmittedDate: isFormSubmitted ? (formSubmittedDate || dateStr.slice(0, 10)) : undefined,
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

          {/* Section 2: 4 Mandatory Document Collection Checklist */}
          <div className="bg-white/80 p-5 rounded-2xl border border-emerald-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E4D5] pb-2">
              <h3 className="text-sm font-bold text-[#2E5B50] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>2. 11वीं पंजीयन अनिवार्य दस्तावेज (4 Required Documents)</span>
              </h3>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                1. आधार &bull; 2. बैंक पासबुक &bull; 3. जाति प्रमाण पत्र &bull; 4. फोटो
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Doc 1: AADHAR CARD */}
              <div className={`p-3.5 rounded-xl border space-y-2.5 transition ${
                aadharStatus === 'SUBMITTED' ? 'bg-emerald-50/50 border-emerald-300' : 'bg-[#FAF9F5] border-[#E8E4D5]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#4A453E] flex items-center gap-1.5">
                    <IdCard className="w-4 h-4 text-blue-600" />
                    <span>1. आधार कार्ड (AADHAR CARD)</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </span>
                  <select
                    value={aadharStatus}
                    onChange={(e) => setAadharStatus(e.target.value as RegistrationDocStatus)}
                    className="px-2 py-1 bg-white rounded-lg border border-[#DDD8C5] font-semibold text-[11px]"
                  >
                    <option value="SUBMITTED">जमा किया गया (Submitted ✓)</option>
                    <option value="PENDING">लंबित (Pending ✗)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#5A5A40] mb-1">
                    12-अंकीय आधार नंबर (Aadhaar Number)
                  </label>
                  <input
                    type="text"
                    value={aadharNumber}
                    onChange={(e) => setAadharNumber(e.target.value)}
                    placeholder="e.g. 7458 9201 3345"
                    maxLength={14}
                    className="w-full px-3 py-1.5 bg-white rounded-lg border border-[#DDD8C5] font-mono text-xs"
                  />
                </div>
              </div>

              {/* Doc 2: BANK PASSBOOK */}
              <div className={`p-3.5 rounded-xl border space-y-2.5 transition ${
                bankPassbookStatus === 'SUBMITTED' ? 'bg-emerald-50/50 border-emerald-300' : 'bg-[#FAF9F5] border-[#E8E4D5]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#4A453E] flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-emerald-700" />
                    <span>2. बैंक पासबुक (BANK PASSBOOK)</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </span>
                  <select
                    value={bankPassbookStatus}
                    onChange={(e) => setBankPassbookStatus(e.target.value as RegistrationDocStatus)}
                    className="px-2 py-1 bg-white rounded-lg border border-[#DDD8C5] font-semibold text-[11px]"
                  >
                    <option value="SUBMITTED">जमा किया गया (Submitted ✓)</option>
                    <option value="PENDING">लंबित (Pending ✗)</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10.5px] font-semibold text-[#5A5A40] mb-0.5">
                      खाता संख्या (A/c No)
                    </label>
                    <input
                      type="text"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      placeholder="e.g. 30891245678"
                      className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-[#DDD8C5] font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-semibold text-[#5A5A40] mb-0.5">
                      IFSC कोड
                    </label>
                    <input
                      type="text"
                      value={bankIfscCode}
                      onChange={(e) => setBankIfscCode(e.target.value.toUpperCase())}
                      placeholder="e.g. SBIN0001234"
                      className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-[#DDD8C5] font-mono text-xs"
                    />
                  </div>
                </div>
                <div>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="बैंक का नाम व शाखा (e.g. SBI Gaayghat Branch)"
                    className="w-full px-2.5 py-1 bg-white rounded-lg border border-[#DDD8C5] text-[11px]"
                  />
                </div>
              </div>

              {/* Doc 3: CASTE CERTIFICATE */}
              <div className={`p-3.5 rounded-xl border space-y-2.5 transition ${
                casteStatus === 'SUBMITTED' ? 'bg-emerald-50/50 border-emerald-300' : isCasteCertMandatory ? 'bg-amber-50/70 border-amber-300' : 'bg-[#FAF9F5] border-[#E8E4D5]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#4A453E] flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span>3. जाति प्रमाण पत्र (CASTE CERTIFICATE)</span>
                    {isCasteCertMandatory && (
                      <span className="bg-amber-200 text-amber-900 text-[10px] px-1.5 py-0.5 rounded font-bold">
                        {casteCategory} अनिवार्य
                      </span>
                    )}
                  </span>
                  <select
                    value={casteStatus}
                    onChange={(e) => setCasteStatus(e.target.value as RegistrationDocStatus)}
                    className="px-2 py-1 bg-white rounded-lg border border-[#DDD8C5] font-semibold text-[11px]"
                  >
                    <option value="SUBMITTED">जमा किया गया (Submitted ✓)</option>
                    <option value="PENDING">लंबित (Pending ✗)</option>
                    <option value="EXEMPTED">लागू नहीं (Exempted - Gen)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#5A5A40] mb-1">
                    जाति प्रमाण पत्र क्रमांक (Certificate Number)
                  </label>
                  <input
                    type="text"
                    value={casteNumber}
                    onChange={(e) => setCasteNumber(e.target.value)}
                    placeholder="e.g. BICC/2024/99120"
                    className="w-full px-3 py-1.5 bg-white rounded-lg border border-[#DDD8C5] font-mono text-xs"
                  />
                </div>
              </div>

              {/* Doc 4: PHOTO */}
              <div className={`p-3.5 rounded-xl border space-y-2.5 transition ${
                photoStatus === 'SUBMITTED' ? 'bg-emerald-50/50 border-emerald-300' : 'bg-[#FAF9F5] border-[#E8E4D5]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#4A453E] flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-rose-600" />
                    <span>4. पासपोर्ट साइज फोटो (PHOTO)</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </span>
                  <select
                    value={photoStatus}
                    onChange={(e) => setPhotoStatus(e.target.value as RegistrationDocStatus)}
                    className="px-2 py-1 bg-white rounded-lg border border-[#DDD8C5] font-semibold text-[11px]"
                  >
                    <option value="SUBMITTED">प्राप्त / चस्पा (Submitted ✓)</option>
                    <option value="PENDING">लंबित (Pending ✗)</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-16 rounded-lg bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center overflow-hidden shrink-0">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Student" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-[#2E5B50] hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>फोटो अपलोड करें</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setPhotoPreview(event.target?.result as string);
                              setPhotoStatus('SUBMITTED');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <input
                      type="text"
                      value={photoRemarks}
                      onChange={(e) => setPhotoRemarks(e.target.value)}
                      placeholder="फोटो विवरण (e.g. 2 Photos Received with Sign)"
                      className="w-full px-2.5 py-1 bg-white rounded-lg border border-[#DDD8C5] text-[11px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Form Distribution & Submission Status (फॉर्म लिया / फॉर्म जमा) */}
          <div className="bg-white/80 p-5 rounded-2xl border border-blue-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#E8E4D5] pb-2">
              <h3 className="text-sm font-bold text-[#2E5B50] flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-600" />
                <span>3. फॉर्म वितरण एवं संकलन ट्रैकिंग (Form Issue & Submission Status)</span>
              </h3>
              <span className="text-[11px] text-gray-500 font-medium">
                डिफ़ॉल्ट: NO (आवश्यकतानुसार टॉगल करें)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Form Issued / Taken */}
              <div className={`p-4 rounded-xl border transition ${
                isFormIssued ? 'bg-emerald-50/80 border-emerald-300' : 'bg-rose-50/50 border-rose-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-800 flex items-center gap-1.5">
                    <span>1. क्या छात्र ने फॉर्म लिया है?</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isFormIssued;
                      setIsFormIssued(next);
                      if (!next) setIsFormSubmitted(false);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-black shadow-xs transition flex items-center gap-1 cursor-pointer ${
                      isFormIssued 
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                        : 'bg-rose-600 text-white hover:bg-rose-700'
                    }`}
                  >
                    <span>{isFormIssued ? 'YES (फॉर्म लिया ✓)' : 'NO (नहीं लिया ✗)'}</span>
                  </button>
                </div>
                {isFormIssued && (
                  <div>
                    <label className="block text-[10.5px] font-semibold text-gray-600 mb-1">फॉर्म लेने / वितरण की तिथि</label>
                    <input
                      type="text"
                      value={formIssuedDate}
                      onChange={(e) => setFormIssuedDate(e.target.value)}
                      placeholder="DD-MM-YYYY (e.g. 10-09-2026)"
                      className="w-full px-3 py-1.5 bg-white rounded-lg border border-emerald-300 text-xs font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Form Submitted */}
              <div className={`p-4 rounded-xl border transition ${
                isFormSubmitted ? 'bg-blue-50/80 border-blue-300' : 'bg-rose-50/50 border-rose-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-800 flex items-center gap-1.5">
                    <span>2. क्या छात्र ने फॉर्म जमा किया है?</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isFormSubmitted;
                      setIsFormSubmitted(next);
                      if (next) setIsFormIssued(true);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-black shadow-xs transition flex items-center gap-1 cursor-pointer ${
                      isFormSubmitted 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-rose-600 text-white hover:bg-rose-700'
                    }`}
                  >
                    <span>{isFormSubmitted ? 'YES (फॉर्म जमा ✓)' : 'NO (जमा नहीं ✗)'}</span>
                  </button>
                </div>
                {isFormSubmitted && (
                  <div>
                    <label className="block text-[10.5px] font-semibold text-gray-600 mb-1">फॉर्म जमा करने की तिथि</label>
                    <input
                      type="text"
                      value={formSubmittedDate}
                      onChange={(e) => setFormSubmittedDate(e.target.value)}
                      placeholder="DD-MM-YYYY (e.g. 10-09-2026)"
                      className="w-full px-3 py-1.5 bg-white rounded-lg border border-blue-300 text-xs font-mono"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Registration Fee Collection (₹515 for BSEB / ₹715 for Other Boards) */}
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
                    4. पंजीकरण शुल्क रसीद (Registration Fee ₹{feeInfo.totalFee})
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
