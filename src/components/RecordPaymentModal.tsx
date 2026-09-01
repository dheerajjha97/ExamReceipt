import React, { useState } from 'react';
import { 
  X, 
  IndianRupee, 
  CreditCard, 
  Receipt, 
  CheckCircle2, 
  Sparkles,
  QrCode,
  Building2
} from 'lucide-react';
import { Student, PaymentMode, InstituteSettings } from '../types';

interface RecordPaymentModalProps {
  student: Student | null;
  settings: InstituteSettings;
  onClose: () => void;
  onConfirmPayment: (
    studentId: string,
    paidAmount: number,
    paymentMode: PaymentMode,
    transactionRef: string,
    remarks: string
  ) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  student,
  settings,
  onClose,
  onConfirmPayment,
}) => {
  const onlineCharge = student?.onlineCharges || settings.defaultOnlineCharge || 30;
  const totalFee = student?.totalFee || ((student?.baseFee || 1400) + onlineCharge);
  const remainingDue = totalFee - (student?.paidAmount || 0);

  const [paymentAmount, setPaymentAmount] = useState<number>(remainingDue > 0 ? remainingDue : totalFee);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) return;

    onConfirmPayment(
      student.id,
      Number(paymentAmount),
      paymentMode,
      transactionRef.trim() || `TXN-${Date.now().toString().slice(-6)}`,
      remarks.trim() || 'Board Examination Fee Payment'
    );
    onClose();
  };

  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#2D2A26]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FDFCF8] rounded-2xl shadow-2xl max-w-lg w-full border border-[#E6E2D3] overflow-hidden my-6">
        
        {/* Top bar */}
        <div className="bg-[#4A453E] text-white px-6 py-4 flex items-center justify-between border-b border-[#3E3A33]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#5A5A40] text-[#E6E2D3] rounded-lg">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#FDFCF8]">Collect Fee & Issue Receipt</h2>
              <p className="text-xs text-[#C2BEB5]">
                Record fee payment for {student.studentName}
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
          
          {/* Summary Box */}
          <div className="bg-[#F7F5EE] p-4 rounded-xl border border-[#E6E2D3] space-y-2">
            <div className="flex justify-between items-center text-[#4A453E] font-bold text-sm">
              <span>{student.studentName}</span>
              <span className="font-mono text-xs text-[#5A5A40] bg-[#EFECE1] px-2 py-0.5 rounded border border-[#DDD8C5]">
                {student.registrationNo}
              </span>
            </div>

            <div className="text-[#787267] space-y-1 pt-1 border-t border-[#E6E2D3]">
              <div className="flex justify-between">
                <span>Base Exam Fee ({student.casteCategory}):</span>
                <span className="font-mono font-semibold text-[#4A453E]">₹{student.baseFee}</span>
              </div>
              <div className="flex justify-between text-[#5A5A40] font-medium">
                <span>Online Processing Charge (Included Extra):</span>
                <span className="font-mono font-bold">+₹{onlineCharge}</span>
              </div>
              <div className="flex justify-between text-[#4A453E] font-bold border-t border-[#DDD8C5] pt-1">
                <span>Total Fee Payable:</span>
                <span className="font-mono text-sm">₹{totalFee}</span>
              </div>
              <div className="flex justify-between text-[#787267]">
                <span>Already Paid:</span>
                <span className="font-mono text-[#2E5B50] font-semibold">₹{student.paidAmount}</span>
              </div>
              <div className="flex justify-between text-[#8C2B2B] font-bold">
                <span>Current Balance Due:</span>
                <span className="font-mono text-sm">₹{remainingDue}</span>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-1">
            <label className="block font-semibold text-[#4A453E]">Payment Amount to Collect (₹) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C857B] font-bold">₹</span>
              <input
                type="number"
                min={1}
                max={totalFee}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                required
                className="w-full pl-8 pr-4 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-sm font-bold text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
              />
            </div>
          </div>

          {/* Mode Selector */}
          <div className="space-y-1">
            <label className="block font-semibold text-[#4A453E]">Payment Method *</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMode('UPI')}
                className={`p-2.5 rounded-lg border text-center transition font-semibold ${
                  paymentMode === 'UPI'
                    ? 'bg-[#E2ECE9] border-[#2E5B50] text-[#2E5B50] ring-2 ring-[#2E5B50]/20'
                    : 'bg-[#FDFCF8] border-[#DDD8C5] text-[#4A453E] hover:bg-[#F7F5EE]'
                }`}
              >
                UPI / PhonePe
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('CASH')}
                className={`p-2.5 rounded-lg border text-center transition font-semibold ${
                  paymentMode === 'CASH'
                    ? 'bg-[#E2ECE9] border-[#2E5B50] text-[#2E5B50] ring-2 ring-[#2E5B50]/20'
                    : 'bg-[#FDFCF8] border-[#DDD8C5] text-[#4A453E] hover:bg-[#F7F5EE]'
                }`}
              >
                Counter Cash
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('QR_CODE')}
                className={`p-2.5 rounded-lg border text-center transition font-semibold ${
                  paymentMode === 'QR_CODE'
                    ? 'bg-[#E2ECE9] border-[#2E5B50] text-[#2E5B50] ring-2 ring-[#2E5B50]/20'
                    : 'bg-[#FDFCF8] border-[#DDD8C5] text-[#4A453E] hover:bg-[#F7F5EE]'
                }`}
              >
                QR Code Scan
              </button>
            </div>
          </div>

          {/* Form Submission Checkbox */}
          <div className="bg-[#E2ECE9]/60 p-3 rounded-xl border border-[#2E5B50]/30 flex items-center justify-between">
            <label className="flex items-center gap-2.5 cursor-pointer text-[#2E5B50]">
              <input
                type="checkbox"
                defaultChecked={true}
                id="markFormSubmitted"
                className="w-4 h-4 rounded text-[#2E5B50] focus:ring-[#2E5B50]"
              />
              <span className="font-bold text-xs">Mark Exam Form as Submitted with this Fee Payment</span>
            </label>
            <span className="text-[10px] text-[#5A5A40] bg-[#FAF9F5] px-2 py-0.5 rounded font-mono">
              Form: {student.formNo || `EF-${student.registrationNo.slice(-6)}`}
            </span>
          </div>

          {/* Transaction Ref / UTR */}
          <div className="space-y-1">
            <label className="block font-semibold text-[#4A453E]">Transaction Reference ID / UTR No.</label>
            <input
              type="text"
              placeholder="e.g. UPI/3234901231/OKAXIS or Cash Receipt No."
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg font-mono text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
            />
          </div>

          {/* Remarks */}
          <div className="space-y-1">
            <label className="block font-semibold text-[#4A453E]">Remarks / Collector Notes</label>
            <input
              type="text"
              placeholder="e.g. Full fee received at counter by Cashier"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
            />
          </div>

          {/* Submit */}
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
              <span>Confirm & Generate Receipt</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
