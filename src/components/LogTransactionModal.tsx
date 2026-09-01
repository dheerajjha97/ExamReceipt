import React, { useState } from 'react';
import { 
  X, 
  IndianRupee, 
  CheckCircle2, 
  PlusCircle,
  User,
  Calendar,
  Tag,
  CreditCard,
  FileText
} from 'lucide-react';
import { Student, PaymentMode, InstituteSettings, Transaction } from '../types';

interface LogTransactionModalProps {
  isOpen: boolean;
  students: Student[];
  settings: InstituteSettings;
  onClose: () => void;
  onLogTransaction: (newTxn: Partial<Transaction>, targetStudentId?: string) => void;
}

export const LogTransactionModal: React.FC<LogTransactionModalProps> = ({
  isOpen,
  students,
  settings,
  onClose,
  onLogTransaction,
}) => {
  const [selectMode, setSelectMode] = useState<'existing' | 'manual'>('existing');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');

  // Manual student fields (if manual)
  const [manualStudentName, setManualStudentName] = useState<string>('');
  const [manualRegNo, setManualRegNo] = useState<string>('');
  const [manualFatherName, setManualFatherName] = useState<string>('');
  const [manualClassOrStream, setManualClassOrStream] = useState<string>('Intermediate Science (12th)');

  // Transaction fields
  const [transactionType, setTransactionType] = useState<string>('Board Exam Fee');
  const [baseFee, setBaseFee] = useState<number>(1400);
  const [onlineCharges, setOnlineCharges] = useState<number>(settings.defaultOnlineCharge || 30);
  const [paidAmount, setPaidAmount] = useState<number>(1430);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
  );
  const [collectedBy, setCollectedBy] = useState<string>(settings.cashierName || 'Counter Clerk');
  const [remarks, setRemarks] = useState<string>('Direct Fee Collection');

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const handleStudentSelect = (id: string) => {
    setSelectedStudentId(id);
    const stu = students.find((s) => s.id === id);
    if (stu) {
      const charge = stu.onlineCharges || settings.defaultOnlineCharge || 30;
      setBaseFee(stu.baseFee || 1400);
      setOnlineCharges(charge);
      const total = stu.baseFee + charge;
      setPaidAmount(total);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let studentName = manualStudentName.trim();
    let regNo = manualRegNo.trim();
    let fatherName = manualFatherName.trim();
    let stream = manualClassOrStream;
    let studentId = `STU-MANUAL-${Date.now()}`;

    if (selectMode === 'existing' && selectedStudent) {
      studentName = selectedStudent.studentName;
      regNo = selectedStudent.registrationNo;
      fatherName = selectedStudent.fatherName;
      stream = selectedStudent.classOrStream;
      studentId = selectedStudent.id;
    } else if (!studentName) {
      studentName = 'WALK-IN STUDENT';
    }

    const totalAmount = Number(baseFee || 0) + Number(onlineCharges || 0);

    const newTxnPayload: Partial<Transaction> = {
      studentId,
      studentName,
      registrationNo: regNo || `R-MANUAL-${Date.now().toString().slice(-6)}`,
      fatherName: fatherName || 'N/A',
      classOrStream: stream,
      transactionType,
      baseFee: Number(baseFee),
      onlineCharges: Number(onlineCharges),
      totalAmount,
      paidAmount: Number(paidAmount),
      dueAmount: Math.max(0, totalAmount - Number(paidAmount)),
      paymentMode,
      transactionRef: transactionRef.trim() || `REF-${Date.now().toString().slice(-6)}`,
      paymentDate: paymentDate || new Date().toLocaleString('en-IN'),
      collectedBy: collectedBy || settings.cashierName || 'Counter Clerk',
      remarks,
    };

    onLogTransaction(newTxnPayload, selectMode === 'existing' ? selectedStudentId : undefined);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#2D2A26]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FDFCF8] rounded-2xl shadow-2xl max-w-xl w-full border border-[#E6E2D3] overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-[#4A453E] text-white px-6 py-4 flex items-center justify-between border-b border-[#3E3A33]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#5A5A40] text-[#E6E2D3] rounded-lg border border-[#737356]">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#FDFCF8]">Log Financial Transaction</h2>
              <p className="text-xs text-[#C2BEB5]">
                Record fee payment, late fine, or custom transaction into database
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#C2BEB5] hover:text-white rounded-lg hover:bg-[#3E3A33] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Mode Switcher */}
          <div className="flex bg-[#EFECE1] p-1 rounded-xl border border-[#DDD8C5]">
            <button
              type="button"
              onClick={() => setSelectMode('existing')}
              className={`flex-1 py-1.5 rounded-lg font-bold text-center transition ${
                selectMode === 'existing'
                  ? 'bg-[#FDFCF8] text-[#4A453E] shadow-xs'
                  : 'text-[#787267] hover:text-[#4A453E]'
              }`}
            >
              Select Registered Student
            </button>
            <button
              type="button"
              onClick={() => setSelectMode('manual')}
              className={`flex-1 py-1.5 rounded-lg font-bold text-center transition ${
                selectMode === 'manual'
                  ? 'bg-[#FDFCF8] text-[#4A453E] shadow-xs'
                  : 'text-[#787267] hover:text-[#4A453E]'
              }`}
            >
              Manual / New Walk-in Entry
            </button>
          </div>

          {selectMode === 'existing' ? (
            <div className="space-y-1">
              <label className="block font-semibold text-[#4A453E]">Select Student Record *</label>
              <select
                value={selectedStudentId}
                onChange={(e) => handleStudentSelect(e.target.value)}
                className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-[#4A453E] font-medium focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
              >
                {students.map((stu) => (
                  <option key={stu.id} value={stu.id}>
                    {stu.studentName} — Reg: {stu.registrationNo} ({stu.classOrStream})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F7F5EE] p-3 rounded-xl border border-[#E6E2D3]">
              <div className="space-y-1">
                <label className="block font-semibold text-[#4A453E]">Student Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AMAN KUMAR"
                  value={manualStudentName}
                  onChange={(e) => setManualStudentName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-[#4A453E] font-bold focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-[#4A453E]">Registration No.</label>
                <input
                  type="text"
                  placeholder="e.g. R-313370099-25"
                  value={manualRegNo}
                  onChange={(e) => setManualRegNo(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg font-mono text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-[#4A453E]">Father's Name</label>
                <input
                  type="text"
                  placeholder="e.g. RAMESH PRASAD"
                  value={manualFatherName}
                  onChange={(e) => setManualFatherName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-[#4A453E]">Class / Stream</label>
                <select
                  value={manualClassOrStream}
                  onChange={(e) => setManualClassOrStream(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
                >
                  <option value="Intermediate Science (12th)">Intermediate Science (12th)</option>
                  <option value="Intermediate Arts (12th)">Intermediate Arts (12th)</option>
                  <option value="Intermediate Commerce (12th)">Intermediate Commerce (12th)</option>
                  <option value="Matriculation (10th)">Matriculation (10th)</option>
                </select>
              </div>
            </div>
          )}

          {/* Transaction Type & Amounts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-semibold text-[#4A453E]">Transaction / Fee Type *</label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-[#4A453E] font-medium focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
              >
                <option value="Board Exam Fee">Board Examination Fee</option>
                <option value="Registration Fee">Registration / Form Fee</option>
                <option value="Late Fine">Late Fine / Penalty</option>
                <option value="Certificate Fee">Certificate / Marksheet Fee</option>
                <option value="Miscellaneous">Miscellaneous Revenue</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-[#4A453E]">Payment Mode *</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-[#4A453E] font-semibold focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
              >
                <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                <option value="QR_CODE">QR Code Scan</option>
                <option value="CASH">Counter Cash</option>
                <option value="NET_BANKING">Net Banking</option>
                <option value="CARD">Debit / Credit Card</option>
                <option value="OTHER">Cheque / Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-[#4A453E]">Base Amount (₹) *</label>
              <input
                type="number"
                required
                value={baseFee}
                onChange={(e) => {
                  const b = Number(e.target.value);
                  setBaseFee(b);
                  setPaidAmount(b + Number(onlineCharges));
                }}
                className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-[#4A453E] font-bold focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-[#4A453E]">Online / Portal Charge (₹)</label>
              <input
                type="number"
                value={onlineCharges}
                onChange={(e) => {
                  const c = Number(e.target.value);
                  setOnlineCharges(c);
                  setPaidAmount(Number(baseFee) + c);
                }}
                className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-[#4A453E] font-bold focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="block font-semibold text-[#4A453E]">Total Paid Amount Collected (₹) *</label>
              <input
                type="number"
                required
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#EFECE1] border border-[#DDD8C5] rounded-lg text-[#2E5B50] font-black text-sm focus:outline-none focus:ring-2 focus:ring-[#2E5B50]"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-[#4A453E]">Transaction Ref / UTR No.</label>
              <input
                type="text"
                placeholder="e.g. UPI/3294829103/OKAXIS"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg font-mono text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-[#4A453E]">Date & Time</label>
              <input
                type="text"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg font-mono text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="block font-semibold text-[#4A453E]">Collected By (Staff / Cashier)</label>
              <input
                type="text"
                value={collectedBy}
                onChange={(e) => setCollectedBy(e.target.value)}
                className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="block font-semibold text-[#4A453E]">Remarks / Notes</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-[#E6E2D3] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#EFECE1] hover:bg-[#E6E2D3] text-[#4A453E] rounded-lg font-medium transition border border-[#DDD8C5]"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-[#2E5B50] hover:bg-[#254A41] text-white rounded-lg font-semibold shadow transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Log Transaction</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
