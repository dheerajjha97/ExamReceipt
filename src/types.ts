export type PaymentStatus = 'PAID' | 'UNPAID' | 'PARTIAL';
export type PaymentMode = 'UPI' | 'CASH' | 'NET_BANKING' | 'CARD' | 'QR_CODE' | 'OTHER';
export type CasteCategory = 'General' | 'BC' | 'EBC' | 'SC' | 'ST';
export type ExamType = 'REGULAR' | 'EX-REGULAR' | 'IMPROVEMENT' | 'COMPARTMENTAL';
export type FormIssueStatus = 'NOT_ISSUED' | 'ISSUED' | 'SUBMITTED';

// Document statuses for Registration
export type RegistrationDocStatus = 'SUBMITTED' | 'PENDING' | 'NOT_AVAILABLE' | 'EXEMPTED';

export interface DocumentRecord {
  status: RegistrationDocStatus;
  docNumber?: string;
  issueDate?: string;
  schoolName?: string;
  rollNo?: string;
  notAvailableReason?: string; // Mandatory when status is NOT_AVAILABLE (especially for APAAR)
  fileData?: string;           // Base64 file or image preview
  fileName?: string;
  remarks?: string;
  verified?: boolean;
}

export interface RegistrationDocuments {
  aadhar: DocumentRecord;
  apaar: DocumentRecord;
  transferCertificate: DocumentRecord;
  casteCertificate: DocumentRecord;
  matricMarksheet: DocumentRecord;
  photoSign?: DocumentRecord;
}

export interface RegistrationStudent {
  id: string;
  sNo: number;
  session?: string;            // e.g. "2026-2028" (11th Registration) or "2025-2027"
  formNo: string;              // e.g. "REG-2026-001"
  ofssNo?: string;             // OFSS Reference / CAF Number e.g. "24J1029384"
  bsebUniqueId?: string;       // BSEB Unique ID if allotted
  studentName: string;
  fatherName: string;
  motherName: string;
  dob: string;                 // DD-MM-YYYY
  gender: 'MALE' | 'FEMALE' | 'OTHER' | string;
  casteCategory: CasteCategory | string; // General, BC, EBC, SC, ST
  stream: 'Science (I.Sc)' | 'Arts (I.A)' | 'Commerce (I.Com)' | 'Vocational' | string;
  mobile: string;
  email?: string;
  
  // 10th / Matriculation Academic Background
  boardName?: string;          // e.g. "BSEB PATNA", "CBSE", "ICSE", "OTHER"
  matricRollCode?: string;
  matricRollNo?: string;
  matricPassingYear?: string;
  matricBoard?: string;
  prevSchoolName?: string;     // School from where TC was issued
  address?: string;

  // Registration Fee details (Base Fee e.g. ₹485/₹685 + ₹30 Service Charge = ₹515/₹715)
  baseFee?: number;            // e.g. 485 for BSEB, 685 for Other Boards
  serviceCharge?: number;      // e.g. 30
  registrationFee: number;     // e.g. 515 or 715
  paidAmount: number;
  paymentStatus: PaymentStatus;
  paymentMode?: PaymentMode;
  paymentDate?: string;
  receiptNo?: string;
  transactionRef?: string;
  feeBreakup?: {
    permissionFee: number;
    applicationFee: number;
    registrationFee: number;
    processingFee: number;
    otherBoardFee: number;
    totalFee: number;
  };

  // 4-Stage Lifecycle Fee Records
  feeLifecycle?: {
    adm_11?: StageFeeRecord;
    reg_11?: StageFeeRecord;
    adm_12?: StageFeeRecord;
    exam_12?: StageFeeRecord;
  };

  // Mandatory Document Collection
  documents: RegistrationDocuments;
  registrationStatus: 'PENDING_DOCS' | 'DOCS_VERIFIED' | 'FEE_PAID' | 'COMPLETED';

