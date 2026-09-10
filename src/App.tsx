import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  getStoredStudents, 
  saveStudentsToStorage, 
  getStoredRegistrationStudents,
  saveRegistrationStudentsToStorage,
  getStoredTransactions, 
  saveTransactionsToStorage, 
  getStoredSettings, 
  saveSettingsToStorage, 
  getNextReceiptNumber,
  syncTransactionsFromStudents,
} from './services/storageService';
import { 
  subscribeSchoolData, 
  saveStudentToCloud, 
  saveRegistrationStudentToCloud,
  deleteRegistrationStudentFromCloud,
  clearRegistrationCloudData,
  saveTransactionToCloud, 
  saveSettingsToCloud, 
  deleteStudentFromCloud, 
  deleteTransactionFromCloud,
  clearSchoolCloudData 
} from './services/firebaseSyncService';
import { Student, RegistrationStudent, Transaction, InstituteSettings, PaymentMode, FormIssueStatus, FeeStageKey, FEE_STAGES_CONFIG, PaymentStatus } from './types';
import { initialStudents, initialTransactions, initialRegistrationStudents } from './data/mockStudents';
import { Header } from './components/Header';
import { StudentList } from './components/StudentList';
import { FeeReceiptModal } from './components/FeeReceiptModal';
import { WhatsAppShareModal } from './components/WhatsAppShareModal';
import { PdfUploadModal } from './components/PdfUploadModal';
import { TransactionHistory } from './components/TransactionHistory';
import { RecordPaymentModal } from './components/RecordPaymentModal';
import { LogTransactionModal } from './components/LogTransactionModal';
import { AddEditStudentModal } from './components/AddEditStudentModal';
import { IssueFormModal } from './components/IssueFormModal';
import { SettingsModal } from './components/SettingsModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { LoginPage } from './components/LoginPage';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { DailySettlementModal } from './components/DailySettlementModal';
import { MainDashboardHub } from './components/MainDashboardHub';
import { RegistrationModule } from './components/Registration/RegistrationModule';
import { StudentLifecycleModule } from './components/Lifecycle/StudentLifecycleModule';
import { OfflineIndicator } from './components/PWA/OfflineIndicator';
import { RotateCcw, CheckCircle2, X, ArrowLeft, School, BookOpen, Layers } from 'lucide-react';

