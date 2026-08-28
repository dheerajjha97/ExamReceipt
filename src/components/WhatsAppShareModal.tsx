import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Send, 
  Copy, 
  Check, 
  Phone, 
  Receipt,
  Sparkles
} from 'lucide-react';
import { Student, InstituteSettings } from '../types';

interface WhatsAppShareModalProps {
  student: Student | null;
  settings: InstituteSettings;
  onClose: () => void;
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  student,
  settings,
  onClose,
}) => {
  if (!student) return null;

  const [phone, setPhone] = useState(student.phone || '');
  const [copied, setCopied] = useState(false);

  const onlineCharges = student.onlineCharges || settings.defaultOnlineCharge || 30;
  const totalFee = student.totalFee || (student.baseFee + onlineCharges);
  const paidAmount = student.paidAmount;
  const dueAmount = Math.max(0, totalFee - paidAmount);
  const receiptNo = student.lastReceiptNo || `REC/${settings.academicYear.slice(2, 4)}/0108`;

  // Pre-formatted WhatsApp Message
  const messageText = `📋 *EXAMINATION FEE RECEIPT & CONFIRMATION*
🏫 *${settings.name}*
Session: ${settings.academicYear}

👤 *Student Details:*
• *Student Name:* ${student.studentName}
• *Registration No:* ${student.registrationNo}
• *Father's Name:* ${student.fatherName}
• *Class/Stream:* ${student.classOrStream || 'Intermediate'}
• *Category:* ${student.casteCategory} (${student.examType})

💰 *Fee Breakup:*
• Board Exam Base Fee: ₹${student.baseFee}
• Online Charges: ₹${onlineCharges}
• *Total Fee Amount:* ₹${totalFee}
• *Amount Paid Received:* ₹${paidAmount}
${dueAmount > 0 ? `• *Balance Due Remaining:* ₹${dueAmount}` : `• *Status:* ✅ FULLY PAID`}

🧾 *Receipt No:* ${receiptNo}
🗓️ *Payment Date:* ${student.paymentDate || new Date().toLocaleString('en-IN')}
${student.transactionRef ? `💳 *Txn Ref / UTR:* ${student.transactionRef}` : ''}

Thank you! Keep this message for reference.
— ${settings.name} (Exam Cell)`;

  // Clean phone number for wa.me link
  const cleanPhone = phone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const encodedText = encodeURIComponent(messageText);
  const waUrl = formattedPhone ? `https://wa.me/${formattedPhone}?text=${encodedText}` : `https://wa.me/?text=${encodedText}`;

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2D2A26]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FDFCF8] rounded-2xl shadow-2xl max-w-lg w-full border border-[#E6E2D3] overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-[#2E5B50] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#254A41] rounded-lg text-white">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#FDFCF8]">Share Fee Receipt on WhatsApp</h2>
              <p className="text-xs text-[#E2ECE9]">Send receipt summary directly to student or parent</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#E2ECE9] hover:text-white rounded-lg hover:bg-[#254A41] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Phone Number Input */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-[#4A453E] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#2E5B50]" />
              <span>WhatsApp Phone Number (with Country Code e.g. 919876543210):</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 919876543210 or 9876543210"
                className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-sm text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
              />
            </div>
            <p className="text-[11px] text-[#787267]">
              Entering the student's 10-digit mobile number will automatically open their chat on WhatsApp.
            </p>
          </div>

          {/* Message Preview Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-[#4A453E]">Generated WhatsApp Message Preview:</label>
              <button
                onClick={handleCopyMessage}
                className="text-xs text-[#2E5B50] hover:text-[#254A41] font-medium flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#2E5B50]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>

            <div className="bg-[#3E3A33] text-[#DDD8C5] p-3.5 rounded-xl text-xs font-mono whitespace-pre-wrap max-h-60 overflow-y-auto border border-[#5A554A] leading-relaxed shadow-inner">
              {messageText}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#EFECE1] px-6 py-3 border-t border-[#E6E2D3] flex items-center justify-end gap-3 text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#EFECE1] hover:bg-[#E6E2D3] text-[#4A453E] rounded-lg font-medium transition border border-[#DDD8C5]"
          >
            Cancel
          </button>

          <button
            onClick={handleSendWhatsApp}
            className="flex items-center gap-2 px-5 py-2 bg-[#2E5B50] hover:bg-[#254A41] text-white rounded-lg font-semibold shadow transition"
          >
            <Send className="w-4 h-4" />
            <span>Open WhatsApp & Send</span>
          </button>
        </div>

      </div>
    </div>
  );
};
