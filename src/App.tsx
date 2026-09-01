import React, { useState, useEffect } from 'react';
import { 
  getStoredStudents, 
  saveStudentsToStorage, 
  getStoredTransactions, 
  saveTransactionsToStorage, 
  getStoredSettings, 
  saveSettingsToStorage, 
  getNextReceiptNumber,
} from './services/storageService';
import { subscribeSchoolData, saveStudentToCloud } from './services/firebaseSyncService';
import { Student, Transaction, InstituteSettings, PaymentMode, FormIssueStatus } from './types';
import { initialStudents } from './data/mockStudents';
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

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<InstituteSettings>(getStoredSettings());

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

  // Initialize data on mount and listen to Firebase real-time updates for school code
  useEffect(() => {
    if (!currentSchoolCode) return;

    const loadedStudents = getStoredStudents();
    const loadedTxns = getStoredTransactions();
    setStudents(loadedStudents);
    setTransactions(loadedTxns);

    const schoolCode = currentSchoolCode;

    // Seed local initial students to cloud if cloud is empty
    loadedStudents.forEach(stu => {
      saveStudentToCloud(stu, schoolCode);
    });

    const unsubscribe = subscribeSchoolData(
      schoolCode,
      (cloudStudents) => {
        if (cloudStudents && cloudStudents.length > 0) {
          setStudents(cloudStudents);
          saveStudentsToStorage(cloudStudents);
        }
      },
      (cloudTxns) => {
        if (cloudTxns) {
          setTransactions(cloudTxns);
          saveTransactionsToStorage(cloudTxns);
        }
      },
      (cloudSettings) => {
        if (cloudSettings) {
          setSettings(cloudSettings);
          saveSettingsToStorage(cloudSettings);
        }
      }
    );

    return () => unsubscribe();
  }, [currentSchoolCode]);

  // Update storage whenever students or transactions change
  const updateStudentsState = (newStudents: Student[]) => {
    setStudents(newStudents);
    saveStudentsToStorage(newStudents);
  };

  const updateTransactionsState = (newTxns: Transaction[]) => {
    setTransactions(newTxns);
    saveTransactionsToStorage(newTxns);
  };

  const handleSaveSettings = (newSettings: InstituteSettings) => {
    setSettings(newSettings);
    saveSettingsToStorage(newSettings);
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
        return {
          ...s,
          formIssueStatus,
          formNo: formNo || s.formNo || `EF-${s.registrationNo.slice(-6)}`,
          formIssueDate: formIssueDate || s.formIssueDate || new Date().toISOString().slice(0, 10),
          formSubmissionDate:
            formSubmissionDate ||
            (formIssueStatus === 'SUBMITTED' ? new Date().toISOString().slice(0, 10) : s.formSubmissionDate),
          updatedAt: new Date().toISOString(),
        };
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
    const nowStr = new Date().toLocaleString('en-IN');

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
          paymentDate: newTxnData.paymentDate || new Date().toLocaleString('en-IN'),
          paymentMode: newTxnData.paymentMode || 'UPI',
          lastReceiptNo: newReceiptNo,
          transactionRef: newTxnData.transactionRef || '',
          remarks: newTxnData.remarks || target.remarks,
          updatedAt: new Date().toISOString(),
        };

        updatedStudentsList[studentIndex] = updatedStudent;
        updateStudentsState(updatedStudentsList);
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
      paymentDate: newTxnData.paymentDate || new Date().toLocaleString('en-IN'),
      collectedBy: newTxnData.collectedBy || settings.cashierName || 'Counter Clerk',
      remarks: newTxnData.remarks || '',
    };

    const updatedTxnsList = [newTransaction, ...transactions];
    updateTransactionsState(updatedTxnsList);
  };

  // Delete Transaction Handler
  const handleDeleteTransaction = (txnId: string) => {
    const updatedTxns = transactions.filter((t) => t.id !== txnId);
    updateTransactionsState(updatedTxns);
  };

  // Add / Edit Student Save
  const handleSaveStudent = (studentData: Partial<Student>) => {
    if (studentToEdit) {
      // Edit
      const updatedList = students.map((s) =>
        s.id === studentToEdit.id ? { ...s, ...studentData, updatedAt: new Date().toISOString() } : s
      );
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedList = [newStudent, ...students];
      updateStudentsState(updatedList);
      setIsAddStudentOpen(false);
    }
  };

  // Delete Student
  const handleDeleteStudent = (studentId: string) => {
    const updatedList = students.filter((s) => s.id !== studentId);
    updateStudentsState(updatedList);
  };

  // Delete Selected Students
  const handleDeleteSelectedStudents = (studentIds: string[]) => {
    const updatedList = students.filter((s) => !studentIds.includes(s.id));
    updateStudentsState(updatedList);
  };

  // Bulk Issue Forms Handler
  const handleBulkIssueForms = (studentIds: string[], targetStatus: FormIssueStatus = 'ISSUED') => {
    const todayStr = new Date().toLocaleString('en-IN').slice(0, 16);
    const updatedList = students.map((s, idx) => {
      if (studentIds.includes(s.id)) {
        const formNo = s.formNo || `EF-26-${(100 + (s.sNo || idx + 1)).toString().padStart(4, '0')}`;
        return {
          ...s,
          formIssueStatus: targetStatus,
          formNo,
          formIssueDate: s.formIssueDate || todayStr,
          formSubmissionDate: targetStatus === 'SUBMITTED' ? (s.formSubmissionDate || todayStr) : s.formSubmissionDate,
          updatedAt: new Date().toISOString(),
        };
      }
      return s;
    });
    updateStudentsState(updatedList);
  };

  // Restore 48 Official PDF Students Dataset
  const handleRestoreOfficialData = () => {
    updateStudentsState(initialStudents);
  };

  // Clear All Students
  const handleClearAllStudents = () => {
    updateStudentsState([]);
  };

  // Clear All Transactions
  const handleClearAllTransactions = () => {
    updateTransactionsState([]);
  };

  // Import extracted students from PDF / Image OCR
  const handleImportStudents = (newExtractedStudents: Student[]) => {
    const updatedList = [...newExtractedStudents, ...students];
    updateStudentsState(updatedList);
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
      
      {/* Top Header Navigation */}
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

      {/* Main View Area */}
      <main className="max-w-7xl mx-auto px-4 pt-6">
        {activeTab === 'students' && (
          <StudentList
            students={students}
            onSelectStudentReceipt={(student) => setSelectedStudentForReceipt(student)}
            onOpenRecordPayment={(student) => setSelectedStudentForPayment(student)}
            onOpenIssueForm={(student) => setSelectedStudentForIssueForm(student)}
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
              onSelectStudentReceipt={(student) => setSelectedStudentForReceipt(student)}
              onOpenRecordPayment={(student) => setSelectedStudentForPayment(student)}
              onOpenIssueForm={(student) => setSelectedStudentForIssueForm(student)}
              onBulkIssueForms={handleBulkIssueForms}
              onRestoreOfficialData={handleRestoreOfficialData}
              onOpenWhatsAppShare={(student) => setSelectedStudentForWhatsApp(student)}
              onEditStudent={(student) => setStudentToEdit(student)}
              onDeleteStudent={handleDeleteStudent}
              onDeleteSelectedStudents={handleDeleteSelectedStudents}
              onClearAllStudents={handleClearAllStudents}
              onOpenAddStudent={() => setIsAddStudentOpen(true)}
              onOpenUploadPdf={() => setIsUploadPdfOpen(true)}
            />
          </div>
        )}

        {activeTab === 'transactions' && (
          <TransactionHistory
            transactions={transactions}
            settings={settings}
            onOpenLogTransaction={() => setIsLogTransactionOpen(true)}
            onDeleteTransaction={handleDeleteTransaction}
            onClearAllTransactions={handleClearAllTransactions}
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
          />
        )}
      </main>

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
          student={selectedStudentForIssueForm}
          settings={settings}
          onClose={() => setSelectedStudentForIssueForm(null)}
          onUpdateFormStatus={handleUpdateFormStatus}
          onOpenCollectFee={(student) => {
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
      />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        schoolCode={currentSchoolCode}
      />

    </div>
  );
}

