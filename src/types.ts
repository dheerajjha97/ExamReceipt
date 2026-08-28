export type PaymentStatus = 'PAID' | 'UNPAID' | 'PARTIAL';
export type PaymentMode = 'UPI' | 'CASH' | 'NET_BANKING' | 'CARD' | 'QR_CODE' | 'OTHER';
export type CasteCategory = 'General' | 'BC' | 'EBC' | 'SC' | 'ST';
export type ExamType = 'REGULAR' | 'EX-REGULAR' | 'IMPROVEMENT' | 'COMPARTMENTAL';

export interface Student {
  id: string;
  sNo: number;
  registrationNo: string;
  rollNo?: string;
  studentName: string;
  fatherName: string;
  motherName: string;
  dob: string;
  casteCategory: CasteCategory | string;
  examType: ExamType | string;
  classOrStream: string; // e.g. "Intermediate Science (12th)", "Matriculation (10th)"
  phone: string; // WhatsApp number
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

export interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  filePath: string;
  token: string;
  autoSync: boolean;
  lastSyncedAt?: string;
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
