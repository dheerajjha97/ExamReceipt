import React, { useRef, useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  MessageSquare, 
  Receipt, 
  CheckCircle2, 
  Share2, 
  Sparkles,
  Building2,
  PhoneCall
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Student, InstituteSettings } from '../types';
import { numberToWordsInINR } from '../services/storageService';

interface FeeReceiptModalProps {
  student: Student | null;
  settings: InstituteSettings;
  onClose: () => void;
  onOpenWhatsApp: (student: Student) => void;
}

export const FeeReceiptModal: React.FC<FeeReceiptModalProps> = ({
  student,
  settings,
  onClose,
  onOpenWhatsApp,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!student) return null;

  const onlineCharges = student.onlineCharges || settings.defaultOnlineCharge || 30;
  const totalAmount = student.totalFee || (student.baseFee + onlineCharges);
  const paidAmount = student.paidAmount;
  const balanceDue = Math.max(0, totalAmount - paidAmount);
  const receiptNo = student.lastReceiptNo || `REC/${settings.academicYear.slice(2, 4)}/0108`;
  const paymentDate = student.paymentDate || new Date().toLocaleString('en-IN');
  const amountInWords = numberToWordsInINR(paidAmount > 0 ? paidAmount : totalAmount);

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // Download Image / PDF
  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    setIsDownloading(true);

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a5'); // A5 small slip format
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Fee_Receipt_${student.registrationNo}_${student.studentName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Could not download PDF. You can use the Print button to Save as PDF instead.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2D2A26]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FDFCF8] rounded-2xl shadow-2xl max-w-2xl w-full border border-[#E6E2D3] overflow-hidden my-6">
        
        {/* Modal Top Bar */}
        <div className="bg-[#4A453E] text-white px-6 py-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#5A5A40] text-[#E6E2D3] rounded-lg">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#FDFCF8]">Traditional School Fee Receipt</h2>
              <p className="text-xs text-[#C2BEB5]">
                Official Board Examination Fee Slip ({settings.academicYear})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenWhatsApp(student)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2E5B50] hover:bg-[#254A41] text-white rounded-lg text-xs font-semibold shadow-sm transition border border-[#3B6E62]"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Send WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-lg text-xs font-semibold shadow-sm transition border border-[#737356]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3E3A33] hover:bg-[#34302A] text-[#DDD8C5] rounded-lg text-xs font-semibold transition border border-[#5A554A]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Generating...' : 'PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#C2BEB5] hover:text-white rounded-lg hover:bg-[#3E3A33] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Traditional Fee Receipt Content */}
        <div className="p-6 bg-slate-100 overflow-x-auto flex justify-center">
          <div
            ref={receiptRef}
            className="printable-receipt bg-white w-full max-w-[580px] p-6 border-4 border-double border-slate-800 rounded shadow-md text-slate-900 font-serif relative"
            style={{ minHeight: '680px' }}
          >
            
            {/* Traditional Watermark Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none font-bold text-7xl select-none text-slate-900 uppercase">
              PAID
            </div>

            {/* Institution Header */}
            <div className="text-center pb-4 border-b-2 border-slate-800 space-y-1">
              <div className="flex items-center justify-center gap-2">
                <Building2 className="w-6 h-6 text-slate-800" />
                <h1 className="text-lg sm:text-xl font-black uppercase tracking-wide text-slate-900 font-sans">
                  {settings.name}
                </h1>
              </div>
              <p className="text-xs font-sans font-medium text-slate-700">
                {settings.subTitle}
              </p>
              <p className="text-[11px] font-sans text-slate-600">
                {settings.address} {settings.code && `| College Code: ${settings.code}`}
              </p>
              <div className="inline-block bg-slate-900 text-white text-[11px] font-sans font-bold px-3 py-0.5 rounded uppercase tracking-wider mt-1">
                FEE RECEIPT — ACADEMIC SESSION {settings.academicYear}
              </div>
            </div>

            {/* Receipt No & Date Row */}
            <div className="flex justify-between items-center py-2 text-xs font-mono border-b border-slate-300 font-semibold">
              <div>
                <span className="text-slate-600 font-sans font-normal">Receipt No: </span>
                <span className="text-slate-900 font-bold">{receiptNo}</span>
              </div>
              <div>
                <span className="text-slate-600 font-sans font-normal">Date: </span>
                <span>{paymentDate}</span>
              </div>
            </div>

            {/* Student Information Grid */}
            <div className="py-3 border-b border-slate-300 text-xs space-y-1.5 font-sans">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 font-medium">Registration No:</span>{' '}
                  <strong className="text-slate-900 font-mono text-sm">{student.registrationNo}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Caste Category:</span>{' '}
                  <strong className="text-slate-900">{student.casteCategory || 'General'}</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 font-medium">Student's Name:</span>{' '}
                  <strong className="text-slate-900 text-sm font-semibold">{student.studentName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Exam Type:</span>{' '}
                  <strong className="text-purple-900 font-mono">{student.examType || 'REGULAR'}</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 font-medium">Father's Name:</span>{' '}
                  <span className="text-slate-900 font-medium">{student.fatherName}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Mother's Name:</span>{' '}
                  <span className="text-slate-900">{student.motherName}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <div>
                  <span className="text-slate-500 font-medium">Date of Birth:</span>{' '}
                  <span className="text-slate-900 font-mono">{student.dob || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Class / Stream:</span>{' '}
                  <span className="text-slate-900 font-medium">{student.classOrStream || 'Intermediate (12th)'}</span>
                </div>
              </div>
            </div>

            {/* Fee Particulars Itemized Table */}
            <div className="py-3">
              <table className="w-full text-left border border-slate-400 text-xs font-sans">
                <thead>
                  <tr className="bg-slate-200 border-b border-slate-400 font-bold text-slate-800">
                    <th className="p-2 border-r border-slate-400 text-center w-10">S.N.</th>
                    <th className="p-2 border-r border-slate-400">Particulars / Head of Account</th>
                    <th className="p-2 text-right w-32">Amount (Rs.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  <tr>
                    <td className="p-2 border-r border-slate-300 text-center font-mono">1.</td>
                    <td className="p-2 border-r border-slate-300">
                      Annual Examination & Registration Board Fee ({student.casteCategory})
                    </td>
                    <td className="p-2 text-right font-mono font-semibold">
                      Rs. {(student.baseFee || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-slate-300 text-center font-mono">2.</td>
                    <td className="p-2 border-r border-slate-300 font-medium text-indigo-900">
                      Online Processing & Portal Charges (Included Extra)
                    </td>
                    <td className="p-2 text-right font-mono font-semibold text-indigo-900">
                      Rs. {(onlineCharges || 30).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                    <td colSpan={2} className="p-2 text-right border-r border-slate-400">
                      TOTAL PAYABLE FEE AMOUNT:
                    </td>
                    <td className="p-2 text-right font-mono text-sm">
                      Rs. {(totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr className="bg-emerald-50 text-emerald-950 font-bold">
                    <td colSpan={2} className="p-2 text-right border-r border-slate-400">
                      AMOUNT PAID RECEIVED:
                    </td>
                    <td className="p-2 text-right font-mono text-sm text-emerald-700">
                      Rs. {(paidAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  {balanceDue > 0 && (
                    <tr className="bg-rose-50 text-rose-950 font-bold">
                      <td colSpan={2} className="p-2 text-right border-r border-slate-400">
                        BALANCE DUE AMOUNT:
                      </td>
                      <td className="p-2 text-right font-mono text-sm text-rose-700">
                        Rs. {(balanceDue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Amount in Words */}
            <div className="bg-slate-50 p-2.5 rounded border border-slate-300 text-xs font-sans mb-3">
              <span className="font-semibold text-slate-700">Amount in Words: </span>
              <strong className="text-slate-900 italic">{amountInWords}</strong>
            </div>

            {/* Payment Details & Ref */}
            <div className="grid grid-cols-2 gap-4 text-xs font-sans py-2 border-t border-b border-slate-300 mb-4">
              <div>
                <p className="text-slate-500">Payment Mode:</p>
                <p className="font-bold text-slate-900 uppercase">
                  {student.paymentMode || 'CASH / COUNTER'}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Txn Ref / UTR ID:</p>
                <p className="font-mono font-semibold text-slate-800 truncate">
                  {student.transactionRef || 'N/A'}
                </p>
              </div>
            </div>

            {/* Stamp & Authorized Signatures Row */}
            <div className="pt-6 grid grid-cols-2 gap-8 text-xs font-sans items-end">
              <div className="text-center space-y-8">
                <div className="border-t border-slate-400 pt-1 text-slate-600 font-medium">
                  Student / Guardian Signature
                </div>
              </div>

              <div className="text-center space-y-4">
                {/* Official Stamp Box */}
                <div className="w-28 h-12 border border-dashed border-indigo-400 rounded mx-auto flex items-center justify-center text-[10px] text-indigo-700 bg-indigo-50/50 font-semibold">
                  [ COLLEGE STAMP ]
                </div>
                <div className="border-t border-slate-800 pt-1 font-bold text-slate-900">
                  Authorized Cashier / Exam Clerk
                </div>
              </div>
            </div>

            {/* Footnote */}
            <div className="mt-6 pt-2 border-t border-slate-300 text-[9px] text-center font-sans text-slate-500">
              Note: This receipt is computer-generated. Please preserve this receipt for final admit card & mark sheet collection.
            </div>
          </div>
        </div>

        {/* Modal Bottom Quick Action Bar */}
        <div className="bg-[#EFECE1] px-6 py-3 border-t border-[#E6E2D3] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-[#4A453E] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#2E5B50]" />
            <span>
              Receipt status:{' '}
              <strong className="text-[#4A453E]">
                {paidAmount >= totalAmount ? 'FULL PAYMENT COMPLETED' : `PARTIAL PAYMENT (DUE Rs. ${balanceDue.toLocaleString('en-IN')})`}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenWhatsApp(student)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#2E5B50] hover:bg-[#254A41] text-white rounded-lg font-semibold shadow transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Share Receipt to WhatsApp</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
