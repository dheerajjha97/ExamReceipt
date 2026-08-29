import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Send, 
  Copy, 
  Check, 
  Phone, 
  Download,
  Share2,
  FileText
} from 'lucide-react';
import { Student, InstituteSettings } from '../types';
import { generateStudentFeeReceiptPDF, downloadStudentFeeReceiptPDF } from '../utils/pdfGenerator';

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
  const [pdfDownloadedNotice, setPdfDownloadedNotice] = useState(false);

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

📄 *PDF Receipt:* Attached Fee_Receipt_${student.registrationNo}.pdf

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

  const handleDownloadPDF = () => {
    downloadStudentFeeReceiptPDF(student, settings);
    setPdfDownloadedNotice(true);
  };

  // Direct PDF Share or Download + WhatsApp flow
  const handleSendWhatsAppWithPDF = async () => {
    // 1. Generate PDF Blob
    const doc = generateStudentFeeReceiptPDF(student, settings);
    const pdfBlob = doc.output('blob');
    const pdfFileName = `Fee_Receipt_${student.registrationNo}_${student.studentName.replace(/\s+/g, '_')}.pdf`;
    const pdfFile = new File([pdfBlob], pdfFileName, { type: 'application/pdf' });

    // 2. Try native Web Share API if device supports sharing PDF documents
    if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      try {
        await navigator.share({
          title: `Fee Receipt ${student.registrationNo}`,
          text: messageText,
          files: [pdfFile],
        });
        return;
      } catch (err) {
        console.log('Web Share fallback to wa.me URL:', err);
      }
    }

    // 3. Desktop / Standard Fallback: Auto download PDF + Open WhatsApp
    downloadStudentFeeReceiptPDF(student, settings);
    setPdfDownloadedNotice(true);
    navigator.clipboard.writeText(messageText);
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2D2A26]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FDFCF8] rounded-3xl shadow-2xl max-w-lg w-full border border-[#E6E2D3] overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-[#2E5B50] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#254A41] rounded-2xl text-white">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#FDFCF8]">WhatsApp PDF Receipt Share</h2>
              <p className="text-xs text-[#E2ECE9]">Send official PDF fee receipt directly on WhatsApp</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#E2ECE9] hover:text-white rounded-full hover:bg-[#254A41] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          
          {/* PDF Format Banner */}
          <div className="bg-[#E2ECE9] border border-[#3B6E62]/30 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-[#2E5B50]">
            <div className="flex items-center gap-2.5">
              <FileText className="w-6 h-6 text-[#2E5B50] shrink-0" />
              <div>
                <p className="font-bold text-xs">Official PDF Receipt Ready</p>
                <p className="text-[11px] text-[#254A41]">
                  File: <code className="font-mono bg-white/70 px-1.5 py-0.5 rounded">Fee_Receipt_{student.registrationNo}.pdf</code>
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2E5B50] hover:bg-[#254A41] text-white rounded-xl text-xs font-bold shadow transition shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>

          {pdfDownloadedNotice && (
            <div className="bg-[#FAF0E6] border border-[#E8D0B8] p-3 rounded-2xl text-xs text-[#8C5A2B] font-medium flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 text-[#8C5A2B] shrink-0" />
              <span>PDF downloaded to your device! Drag & attach this file inside WhatsApp chat.</span>
            </div>
          )}

          {/* Phone Number Input */}
          <div className="space-y-1.5">
            <label className="block font-bold text-[#4A453E] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#2E5B50]" />
              <span>WhatsApp Mobile Number (e.g. 919876543210):</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 919876543210 or 9876543210"
                className="w-full px-3.5 py-2.5 bg-[#FDFCF8] border border-[#DDD8C5] rounded-2xl text-xs font-medium text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
              />
            </div>
          </div>

          {/* Message Preview Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#4A453E]">WhatsApp Message Body Preview:</label>
              <button
                onClick={handleCopyMessage}
                className="text-xs text-[#2E5B50] hover:text-[#254A41] font-bold flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#2E5B50]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>

            <div className="bg-[#3E3A33] text-[#DDD8C5] p-3.5 rounded-2xl text-xs font-mono whitespace-pre-wrap max-h-48 overflow-y-auto border border-[#5A554A] leading-relaxed shadow-inner">
              {messageText}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#EFECE1] px-6 py-4 border-t border-[#E6E2D3] flex flex-wrap items-center justify-between gap-3 text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-[#EFECE1] hover:bg-[#E6E2D3] text-[#4A453E] rounded-2xl font-bold transition border border-[#DDD8C5]"
          >
            Cancel
          </button>

          <button
            onClick={handleSendWhatsAppWithPDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2E5B50] hover:bg-[#254A41] text-white rounded-2xl font-bold shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all transform-gpu border border-[#3B6E62]"
          >
            <Send className="w-4 h-4" />
            <span>Send PDF & Open WhatsApp</span>
          </button>
        </div>

      </div>
    </div>
  );
};