  // Form Track Status (Form Issued & Form Submitted)
  isFormIssued?: boolean;        // फॉर्म लिया / निर्गत (Form Taken/Issued) - default false (NO)
  formIssuedDate?: string;
  isFormSubmitted?: boolean;     // फॉर्म जमा किया (Form Submitted) - default false (NO)
  formSubmittedDate?: string;

  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export function isBSEBBoard(boardName?: string): boolean {
  if (!boardName) return true; // default to BSEB
  const b = boardName.trim().toUpperCase();
  if (b.includes('BSEB') || b.includes('BIHAR') || b.includes('PATNA') || b.includes('बिहार')) {
    return true;
  }
  return false;
}

export function calculateRegistrationFee(boardName?: string, serviceCharge = 30): { baseFee: number; serviceCharge: number; totalFee: number; isBseb: boolean } {
  const isBseb = isBSEBBoard(boardName);
  const baseFee = isBseb ? 485 : 685;
  return {
    isBseb,
    baseFee,
    serviceCharge,
    totalFee: baseFee + serviceCharge,
  };
}

export function normalizeStream(raw?: string): 'Science (I.Sc)' | 'Arts (I.A)' | 'Commerce (I.Com)' | 'Vocational' {
  if (!raw) return 'Science (I.Sc)';
  const lower = raw.toLowerCase().trim();
  if (lower.includes('com') || lower.includes('वाणिज्य') || lower.includes('i.com')) {
    return 'Commerce (I.Com)';
  }
  if (lower.includes('art') || lower.includes('कला') || lower.includes('i.a') || lower.includes('ia')) {
    return 'Arts (I.A)';
  }
  if (lower.includes('sci') || lower.includes('विज्ञान') || lower.includes('i.sc') || lower.includes('isc')) {
    return 'Science (I.Sc)';
  }
  if (lower.includes('voc') || lower.includes('व्यावसायिक')) {
    return 'Vocational';
  }
  return 'Science (I.Sc)';
}

export function isStreamMatching(stuStream: string = '', filterStream: string): boolean {
  if (!filterStream || filterStream === 'ALL') return true;
  const s = (stuStream || '').toLowerCase().trim();
  const f = filterStream.toLowerCase().trim();
  if (f.includes('com') || f.includes('वाणिज्य') || f.includes('i.com')) {
    return s.includes('com') || s.includes('वाणिज्य') || s.includes('i.com');
  }
  if (f.includes('art') || f.includes('कला') || f.includes('i.a')) {
    return s.includes('art') || s.includes('कला') || s.includes('i.a') || s.includes('ia');
  }
  if (f.includes('sci') || f.includes('विज्ञान') || f.includes('i.sc')) {
    return s.includes('sci') || s.includes('विज्ञान') || s.includes('i.sc') || s.includes('isc');
  }
  if (f.includes('voc') || f.includes('व्यावसायिक')) {
    return s.includes('voc') || s.includes('व्यावसायिक');
  }
  return s.includes(f);
}

export type FeeStageKey = 'ADM_11' | 'REG_11' | 'ADM_12' | 'EXAM_12';

export interface StageFeeRecord {
  stageKey: FeeStageKey;
  stageName: string;
  stageHindi: string;
  stageClass: '11th' | '12th';
  targetSession: string; // e.g. '2025-2027' or '2026-2028'
  expectedFee: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: PaymentStatus;
  receiptNo?: string;
  paymentDate?: string;
  paymentMode?: PaymentMode;
  transactionRef?: string;
  remarks?: string;
}

export const FEE_STAGES_CONFIG: Record<FeeStageKey, { 
  key: FeeStageKey; 
  name: string; 
  hindi: string; 
  class: '11th' | '12th';
  defaultFee: number; 
  description: string;
  color: string;
}> = {
  ADM_11: {
    key: 'ADM_11',
    name: '11th Admission',
    hindi: '11वीं नामांकन शुल्क',
    class: '11th',
    defaultFee: 0,
    description: 'कक्षा 11वीं नामांकन एवं प्रवेश शुल्क (Admission Fee)',
    color: 'emerald'
  },
  REG_11: {
    key: 'REG_11',
    name: '11th Registration',
    hindi: '11वीं BSEB पंजीयन शुल्क',
    class: '11th',
    defaultFee: 0,
    description: 'बिहार बोर्ड (BSEB) 11वीं सूचीकरण / पंजीयन प्रपत्र शुल्क',
    color: 'indigo'
  },
  ADM_12: {
    key: 'ADM_12',
    name: '12th Admission',
    hindi: '12वीं नामांकन शुल्क',
    class: '12th',
    defaultFee: 0,
    description: 'कक्षा 12वीं (द्वितीय वर्ष) पुनः नामांकन शुल्क (Re-Admission Fee)',
    color: 'purple'
  },
  EXAM_12: {
    key: 'EXAM_12',
    name: '12th Exam Form',
    hindi: '12वीं BSEB परीक्षा प्रपत्र शुल्क',
    class: '12th',
    defaultFee: 0,
    description: 'बिहार बोर्ड (BSEB) 12वीं वार्षिक परीक्षा प्रपत्र एवं परीक्षा शुल्क',
    color: 'amber'
  }
};

export interface Student {
  id: string;
  sNo: number;
  session?: string; // e.g. "2025-2027" (12th Exam Form) or "2026-2028" (11th Reg)
  registrationNo: string;
  rollNo?: string;
  studentName: string;
  fatherName: string;
  motherName: string;
  dob: string;
  casteCategory: CasteCategory | string;
  examType: ExamType | string;
  classOrStream: string; // e.g. "Intermediate Science (12th)", "Matriculation (10th)"
  phone?: string; // WhatsApp number
  baseFee: number; // e.g. 1400 or 1140
  onlineCharges: number; // default: 30
  totalFee: number; // baseFee + onlineCharges
  paidAmount: number;
  paymentStatus: PaymentStatus;
  paymentDate?: string;
  paymentMode?: PaymentMode;
  lastReceiptNo?: string;
  transactionRef?: string;
  remarks?: string;
  
