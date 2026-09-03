import React from 'react';
import { 
  X, 
  Printer, 
  Building2, 
  CheckCircle2, 
  IndianRupee, 
  Receipt, 
  QrCode, 
  Banknote,
  FileCheck,
  Calendar
} from 'lucide-react';
import { Transaction, InstituteSettings } from '../types';

interface DailySettlementModalProps {
  isOpen: boolean;
  transactions: Transaction[];
  settings: InstituteSettings;
  selectedDate?: string;
  onClose: () => void;
}

export const DailySettlementModal: React.FC<DailySettlementModalProps> = ({
  isOpen,
  transactions,
  settings,
  selectedDate,
  onClose,
}) => {
  if (!isOpen) return null;

  const displayDate = selectedDate || new Date().toISOString().slice(0, 10);

  // Filter transactions for this date
  const dayTxns = transactions.filter((t) => {
    if (!t.paymentDate) return false;
    return t.paymentDate.startsWith(displayDate);
  });

  const totalCollected = dayTxns.reduce((acc, t) => acc + t.paidAmount, 0);
  const totalBaseFee = dayTxns.reduce((acc, t) => acc + t.baseFee, 0);
  const totalOnlineCharges = dayTxns.reduce((acc, t) => acc + (t.onlineCharges || settings.defaultOnlineCharge || 30), 0);

  const cashTxns = dayTxns.filter((t) => t.paymentMode === 'CASH');
  const cashTotal = cashTxns.reduce((acc, t) => acc + t.paidAmount, 0);

  const upiTxns = dayTxns.filter((t) => t.paymentMode === 'UPI' || t.paymentMode === 'QR_CODE');
  const upiTotal = upiTxns.reduce((acc, t) => acc + t.paidAmount, 0);

  const bankTxns = dayTxns.filter((t) => t.paymentMode !== 'CASH' && t.paymentMode !== 'UPI' && t.paymentMode !== 'QR_CODE');
  const bankTotal = bankTxns.reduce((acc, t) => acc + t.paidAmount, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      
      {/* Container */}
      <div className="bg-[#FDFCF8] rounded-3xl shadow-2xl max-w-4xl w-full border border-[#E6E2D3] flex flex-col max-h-[95vh] overflow-hidden my-auto print:max-h-none print:border-none print:shadow-none print:rounded-none print:w-full">
        
        {/* Modal Header (Hidden on Print) */}
        <div className="bg-[#2D2A26] text-white px-5 py-3.5 flex items-center justify-between gap-3 border-b border-[#3E3A33] shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#2E5B50] text-white rounded-xl">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">
                दैनिक रोकड़ पर्ची एवं क्लोजिंग ऑडिट (Daily Cashier Settlement Sheet)
              </h2>
              <p className="text-xs text-slate-300">
                Official closing audit report for cashier and principal signature
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#2E5B50] hover:bg-[#254A41] text-white text-xs font-bold rounded-xl shadow-lg transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Sheet (प्रिंट करें)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#FAF9F5] print:p-0 print:bg-white print:overflow-visible text-[#2D2A26] space-y-5">
          
          {/* Institution Header */}
          <div className="text-center border-b-2 border-slate-900 pb-3 space-y-1">
            <h1 className="text-xl font-black uppercase tracking-wide">{settings.name}</h1>
            {settings.subTitle && <p className="text-xs font-semibold text-slate-600">{settings.subTitle}</p>}
            <p className="text-[11px] text-slate-600">{settings.address} - College Code: <strong>{settings.code}</strong></p>
            <div className="pt-2">
              <span className="inline-block bg-slate-900 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider print:bg-black">
                दैनिक रोकड़ समाधान एवं शुल्क संग्रह विवरण (DAILY CASH & REVENUE CLOSING SHEET)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold pt-2 px-2 border-t border-dashed border-slate-300">
              <span>क्लोजिंग दिनांक (Date): <strong>{displayDate}</strong></span>
              <span>सत्र (Session): <strong>{settings.academicYear}</strong></span>
              <span>कुल जारी रसीदें: <strong>{dayTxns.length}</strong></span>
            </div>
          </div>

          {/* Revenue Breakdown Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="border border-slate-800 p-3 rounded-xl bg-slate-50 print:bg-white">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>काउंटर कैश (Cash in Hand)</span>
                <Banknote className="w-4 h-4 text-amber-700 print:hidden" />
              </div>
              <p className="text-xl font-black font-mono text-slate-900 pt-1">
                ₹{cashTotal.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">{cashTxns.length} रसीदें (Counter Cash)</p>
            </div>

            <div className="border border-slate-800 p-3 rounded-xl bg-slate-50 print:bg-white">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>ऑनलाइन UPI / QR (Bank Credit)</span>
                <QrCode className="w-4 h-4 text-teal-700 print:hidden" />
              </div>
              <p className="text-xl font-black font-mono text-slate-900 pt-1">
                ₹{upiTotal.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">{upiTxns.length} रसीदें (Direct College A/C)</p>
            </div>

            <div className="border-2 border-slate-900 p-3 rounded-xl bg-slate-100 print:bg-white">
              <div className="flex items-center justify-between text-xs font-black text-slate-900">
                <span>दैनिक कुल संग्रह (Total Collection)</span>
                <IndianRupee className="w-4 h-4 print:hidden" />
              </div>
              <p className="text-xl font-black font-mono text-emerald-900 print:text-black pt-1">
                ₹{totalCollected.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-slate-600 font-bold">{dayTxns.length} कुल ट्रांजेक्शन</p>
            </div>
          </div>

          {/* Fee Heads Breakdown */}
          <div className="border border-slate-800 p-3 rounded-xl space-y-2 bg-white text-xs">
            <h4 className="font-bold text-slate-800 uppercase text-[11px] border-b border-slate-200 pb-1">
              मद-वार शुल्क वर्गीकरण (Fee Head Allocation)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] text-slate-500 block">1. मुख्य बोर्ड परीक्षा शुल्क (Base Exam Fee):</span>
                <strong className="font-mono text-sm">₹{totalBaseFee.toLocaleString('en-IN')}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">2. ऑनलाइन पोर्टल शुल्क (+₹30 प्रति छात्र):</span>
                <strong className="font-mono text-sm">₹{totalOnlineCharges.toLocaleString('en-IN')}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">3. अन्य बैंक / कार्ड ट्रांजेक्शन:</span>
                <strong className="font-mono text-sm">₹{bankTotal.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-800 text-xs uppercase">
              दैनिक लेन-देन सूची (Day's Receipt Ledger)
            </h4>
            <table className="w-full border-collapse text-[11px] border border-slate-800">
              <thead>
                <tr className="bg-slate-100 font-bold border-b border-slate-800 text-slate-800">
                  <th className="p-1 border border-slate-800 text-center w-8">क्र.</th>
                  <th className="p-1 border border-slate-800">रसीद सं.</th>
                  <th className="p-1 border border-slate-800">छात्र का नाम</th>
                  <th className="p-1 border border-slate-800">पंजीकरण संख्या</th>
                  <th className="p-1 border border-slate-800">कक्षा / संकाय</th>
                  <th className="p-1 border border-slate-800 text-center">माध्यम</th>
                  <th className="p-1 border border-slate-800 text-right">जमा राशि</th>
                  <th className="p-1 border border-slate-800">UTR / Ref No.</th>
                </tr>
              </thead>
              <tbody>
                {dayTxns.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-4 text-center text-slate-500 italic">
                      इस तारीख ({displayDate}) को कोई लेन-देन दर्ज नहीं किया गया।
                    </td>
                  </tr>
                ) : (
                  dayTxns.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="p-1 border border-slate-800 text-center font-mono">{idx + 1}</td>
                      <td className="p-1 border border-slate-800 font-mono font-bold">{t.receiptNo}</td>
                      <td className="p-1 border border-slate-800 font-semibold">{t.studentName}</td>
                      <td className="p-1 border border-slate-800 font-mono text-[10px]">{t.registrationNo}</td>
                      <td className="p-1 border border-slate-800">{t.classOrStream}</td>
                      <td className="p-1 border border-slate-800 text-center font-bold">
                        {t.paymentMode}
                      </td>
                      <td className="p-1 border border-slate-800 text-right font-mono font-bold">
                        ₹{t.paidAmount}
                      </td>
                      <td className="p-1 border border-slate-800 font-mono text-[10px] text-slate-600">
                        {t.transactionRef || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {dayTxns.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-200 font-bold border-t-2 border-slate-900">
                    <td colSpan={6} className="p-1.5 border border-slate-800 text-right uppercase">
                      कुल योग (Grand Total):
                    </td>
                    <td className="p-1.5 border border-slate-800 text-right font-mono font-black text-xs">
                      ₹{totalCollected.toLocaleString('en-IN')}
                    </td>
                    <td className="p-1.5 border border-slate-800 text-center font-mono text-[10px]">
                      {dayTxns.length} Slips
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Cashier Declaration & Signatures */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-300 text-xs space-y-2 print:bg-white">
            <p className="text-[11px] text-slate-700 italic">
              "प्रमाणित किया जाता है कि उपरोक्त विवरण के अनुसार आज कुल <strong>{dayTxns.length}</strong> छात्रों से कुल <strong>₹{totalCollected.toLocaleString('en-IN')}</strong> (नकद: ₹{cashTotal.toLocaleString('en-IN')}, यूपीआई: ₹{upiTotal.toLocaleString('en-IN')}) परीक्षा शुल्क के रूप में प्राप्त कर रोकड़ बही में प्रविष्टि कर ली गई है।"
            </p>
          </div>

          <div className="pt-10 grid grid-cols-2 gap-12 text-center text-xs font-bold">
            <div className="border-t-2 border-slate-900 pt-2">
              <p>काउंटर लिपिक / रोकड़पाल (Cashier Signature)</p>
              <p className="text-[10px] text-slate-500">नाम एवं मोहर</p>
            </div>
            <div className="border-t-2 border-slate-900 pt-2">
              <p>प्रधानाध्यापक / प्राचार्य (Principal / Headmaster Signature)</p>
              <p className="text-[10px] text-slate-500">संस्थान की आधिकारिक मोहर</p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-[#F7F5EE] px-6 py-3 border-t border-[#E6E2D3] flex items-center justify-between text-xs text-[#787267] print:hidden shrink-0">
          <div>
            Date: <strong>{displayDate}</strong> | Receipts: <strong>{dayTxns.length}</strong> | Total: <strong className="text-[#2E5B50]">₹{totalCollected.toLocaleString('en-IN')}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#EFECE1] hover:bg-[#E6E2D3] text-[#4A453E] rounded-xl font-bold transition border border-[#DDD8C5]"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-5 py-2 bg-[#2E5B50] hover:bg-[#254A41] text-white rounded-xl font-bold shadow transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Settlement Sheet</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
