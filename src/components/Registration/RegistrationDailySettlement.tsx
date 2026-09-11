import React, { useState, useMemo, useRef } from 'react';
import { 
  Printer, 
  Calendar, 
  IndianRupee, 
  Wallet, 
  Building2, 
  QrCode, 
  CheckCircle2, 
  Clock, 
  Receipt,
  FileCheck,
  Send,
  AlertCircle
} from 'lucide-react';
import { RegistrationStudent, InstituteSettings, isBSEBBoard } from '../../types';
import { printIsolatedElement, fallbackDirectPrint } from '../../utils/printHelper';
import { numberToWordsInINR } from '../../services/storageService';

interface RegistrationDailySettlementProps {
  students: RegistrationStudent[];
  settings: InstituteSettings;
}

export const RegistrationDailySettlement: React.FC<RegistrationDailySettlementProps> = ({
  students,
  settings,
}) => {
  // Normalize current date in DD/MM/YYYY or YYYY-MM-DD
  const todayDateStr = useMemo(() => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(todayDateStr);
  const [viewAllDates, setViewAllDates] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Filter students who paid on this date
  const dayPaidStudents = useMemo(() => {
    return students.filter(s => {
      if (s.paymentStatus !== 'PAID') return false;
      if (viewAllDates) return true;
      const pDate = s.paymentDate || '';
      return pDate.includes(selectedDate) || selectedDate.includes(pDate);
    });
  }, [students, selectedDate, viewAllDates]);

  // Financial Breakdown
  const totalAmount = dayPaidStudents.reduce((acc, s) => {
    const fee = s.paidAmount || (isBSEBBoard(s.boardName || s.matricBoard) ? 515 : 715);
    return acc + fee;
  }, 0);

  const cashTxns = dayPaidStudents.filter(s => (s.paymentMode || 'CASH') === 'CASH');
  const cashTotal = cashTxns.reduce((acc, s) => acc + (s.paidAmount || (isBSEBBoard(s.boardName || s.matricBoard) ? 515 : 715)), 0);

  const upiTxns = dayPaidStudents.filter(s => s.paymentMode === 'UPI' || s.paymentMode === 'QR_CODE');
  const upiTotal = upiTxns.reduce((acc, s) => acc + (s.paidAmount || (isBSEBBoard(s.boardName || s.matricBoard) ? 515 : 715)), 0);

  const bankTxns = dayPaidStudents.filter(s => s.paymentMode === 'BANK_TRANSFER' || s.paymentMode === 'CHALLAN' || s.paymentMode === 'NEFT_RTGS');
  const bankTotal = bankTxns.reduce((acc, s) => acc + (s.paidAmount || (isBSEBBoard(s.boardName || s.matricBoard) ? 515 : 715)), 0);

  const handlePrint = () => {
    if (printAreaRef.current) {
      printIsolatedElement(printAreaRef.current, {
        documentTitle: `11th_पंजीयन_दैनिक_रोकड़_पर्ची_${selectedDate.replace(/\//g, '-')}`,
        landscape: false,
        pageMargin: '6mm 8mm 6mm 8mm'
      });
    } else {
      fallbackDirectPrint();
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Control Header */}
      <div className="bg-white/80 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-teal-700" />
            <span>11वीं सूचीकरण दैनिक रोकड़ पर्ची (Day-Book & Closing Sheet)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            प्रतिदिन काउंटर पर प्राप्त 11वीं पंजीयन शुल्क (₹515 / ₹715) का ऑडिट व मिलान
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Date Selector */}
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-2xl border border-slate-200 text-xs">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="font-bold text-slate-700">दिनांक:</span>
            <input
              type="text"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setViewAllDates(false);
              }}
              placeholder="DD/MM/YYYY"
              className="w-24 bg-white px-2 py-0.5 rounded border border-slate-300 text-xs font-mono font-bold text-center"
            />
          </div>

          <button
            onClick={() => setViewAllDates(!viewAllDates)}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition cursor-pointer border ${
              viewAllDates 
                ? 'bg-teal-700 text-white border-teal-800' 
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {viewAllDates ? '✓ सभी तिथियां दिख रही हैं' : 'सभी तिथियां देखें'}
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4 text-teal-300" />
            <span>दैनिक पर्ची प्रिंट करें (A4)</span>
          </button>
        </div>
      </div>

      {/* 2. Printable Settlement Area */}
      <div 
        ref={printAreaRef}
        className="bg-[#FAF9F5] p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md max-w-4xl mx-auto space-y-6 text-slate-800 font-sans"
      >
        {/* Institutional Header */}
        <div className="text-center border-b-2 border-teal-900 pb-3 space-y-1">
          <h2 className="text-xl font-black text-teal-950 uppercase tracking-tight">{settings.name}</h2>
          <p className="text-xs text-slate-600">{settings.subTitle || 'इंटरमीडिएट संभाग (कला, विज्ञान, वाणिज्य)'}</p>
          <div className="text-xs text-slate-700 flex items-center justify-center gap-4 pt-1 font-medium">
            <span>संस्थान कोड: <strong>{settings.code}</strong></span>
            <span>•</span>
            <span>सत्र: <strong>2026-2028 (11वीं सूचीकरण)</strong></span>
            <span>•</span>
            <span>ऑडिट तिथि: <strong>{viewAllDates ? 'समस्त तिथियां (All)' : selectedDate}</strong></span>
          </div>
          <div className="inline-block mt-2 px-4 py-1 bg-teal-800 text-white rounded-md text-xs font-black uppercase tracking-wider">
            दैनिक रोकड़ पर्ची एवं क्लोजिंग लेज़र (11th Registration Day-Book)
          </div>
        </div>

        {/* Summary Grid */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-white rounded-xl border border-slate-300">
            <div className="text-slate-500 font-bold">1. नकद काउंटर प्राप्ति (Cash in Hand)</div>
            <div className="text-lg font-black text-emerald-800 font-mono mt-1">₹{cashTotal.toLocaleString('en-IN')}</div>
            <div className="text-[10px] text-slate-500">{cashTxns.length} छात्रों से प्राप्त</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-300">
            <div className="text-slate-500 font-bold">2. ऑनलाइन / UPI / QR प्राप्ति</div>
            <div className="text-lg font-black text-blue-800 font-mono mt-1">₹{upiTotal.toLocaleString('en-IN')}</div>
            <div className="text-[10px] text-slate-500">{upiTxns.length} छात्रों से प्राप्त</div>
          </div>
          <div className="p-3 bg-teal-50 rounded-xl border border-teal-300">
            <div className="text-teal-900 font-bold">कुल संकलित रोकड़ (Total Realized)</div>
            <div className="text-xl font-black text-teal-950 font-mono mt-1">₹{totalAmount.toLocaleString('en-IN')}</div>
            <div className="text-[10px] text-teal-700 font-bold">{dayPaidStudents.length} छात्रों का कुल योग</div>
          </div>
        </div>

        {/* Detailed Transactions List */}
        <div>
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
            दैनिक प्राप्ति विवरण तालिका ({dayPaidStudents.length} छात्र):
          </h4>
          <table className="w-full border-collapse text-[10.5px] border border-slate-400">
            <thead>
              <tr className="bg-slate-200 text-slate-800 font-bold">
                <th className="border border-slate-400 p-1.5 text-center w-8">क्र.</th>
                <th className="border border-slate-400 p-1.5 text-left">फॉर्म नं / OFSS</th>
                <th className="border border-slate-400 p-1.5 text-left">छात्र का नाम (Student)</th>
                <th className="border border-slate-400 p-1.5 text-center">संकाय</th>
                <th className="border border-slate-400 p-1.5 text-center">बोर्ड दर</th>
                <th className="border border-slate-400 p-1.5 text-right">राशि (₹)</th>
                <th className="border border-slate-400 p-1.5 text-center">माध्यम</th>
                <th className="border border-slate-400 p-1.5 text-center">समय / UTR</th>
              </tr>
            </thead>
            <tbody>
              {dayPaidStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500">
                    इस तिथि ({selectedDate}) को कोई 11वीं शुल्क प्राप्ति दर्ज नहीं है।
                  </td>
                </tr>
              ) : (
                dayPaidStudents.map((s, idx) => {
                  const fee = s.paidAmount || (isBSEBBoard(s.boardName || s.matricBoard) ? 515 : 715);
                  const isBseb = isBSEBBoard(s.boardName || s.matricBoard) || fee === 515;
                  return (
                    <tr key={s.id} className="border-b border-slate-300">
                      <td className="border border-slate-400 p-1.5 text-center font-bold">{idx + 1}</td>
                      <td className="border border-slate-400 p-1.5 font-mono">{s.formNo || s.ofssReferenceNo || '—'}</td>
                      <td className="border border-slate-400 p-1.5 font-bold">{s.studentName}</td>
                      <td className="border border-slate-400 p-1.5 text-center">{s.stream}</td>
                      <td className="border border-slate-400 p-1.5 text-center">{isBseb ? 'BSEB (₹515)' : 'Other (₹715)'}</td>
                      <td className="border border-slate-400 p-1.5 text-right font-bold font-mono">₹{fee}</td>
                      <td className="border border-slate-400 p-1.5 text-center font-bold">{s.paymentMode || 'CASH'}</td>
                      <td className="border border-slate-400 p-1.5 text-center font-mono">{s.utrNumber || s.paymentDate || '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {dayPaidStudents.length > 0 && (
              <tfoot>
                <tr className="bg-slate-100 font-bold">
                  <td colSpan={5} className="border border-slate-400 p-2 text-right">कुल योग (Grand Total):</td>
                  <td className="border border-slate-400 p-2 text-right font-mono font-black text-xs text-teal-900">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td colSpan={2} className="border border-slate-400 p-2"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Closing Certification & Signatures */}
        <div className="pt-4 border-t border-slate-300">
          <div className="text-[11px] text-slate-700 bg-white p-3 rounded-xl border border-slate-300">
            <strong>प्रमाणीकरण:</strong> प्रमाणित किया जाता है कि आज दिनांक <strong>{selectedDate}</strong> को 11वीं सूचीकरण मद में कुल <strong>₹{totalAmount.toLocaleString('en-IN')} ({numberToWordsInINR(totalAmount)})</strong> की राशि प्राप्त हुई जिसका भौतिक नकद व बैंक खातों से मिलान कर लिया गया है।
          </div>

          <div className="flex items-center justify-between mt-12 pt-4 text-xs font-bold text-slate-800">
            <div className="text-center">
              <div className="w-36 border-b border-slate-800 mb-1"></div>
              <span>काउंटर रोकड़िया (Cashier)</span>
            </div>
            <div className="text-center">
              <div className="w-36 border-b border-slate-800 mb-1"></div>
              <span>लेखापाल (Accountant)</span>
            </div>
            <div className="text-center">
              <div className="w-36 border-b border-slate-800 mb-1"></div>
              <span>प्राचार्य / विभागाध्यक्ष मुहर</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
