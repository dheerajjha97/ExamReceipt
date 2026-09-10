import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  CheckCircle2, 
  QrCode, 
  Banknote, 
  Smartphone, 
  Receipt,
  User,
  BookOpen
} from 'lucide-react';
import { RegistrationStudent, InstituteSettings, PaymentMode, calculateRegistrationFee } from '../../types';
import { getNextRegistrationReceiptNumber, numberToWordsInINR } from '../../services/storageService';

interface RegistrationRecordPaymentModalProps {
  isOpen: boolean;
  student: RegistrationStudent | null;
  settings: InstituteSettings;
  onClose: () => void;
  onSavePayment: (updatedStudent: RegistrationStudent) => void;
}

export const RegistrationRecordPaymentModal: React.FC<RegistrationRecordPaymentModalProps> = ({
  isOpen,
  student,
  settings,
  onClose,
  onSavePayment,
}) => {
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');
  const [transactionRef, setTransactionRef] = useState<string>('CASH-REG');

  if (!isOpen || !student) return null;

  const boardName = student.boardName || student.matricBoard || 'BSEB PATNA';
  const feeInfo = calculateRegistrationFee(boardName, settings.defaultOnlineCharge || 30);
  const targetFee = student.registrationFee > 0 ? student.registrationFee : feeInfo.totalFee;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date();
    const dateStr = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}`;
    const receiptNo = student.receiptNo || getNextRegistrationReceiptNumber();

    const updatedStudent: RegistrationStudent = {
      ...student,
      baseFee: feeInfo.baseFee,
      serviceCharge: feeInfo.serviceCharge,
      registrationFee: targetFee,
      paidAmount: targetFee,
      paymentStatus: 'PAID',
      paymentMode,
      paymentDate: dateStr,
      receiptNo,
      transactionRef: transactionRef.trim() || (paymentMode === 'CASH' ? 'CASH-REG' : 'UPI-PAY'),
      registrationStatus: student.registrationStatus === 'PENDING_DOCS' ? 'PENDING_DOCS' : 'COMPLETED',
      updatedAt: new Date().toISOString(),
    };

    onSavePayment(updatedStudent);
    onClose();
  };

  const upiId = 'principal.school@sbi'; // Institutional UPI ID
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(settings.name)}&am=${targetFee}&tn=${encodeURIComponent('Inter Registration Fee ' + student.formNo)}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className={`px-6 py-4 text-white flex items-center justify-between ${
          feeInfo.isBseb 
            ? 'bg-linear-to-r from-[#2E5B50] to-[#1F3D36]' 
            : 'bg-linear-to-r from-amber-700 to-amber-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
              <CreditCard className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-bold">पंजीकरण शुल्क भुगतान (Collect ₹{targetFee})</h2>
              <p className="text-xs text-emerald-100">
                फॉर्म सं: {student.formNo} &bull; {feeInfo.isBseb ? 'BSEB बिहार बोर्ड' : `अन्य बोर्ड (${boardName})`}
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

        {/* Student Mini Card */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            feeInfo.isBseb 
              ? 'bg-[#FAF9F5] border-[#E8E4D5]' 
              : 'bg-amber-50/70 border-amber-300'
          }`}>
            <div>
              <div className="text-xs text-[#5A5A40]">छात्र / संकाय &bull; 10वीं बोर्ड</div>
              <div className="font-bold text-sm text-gray-900 uppercase">{student.studentName}</div>
              <div className="text-xs text-gray-600">पिता: {student.fatherName} &bull; {student.stream}</div>
              <div className="text-[11px] font-semibold text-emerald-800 mt-0.5">
                बोर्ड: {boardName} ({feeInfo.isBseb ? '₹485 + ₹30 = ₹515' : '₹685 + ₹30 = ₹715'})
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#5A5A40]">देय राशि</div>
              <div className={`text-2xl font-black ${feeInfo.isBseb ? 'text-[#2E5B50]' : 'text-amber-900'}`}>
                ₹{targetFee}
              </div>
              <span className="text-[10px] text-gray-500 font-semibold block">
                {feeInfo.isBseb ? 'BSEB' : 'अन्य बोर्ड'}
              </span>
            </div>
          </div>

          {/* Payment Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-[#4A453E] mb-2">
              भुगतान माध्यम चुनें (Payment Mode):
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setPaymentMode('CASH'); setTransactionRef('CASH-REG'); }}
                className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold transition ${
                  paymentMode === 'CASH'
                    ? 'bg-emerald-50 border-[#2E5B50] text-[#2E5B50] ring-2 ring-[#2E5B50]'
                    : 'bg-[#FAF9F5] border-[#E8E4D5] text-gray-700'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>नकद (Cash Counter)</span>
              </button>

              <button
                type="button"
                onClick={() => { setPaymentMode('UPI'); setTransactionRef(`UPI-${Date.now().toString().slice(-6)}`); }}
                className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold transition ${
                  paymentMode === 'UPI'
                    ? 'bg-emerald-50 border-[#2E5B50] text-[#2E5B50] ring-2 ring-[#2E5B50]'
                    : 'bg-[#FAF9F5] border-[#E8E4D5] text-gray-700'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>UPI / QR कोड</span>
              </button>
            </div>
          </div>

          {/* UPI Dynamic QR Code */}
          {paymentMode === 'UPI' && (
            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-center space-y-2">
              <span className="text-xs font-bold text-[#2E5B50] block">
                ₹{targetFee} प्राप्त करने हेतु QR स्कैन करवाएं
              </span>
              <img
                src={qrCodeUrl}
                alt="UPI QR Code"
                className="w-36 h-36 mx-auto rounded-xl border border-emerald-300 shadow-xs"
              />
              <span className="text-[11px] text-gray-600 font-mono block">
                UPI ID: {upiId}
              </span>
            </div>
          )}

          {/* Reference Input */}
          <div>
            <label className="block text-xs font-bold text-[#4A453E] mb-1">
              रिफरेंस / रसीद विवरण (Reference / Note):
            </label>
            <input
              type="text"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="e.g. CASH-REG or UPI/2609090123"
              className="w-full px-3 py-2 bg-[#FAF9F5] rounded-xl border border-[#DDD8C5] text-xs font-mono"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E4D5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#2E5B50] hover:bg-[#23463E] text-white font-bold text-xs shadow-md flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>₹{targetFee} भुगतान स्वीकार करें & रसीद बनाएं</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
