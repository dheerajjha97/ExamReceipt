import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  Share2, 
  Download, 
  CheckCircle2, 
  QrCode, 
  School, 
  Copy, 
  Check,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { RegistrationStudent, InstituteSettings, calculateRegistrationFee } from '../../types';
import { numberToWordsInINR } from '../../services/storageService';

interface RegistrationFeeReceiptModalProps {
  isOpen: boolean;
  student: RegistrationStudent | null;
  settings: InstituteSettings;
  onClose: () => void;
}

export const RegistrationFeeReceiptModal: React.FC<RegistrationFeeReceiptModalProps> = ({
  isOpen,
  student,
  settings,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !student) return null;

  const boardName = student.boardName || student.matricBoard || 'BSEB PATNA';
  const feeCalc = calculateRegistrationFee(boardName, student.serviceCharge ?? (settings.defaultOnlineCharge || 30));
  const feeAmount = student.registrationFee || (student.paidAmount > 0 ? student.paidAmount : feeCalc.totalFee);
  const baseFee = student.baseFee || feeCalc.baseFee;
  const serviceCharge = student.serviceCharge !== undefined ? student.serviceCharge : (feeAmount - baseFee);
  const receiptNo = student.receiptNo || `REG/26-27/${student.sNo.toString().padStart(4, '0')}`;
  const paymentDate = student.paymentDate || new Date().toLocaleDateString('en-GB');

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `*${settings.name}*
*इंटरमीडिएट पंजीकरण शुल्क रसीद (Session 2026-2027)*
-----------------------------------
रसीद सं. (Receipt No): ${receiptNo}
OFSS सं. (OFSS No): ${student.ofssNo || student.formNo}
फॉर्म सं. (Form No): ${student.formNo}
छात्र का नाम: ${student.studentName}
पिता का नाम: ${student.fatherName}
माता का नाम: ${student.motherName || '-'}
जन्म तिथि: ${student.dob || '-'}
10वीं बोर्ड: ${student.boardName || student.matricBoard || 'BSEB PATNA'}
संकाय (Stream): ${student.stream}
जाति कोटि: ${student.casteCategory}
-----------------------------------
मूल पंजीकरण शुल्क: ₹${baseFee}
सेवा/ऑनलाइन शुल्क: ₹${serviceCharge}
कुल प्राप्त राशि (Total Paid): ₹${feeAmount} (${numberToWordsInINR(feeAmount)})
भुगतान माध्यम: ${student.paymentMode || 'CASH'} (Ref: ${student.transactionRef || 'CASH'})
भुगतान तिथि: ${paymentDate}
-----------------------------------
*जमा दस्तावेज स्थिति:*
• आधार कार्ड: ${student.documents?.aadhar?.status === 'SUBMITTED' ? `जमा (${student.documents.aadhar.docNumber || 'Yes'})` : 'लंबित'}
• अपार आईडी: ${student.documents?.apaar?.status === 'SUBMITTED' ? `उपलब्ध (${student.documents.apaar.docNumber})` : `उपलब्ध नहीं (${student.documents?.apaar?.notAvailableReason || 'Reason pending'})`}
• TC/SLC: ${student.documents?.transferCertificate?.status === 'SUBMITTED' ? `मूल TC जमा (${student.documents.transferCertificate.docNumber || 'Yes'})` : 'लंबित'}
• जाति प्रमाण पत्र: ${student.documents?.casteCertificate?.status === 'SUBMITTED' ? `जमा (${student.documents.casteCertificate.docNumber})` : (student.casteCategory === 'General' || student.casteCategory === 'BC' ? 'लागू नहीं' : 'लंबित')}
-----------------------------------
अधिकृत हस्ताक्षरकर्ता: ${settings.cashierName || 'Accountant / Principal'}
${settings.address}`;

    const url = `https://wa.me/${student.mobile ? '91' + student.mobile : ''}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyText = () => {
    const summary = `रसीद सं: ${receiptNo} | OFSS: ${student.ofssNo || '-'} | छात्र: ${student.studentName} | संकाय: ${student.stream} | शुल्क: ₹${feeAmount} | स्थिति: PAID`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render a single half-sheet receipt component (Used for College Copy and Student Copy)
  const renderReceiptSheet = (copyTitle: string, isWatermarked = false) => (
    <div className={`receipt-slip border-2 border-[#333] p-5 rounded-xl bg-white text-black relative ${isWatermarked ? 'mt-6 pt-6 border-dashed' : ''}`}>
      {/* Institutional Header */}
      <div className="text-center border-b-2 border-black pb-3 mb-3">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-full border border-black flex items-center justify-center font-bold text-xs">
            BSEB
          </div>
          <div className="flex-1 px-2">
            <h1 className="text-lg font-black tracking-tight uppercase leading-tight font-serif">
              {settings.name}
            </h1>
            <p className="text-[11px] text-gray-700 font-medium">
              {settings.address} &bull; कोड: <span className="font-mono font-bold">{settings.code || '31337'}</span>
            </p>
            <div className="mt-1 inline-block px-3 py-0.5 bg-black text-white text-[11px] font-bold rounded-sm tracking-wider uppercase">
              इंटरमीडिएट पंजीकरण एवं दस्तावेज सत्यापन रसीद (2026-2027)
            </div>
          </div>
          <div className="text-right text-[10px] font-mono border border-black p-1 rounded-sm">
            <span className="font-bold block uppercase bg-gray-200 px-1">{copyTitle}</span>
            <span className="font-bold">₹{feeAmount}/-</span>
          </div>
        </div>
      </div>

      {/* Metadata Row */}
      <div className="grid grid-cols-4 gap-2 text-xs border-b border-gray-400 pb-2 mb-3 bg-gray-50 p-2 rounded-sm font-mono">
        <div>
          <span className="text-gray-600 block text-[10px]">रसीद सं. (Receipt No):</span>
          <strong className="text-black font-bold text-xs">{receiptNo}</strong>
        </div>
        <div>
          <span className="text-gray-600 block text-[10px]">OFSS सं. (OFSS NO.):</span>
          <strong className="text-[#2E5B50] font-bold text-xs">{student.ofssNo || student.formNo}</strong>
        </div>
        <div>
          <span className="text-gray-600 block text-[10px]">पंजीकरण फॉर्म सं.:</span>
          <strong className="text-black font-bold text-xs">{student.formNo}</strong>
        </div>
        <div className="text-right">
          <span className="text-gray-600 block text-[10px]">दिनांक (Date):</span>
          <strong className="text-black text-xs">{paymentDate}</strong>
        </div>
      </div>

      {/* Student Details Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs mb-3">
        <div className="flex justify-between border-b border-gray-200 pb-0.5">
          <span className="text-gray-600">छात्र/छात्रा का नाम (NAME):</span>
          <strong className="font-bold text-black uppercase">{student.studentName}</strong>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-0.5">
          <span className="text-gray-600">संकाय (Stream / Faculty):</span>
          <strong className="font-bold text-black bg-gray-100 px-1 rounded-xs">{student.stream}</strong>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-0.5">
          <span className="text-gray-600">पिता का नाम (FATHER NAME):</span>
          <span className="font-semibold text-black uppercase">{student.fatherName}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-0.5">
          <span className="text-gray-600">माता का नाम (MOTHER NAME):</span>
          <span className="font-semibold text-black uppercase">{student.motherName || '-'}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-0.5">
          <span className="text-gray-600">जाति कोटि (CATEGORY):</span>
          <strong className="font-bold text-black">{student.casteCategory}</strong>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-0.5">
          <span className="text-gray-600">जन्म तिथि (DOB):</span>
          <span className="font-mono text-black">{student.dob || '-'}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-0.5">
          <span className="text-gray-600">10वीं बोर्ड (BOARD NAME):</span>
          <strong className="font-bold text-blue-900">{student.boardName || student.matricBoard || 'BSEB PATNA'}</strong>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-0.5">
          <span className="text-gray-600">मैट्रिक रोल कोड एवं नं.:</span>
          <span className="font-mono text-black">{student.matricRollCode || '-'}-{student.matricRollNo || '-'} ({student.matricPassingYear || '2024'})</span>
        </div>
      </div>

      {/* Fee Table */}
      <table className="w-full text-xs border border-black mb-3">
        <thead>
          <tr className="bg-gray-100 border-b border-black">
            <th className="p-1.5 text-left border-r border-black w-8">क्र.</th>
            <th className="p-1.5 text-left border-r border-black">मद का विवरण (Fee Particulars)</th>
            <th className="p-1.5 text-right w-24">राशि (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-200">
            <td className="p-1.5 border-r border-black font-mono text-center">1</td>
            <td className="p-1.5 border-r border-black">
              <strong>इंटरमीडिएट सत्र 2026-2027 मूल पंजीकरण शुल्क (Base Registration Fee)</strong>
              <div className="text-[10px] text-gray-600">BSEB / Board Prescribed Registration Fee</div>
            </td>
            <td className="p-1.5 text-right font-mono font-bold">₹{baseFee}.00</td>
          </tr>
          <tr className="border-b border-gray-300">
            <td className="p-1.5 border-r border-black font-mono text-center">2</td>
            <td className="p-1.5 border-r border-black">
              <strong>ऑनलाइन आवेदन एवं सेवा/प्रोसेसिंग शुल्क (Online Service Charge)</strong>
              <div className="text-[10px] text-gray-600">Portal & Documentation Processing Charges</div>
            </td>
            <td className="p-1.5 text-right font-mono font-bold">₹{serviceCharge}.00</td>
          </tr>
          <tr className="bg-gray-50 font-bold border-t border-black">
            <td colSpan={2} className="p-1.5 text-right border-r border-black">
              कुल प्राप्त राशि (Total Amount Received):
            </td>
            <td className="p-1.5 text-right font-mono text-sm">₹{feeAmount}.00</td>
          </tr>
        </tbody>
      </table>

      {/* Amount in words */}
      <div className="text-xs mb-3 p-1.5 bg-gray-50 border border-gray-300 rounded-xs flex items-center justify-between">
        <div>
          <span className="text-gray-600">शब्दों में (In Words): </span>
          <strong className="font-bold text-black uppercase">{numberToWordsInINR(feeAmount)}</strong>
        </div>
        <div className="text-[11px] font-mono font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-xs border border-emerald-300">
          भुगतान माध्यम: {student.paymentMode || 'CASH'} ({student.transactionRef || 'SUCCESS'})
        </div>
      </div>

      {/* Document Submission Audit Checklist */}
      <div className="border border-gray-300 p-2 rounded-xs mb-3 bg-white text-[10px]">
        <div className="font-bold uppercase tracking-wider text-gray-700 mb-1 border-b border-gray-200 pb-0.5 flex items-center justify-between">
          <span>संलग्न/सत्यापित दस्तावेजों का विवरण (Document Checklist):</span>
          <span className="text-gray-500 font-normal">चेकलिस्ट</span>
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
          <div>
            • <strong>आधार कार्ड (Aadhaar):</strong> {student.documents?.aadhar?.status === 'SUBMITTED' ? `[✓] जमा (${student.documents.aadhar.docNumber || 'सत्यापित'})` : '[✗] लंबित'}
          </div>
          <div>
            • <strong>अपार आईडी (APAAR):</strong> {student.documents?.apaar?.status === 'SUBMITTED' ? `[✓] दर्ज (${student.documents.apaar.docNumber})` : `[!] अनुपलब्ध: ${student.documents?.apaar?.notAvailableReason || 'कारण लंबित'}`}
          </div>
          <div>
            • <strong>स्थानांतरण प्रमाणपत्र (TC/SLC):</strong> {student.documents?.transferCertificate?.status === 'SUBMITTED' ? `[✓] मूल प्रति जमा (${student.documents.transferCertificate.docNumber || 'जमा'})` : '[✗] लंबित (अनिवार्य)'}
          </div>
          <div>
            • <strong>जाति प्रमाण पत्र:</strong> {student.documents?.casteCertificate?.status === 'SUBMITTED' ? `[✓] जमा (${student.documents.casteCertificate.docNumber})` : (student.casteCategory === 'General' || student.casteCategory === 'BC' ? '[—] सामान्य (लागू नहीं)' : '[✗] लंबित (अनिवार्य)')}
          </div>
        </div>
      </div>

      {/* Signatures & Footer */}
      <div className="flex justify-between items-end pt-3 text-[11px] border-t border-gray-300">
        <div className="text-center">
          <div className="w-24 border-b border-gray-400 mb-1"></div>
          <span className="text-gray-600">छात्र/अभिभावक हस्ताक्षर</span>
        </div>
        <div className="text-center">
          <div className="text-[10px] font-bold text-gray-700">{settings.cashierName || 'काउंटर लिपिक'}</div>
          <div className="w-24 border-b border-gray-400 mb-1"></div>
          <span className="text-gray-600">रोकड़िया / काउंटर लिपिक</span>
        </div>
        <div className="text-center">
          <div className="w-28 border-b border-black mb-1"></div>
          <strong className="text-black font-bold">प्रधानाध्यापक / प्राचार्य</strong>
          <div className="text-[9px] text-gray-500">सील एवं हस्ताक्षर</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/40 my-auto">
        {/* Top Modal Controls */}
        <div className="px-6 py-4 bg-[#2E5B50] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <School className="w-5 h-5 text-emerald-200" />
            <div>
              <h2 className="font-bold text-base">इंटरमीडिएट पंजीकरण रसीद (₹515)</h2>
              <p className="text-xs text-emerald-100">फॉर्म सं: {student.formNo} &bull; रसीद सं: {receiptNo}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition text-xs flex items-center gap-1.5"
              title="कॉपी करें"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-white text-[#2E5B50] hover:bg-emerald-50 font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>प्रिंट (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto bg-stone-100" ref={printRef} id="printable-registration-receipt">
          {/* Sheet 1: College / Office Copy */}
          {renderReceiptSheet('महाविद्यालय / संस्थान प्रति (Office Copy)')}

          {/* Cut Line Indicator */}
          <div className="my-4 border-b-2 border-dashed border-gray-400 relative text-center">
            <span className="bg-stone-100 px-3 text-[10px] text-gray-500 font-mono -top-2.5 relative">
              ✂ यहाँ से काटें (Tear Here) ✂
            </span>
          </div>

          {/* Sheet 2: Student Copy */}
          {renderReceiptSheet('छात्र / छात्रा प्रति (Student Copy)', true)}
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 bg-[#FAF9F5] border-t border-[#E8E4D5] flex items-center justify-between text-xs text-[#5A5A40]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>पंजीकरण शुल्क ₹515 सफलतापूर्वक संगृहीत। रसीद A4 / 2-Up प्रिंटेबल है।</span>
          </div>
          <button
            onClick={handlePrint}
            className="text-[#2E5B50] font-bold hover:underline"
          >
            A4 साइज में प्रिंट करें &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