  // 4-Stage Lifecycle Fee Records
  feeLifecycle?: {
    adm_11?: StageFeeRecord;
    reg_11?: StageFeeRecord;
    adm_12?: StageFeeRecord;
    exam_12?: StageFeeRecord;
  };

  // Examination Form Collection & Submission Management
  formIssueStatus?: FormIssueStatus; // 'NOT_ISSUED' | 'ISSUED' | 'SUBMITTED'
  formNo?: string;                   // e.g. "FORM-2026-0108-001"
  formIssueDate?: string;            // e.g. "2026-08-20 10:30"
  formSubmissionDate?: string;       // e.g. "2026-08-25 11:15"

  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  registrationNo: string;
  fatherName: string;
  classOrStream: string;
  baseFee: number;
  onlineCharges: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentMode: PaymentMode;
  transactionRef: string;
  paymentDate: string; // YYYY-MM-DD HH:mm
  collectedBy: string;
  remarks?: string;
  transactionType?: string; // e.g. "Board Exam Fee", "Registration Fee", "Late Fine", "Certificate Fee", "Misc"
}

export interface InstituteSettings {
  name: string;
  subTitle: string;
  address: string;
  code: string;
  academicYear: string;
  defaultOnlineCharge: number;
  currencySymbol: string;
  cashierName: string;
  contactNumber: string;
}

export interface ExtractedStudent {
  sNo?: number;
  registrationNo: string;
  studentName: string;
  fatherName: string;
  motherName: string;
  dob: string;
  casteCategory: string;
  examType: string;
  feeAmount: number;
}

export interface ExtractionResult {
  instituteName?: string;
  classOrStream?: string;
  students: ExtractedStudent[];
}
