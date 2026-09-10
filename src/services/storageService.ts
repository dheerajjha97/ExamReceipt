import { Student, Transaction, InstituteSettings, RegistrationStudent } from '../types';
import { initialStudents, initialInstituteSettings, initialTransactions, initialRegistrationStudents } from '../data/mockStudents';

const KEYS = {
  STUDENTS: 'fee_app_students_v4',
  REGISTRATION_STUDENTS: 'fee_app_reg_students_v2',
  TRANSACTIONS: 'fee_app_transactions_v4',
  SETTINGS: 'fee_app_settings_v4',
  RECEIPT_COUNTER: 'fee_app_receipt_counter_v4',
  REG_RECEIPT_COUNTER: 'fee_app_reg_receipt_counter_v2',
};

// Clean up legacy mock storage keys if present
try {
  localStorage.removeItem('fee_app_students_v2');
  localStorage.removeItem('fee_app_transactions_v2');
  localStorage.removeItem('fee_app_reg_students_v1');
} catch (e) {
  // ignore
}

// Storage getters
export function getStoredStudents(): Student[] {
  try {
    const data = localStorage.getItem(KEYS.STUDENTS);
    if (data) {
      const parsed: Student[] = JSON.parse(data);
      // Ensure backward-compatibility with existing stored student records
      return parsed.map((s, idx) => {
        const isPaid = s.paymentStatus === 'PAID';
        const defaultStatus = isPaid ? 'SUBMITTED' : (idx % 2 === 0 ? 'ISSUED' : 'NOT_ISSUED');
        const formNo = s.formNo || `EF-2026-${(100 + (s.sNo || idx + 1)).toString().padStart(4, '0')}`;
        const formIssueDate = s.formIssueDate || (defaultStatus !== 'NOT_ISSUED' ? (s.paymentDate || '2026-08-22 10:00') : undefined);
        const formSubmissionDate = s.formSubmissionDate || (defaultStatus === 'SUBMITTED' ? (s.paymentDate || '2026-08-25 11:00') : undefined);

        return {
          ...s,
          formIssueStatus: s.formIssueStatus || defaultStatus,
          formNo,
          formIssueDate,
          formSubmissionDate,
        };
      });
    }
  } catch (e) {
    console.error('Failed to load students from localStorage:', e);
  }
  // Initialize with default empty array
  saveStudentsToStorage(initialStudents);
  return initialStudents;
}

const MOCK_REG_IDS = new Set([
  'REG-31337-001',
  'REG-31337-002',
  'REG-31337-003',
  'REG-31337-004',
  'REG-31337-005',
]);

const MOCK_REG_NAMES = new Set([
  'ADITYA RAJ',
  'PRIYA KUMARI',
  'AMIT PASWAN',
  'SHIKHA KUMARI',
  'VIKASH KUMAR MANJHI',
]);

export function getStoredRegistrationStudents(): RegistrationStudent[] {
  try {
    const data = localStorage.getItem(KEYS.REGISTRATION_STUDENTS);
    if (data) {
      const parsed: RegistrationStudent[] = JSON.parse(data);
      if (Array.isArray(parsed)) {
        // Exclude any legacy mock items
        const cleanList = parsed.filter((s) => {
          const name = (s.studentName || '').toUpperCase().trim();
          return !MOCK_REG_IDS.has(s.id) && !MOCK_REG_NAMES.has(name);
        });
        if (cleanList.length !== parsed.length) {
          saveRegistrationStudentsToStorage(cleanList);
        }
        return cleanList;
      }
    }
  } catch (e) {
    console.error('Failed to load registration students from localStorage:', e);
  }
  return [];
}

export function clearStoredRegistrationStudents(): void {
  try {
    localStorage.removeItem(KEYS.REGISTRATION_STUDENTS);
    localStorage.removeItem(KEYS.REG_RECEIPT_COUNTER);
  } catch (e) {
    console.error('Failed to clear registration storage:', e);
  }
}

export function saveRegistrationStudentsToStorage(students: RegistrationStudent[]): void {
  try {
    localStorage.setItem(KEYS.REGISTRATION_STUDENTS, JSON.stringify(students));
  } catch (e) {
    console.error('Failed to save registration students to localStorage:', e);
  }
}

export function clearAllData(): void {
  try {
    localStorage.removeItem(KEYS.STUDENTS);
    localStorage.removeItem(KEYS.REGISTRATION_STUDENTS);
    localStorage.removeItem(KEYS.TRANSACTIONS);
    localStorage.removeItem(KEYS.RECEIPT_COUNTER);
    localStorage.removeItem(KEYS.REG_RECEIPT_COUNTER);
    saveStudentsToStorage([]);
    saveRegistrationStudentsToStorage([]);
    saveTransactionsToStorage([]);
  } catch (e) {
    console.error('Failed to clear data:', e);
  }
}

