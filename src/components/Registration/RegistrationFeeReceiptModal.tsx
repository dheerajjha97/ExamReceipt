import React, { useRef, useState } from 'react';
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
  AlertTriangle,
  LayoutGrid,
  FileText,
  Layers,
  Scissors
} from 'lucide-react';
import { RegistrationStudent, InstituteSettings, calculateRegistrationFee } from '../../types';
import { numberToWordsInINR } from '../../services/storageService';
import { printIsolatedElement, fallbackDirectPrint } from '../../utils/printHelper';

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
  const [copied, setCopied] = useState(false);
  const [printLayout, setPrintLayout] = useState<'two-up' | 'quarter-single' | 'quarter-4up' | 'single'>('two-up');
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
    if (printRef.current) {
      printIsolatedElement(printRef.current, {
        documentTitle: `पंजीकरण_रसीद_${student.formNo}_${student.studentName}`,
        landscape: false,
        pageMargin: printLayout === 'quarter-4up' ? '3mm 4mm 3mm 4mm' : '4mm 6mm 4mm 6mm'
      });
    } else {
      fallbackDirectPrint();
    }
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

  // Ultra-Compact 1/4 Size Quarter Slip Component (Saves 75% paper)
  const renderQuarterSlip = (copyTitle: string, index = 0) => (
    <div key={index} className="quarter-slip-box border-2 border-dashed border-slate-800 p-2.5 bg-white text-black font-sans rounded flex flex-col justify-between" style={{ minHeight: '130mm', boxSizing: 'border-box' }}>
      <div>
        {/* Header */}
        <div className="border-b border-black pb-1 mb-1 text-center">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[9px] border border-black px-1 rounded-xs">BSEB</span>
            <div className="flex-1 px-1">
              <h1 className="text-[11px] font-black uppercase leading-tight font-serif truncate">
                {settings.name}
              </h1>
              <p className="text-[8px] text-gray-700">
                कोड: <strong className="font-mono">{settings.code || '31337'}</strong> &bull; इंटर पंजीकरण (2026-2027)
              </p>
            </div>
            <span className="text-[8px] font-bold border border-black bg-gray-100 px-1 rounded-xs uppercase">
              {copyTitle}
            </span>
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-3 gap-1 text-[8px] font-mono border-b border-gray-300 pb-1 mb-1 bg-gray-50 px-1 py-0.5 rounded-xs">
          <div>रसीद: <strong>{receiptNo}</strong></div>
          <div>OFSS: <strong className="text-[#2E5B50]">{student.ofssNo || student.formNo}</strong></div>
          <div className="text-right">तिथि: <strong>{paymentDate}</strong></div>
        </div>

        {/* Student Details Grid */}
        <div className="text-[8.5px] space-y-0.5 border-b border-gray-300 pb-1 mb-1">
          <div className="flex justify-between">
            <span className="text-gray-600">छात्र का नाम:</span>
            <strong className="uppercase font-bold">{student.studentName}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">पिता का नाम:</span>
            <span className="uppercase">{student.fatherName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">संकाय / कोटि:</span>
            <span><strong>{student.stream}</strong> | {student.casteCategory}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">10वीं बोर्ड / रोल:</span>
            <span className="text-[8px] font-mono">{student.boardName || student.matricBoard || 'BSEB'} ({student.matricRollCode || '-'}-{student.matricRollNo || '-'})</span>
          </div>
        </div>

        {/* Fee Particulars */}
        <div className="bg-gray-50 border border-gray-300 rounded-xs p-1 mb-1 text-[8px]">
          <div className="flex justify-between">
            <span>मूल पंजीकरण शुल्क (BSEB):</span>
            <span className="font-mono">₹{baseFee}.00</span>
          </div>
          <div className="flex justify-between">
            <span>ऑनलाइन/प्रोसेसिंग शुल्क:</span>
            <span className="font-mono">₹{serviceCharge}.00</span>
          </div>
          <div className="flex justify-between font-bold border-t border-gray-300 mt-0.5 pt-0.5 text-[9px] text-black">
            <span>कुल प्राप्त राशि (Total Paid):</span>
            <span className="font-mono text-emerald-900 bg-emerald-50 px-1">₹{feeAmount}.00</span>
          </div>
        </div>

        {/* Checklist */}
        <div className="text-[7.5px] text-gray-700 bg-white border border-gray-200 p-1 rounded-xs mb-1">
          <span className="font-bold">दस्तावेज: </span>
          आधार [{student.documents?.aadhar?.status === 'SUBMITTED' ? '✓' : '✗'}], 
          अपार [{student.documents?.apaar?.status === 'SUBMITTED' ? '✓' : '!'}], 
          मूल TC [{student.documents?.transferCertificate?.status === 'SUBMITTED' ? '✓' : '✗'}], 
          जाति [{student.documents?.casteCertificate?.status === 'SUBMITTED' ? '✓' : '-'}]
        </div>
      </div>

      {/* Signature */}
      <div className="flex justify-between items-end pt-1 border-t border-gray-400 text-[8px]">
        <div className="text-center">
          <div className="w-14 border-b border-gray-400 mb-0.5"></div>
          <span className="text-gray-600">छात्र हस्ताक्षर</span>
        </div>
        <div className="text-center">
          <div className="w-16 border-b border-gray-400 mb-0.5"></div>
          <span className="text-gray-600">काउंटर लिपिक</span>
        </div>
        <div className="text-center">
          <div className="w-16 border-b border-black mb-0.5"></div>
          <strong className="text-black font-bold">प्राचार्य सील</strong>
        </div>
      </div>
    </div>
  );

  // Calibrated Single Receipt Sheet for 1-Page A4 (2-Up) Fit
  const renderCalibratedSlip = (copyTitle: string, isWatermarked = false) => (
    <div className={`receipt-slip-compact border-2 border-slate-900 p-2.5 rounded-lg bg-white text-black relative ${isWatermarked ? 'border-dashed' : ''}`}>
      {/* Institutional Header */}
      <div className="text-center border-b border-black pb-1.5 mb-1.5">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-full border border-black flex items-center justify-center font-bold text-[10px]">
            BSEB
          </div>
          <div className="flex-1 px-2">
            <h1 className="text-sm font-black tracking-tight uppercase leading-tight font-serif">
              {settings.name}
            </h1>
            <p className="text-[9.5px] text-gray-700 font-medium">
              {settings.address} &bull; कोड: <span className="font-mono font-bold">{settings.code || '31337'}</span>
            </p>
            <div className="mt-0.5 inline-block px-2 py-0.5 bg-black text-white text-[9px] font-bold rounded-xs tracking-wider uppercase">
              इंटरमीडिएट पंजीकरण एवं दस्तावेज सत्यापन रसीद (2026-2027)
            </div>
          </div>
          <div className="text-right text-[9px] font-mono border border-black p-1 rounded-xs">
            <span className="font-bold block uppercase bg-gray-200 px-1">{copyTitle}</span>
            <span className="font-bold">₹{feeAmount}/-</span>
          </div>
        </div>
      </div>

      {/* Metadata Row */}
      <div className="grid grid-cols-4 gap-1 text-[9.5px] border-b border-gray-300 pb-1 mb-1.5 bg-gray-50 p-1 rounded-xs font-mono">
        <div>
          <span className="text-gray-600 block text-[8px]">रसीद सं. (Receipt No):</span>
          <strong className="text-black font-bold text-[9.5px]">{receiptNo}</strong>
        </div>
        <div>
          <span className="text-gray-600 block text-[8px]">OFSS सं. (OFSS NO.):</span>
          <strong className="text-[#2E5B50] font-bold text-[9.5px]">{student.ofssNo || student.formNo}</strong>
        </div>
        <div>
          <span className="text-gray-600 block text-[8px]">पंजीकरण फॉर्म सं.:</span>
          <strong className="text-black font-bold text-[9.5px]">{student.formNo}</strong>
        </div>
        <div className="text-right">
          <span className="text-gray-600 block text-[8px]">दिनांक (Date):</span>
          <strong className="text-black text-[9.5px]">{paymentDate}</strong>
        </div>
      </div>

      {/* Student Details Grid */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[9.5px] mb-1.5 leading-tight">
        <div className="flex justify-between border-b border-gray-200 pb-0.5">
          <span className="text-gray-600">छात्र/छात्रा का नाम:</span>
          <strong className="font-bold text-black uppercase">{student.studentName}</strong>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-0.5">
          <span className="text-gray-600">संकाय (Stream):</span>
          <strong className="font-bold text-black bg-gray-100 px-1 rounded-xs">{student.stream}</strong>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-0.5">
          <span className="text-gray-600">पिता का नाम:</span>
          <span className="font-semibold text-black uppercase">{student.fatherName}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-0.5">
          <span className="text-gray-600">माता का नाम:</span>
          <span className="font-semibold text-black uppercase">{student.motherName || '-'}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-0.5">
          <span className="text-gray-600">जाति कोटि (Category):</span>
          <strong className="font-bold text-black">{student.casteCategory}</strong>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-0.5">
          <span className="text-gray-600">जन्म तिथि (DOB):</span>
          <span className="font-mono text-black">{student.dob || '-'}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-0.5">
          <span className="text-gray-600">10वीं बोर्ड (Board):</span>
          <strong className="font-bold text-blue-900">{student.boardName || student.matricBoard || 'BSEB PATNA'}</strong>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-0.5">
          <span className="text-gray-600">मैट्रिक रोल कोड-नं.:</span>
          <span className="font-mono text-black">{student.matricRollCode || '-'}-{student.matricRollNo || '-'} ({student.matricPassingYear || '2024'})</span>
        </div>
      </div>

      {/* Fee Table */}
      <table className="w-full text-[8.5px] border border-black mb-1.5">
        <thead>
          <tr className="bg-gray-100 border-b border-black">
            <th className="p-1 text-left border-r border-black w-6">क्र.</th>
            <th className="p-1 text-left border-r border-black">मद का विवरण (Fee Particulars)</th>
            <th className="p-1 text-right w-20">राशि (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-200">
            <td className="p-0.5 border-r border-black font-mono text-center">1</td>
            <td className="p-0.5 border-r border-black">
              <strong>इंटरमीडिएट सत्र 2026-2027 मूल पंजीकरण शुल्क (BSEB Base Fee)</strong>
            </td>
            <td className="p-0.5 text-right font-mono font-bold">₹{baseFee}.00</td>
          </tr>
          <tr className="border-b border-gray-300">
            <td className="p-0.5 border-r border-black font-mono text-center">2</td>
            <td className="p-0.5 border-r border-black">
              <strong>ऑनलाइन आवेदन एवं सेवा/प्रोसेसिंग शुल्क (Online Processing Charges)</strong>
            </td>
            <td className="p-0.5 text-right font-mono font-bold">₹{serviceCharge}.00</td>
          </tr>
          <tr className="bg-gray-50 font-bold border-t border-black">
            <td colSpan={2} className="p-1 text-right border-r border-black">
              कुल प्राप्त राशि (Total Amount Received):
            </td>
            <td className="p-1 text-right font-mono text-[10px] text-emerald-950">₹{feeAmount}.00</td>
          </tr>
        </tbody>
      </table>

      {/* Amount in words & Pay mode */}
      <div className="text-[8.5px] mb-1.5 p-1 bg-gray-50 border border-gray-300 rounded-xs flex items-center justify-between">
        <div>
          <span className="text-gray-600">शब्दों में: </span>
          <strong className="font-bold text-black uppercase">{numberToWordsInINR(feeAmount)}</strong>
        </div>
        <div className="text-[8.5px] font-mono font-bold bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded-xs border border-emerald-300">
          माध्यम: {student.paymentMode || 'CASH'}
        </div>
      </div>

      {/* Document Submission Audit Checklist */}
      <div className="border border-gray-300 p-1 rounded-xs mb-1.5 bg-white text-[8px] leading-tight">
        <div className="font-bold uppercase tracking-wider text-gray-700 mb-0.5 border-b border-gray-200 pb-0.5 flex items-center justify-between">
          <span>संलग्न/सत्यापित दस्तावेजों का विवरण (Document Checklist):</span>
          <span className="text-gray-500 font-normal">सत्यापित</span>
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
          <div>
            • <strong>आधार (Aadhaar):</strong> {student.documents?.aadhar?.status === 'SUBMITTED' ? `[✓] जमा (${student.documents.aadhar.docNumber || 'सत्यापित'})` : '[✗] लंबित'}
          </div>
          <div>
            • <strong>अपार (APAAR):</strong> {student.documents?.apaar?.status === 'SUBMITTED' ? `[✓] दर्ज (${student.documents.apaar.docNumber})` : `[!] अनुपलब्ध: ${student.documents?.apaar?.notAvailableReason || 'लंबित'}`}
          </div>
          <div>
            • <strong>स्थानांतरण (TC/SLC):</strong> {student.documents?.transferCertificate?.status === 'SUBMITTED' ? `[✓] मूल प्रति जमा (${student.documents.transferCertificate.docNumber || 'जमा'})` : '[✗] लंबित (अनिवार्य)'}
          </div>
          <div>
            • <strong>जाति प्रमाण पत्र:</strong> {student.documents?.casteCertificate?.status === 'SUBMITTED' ? `[✓] जमा (${student.documents.casteCertificate.docNumber})` : (student.casteCategory === 'General' || student.casteCategory === 'BC' ? '[—] सामान्य (लागू नहीं)' : '[✗] लंबित')}
          </div>
        </div>
      </div>

      {/* Signatures & Footer */}
      <div className="flex justify-between items-end pt-1 text-[9px] border-t border-gray-300">
        <div className="text-center">
          <div className="w-20 border-b border-gray-400 mb-0.5"></div>
          <span className="text-gray-600 text-[8px]">छात्र/अभिभावक हस्ताक्षर</span>
        </div>
        <div className="text-center">
          <div className="text-[8px] font-bold text-gray-700">{settings.cashierName || 'काउंटर लिपिक'}</div>
          <div className="w-20 border-b border-gray-400 mb-0.5"></div>
          <span className="text-gray-600 text-[8px]">रोकड़िया / काउंटर लिपिक</span>
        </div>
        <div className="text-center">
          <div className="w-24 border-b border-black mb-0.5"></div>
          <strong className="text-black font-bold text-[8.5px]">प्रधानाध्यापक / प्राचार्य</strong>
          <div className="text-[7.5px] text-gray-500">सील एवं हस्ताक्षर</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/40 my-auto print:shadow-none print:border-none print:rounded-none">
        
        {/* Top Modal Controls */}
        <div className="px-5 py-3.5 bg-[#2E5B50] text-white flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <School className="w-5 h-5 text-emerald-200" />
            <div>
              <h2 className="font-bold text-sm sm:text-base">इंटरमीडिएट पंजीकरण रसीद (₹{feeAmount})</h2>
              <p className="text-[11px] text-emerald-100">फॉर्म: {student.formNo} &bull; रसीद: {receiptNo} &bull; {student.studentName}</p>
            </div>
          </div>

          {/* Layout Selector & Actions */}
          <div className="flex items-center flex-wrap gap-1.5">
            {/* Layout Options */}
            <div className="bg-emerald-950/60 p-1 rounded-xl flex items-center gap-1 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setPrintLayout('two-up')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition flex items-center gap-1 cursor-pointer ${
                  printLayout === 'two-up'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-100 hover:text-white'
                }`}
                title="A4 साइज में 2 प्रतियां (Office + Student) - ठीक 1 पेज पर फिट होगी"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>A4 (1 पेज - 2 प्रति)</span>
              </button>

              <button
                type="button"
                onClick={() => setPrintLayout('quarter-single')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition flex items-center gap-1 cursor-pointer ${
                  printLayout === 'quarter-single'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-emerald-100 hover:text-white'
                }`}
                title="1/4 साइज सिंगल स्लिप (Quarter Page Paper Saving)"
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>1/4 साइज (Single)</span>
              </button>

              <button
                type="button"
                onClick={() => setPrintLayout('quarter-4up')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition flex items-center gap-1 cursor-pointer ${
                  printLayout === 'quarter-4up'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-emerald-100 hover:text-white'
                }`}
                title="1 A4 पेज पर 4 रसीदें (4-Up Quarter Grid)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>1/4 साइज (4-Up Grid)</span>
              </button>
            </div>

            <button
              onClick={handleCopyText}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition text-xs flex items-center gap-1 cursor-pointer"
              title="रसीद विवरण कॉपी करें"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-white text-[#2E5B50] hover:bg-emerald-50 font-black text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>प्रिंट (Print)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body Container */}
        <div className="p-3 sm:p-4 max-h-[78vh] overflow-y-auto bg-stone-100 print:p-0 print:max-h-none print:bg-white" ref={printRef} id="printable-registration-receipt">
          
          {/* Option 1: 1/4 Size 4-Up Grid (4 slips on 1 A4 Page) */}
          {printLayout === 'quarter-4up' && (
            <div className="quarter-grid-4up grid grid-cols-2 gap-2 bg-white p-1">
              {renderQuarterSlip('कार्यालय प्रति (OFFICE COPY)', 0)}
              {renderQuarterSlip('छात्र प्रति (STUDENT COPY)', 1)}
              {renderQuarterSlip('कार्यालय प्रति-2 (RECORD COPY)', 2)}
              {renderQuarterSlip('छात्र प्रति-2 (STUDENT COPY)', 3)}
            </div>
          )}

          {/* Option 2: 1/4 Size Single Slip */}
          {printLayout === 'quarter-single' && (
            <div className="flex justify-center p-2">
              <div className="w-full max-w-[105mm]">
                {renderQuarterSlip('छात्र/छात्रा प्रति (STUDENT COPY)')}
              </div>
            </div>
          )}

          {/* Option 3: Default 2-Up (Office + Student Copy on Exactly 1 A4 Sheet) */}
          {printLayout === 'two-up' && (
            <div className="receipt-container-a4 space-y-2">
              {/* Sheet 1: College / Office Copy */}
              {renderCalibratedSlip('महाविद्यालय / संस्थान प्रति (Office Copy)')}

              {/* Cut Line Indicator */}
              <div className="my-1 border-b border-dashed border-gray-400 relative text-center">
                <span className="bg-stone-100 px-2 text-[9px] text-gray-500 font-mono -top-2 relative">
                  ✂ यहाँ से काटें (Tear Here) ✂
                </span>
              </div>

              {/* Sheet 2: Student Copy */}
              {renderCalibratedSlip('छात्र / छात्रा प्रति (Student Copy)', true)}
            </div>
          )}

          {/* Option 4: Single Half Sheet */}
          {printLayout === 'single' && (
            <div className="p-2">
              {renderCalibratedSlip('छात्र / छात्रा प्रति (Student Copy)')}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-2.5 bg-[#FAF9F5] border-t border-[#E8E4D5] flex flex-wrap items-center justify-between gap-2 text-xs text-[#5A5A40] print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-[11px] sm:text-xs">
              {printLayout === 'two-up' && 'A4 1-पेज कैलिब्रेटेड: दोनों प्रतियां ठीक 1 पेज पर फिट होंगी (1/2 नहीं होगा)।'}
              {printLayout === 'quarter-single' && '1/4 साइज: सिंगल कॉम्पैक्ट स्लिप प्रिंट होगी।'}
              {printLayout === 'quarter-4up' && '1/4 4-Up: 1 A4 पेपर पर 4 रसीदें प्रिंट होंगी।'}
            </span>
          </div>
          <button
            onClick={handlePrint}
            className="px-3 py-1 bg-[#2E5B50] text-white rounded-lg font-bold text-xs hover:bg-[#254A41] transition flex items-center gap-1 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>अभी A4 पर प्रिंट करें</span>
          </button>
        </div>

      </div>
    </div>
  );
};