interface UndoAction {
  id: string;
  message: string;
  subMessage?: string;
  onUndo: () => void;
}

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [registrationStudents, setRegistrationStudents] = useState<RegistrationStudent[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<InstituteSettings>(getStoredSettings());

  // Top-Level Module Navigation: 'HUB' | 'EXAMINATION' | 'REGISTRATION' | 'LIFECYCLE'
  const [activeModule, setActiveModule] = useState<'HUB' | 'EXAMINATION' | 'REGISTRATION' | 'LIFECYCLE'>('HUB');

  // Accidental Deletion Protection & Undo state
  const [undoAction, setUndoAction] = useState<UndoAction | null>(null);
  const [undoCountdown, setUndoCountdown] = useState<number>(10);
  const [restoredNotice, setRestoredNotice] = useState<string | null>(null);

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'students' | 'upload' | 'transactions' | 'settings'>('students');

  // Auth session state
  const [currentSchoolCode, setCurrentSchoolCode] = useState<string>(() => {
    try {
      const savedSession = localStorage.getItem('fee_app_active_session_v1');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed.isLoggedIn && parsed.schoolCode) return parsed.schoolCode;
      }
    } catch (e) {
      console.error(e);
    }
    return '';
  });

  // Modal states
  const [selectedStudentForReceipt, setSelectedStudentForReceipt] = useState<Student | null>(null);
  const [selectedStudentForWhatsApp, setSelectedStudentForWhatsApp] = useState<Student | null>(null);
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState<Student | null>(null);
  const [selectedStudentForIssueForm, setSelectedStudentForIssueForm] = useState<Student | null>(null);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isUploadPdfOpen, setIsUploadPdfOpen] = useState(false);
  const [isLogTransactionOpen, setIsLogTransactionOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isDailySettlementOpen, setIsDailySettlementOpen] = useState(false);

  const handleLoginSuccess = (schoolCode: string) => {
    setCurrentSchoolCode(schoolCode);
    try {
      localStorage.setItem('fee_app_active_session_v1', JSON.stringify({
        schoolCode,
        isLoggedIn: true,
        loginTime: new Date().toISOString()
      }));
    } catch (e) {
      console.error(e);
    }
    setSettings(prev => ({ ...prev, code: schoolCode }));
  };

  const handleLogout = () => {
    setCurrentSchoolCode('');
    localStorage.removeItem('fee_app_active_session_v1');
  };

  const isFirstStudentFetch = useRef(true);
  const isFirstRegStudentFetch = useRef(true);
  const isFirstTxnFetch = useRef(true);
  const isFirstSettingsFetch = useRef(true);

  // Initialize data on mount and listen to Firebase real-time updates for school code
  useEffect(() => {
    if (!currentSchoolCode) return;

    const loadedStudents = getStoredStudents();
    const loadedRegStudents = getStoredRegistrationStudents();
    const loadedTxns = getStoredTransactions();
    setStudents(loadedStudents);
    setRegistrationStudents(loadedRegStudents);
    setTransactions(loadedTxns);

    const schoolCode = currentSchoolCode;

    const unsubscribe = subscribeSchoolData(
      schoolCode,
      (cloudStudents) => {
        if (isFirstStudentFetch.current && cloudStudents.length === 0 && loadedStudents.length > 0) {
          // Seed local initial students to cloud if cloud is empty on first load
          loadedStudents.forEach((stu) => {
            saveStudentToCloud(stu, schoolCode);
          });
        } else {
          setStudents(cloudStudents);
          saveStudentsToStorage(cloudStudents);
        }
        isFirstStudentFetch.current = false;
      },
      (cloudTxns) => {
        if (isFirstTxnFetch.current && cloudTxns.length === 0 && loadedTxns.length > 0) {
          // Seed local txns to cloud on first load
          loadedTxns.forEach((txn) => {
            saveTransactionToCloud(txn, schoolCode);
          });
        } else {
          setTransactions(cloudTxns);
          saveTransactionsToStorage(cloudTxns);
        }
        isFirstTxnFetch.current = false;
      },
      (cloudSettings) => {
        if (cloudSettings) {
          setSettings(cloudSettings);
          saveSettingsToStorage(cloudSettings);
        } else if (isFirstSettingsFetch.current) {
          saveSettingsToCloud(getStoredSettings(), schoolCode);
        }
        isFirstSettingsFetch.current = false;
      },
      (cloudRegStudents) => {
        setRegistrationStudents(cloudRegStudents);
        saveRegistrationStudentsToStorage(cloudRegStudents);
        isFirstRegStudentFetch.current = false;
      }
    );

    return () => unsubscribe();
  }, [currentSchoolCode]);

  useEffect(() => {
    if (!undoAction) return;
    setUndoCountdown(10);
    const interval = setInterval(() => {
      setUndoCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setUndoAction(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [undoAction?.id]);

  // Update storage AND Cloud Firestore whenever students, registrations or transactions change
  const updateStudentsState = (newStudents: Student[]) => {
    setStudents(newStudents);
    saveStudentsToStorage(newStudents);
  };

  const updateRegistrationStudentsState = (newRegStudents: RegistrationStudent[]) => {
    setRegistrationStudents(newRegStudents);
    saveRegistrationStudentsToStorage(newRegStudents);
    if (currentSchoolCode) {
      if (newRegStudents.length === 0) {
        clearRegistrationCloudData(currentSchoolCode);
      } else {
        newRegStudents.forEach(reg => saveRegistrationStudentToCloud(reg, currentSchoolCode));
      }
    }
  };

  const handleDeleteRegistrationStudent = (studentId: string) => {
    const studentToDelete = registrationStudents.find((s) => s.id === studentId);
    const previousRegStudents = [...registrationStudents];
    const updated = registrationStudents.filter((s) => s.id !== studentId);
    setRegistrationStudents(updated);
    saveRegistrationStudentsToStorage(updated);
    if (currentSchoolCode) {
      deleteRegistrationStudentFromCloud(studentId, currentSchoolCode);
    }
    if (studentToDelete) {
      setUndoAction({
        id: `reg-${studentId}-${Date.now()}`,
        message: `पंजीकरण: ${studentToDelete.studentName} (${studentToDelete.formNo}) हटाया गया`,
        subMessage: 'गलती से हटा? पूर्ववत (Undo) दबाकर तुरंत वापस लाएं।',
        onUndo: () => {
          setRegistrationStudents(previousRegStudents);
          saveRegistrationStudentsToStorage(previousRegStudents);
          if (currentSchoolCode) {
            saveRegistrationStudentToCloud(studentToDelete, currentSchoolCode);
          }
        },
      });
    }
  };

  const handleClearAllRegistrationStudents = () => {
    const previousRegStudents = [...registrationStudents];
    setRegistrationStudents([]);
    saveRegistrationStudentsToStorage([]);
    if (currentSchoolCode) {
      clearRegistrationCloudData(currentSchoolCode);
    }
    setUndoAction({
      id: `reg-clear-all-${Date.now()}`,
      message: `सभी ${previousRegStudents.length} पंजीकरण रिकॉर्ड हटाए गए`,
      subMessage: 'गलती से हटा? पूर्ववत (Undo) दबाकर तुरंत वापस लाएं।',
      onUndo: () => {
        setRegistrationStudents(previousRegStudents);
        saveRegistrationStudentsToStorage(previousRegStudents);
        if (currentSchoolCode) {
          previousRegStudents.forEach((s) => saveRegistrationStudentToCloud(s, currentSchoolCode));
        }
      },
    });
  };

  const updateTransactionsState = (newTxns: Transaction[]) => {
    setTransactions(newTxns);
    saveTransactionsToStorage(newTxns);
  };

  const handleSaveSettings = (newSettings: InstituteSettings) => {
    setSettings(newSettings);
    saveSettingsToStorage(newSettings);
    if (currentSchoolCode) {
      saveSettingsToCloud(newSettings, currentSchoolCode);
    }
  };

  // Examination Form Status Update Handler
  const handleUpdateFormStatus = (
    studentId: string,
    formIssueStatus: FormIssueStatus,
    formNo: string,
    formIssueDate?: string,
    formSubmissionDate?: string
  ) => {
    const updatedStudentsList = students.map((s) => {
      if (s.id === studentId) {
        const updated = {
          ...s,
          formIssueStatus,
          formNo: formNo || s.formNo || `EF-${s.registrationNo.slice(-6)}`,
          formIssueDate: formIssueStatus === 'NOT_ISSUED' ? '' : (formIssueDate || s.formIssueDate || new Date().toISOString().slice(0, 16)),
          formSubmissionDate: formIssueStatus === 'SUBMITTED' ? (formSubmissionDate || s.formSubmissionDate || new Date().toISOString().slice(0, 16)) : '',
          updatedAt: new Date().toISOString(),
        };
        if (currentSchoolCode) saveStudentToCloud(updated, currentSchoolCode);
        return updated;
      }
      return s;
    });
    updateStudentsState(updatedStudentsList);
  };

  // Payment Confirmation Logic
  const handleConfirmPayment = (
    studentId: string,
    paidAmount: number,
    paymentMode: PaymentMode,
    transactionRef: string,
    remarks: string
  ) => {
    const targetStudent = students.find((s) => s.id === studentId);
    if (!targetStudent) return;

    const onlineCharges = targetStudent.onlineCharges || settings.defaultOnlineCharge || 30;
    const totalFee = targetStudent.totalFee || (targetStudent.baseFee + onlineCharges);
    const newPaidAmount = targetStudent.paidAmount + paidAmount;
    const isFullPaid = newPaidAmount >= totalFee;
    const newReceiptNo = getNextReceiptNumber();
    const now = new Date();
    const nowStr = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}`;

    // 1. Update Student
    const updatedStudent: Student = {
      ...targetStudent,
      paidAmount: newPaidAmount,
      paymentStatus: isFullPaid ? 'PAID' : 'PARTIAL',
      formIssueStatus: 'SUBMITTED',
      formSubmissionDate: targetStudent.formSubmissionDate || new Date().toISOString().slice(0, 10),
      formNo: targetStudent.formNo || `EF-${targetStudent.registrationNo.slice(-6)}`,
      paymentDate: nowStr,
      paymentMode,
      lastReceiptNo: newReceiptNo,
      transactionRef,
      remarks,
      updatedAt: new Date().toISOString(),
    };

    const updatedStudentsList = students.map((s) => (s.id === studentId ? updatedStudent : s));
    updateStudentsState(updatedStudentsList);
    if (currentSchoolCode) saveStudentToCloud(updatedStudent, currentSchoolCode);

    // 2. Create Transaction Record
    const newTransaction: Transaction = {
      id: `TXN-${Date.now()}`,
      receiptNo: newReceiptNo,
      studentId: targetStudent.id,
      studentName: targetStudent.studentName,
      registrationNo: targetStudent.registrationNo,
      fatherName: targetStudent.fatherName,
      classOrStream: targetStudent.classOrStream,
      baseFee: targetStudent.baseFee,
      onlineCharges,
      totalAmount: totalFee,
      paidAmount,
      dueAmount: Math.max(0, totalFee - newPaidAmount),
      paymentMode,
      transactionRef,
      paymentDate: nowStr,
      collectedBy: settings.cashierName || 'Counter Clerk',
      remarks,
    };

    const updatedTxnsList = [newTransaction, ...transactions];
    updateTransactionsState(updatedTxnsList);
    
    if (currentSchoolCode) {
      saveTransactionToCloud(newTransaction, currentSchoolCode);
    }

    // 3. Open Traditional Receipt Modal automatically
    setSelectedStudentForReceipt(updatedStudent);
  };

  // Direct Log Transaction Handler
  const handleLogTransaction = (
    newTxnData: Partial<Transaction>,
    targetStudentId?: string
  ) => {
    const newReceiptNo = getNextReceiptNumber();
    let updatedStudentsList = [...students];

    const now = new Date();
    const defaultDateStr = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}`;

    if (targetStudentId) {
      const studentIndex = students.findIndex((s) => s.id === targetStudentId);
      if (studentIndex >= 0) {
        const target = students[studentIndex];
        const newPaidAmount = target.paidAmount + (newTxnData.paidAmount || 0);
        const totalFee = target.totalFee || (target.baseFee + target.onlineCharges);
        const isFull = newPaidAmount >= totalFee;

        const updatedStudent: Student = {
          ...target,
          paidAmount: newPaidAmount,
          paymentStatus: isFull ? 'PAID' : 'PARTIAL',
          paymentDate: newTxnData.paymentDate || defaultDateStr,
          paymentMode: newTxnData.paymentMode || 'UPI',
          lastReceiptNo: newReceiptNo,
          transactionRef: newTxnData.transactionRef || '',
          remarks: newTxnData.remarks || target.remarks,
          updatedAt: new Date().toISOString(),
        };

        updatedStudentsList[studentIndex] = updatedStudent;
        updateStudentsState(updatedStudentsList);
        if (currentSchoolCode) saveStudentToCloud(updatedStudent, currentSchoolCode);
      }
    }

    const newTransaction: Transaction = {
      id: `TXN-${Date.now()}`,
      receiptNo: newReceiptNo,
      studentId: newTxnData.studentId || `STU-${Date.now()}`,
      studentName: newTxnData.studentName || 'MANUAL ENTRY',
      registrationNo: newTxnData.registrationNo || 'N/A',
      fatherName: newTxnData.fatherName || 'N/A',
      classOrStream: newTxnData.classOrStream || 'Intermediate Science (12th)',
      transactionType: newTxnData.transactionType || 'Board Exam Fee',
      baseFee: newTxnData.baseFee || 1400,
      onlineCharges: newTxnData.onlineCharges ?? settings.defaultOnlineCharge ?? 30,
      totalAmount: newTxnData.totalAmount || 1430,
      paidAmount: newTxnData.paidAmount || 1430,
      dueAmount: newTxnData.dueAmount || 0,
      paymentMode: newTxnData.paymentMode || 'UPI',
      transactionRef: newTxnData.transactionRef || `REF-${Date.now().toString().slice(-6)}`,
      paymentDate: newTxnData.paymentDate || defaultDateStr,
      collectedBy: newTxnData.collectedBy || settings.cashierName || 'Counter Clerk',
      remarks: newTxnData.remarks || '',
    };

    const updatedTxnsList = [newTransaction, ...transactions];
    updateTransactionsState(updatedTxnsList);
    if (currentSchoolCode) {
      saveTransactionToCloud(newTransaction, currentSchoolCode);
    }
  };

  // Delete Transaction Handler
  const handleDeleteTransaction = (txnId: string) => {
    const txnToDelete = transactions.find((t) => t.id === txnId);
    if (!txnToDelete) return;

    const previousTxns = [...transactions];
    const previousStudents = [...students];

    // 1. Remove transaction
    const updatedTxns = transactions.filter((t) => t.id !== txnId);
    updateTransactionsState(updatedTxns);
    if (currentSchoolCode) {
      deleteTransactionFromCloud(txnId, currentSchoolCode);
    }

    // 2. Revert student paid amount
    const updatedStudents = students.map((s) => {
      if (s.id === txnToDelete.studentId) {
        const newPaidAmount = Math.max(0, s.paidAmount - txnToDelete.paidAmount);
        const totalFee = s.totalFee || (s.baseFee + (s.onlineCharges || 30));
        
        let newStatus: 'UNPAID' | 'PARTIAL' | 'PAID' = 'UNPAID';
        if (newPaidAmount >= totalFee) newStatus = 'PAID';
        else if (newPaidAmount > 0) newStatus = 'PARTIAL';

        const updated = {
          ...s,
          paidAmount: newPaidAmount,
          paymentStatus: newStatus,
          updatedAt: new Date().toISOString()
        };
        if (currentSchoolCode) saveStudentToCloud(updated, currentSchoolCode);
        return updated;
      }
      return s;
    });
    updateStudentsState(updatedStudents);

    // Provide Undo Opportunity (ग़लती से सुरक्षा)
    setUndoAction({
      id: `txn-${txnId}-${Date.now()}`,
      message: `रसीद #${txnToDelete.receiptNo} (${txnToDelete.studentName}, Rs. ${txnToDelete.paidAmount}) हटाई गई`,
      subMessage: 'गलती से हट गया? पूर्ववत (Undo) दबाकर तुरंत वापस लाएं।',
      onUndo: () => {
        updateTransactionsState(previousTxns);
        updateStudentsState(previousStudents);
        if (currentSchoolCode) {
          saveTransactionToCloud(txnToDelete, currentSchoolCode);
          const origStudent = previousStudents.find((s) => s.id === txnToDelete.studentId);
          if (origStudent) saveStudentToCloud(origStudent, currentSchoolCode);
        }
        setUndoAction(null);
      },
    });
  };

  // Bulk Delete Transactions Handler
  const handleBulkDeleteTransactions = (txnIds: string[]) => {
    if (!txnIds.length) return;
    const txnsToDelete = transactions.filter((t) => txnIds.includes(t.id));
    const previousTxns = [...transactions];
    const previousStudents = [...students];

    const updatedTxns = transactions.filter((t) => !txnIds.includes(t.id));
    updateTransactionsState(updatedTxns);
    if (currentSchoolCode) {
      txnIds.forEach((id) => deleteTransactionFromCloud(id, currentSchoolCode));
    }

    const updatedStudents = students.map((s) => {
      const matchedTxns = txnsToDelete.filter((t) => t.studentId === s.id);
      if (matchedTxns.length > 0) {
        const deducted = matchedTxns.reduce((sum, t) => sum + t.paidAmount, 0);
        const newPaidAmount = Math.max(0, s.paidAmount - deducted);
        const totalFee = s.totalFee || (s.baseFee + (s.onlineCharges || 30));
        let newStatus: 'UNPAID' | 'PARTIAL' | 'PAID' = 'UNPAID';
        if (newPaidAmount >= totalFee) newStatus = 'PAID';
        else if (newPaidAmount > 0) newStatus = 'PARTIAL';
        const updated = {
          ...s,
          paidAmount: newPaidAmount,
          paymentStatus: newStatus,
          updatedAt: new Date().toISOString(),
        };
        if (currentSchoolCode) saveStudentToCloud(updated, currentSchoolCode);
        return updated;
      }
      return s;
    });
    updateStudentsState(updatedStudents);

    // Provide Undo Opportunity (ग़लती से सुरक्षा)
    setUndoAction({
      id: `bulk-txns-${Date.now()}`,
      message: `${txnsToDelete.length} लेन-देन रसीदें हटाई गईं`,
      subMessage: 'गलती से हटा? पूर्ववत (Undo) दबाकर सभी को पुनः स्थापित करें।',
      onUndo: () => {
        updateTransactionsState(previousTxns);
        updateStudentsState(previousStudents);
        if (currentSchoolCode) {
          txnsToDelete.forEach((t) => saveTransactionToCloud(t, currentSchoolCode));
          previousStudents.forEach((s) => saveStudentToCloud(s, currentSchoolCode));
        }
        setUndoAction(null);
      },
    });
  };

  // Add / Edit Student Save
  const handleSaveStudent = (studentData: Partial<Student>) => {
    if (studentToEdit) {
      // Edit
      const updatedList = students.map((s) => {
        if (s.id === studentToEdit.id) {
          let updatedFormIssueDate = studentData.formIssueDate !== undefined ? studentData.formIssueDate : s.formIssueDate;
          let updatedFormSubmissionDate = studentData.formSubmissionDate !== undefined ? studentData.formSubmissionDate : s.formSubmissionDate;
          
          if (studentData.formIssueStatus === 'SUBMITTED' && s.formIssueStatus !== 'SUBMITTED') {
            updatedFormSubmissionDate = updatedFormSubmissionDate || new Date().toISOString().slice(0, 16);
            updatedFormIssueDate = updatedFormIssueDate || new Date().toISOString().slice(0, 16);
          } else if (studentData.formIssueStatus === 'ISSUED' && s.formIssueStatus === 'NOT_ISSUED') {
            updatedFormIssueDate = updatedFormIssueDate || new Date().toISOString().slice(0, 16);
          } else if (studentData.formIssueStatus === 'NOT_ISSUED') {
            updatedFormIssueDate = '';
            updatedFormSubmissionDate = '';
          }

          const updated = { 
            ...s, 
            ...studentData, 
            formIssueDate: updatedFormIssueDate,
            formSubmissionDate: updatedFormSubmissionDate,
            updatedAt: new Date().toISOString() 
          };
          if (currentSchoolCode) saveStudentToCloud(updated, currentSchoolCode);
          return updated;
        }
        return s;
      });
      updateStudentsState(updatedList);
      setStudentToEdit(null);
    } else {
      // Add New
      const onlineCharge = studentData.onlineCharges ?? settings.defaultOnlineCharge ?? 30;
      const baseFee = studentData.baseFee || 1400;

      const newStudent: Student = {
        id: `STU-${Date.now()}`,
        sNo: students.length + 1,
        registrationNo: studentData.registrationNo || `R-31337${Math.floor(1000 + Math.random() * 9000)}-25`,
        studentName: studentData.studentName || 'NEW STUDENT',
        fatherName: studentData.fatherName || '',
        motherName: studentData.motherName || '',
        dob: studentData.dob || '',
        casteCategory: studentData.casteCategory || 'General',
        examType: studentData.examType || 'REGULAR',
        classOrStream: studentData.classOrStream || 'Intermediate Science (12th)',
        phone: studentData.phone || '',
        baseFee,
        onlineCharges: onlineCharge,
        totalFee: baseFee + onlineCharge,
        paidAmount: 0,
        paymentStatus: 'UNPAID',
        formIssueStatus: studentData.formIssueStatus || 'NOT_ISSUED',
        formNo: studentData.formNo || '',
        formIssueDate: studentData.formIssueDate || '',
        formSubmissionDate: studentData.formSubmissionDate || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedList = [newStudent, ...students];
      updateStudentsState(updatedList);
      if (currentSchoolCode) saveStudentToCloud(newStudent, currentSchoolCode);
      setIsAddStudentOpen(false);
    }
  };

  // Delete Student
  const handleDeleteStudent = (studentId: string) => {
    const studentToDelete = students.find((s) => s.id === studentId);
    if (!studentToDelete) return;

    const previousStudents = [...students];
    const updatedList = students.filter((s) => s.id !== studentId);
    updateStudentsState(updatedList);
    if (currentSchoolCode) {
      deleteStudentFromCloud(studentId, currentSchoolCode);
    }

    // Provide Undo Opportunity (ग़लती से सुरक्षा)
    setUndoAction({
      id: `stu-${studentId}-${Date.now()}`,
      message: `छात्र "${studentToDelete.studentName}" (पंजीकरण: ${studentToDelete.registrationNo}) हटाया गया`,
      subMessage: 'गलती से हट गया? पूर्ववत (Undo) दबाकर तुरंत वापस लाएं।',
      onUndo: () => {
        updateStudentsState(previousStudents);
        if (currentSchoolCode) {
          saveStudentToCloud(studentToDelete, currentSchoolCode);
        }
        setUndoAction(null);
      },
    });
  };

  // Delete Selected Students
  const handleDeleteSelectedStudents = (studentIds: string[]) => {
    if (!studentIds.length) return;
    const deletedStudents = students.filter((s) => studentIds.includes(s.id));
    const previousStudents = [...students];

    const updatedList = students.filter((s) => !studentIds.includes(s.id));
    updateStudentsState(updatedList);
    if (currentSchoolCode) {
      studentIds.forEach((id) => deleteStudentFromCloud(id, currentSchoolCode));
    }

    // Provide Undo Opportunity (ग़लती से सुरक्षा)
    setUndoAction({
      id: `bulk-stu-${Date.now()}`,
      message: `${deletedStudents.length} छात्र रिकॉर्ड हटाए गए`,
      subMessage: 'गलती से हटा? पूर्ववत (Undo) दबाकर सभी को तुरंत वापस लाएं।',
      onUndo: () => {
        updateStudentsState(previousStudents);
        if (currentSchoolCode) {
          deletedStudents.forEach((s) => saveStudentToCloud(s, currentSchoolCode));
        }
        setUndoAction(null);
      },
    });
  };

  // Bulk Issue Forms Handler
  const handleBulkIssueForms = (studentIds: string[], targetStatus: FormIssueStatus = 'ISSUED') => {
    const todayStr = new Date().toLocaleString('en-IN').slice(0, 16);
    const updatedList = students.map((s, idx) => {
      if (studentIds.includes(s.id)) {
        const formNo = s.formNo || `EF-26-${(100 + (s.sNo || idx + 1)).toString().padStart(4, '0')}`;
        const updated = {
          ...s,
          formIssueStatus: targetStatus,
          formNo,
          formIssueDate: targetStatus === 'NOT_ISSUED' ? '' : (s.formIssueDate || todayStr),
          formSubmissionDate: targetStatus === 'SUBMITTED' ? (s.formSubmissionDate || todayStr) : (targetStatus === 'NOT_ISSUED' ? '' : s.formSubmissionDate),
          updatedAt: new Date().toISOString(),
        };
        if (currentSchoolCode) saveStudentToCloud(updated, currentSchoolCode);
        return updated;
      }
      return s;
    });
    updateStudentsState(updatedList);
  };

  // Restore 48 Official PDF Students Dataset
  const handleRestoreOfficialData = () => {
    updateStudentsState(initialStudents);
    if (currentSchoolCode) {
      initialStudents.forEach(stu => saveStudentToCloud(stu, currentSchoolCode));
    }
  };

  // Clear All Students
  const handleClearAllStudents = () => {
    setStudents([]);
    saveStudentsToStorage([]);
    if (currentSchoolCode) {
      clearSchoolCloudData(currentSchoolCode);
    }
  };

  // Clear All Transactions
  const handleClearAllTransactions = () => {
    updateTransactionsState([]);
    if (currentSchoolCode) {
      // NOTE: Should actually delete all transactions from cloud here
      // But we will just sync the reverted students for now
    }
    
    // Also revert all students to UNPAID
    const updatedStudents = students.map((s) => {
      const updated = {
        ...s,
        paidAmount: 0,
        paymentStatus: 'UNPAID' as const,
        updatedAt: new Date().toISOString()
      };
      if (currentSchoolCode) saveStudentToCloud(updated, currentSchoolCode);
      return updated;
    });
    updateStudentsState(updatedStudents);
  };

  // Save 4-Stage Lifecycle Fee Payment
  const handleSaveStagePayment = (
    studentId: string, 
    stageKey: FeeStageKey, 
    paymentData: {
      paidAmount: number;
      paymentMode: PaymentMode;
      receiptNo: string;
      paymentDate: string;
      transactionRef?: string;
      remarks?: string;
    }
  ) => {
    const stageConf = FEE_STAGES_CONFIG[stageKey];
    const targetExamStudent = students.find(s => s.id === studentId);
    const targetRegStudent = registrationStudents.find(s => s.id === studentId);

    const studentName = targetExamStudent?.studentName || targetRegStudent?.studentName || 'Student';
    const fatherName = targetExamStudent?.fatherName || targetRegStudent?.fatherName || '';
    const regNo = targetExamStudent?.registrationNo || targetRegStudent?.formNo || studentId;
    const stream = targetExamStudent?.classOrStream || targetRegStudent?.stream || 'Intermediate Science';

    // 1. Log transaction to Day Book
    const newTxn: Transaction = {
      id: `txn-stage-${Date.now()}`,
      receiptNo: paymentData.receiptNo,
      studentId: studentId,
      studentName: studentName,
      registrationNo: regNo,
      fatherName: fatherName,
      classOrStream: stream,
      baseFee: paymentData.paidAmount,
      onlineCharges: 0,
      totalAmount: paymentData.paidAmount,
      paidAmount: paymentData.paidAmount,
      dueAmount: 0,
      paymentMode: paymentData.paymentMode,
      transactionRef: paymentData.transactionRef || '',
      paymentDate: paymentData.paymentDate,
      collectedBy: settings.cashierName || 'Cashier Counter',
      remarks: `${stageConf.name} (${stageConf.hindi}) - ${paymentData.remarks || 'Collected'}`,
      transactionType: stageConf.name
    };

    updateTransactionsState([newTxn, ...transactions]);
    if (currentSchoolCode) {
      saveTransactionToCloud(newTxn, currentSchoolCode);
    }

    // 2. If Exam Form stage, also update examination student if matched
    if (stageKey === 'EXAM_12' && targetExamStudent) {
      const updatedStudents = students.map(s => {
        if (s.id === studentId) {
          const updated: Student = {
            ...s,
            paidAmount: paymentData.paidAmount,
            paymentStatus: 'PAID',
            paymentDate: paymentData.paymentDate,
            paymentMode: paymentData.paymentMode,
            lastReceiptNo: paymentData.receiptNo,
            transactionRef: paymentData.transactionRef,
            updatedAt: new Date().toISOString()
          };
          if (currentSchoolCode) saveStudentToCloud(updated, currentSchoolCode);
          return updated;
        }
        return s;
      });
      updateStudentsState(updatedStudents);
    }

    // 3. If Registration stage, also update registration student if matched
    if (stageKey === 'REG_11' && targetRegStudent) {
      const updatedRegs = registrationStudents.map(s => {
        if (s.id === studentId) {
          const updated: RegistrationStudent = {
            ...s,
            paidAmount: paymentData.paidAmount,
            paymentStatus: 'PAID',
            paymentDate: paymentData.paymentDate,
            paymentMode: paymentData.paymentMode,
            receiptNo: paymentData.receiptNo,
            transactionRef: paymentData.transactionRef,
            registrationStatus: 'FEE_PAID',
            updatedAt: new Date().toISOString()
          };
          if (currentSchoolCode) saveRegistrationStudentToCloud(updated, currentSchoolCode);
          return updated;
        }
        return s;
      });
      updateRegistrationStudentsState(updatedRegs);
    }
  };

  // Update student registration number, session and 4-stage custom fee amounts
  const handleUpdateStudentLifecycleDetails = (
    studentId: string,
    updates: {
      registrationNo?: string;
      session?: string;
      stagesData?: Record<FeeStageKey, { expectedFee: number; paidAmount: number; status: PaymentStatus; receiptNo?: string }>;
    }
  ) => {
    let matchedInExam = false;

    // Check in examination students
    const updatedStudents = students.map(s => {
      if (s.id === studentId) {
        matchedInExam = true;
        const examStage = updates.stagesData?.EXAM_12;
        const updated: Student = {
          ...s,
          registrationNo: updates.registrationNo !== undefined ? updates.registrationNo : s.registrationNo,
          session: updates.session || s.session,
          totalFee: examStage ? examStage.expectedFee : s.totalFee,
          paidAmount: examStage ? examStage.paidAmount : s.paidAmount,
          paymentStatus: examStage ? examStage.status : s.paymentStatus,
          feeLifecycle: {
            adm_11: updates.stagesData?.ADM_11 ? {
              stageKey: 'ADM_11',
              stageName: '11th Admission',
              stageHindi: '11वीं नामांकन शुल्क',
              stageClass: '11th',
              targetSession: updates.session || s.session || '2025-2027',
              expectedFee: updates.stagesData.ADM_11.expectedFee,
              paidAmount: updates.stagesData.ADM_11.paidAmount,
              dueAmount: Math.max(0, updates.stagesData.ADM_11.expectedFee - updates.stagesData.ADM_11.paidAmount),
              paymentStatus: updates.stagesData.ADM_11.status,
              receiptNo: updates.stagesData.ADM_11.receiptNo
            } : s.feeLifecycle?.adm_11,
            reg_11: updates.stagesData?.REG_11 ? {
              stageKey: 'REG_11',
              stageName: '11th Registration',
              stageHindi: '11वीं BSEB पंजीयन शुल्क',
              stageClass: '11th',
              targetSession: updates.session || s.session || '2025-2027',
              expectedFee: updates.stagesData.REG_11.expectedFee,
              paidAmount: updates.stagesData.REG_11.paidAmount,
              dueAmount: Math.max(0, updates.stagesData.REG_11.expectedFee - updates.stagesData.REG_11.paidAmount),
              paymentStatus: updates.stagesData.REG_11.status,
              receiptNo: updates.stagesData.REG_11.receiptNo
            } : s.feeLifecycle?.reg_11,
            adm_12: updates.stagesData?.ADM_12 ? {
              stageKey: 'ADM_12',
              stageName: '12th Admission',
              stageHindi: '12वीं नामांकन शुल्क',
              stageClass: '12th',
              targetSession: updates.session || s.session || '2025-2027',
              expectedFee: updates.stagesData.ADM_12.expectedFee,
              paidAmount: updates.stagesData.ADM_12.paidAmount,
              dueAmount: Math.max(0, updates.stagesData.ADM_12.expectedFee - updates.stagesData.ADM_12.paidAmount),
              paymentStatus: updates.stagesData.ADM_12.status,
              receiptNo: updates.stagesData.ADM_12.receiptNo
            } : s.feeLifecycle?.adm_12,
            exam_12: examStage ? {
              stageKey: 'EXAM_12',
              stageName: '12th Exam Form',
              stageHindi: '12वीं BSEB परीक्षा प्रपत्र शुल्क',
              stageClass: '12th',
              targetSession: updates.session || s.session || '2025-2027',
              expectedFee: examStage.expectedFee,
              paidAmount: examStage.paidAmount,
              dueAmount: Math.max(0, examStage.expectedFee - examStage.paidAmount),
              paymentStatus: examStage.status,
              receiptNo: examStage.receiptNo
            } : s.feeLifecycle?.exam_12
          },
          updatedAt: new Date().toISOString()
        };
        if (currentSchoolCode) saveStudentToCloud(updated, currentSchoolCode);
        return updated;
      }
      return s;
    });

    if (matchedInExam) {
      updateStudentsState(updatedStudents);
    }

    // Check in registration students
    const updatedRegs = registrationStudents.map(s => {
      if (s.id === studentId) {
        const regStage = updates.stagesData?.REG_11;
        const updated: RegistrationStudent = {
          ...s,
          formNo: updates.registrationNo !== undefined ? updates.registrationNo : s.formNo,
          session: updates.session || s.session,
          registrationFee: regStage ? regStage.expectedFee : s.registrationFee,
          paidAmount: regStage ? regStage.paidAmount : s.paidAmount,
          paymentStatus: regStage ? regStage.status : s.paymentStatus,
          feeLifecycle: {
            adm_11: updates.stagesData?.ADM_11 ? {
              stageKey: 'ADM_11',
              stageName: '11th Admission',
              stageHindi: '11वीं नामांकन शुल्क',
              stageClass: '11th',
              targetSession: updates.session || s.session || '2026-2028',
              expectedFee: updates.stagesData.ADM_11.expectedFee,
              paidAmount: updates.stagesData.ADM_11.paidAmount,
              dueAmount: Math.max(0, updates.stagesData.ADM_11.expectedFee - updates.stagesData.ADM_11.paidAmount),
              paymentStatus: updates.stagesData.ADM_11.status,
              receiptNo: updates.stagesData.ADM_11.receiptNo
            } : s.feeLifecycle?.adm_11,
            reg_11: regStage ? {
              stageKey: 'REG_11',
              stageName: '11th Registration',
              stageHindi: '11वीं BSEB पंजीयन शुल्क',
              stageClass: '11th',
              targetSession: updates.session || s.session || '2026-2028',
              expectedFee: regStage.expectedFee,
              paidAmount: regStage.paidAmount,
              dueAmount: Math.max(0, regStage.expectedFee - regStage.paidAmount),
              paymentStatus: regStage.status,
              receiptNo: regStage.receiptNo
            } : s.feeLifecycle?.reg_11,
            adm_12: updates.stagesData?.ADM_12 ? {
              stageKey: 'ADM_12',
              stageName: '12th Admission',
              stageHindi: '12वीं नामांकन शुल्क',
              stageClass: '12th',
              targetSession: updates.session || s.session || '2026-2028',
              expectedFee: updates.stagesData.ADM_12.expectedFee,
              paidAmount: updates.stagesData.ADM_12.paidAmount,
              dueAmount: Math.max(0, updates.stagesData.ADM_12.expectedFee - updates.stagesData.ADM_12.paidAmount),
              paymentStatus: updates.stagesData.ADM_12.status,
              receiptNo: updates.stagesData.ADM_12.receiptNo
            } : s.feeLifecycle?.adm_12,
            exam_12: updates.stagesData?.EXAM_12 ? {
              stageKey: 'EXAM_12',
              stageName: '12th Exam Form',
              stageHindi: '12वीं BSEB परीक्षा प्रपत्र शुल्क',
              stageClass: '12th',
              targetSession: updates.session || s.session || '2026-2028',
              expectedFee: updates.stagesData.EXAM_12.expectedFee,
              paidAmount: updates.stagesData.EXAM_12.paidAmount,
              dueAmount: Math.max(0, updates.stagesData.EXAM_12.expectedFee - updates.stagesData.EXAM_12.paidAmount),
              paymentStatus: updates.stagesData.EXAM_12.status,
              receiptNo: updates.stagesData.EXAM_12.receiptNo
            } : s.feeLifecycle?.exam_12
          },
          updatedAt: new Date().toISOString()
        };
        if (currentSchoolCode) saveRegistrationStudentToCloud(updated, currentSchoolCode);
        return updated;
      }
      return s;
    });

    if (!matchedInExam) {
      updateRegistrationStudentsState(updatedRegs);
    }
  };

  // Import extracted students from PDF / Image OCR
  const handleImportStudents = (newExtractedStudents: Student[]) => {
    const updatedList = [...newExtractedStudents, ...students];
    updateStudentsState(updatedList);
    if (currentSchoolCode) {
      newExtractedStudents.forEach(stu => saveStudentToCloud(stu, currentSchoolCode));
    }
  };

  // Calculate high-level stats
  const totalStudentsCount = students.length;
  const paidStudentsCount = students.filter((s) => s.paymentStatus === 'PAID').length;
  const totalCollected = transactions.reduce((acc, t) => acc + t.paidAmount, 0);
  const totalOnlineCharges = transactions.reduce((acc, t) => acc + (t.onlineCharges || 30), 0);

  if (!currentSchoolCode) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} defaultSchoolCode={settings.code || '31337'} />;
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] font-sans text-[#4A453E] pb-24 md:pb-12">
      
      {/* 1. Landing Hub View (Module Selector) */}
      {activeModule === 'HUB' && (
        <div className="pt-6 px-3 sm:px-6">
          <MainDashboardHub
            students={students}
            registrationStudents={registrationStudents}
            transactions={transactions}
            settings={settings}
            onSelectExamination={() => setActiveModule('EXAMINATION')}
            onSelectRegistration={() => setActiveModule('REGISTRATION')}
            onSelectLifecycle={() => setActiveModule('LIFECYCLE')}
            onOpenDailySettlement={() => setIsDailySettlementOpen(true)}
            onOpenSettings={() => {
              setActiveModule('EXAMINATION');
              setActiveTab('settings');
            }}
          />
        </div>
      )}

      {/* 2. 4-Stage Student Lifecycle Master View */}
      {activeModule === 'LIFECYCLE' && (
        <div className="max-w-7xl mx-auto pt-6 px-3 sm:px-6">
          <StudentLifecycleModule
            students={students}
            registrationStudents={registrationStudents}
            settings={settings}
            onBackToHub={() => setActiveModule('HUB')}
            onSaveStagePayment={handleSaveStagePayment}
            onUpdateStudentDetails={handleUpdateStudentLifecycleDetails}
          />
        </div>
      )}

      {/* 3. Registration Module View (Session 2026-2028 - 11th Registration) */}
      {activeModule === 'REGISTRATION' && (
        <div className="max-w-7xl mx-auto pt-6 px-3 sm:px-6">
          <RegistrationModule
            students={registrationStudents}
            settings={settings}
            onUpdateStudents={updateRegistrationStudentsState}
            onDeleteStudent={handleDeleteRegistrationStudent}
            onClearAll={handleClearAllRegistrationStudents}
            onBackToDashboard={() => setActiveModule('HUB')}
            onSwitchToExamination={() => setActiveModule('EXAMINATION')}
          />
        </div>
      )}

      {/* 4. Examination Module View (Session 2025-2027 - 12th Board Exam Form) */}
      {activeModule === 'EXAMINATION' && (
        <>
          {/* Top Quick Module Switch Bar */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-4 py-2 border-b border-indigo-900/40">
            <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
              <button
                onClick={() => setActiveModule('HUB')}
                className="flex items-center gap-1.5 font-bold hover:text-indigo-200 transition bg-white/10 hover:bg-white/20 px-3 py-1 rounded-xl"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>← मुख्य डैशबोर्ड (Main Dashboard)</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-indigo-200 hidden sm:inline">
                  सत्र: <strong>2025-2027 (12वीं परीक्षा प्रपत्र)</strong>
                </span>
                <button
                  onClick={() => setActiveModule('LIFECYCLE')}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition flex items-center gap-1 shadow-xs"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>4-चरणीय पासबुक</span>
                </button>
                <button
                  onClick={() => setActiveModule('REGISTRATION')}
                  className="px-3 py-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl transition flex items-center gap-1 shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>11वीं पंजीयन (2026-28)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Top Header Navigation for Examination Module */}
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            totalStudentsCount={totalStudentsCount}
            paidStudentsCount={paidStudentsCount}
            totalCollected={totalCollected}
            totalOnlineCharges={totalOnlineCharges}
            onOpenAddStudent={() => setIsAddStudentOpen(true)}
            onOpenUploadPdf={() => setIsUploadPdfOpen(true)}
            settings={settings}
            onChangePasswordClick={() => setIsChangePasswordOpen(true)}
            onLogoutClick={handleLogout}
          />

          {/* Main Examination View Area */}
          <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-6 pb-36 sm:pb-24">
            {activeTab === 'students' && (
              <StudentList
                students={students}
                transactions={transactions}
                settings={settings}
                onSelectStudentReceipt={(student) => setSelectedStudentForReceipt(student)}
                onOpenRecordPayment={(student) => setSelectedStudentForPayment(student)}
                onOpenLogTransaction={() => setIsLogTransactionOpen(true)}
                onSwitchToLedger={() => setActiveTab('transactions')}
                onOpenIssueForm={(student) => setSelectedStudentForIssueForm(student)}
                onBulkIssueForms={handleBulkIssueForms}
                onOpenWhatsAppShare={(student) => setSelectedStudentForWhatsApp(student)}
                onEditStudent={(student) => setStudentToEdit(student)}
                onDeleteStudent={handleDeleteStudent}
                onDeleteSelectedStudents={handleDeleteSelectedStudents}
                onClearAllStudents={handleClearAllStudents}
                onOpenAddStudent={() => setIsAddStudentOpen(true)}
                onOpenUploadPdf={() => setIsUploadPdfOpen(true)}
              />
            )}

            {activeTab === 'upload' && (
              <div className="space-y-4">
                <div className="bg-[#F7F5EE] p-6 rounded-2xl border border-[#E6E2D3] shadow-xs text-xs">
                  <h2 className="text-base font-bold text-[#4A453E] mb-1">
                    AI PDF & Image List Extraction
                  </h2>
                  <p className="text-[#787267] mb-4">
                    Upload Intermediate or Matric examination fee lists in PDF format or image screenshots to extract student records automatically.
                  </p>
                  <button
                    onClick={() => setIsUploadPdfOpen(true)}
                    className="px-5 py-2.5 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-xl font-semibold shadow-xs transition inline-flex items-center gap-2"
                  >
                    <span>Launch OCR Upload Tool</span>
                  </button>
                </div>
                <StudentList
                  students={students}
                  settings={settings}
                  onSelectStudentReceipt={(student) => setSelectedStudentForReceipt(student)}
                  onOpenRecordPayment={(student) => setSelectedStudentForPayment(student)}
                  onOpenIssueForm={(student) => setSelectedStudentForIssueForm(student)}
                  onBulkIssueForms={handleBulkIssueForms}
                  onOpenWhatsAppShare={(student) => setSelectedStudentForWhatsApp(student)}
                  onEditStudent={(student) => setStudentToEdit(student)}
                  onDeleteStudent={handleDeleteStudent}
                  onDeleteSelectedStudents={handleDeleteSelectedStudents}
                  onClearAllStudents={handleClearAllStudents}
                  onOpenAddStudent={() => setIsAddStudentOpen(true)}
                  onOpenUploadPdf={() => setIsUploadPdfOpen(true)}
                  onOpenDailySettlement={() => setIsDailySettlementOpen(true)}
                />
              </div>
            )}

            {activeTab === 'transactions' && (
              <TransactionHistory
                transactions={transactions}
                students={students}
                settings={settings}
                onOpenRecordPayment={(student) => setSelectedStudentForPayment(student)}
                onOpenLogTransaction={() => setIsLogTransactionOpen(true)}
                onDeleteTransaction={handleDeleteTransaction}
                onBulkDeleteTransactions={handleBulkDeleteTransactions}
                onClearAllTransactions={handleClearAllTransactions}
                onLoadSampleTransactions={() => {
                  updateTransactionsState(initialTransactions);
                  if (currentSchoolCode) {
                    initialTransactions.forEach((txn) => saveTransactionToCloud(txn, currentSchoolCode));
                  }
                }}
                onSyncPaidStudents={() => {
                  const synced = syncTransactionsFromStudents(students, transactions, settings);
                  updateTransactionsState(synced);
                  if (currentSchoolCode) {
                    synced.forEach((txn) => saveTransactionToCloud(txn, currentSchoolCode));
                  }
                }}
                onViewStudentReceipt={(regNo) => {
                  const matchedStudent = students.find((s) => s.registrationNo === regNo);
                  if (matchedStudent) {
                    setSelectedStudentForReceipt(matchedStudent);
                  }
                }}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsModal
                settings={settings}
                onSaveSettings={handleSaveSettings}
                onForceSync={() => {
                  if (currentSchoolCode) {
                    const loadedStudents = getStoredStudents();
                    const loadedTxns = getStoredTransactions();
                    loadedStudents.forEach(stu => saveStudentToCloud(stu, currentSchoolCode));
                    loadedTxns.forEach(txn => saveTransactionToCloud(txn, currentSchoolCode));
                    saveSettingsToCloud(settings, currentSchoolCode);
                    alert("Sync complete! Local data has been pushed to the cloud.");
                  }
                }}
              />
            )}
          </main>

          {/* Mobile First Bottom Navigation */}
          <MobileBottomNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenLogTransaction={() => setIsLogTransactionOpen(true)}
            onOpenAddStudent={() => setIsAddStudentOpen(true)}
            onOpenDailySettlement={() => setIsDailySettlementOpen(true)}
          />
        </>
      )}

      {/* Traditional Fee Receipt Modal */}
      {selectedStudentForReceipt && (
        <FeeReceiptModal
          student={selectedStudentForReceipt}
          settings={settings}
          onClose={() => setSelectedStudentForReceipt(null)}
          onOpenWhatsApp={(student) => {
            setSelectedStudentForReceipt(null);
            setSelectedStudentForWhatsApp(student);
          }}
        />
      )}

      {/* WhatsApp Sharing Modal */}
      {selectedStudentForWhatsApp && (
        <WhatsAppShareModal
          student={selectedStudentForWhatsApp}
          settings={settings}
          onClose={() => setSelectedStudentForWhatsApp(null)}
        />
      )}

      {/* Record Payment / Collect Fee Modal */}
      {selectedStudentForPayment && (
        <RecordPaymentModal
          student={selectedStudentForPayment}
          settings={settings}
          onClose={() => setSelectedStudentForPayment(null)}
          onConfirmPayment={handleConfirmPayment}
        />
      )}

      {/* Examination Form Management Modal */}
      {selectedStudentForIssueForm && (
        <IssueFormModal
          isOpen={Boolean(selectedStudentForIssueForm)}
          student={selectedStudentForIssueForm}
          settings={settings}
          onClose={() => setSelectedStudentForIssueForm(null)}
          onUpdateFormStatus={handleUpdateFormStatus}
          onProceedToFeeCollection={(student) => {
            setSelectedStudentForIssueForm(null);
            setSelectedStudentForPayment(student);
          }}
        />
      )}

      {/* PDF / Image AI Extraction Modal */}
      <PdfUploadModal
        isOpen={isUploadPdfOpen}
        onClose={() => setIsUploadPdfOpen(false)}
        onImportStudents={handleImportStudents}
        existingStudents={students}
        defaultOnlineCharge={settings.defaultOnlineCharge}
      />

      {/* Add / Edit Student Modal */}
      <AddEditStudentModal
        isOpen={isAddStudentOpen || Boolean(studentToEdit)}
        studentToEdit={studentToEdit}
        onClose={() => {
          setIsAddStudentOpen(false);
          setStudentToEdit(null);
        }}
        onSaveStudent={handleSaveStudent}
        defaultOnlineCharge={settings.defaultOnlineCharge}
      />

      {/* Log Financial Transaction Modal */}
      {/* Log Transaction Modal */}
      <LogTransactionModal
        isOpen={isLogTransactionOpen}
        students={students}
        settings={settings}
        onClose={() => setIsLogTransactionOpen(false)}
        onLogTransaction={handleLogTransaction}
      />

      {/* Mobile First Bottom Navigation & Floating Action Button */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogTransaction={() => setIsLogTransactionOpen(true)}
        onOpenAddStudent={() => setIsAddStudentOpen(true)}
        onOpenDailySettlement={() => setIsDailySettlementOpen(true)}
      />

      {/* Cashier Day-End Settlement / Day Book Modal */}
      <DailySettlementModal
        isOpen={isDailySettlementOpen}
        transactions={transactions}
        settings={settings}
        onClose={() => setIsDailySettlementOpen(false)}
        onOpenLogTransaction={() => {
          setIsDailySettlementOpen(false);
          setIsLogTransactionOpen(true);
        }}
        onLoadSampleTransactions={() => {
          updateTransactionsState(initialTransactions);
          if (currentSchoolCode) {
            initialTransactions.forEach((txn) => saveTransactionToCloud(txn, currentSchoolCode));
          }
        }}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        schoolCode={currentSchoolCode}
      />

      {/* Accidental Deletion Protection: Floating Undo Toast Notification */}
      {undoAction && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-lg animate-bounce-short">
          <div className="bg-slate-900/95 text-white border-2 border-emerald-500/70 shadow-2xl rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 backdrop-blur-xl">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {undoAction.message}
                </p>
                <p className="text-[11px] text-slate-300 truncate">
                  {undoAction.subMessage || 'गलती से हुआ? वापस लाने के लिए पूर्ववत करें।'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  undoAction.onUndo();
                  setRestoredNotice('डेटा सफलतापूर्वक पुनः प्राप्त कर लिया गया (Successfully Restored)!');
                  setTimeout(() => setRestoredNotice(null), 4000);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer whitespace-nowrap"
                title="हटाए गए डेटा को पुनः वापस लाएं"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>पूर्ववत करें ({undoCountdown}s)</span>
              </button>
              <button
                onClick={() => setUndoAction(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                title="खारिज करें (Dismiss)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restored confirmation toast */}
      {restoredNotice && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-emerald-950/95 text-emerald-200 border border-emerald-500/50 shadow-xl rounded-2xl px-4 py-2.5 flex items-center gap-2 text-xs font-bold backdrop-blur-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{restoredNotice}</span>
          </div>
        </div>
      )}

      {/* PWA Offline / Online Network Connectivity Indicator */}
      <OfflineIndicator />
    </div>
  );
}