export function saveStudentsToStorage(students: Student[]): void {
  try {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
  } catch (e) {
    console.error('Failed to save students to localStorage:', e);
  }
}

export function getStoredTransactions(): Transaction[] {
  try {
    const data = localStorage.getItem(KEYS.TRANSACTIONS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load transactions from localStorage:', e);
  }
  saveTransactionsToStorage(initialTransactions);
  return initialTransactions;
}

/**
 * Generate missing transaction records from students who have paidAmount > 0
 * to ensure the Day Book and Financial Ledger are never out of sync.
 */
export function syncTransactionsFromStudents(
  students: Student[],
  existingTxns: Transaction[],
  settings?: InstituteSettings
): Transaction[] {
  const paidStudents = students.filter((s) => s.paidAmount > 0);
  const existingStudentIds = new Set(existingTxns.map((t) => t.studentId));
  const newTxns: Transaction[] = [];

  paidStudents.forEach((stu, idx) => {
    if (!existingStudentIds.has(stu.id)) {
      const totalAmount = stu.totalFee || (stu.baseFee + (stu.onlineCharges || 30));
      newTxns.push({
        id: `TXN-SYNC-${stu.id}`,
        receiptNo: stu.lastReceiptNo || `MS-2026-${(100 + idx + 1).toString().padStart(4, '0')}`,
        studentId: stu.id,
        studentName: stu.studentName,
        registrationNo: stu.registrationNo,
        fatherName: stu.fatherName,
        classOrStream: stu.classOrStream,
        baseFee: stu.baseFee,
        onlineCharges: stu.onlineCharges || settings?.defaultOnlineCharge || 30,
        totalAmount,
        paidAmount: stu.paidAmount,
        dueAmount: Math.max(0, totalAmount - stu.paidAmount),
        paymentMode: stu.paymentMode || 'CASH',
        transactionRef: stu.transactionRef || '',
        paymentDate: stu.paymentDate || `${new Date().toISOString().slice(0, 10)} 10:00`,
        collectedBy: settings?.cashierName || 'Counter Clerk',
        remarks: stu.remarks || 'Auto-synced from Student Record',
      });
    }
  });

  return [...existingTxns, ...newTxns];
}

export function saveTransactionsToStorage(transactions: Transaction[]): void {
  try {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Failed to save transactions to localStorage:', e);
  }
}

export function getStoredSettings(): InstituteSettings {
  try {
    const data = localStorage.getItem(KEYS.SETTINGS);
    if (data) {
      return { ...initialInstituteSettings, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return initialInstituteSettings;
}

export function saveSettingsToStorage(settings: InstituteSettings): void {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

// Next Receipt Number Generator
export function getNextReceiptNumber(): string {
  let counter = 1;
  try {
    const storedCounter = localStorage.getItem(KEYS.RECEIPT_COUNTER);
    if (storedCounter) {
      counter = parseInt(storedCounter, 10);
    }
  } catch (e) {
    console.error('Receipt counter error:', e);
  }

  const settings = getStoredSettings();
  const yearSuffix = settings.academicYear.replace(/20(\d{2})/g, '$1'); // e.g. 2026-2027 -> 26-27
  const pad = String(counter).padStart(4, '0');
  const receiptNo = `REC/${yearSuffix}/${pad}`;

  // Increment counter for next use
  localStorage.setItem(KEYS.RECEIPT_COUNTER, String(counter + 1));
  return receiptNo;
}

// Next Registration Slip / Receipt Number Generator (e.g. REG/26-27/0001)
export function getNextRegistrationReceiptNumber(): string {
  let counter = 1;
  try {
    const storedCounter = localStorage.getItem(KEYS.REG_RECEIPT_COUNTER);
    if (storedCounter) {
      counter = parseInt(storedCounter, 10);
    }
  } catch (e) {
    console.error('Registration receipt counter error:', e);
  }

  const settings = getStoredSettings();
  const yearSuffix = settings.academicYear.replace(/20(\d{2})/g, '$1'); // e.g. 2026-2027 -> 26-27
  const pad = String(counter).padStart(4, '0');
  const receiptNo = `REG/${yearSuffix}/${pad}`;

  // Increment counter for next use
  localStorage.setItem(KEYS.REG_RECEIPT_COUNTER, String(counter + 1));
  return receiptNo;
}

// Convert numbers to Indian Currency Words (e.g., 1430 => "Rupees One Thousand Four Hundred Thirty Only")
export function numberToWordsInINR(num: number): string {
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    if (n < 20) return a[n];
    const digit = n % 10;
    if (n < 100) return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : ' ');
    if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? 'and ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? inWords(n % 10000000) : '');
  }

  if (num === 0) return 'Rupees Zero Only';
  const whole = Math.floor(num);
  const fraction = Math.round((num - whole) * 100);

  let res = 'Rupees ' + inWords(whole).trim();
  if (fraction > 0) {
    res += ' and ' + inWords(fraction).trim() + ' Paise';
  }
  return res + ' Only';
}
