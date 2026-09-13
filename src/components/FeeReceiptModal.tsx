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
  PhoneCall,
  LayoutGrid,
  FileText,
  Scissors
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Student, InstituteSettings } from '../types';
import { numberToWordsInINR } from '../services/storageService';
import { printIsolatedElement, fallbackDirectPrint } from '../utils/printHelper';

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
  const [printLayout, setPrintLayout] = useState<'two-up' | 'quarter-single' | 'quarter-4up' | 'single'>('two-up');

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
    if (receiptRef.current) {
      printIsolatedElement(receiptRef.current, {
        documentTitle: `शुल्क_रसीद_${student.registrationNo}_${student.studentName}`,
        landscape: false,
        pageMargin: printLayout === 'quarter-4up' ? '3mm 4mm 3mm 4mm' : '4mm 6mm 4mm 6mm'
      });
    } else {
      fallbackDirectPrint();
    }
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
      const pdf = new jsPDF('p', 'mm', 'a4');
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

  // Render 1/4 Size Slip for Examination Fee
  const renderExamQuarterSlip = (copyTitle: string, key = 0) => (
    <div key={key} className="quarter-slip-box border-2 border-dashed border-slate-800 p-2 bg-white text-black font-sans rounded flex flex-col justify-between" style={{ minHeight: '130mm', boxSizing: 'border-box' }}>
      <div>
        <div className="border-b border-black pb-1 mb-1 text-center">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[9px] border border-black px-1 rounded-xs">BSEB</span>
            <div className="flex-1 px-1">
              <h1 className="text-[11px] font-black uppercase leading-tight font-serif truncate">
                {settings.name}
              </h1>
              <p className="text-[8px] text-gray-700">
                कोड: <strong className="font-mono">{settings.code || '31337'}</strong> &bull; परीक्षा शुल्क ({settings.academicYear})
              </p>
            </div>
            <span className="text-[8px] font-bold border border-black bg-gray-100 px-1 rounded-xs uppercase">
              {copyTitle}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1 text-[8px] font-mono border-b border-gray-300 pb-1 mb-1 bg-gray-50 px-1 py-0.5 rounded-xs">
          <div>रसीद: <strong>{receiptNo}</strong></div>
          <div>पंजीकरण: <strong className="text-slate-900">{student.registrationNo}</strong></div>
          <div className="text-right">तिथि: <strong>{paymentDate.split(',')[0]}</strong></div>
        </div>

        <div className="text-[8.5px] space-y-0.5 border-b border-gray-300 pb-1 mb-1">
          <div className="flex justify-between">
            <span className="text-gray-600">परीक्षार्थी का नाम:</span>
            <strong className="uppercase font-bold">{student.studentName}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">पिता का नाम:</span>
            <span className="uppercase">{student.fatherName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">संकाय / कोटि:</span>
            <span><strong>{student.classOrStream}</strong> | {student.casteCategory}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">परीक्षा प्रकार:</span>
            <strong className="text-purple-900">{student.examType || 'REGULAR'}</strong>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-300 rounded-xs p-1 mb-1 text-[8px]">
          <div className="flex justify-between">
            <span>मूल परीक्षा शुल्क ({student.casteCategory}):</span>
            <span className="font-mono">₹{(student.baseFee || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span>ऑनलाइन/पोर्टल शुल्क:</span>
            <span className="font-mono">₹{(onlineCharges || 30).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between font-bold border-t border-gray-300 mt-0.5 pt-0.5 text-[9px] text-black">
            <span>कुल प्राप्त राशि (Total Paid):</span>
            <span className="font-mono text-emerald-900 bg-emerald-50 px-1">₹{(paidAmount || totalAmount).toLocaleString('en-IN')}.00</span>
          </div>
        </div>

        <div className="text-[7.5px] text-gray-700 bg-white border border-gray-200 p-1 rounded-xs mb-1">
          <span>शब्दों में: <strong>{amountInWords}</strong></span> &bull; 
          <span> भुगतान माध्यम: <strong>{student.paymentMode || 'CASH'}</strong></span>
        </div>
      </div>

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

  // Render Calibrated Single Sheet Slip
  const renderExamCalibratedSlip = (copyTitle: string, isWatermarked = false) => (
    <div className={`receipt-slip-compact border-2 border-slate-900 p-2.5 rounded-lg bg-white text-black font-serif relative ${isWatermarked ? 'border-dashed' : ''}`}>
      {/* Header */}
      <div className="text-center border-b border-black pb-1.5 mb-1.5 font-sans">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-full border border-black flex items-center justify-center font-bold text-[10px]">
            BSEB
          </div>
          <div className="flex-1 px-2">
            <h1 className="text-sm font-black uppercase leading-tight">
              {settings.name}
            </h1>
            <p className="text-[9.5px] text-gray-700 font-medium">
              {settings.address} &bull; कॉलेज कोड: <span className="font-mono font-bold">{settings.code || '31337'}</span>
            </p>
            <div className="mt-0.5 inline-block px-2 py-0.5 bg-black text-white text-[9px] font-bold rounded-xs tracking-wider uppercase">
              बोर्ड परीक्षा शुल्क रसीद (Academic Session {settings.academicYear})
            </div>
          </div>
          <div className="text-right text-[9px] font-mono border border-black p-1 rounded-xs">
            <span className="font-bold block uppercase bg-gray-200 px-1">{copyTitle}</span>
            <span className="font-bold">₹{paidAmount || totalAmount}/-</span>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-4 gap-1 text-[9.5px] border-b border-gray-300 pb-1 mb-1.5 bg-gray-50 p-1 rounded-xs font-mono font-sans">
        <div>
          <span className="text-gray-600 block text-[8px]">रसीद सं. (Receipt No):</span>
          <strong className="text-black font-bold text-[9.5px]">{receiptNo}</strong>
        </div>
        <div>
          <span className="text-gray-600 block text-[8px]">पंजीकरण सं. (Reg No):</span>
          <strong className="text-black font-bold text-[9.5px]">{student.registrationNo}</strong>
        </div>
        <div>
          <span className="text-gray-600 block text-[8px]">परीक्षा प्रकार:</span>
          <strong className="text-purple-900 font-bold text-[9.5px]">{student.examType || 'REGULAR'}</strong>
        </div>
        <div className="text-right">
          <span className="text-gray-600 block text-[8px]">दिनांक (Date):</span>
          <strong className="text-black text-[9.5px]">{paymentDate.split(',')[0]}</strong>
        </div>
      </div>

      {/* Student Details */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[9.5px] mb-1.5 leading-tight font-sans">
        <div className="flex justify-between border-b border-gray-200 pb-0.5">
          <span className="text-gray-600">परीक्षार्थी का नाम:</span>
          <strong className="font-bold text-black uppercase">{student.studentName}</strong>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-0.5">
          <span className="text-gray-600">संकाय / वर्ग:</span>
          <strong className="font-bold text-black bg-gray-100 px-1 rounded-xs">{student.classOrStream}</strong>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-0.5">
          <span className="text-gray-600">पिता का नाम:</span>
          <span className="font-semibold text-black uppercase">{student.fatherName}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-0.5">
          <span className="text-gray-600">माता का नाम:</span>
          <span className="font-semibold text-black uppercase">{student.motherName}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-0.5">
          <span className="text-gray-600">जाति कोटि:</span>
          <strong className="font-bold text-black">{student.casteCategory || 'General'}</strong>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-0.5">
          <span className="text-gray-600">जन्म तिथि:</span>
          <span className="font-mono text-black">{student.dob || '-'}</span>
        </div>
      </div>

      {/* Fee Table */}
      <table className="w-full text-[8.5px] border border-black mb-1.5 font-sans">
        <thead>
          <tr className="bg-gray-100 border-b border-black">
            <th className="p-1 text-left border-r border-black w-6">क्र.</th>
            <th className="p-1 text-left border-r border-black">मद का विवरण (Particulars)</th>
            <th className="p-1 text-right w-20">राशि (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-200">
            <td className="p-0.5 border-r border-black font-mono text-center">1</td>
            <td className="p-0.5 border-r border-black">
              वार्षिक बोर्ड परीक्षा एवं परीक्षा फॉर्म शुल्क ({student.casteCategory})
            </td>
            <td className="p-0.5 text-right font-mono font-bold">₹{(student.baseFee || 0).toLocaleString('en-IN')}.00</td>
          </tr>
          <tr className="border-b border-gray-300">
            <td className="p-0.5 border-r border-black font-mono text-center">2</td>
            <td className="p-0.5 border-r border-black">
              ऑनलाइन प्रोसेसिंग एवं पोर्टल संचालन शुल्क
            </td>
            <td className="p-0.5 text-right font-mono font-bold">₹{(onlineCharges || 30).toLocaleString('en-IN')}.00</td>
          </tr>
          <tr className="bg-gray-50 font-bold border-t border-black">
            <td colSpan={2} className="p-1 text-right border-r border-black">
              कुल प्राप्त राशि (Total Amount Received):
            </td>
            <td className="p-1 text-right font-mono text-[10px] text-emerald-950">₹{(paidAmount || totalAmount).toLocaleString('en-IN')}.00</td>
          </tr>
        </tbody>
      </table>

      {/* Words & Mode */}
      <div className="text-[8.5px] mb-1.5 p-1 bg-gray-50 border border-gray-300 rounded-xs flex items-center justify-between font-sans">
        <div>
          <span className="text-gray-600">शब्दों में: </span>
          <strong className="font-bold text-black uppercase">{amountInWords}</strong>
        </div>
        <div className="text-[8.5px] font-mono font-bold bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded-xs border border-emerald-300">
          माध्यम: {student.paymentMode || 'CASH'}
        </div>
      </div>

      {/* Signatures */}
      <div className="flex justify-between items-end pt-1 text-[9px] border-t border-gray-300 font-sans">
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
    <div className="fixed inset-0 z-50 bg-[#2D2A26]/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-[#FDFCF8] rounded-3xl shadow-2xl max-w-4xl w-full border border-[#E6E2D3] overflow-hidden my-auto print:shadow-none print:border-none print:rounded-none">
        
        {/* Modal Top Bar */}
        <div className="bg-[#4A453E] text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#5A5A40] text-[#E6E2D3] rounded-xl">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#FDFCF8]">मैट्रिक/इंटर बोर्ड परीक्षा शुल्क रसीद</h2>
              <p className="text-[11px] text-[#C2BEB5]">
                सत्र {settings.academicYear} &bull; {student.studentName} ({student.registrationNo})
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-1.5">
            {/* Layout Options */}
            <div className="bg-slate-900/80 p-1 rounded-xl flex items-center gap-1 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setPrintLayout('two-up')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition flex items-center gap-1 cursor-pointer ${
                  printLayout === 'two-up'
                    ? 'bg-[#5A5A40] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
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
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="1/4 साइज सिंगल स्लिप"
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>1/4 साइज (Single)</span>
              </button>

              <button
                type="button"
                onClick={() => setPrintLayout('quarter-4up')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition flex items-center gap-1 cursor-pointer ${
                  printLayout === 'quarter-4up'
                    ? 'bg-indigo-700 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="1 A4 पेज पर 4 रसीदें (4-Up Grid)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>1/4 साइज (4-Up)</span>
              </button>
            </div>

            <button
              onClick={() => onOpenWhatsApp(student)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2E5B50] hover:bg-[#254A41] text-white rounded-xl text-xs font-semibold shadow-xs transition border border-[#3B6E62] cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-xl text-xs font-black shadow-md transition border border-[#737356] cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>प्रिंट (Print)</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3E3A33] hover:bg-[#34302A] text-[#DDD8C5] rounded-xl text-xs font-semibold transition border border-[#5A554A] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'PDF...' : 'PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#C2BEB5] hover:text-white rounded-xl hover:bg-[#3E3A33] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Traditional Fee Receipt Content */}
        <div className="p-3 sm:p-4 bg-stone-100 max-h-[78vh] overflow-y-auto print:p-0 print:max-h-none print:bg-white flex justify-center" ref={receiptRef} id="printable-exam-receipt">
          
          {/* Option 1: 1/4 Size 4-Up Grid */}
          {printLayout === 'quarter-4up' && (
            <div className="quarter-grid-4up grid grid-cols-2 gap-2 bg-white p-1 w-full">
              {renderExamQuarterSlip('कार्यालय प्रति (OFFICE COPY)', 0)}
              {renderExamQuarterSlip('छात्र प्रति (STUDENT COPY)', 1)}
              {renderExamQuarterSlip('कार्यालय प्रति-2 (RECORD COPY)', 2)}
              {renderExamQuarterSlip('छात्र प्रति-2 (STUDENT COPY)', 3)}
            </div>
          )}

          {/* Option 2: 1/4 Size Single Slip */}
          {printLayout === 'quarter-single' && (
            <div className="w-full max-w-[105mm] p-2">
              {renderExamQuarterSlip('छात्र / छात्रा प्रति (STUDENT COPY)')}
            </div>
          )}

          {/* Option 3: Default 2-Up (1-Page A4 Guarantee: Office + Student Copy) */}
          {printLayout === 'two-up' && (
            <div className="receipt-container-a4 space-y-2 w-full max-w-[210mm]">
              {renderExamCalibratedSlip('महाविद्यालय / संस्थान प्रति (Office Copy)')}
              
              <div className="my-1 border-b border-dashed border-gray-400 relative text-center">
                <span className="bg-stone-100 px-2 text-[9px] text-gray-500 font-mono -top-2 relative">
                  ✂ यहाँ से काटें (Tear Here) ✂
                </span>
              </div>

              {renderExamCalibratedSlip('छात्र / छात्रा प्रति (Student Copy)', true)}
            </div>
          )}

          {/* Option 4: Single Half Sheet */}
          {printLayout === 'single' && (
            <div className="w-full max-w-[210mm] p-2">
              {renderExamCalibratedSlip('छात्र / छात्रा प्रति (Student Copy)')}
            </div>
          )}
        </div>

        {/* Modal Bottom Quick Action Bar */}
        <div className="bg-[#EFECE1] px-5 py-2.5 border-t border-[#E6E2D3] flex flex-wrap items-center justify-between gap-2 text-xs print:hidden">
          <div className="text-[#4A453E] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#2E5B50] shrink-0" />
            <span className="text-[11px] sm:text-xs">
              {printLayout === 'two-up' && 'A4 1-पेज कैलिब्रेटेड: दोनों प्रतियां ठीक 1 पेज पर फिट होंगी (1/2 नहीं होगा)।'}
              {printLayout === 'quarter-single' && '1/4 साइज: सिंगल कॉम्पैक्ट स्लिप प्रिंट होगी।'}
              {printLayout === 'quarter-4up' && '1/4 4-Up: 1 A4 पेपर पर 4 रसीदें प्रिंट होंगी।'}
            </span>
          </div>

          <button
            onClick={handlePrint}
            className="px-3 py-1 bg-[#5A5A40] text-white rounded-lg font-bold text-xs hover:bg-[#484833] transition flex items-center gap-1 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>A4 पर प्रिंट करें</span>
          </button>
        </div>

      </div>
    </div>
  );
};
