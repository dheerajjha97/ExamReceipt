import React, { useState, useMemo } from 'react';
import { 
  X, 
  Printer, 
  Building2, 
  CheckCircle2, 
  Receipt, 
  QrCode, 
  Banknote,
  FileCheck,
  Calendar,
  Layers,
  ChevronRight,
  Clock
} from 'lucide-react';
import { Transaction, InstituteSettings } from '../types';

interface DailySettlementModalProps {
  isOpen: boolean;
  transactions: Transaction[];
  settings: InstituteSettings;
  selectedDate?: string;
  onClose: () => void;
}

/**
 * Robust date normalizer: converts any DD/MM/YYYY, YYYY-MM-DD, ISO, or timestamp to YYYY-MM-DD
 */
export function normalizeDateToYYYYMMDD(dateStr?: string): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();

  // 1. Check DD/MM/YYYY or DD-MM-YYYY (e.g., 03/09/2026, 25-08-2026)
  const ddmmyyyy = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (ddmmyyyy) {
    const day = ddmmyyyy[1].padStart(2, '0');
    const month = ddmmyyyy[2].padStart(2, '0');
    const year = ddmmyyyy[3];
    return `${year}-${month}-${day}`;
  }

  // 2. Check YYYY-MM-DD or YYYY/MM/DD
  const yyyymmdd = trimmed.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (yyyymmdd) {
    const year = yyyymmdd[1];
    const month = yyyymmdd[2].padStart(2, '0');
    const day = yyyymmdd[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 3. Try parsing with standard Date
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return trimmed.slice(0, 10);
}

export const DailySettlementModal: React.FC<DailySettlementModalProps> = ({
  isOpen,
  transactions,
  settings,
  selectedDate: initialSelectedDate,
  onClose,
}) => {
  if (!isOpen) return null;

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Compute all unique dates available in transactions with counts
  const availableDates = useMemo(() => {
    const map = new Map<string, number>();
    transactions.forEach((t) => {
      const d = normalizeDateToYYYYMMDD(t.paymentDate || t.createdAt);
      if (d) {
        map.set(d, (map.get(d) || 0) + 1);
      }
    });
    return Array.from(map.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions]);

  // Determine initial date: selectedDate > today (if has txns) > most recent date > today
  const defaultDate = useMemo(() => {
    if (initialSelectedDate) {
      return normalizeDateToYYYYMMDD(initialSelectedDate);
    }
    const todayHasTxns = availableDates.some((d) => d.date === todayStr);
    if (todayHasTxns) return todayStr;
    if (availableDates.length > 0) return availableDates[0].date;
    return todayStr;
  }, [initialSelectedDate, availableDates, todayStr]);

  const [currentDate, setCurrentDate] = useState<string>(defaultDate);
  const [viewAllDates, setViewAllDates] = useState<boolean>(false);

  // Filter transactions
  const dayTxns = useMemo(() => {
    if (viewAllDates) {
      return transactions;
    }
    return transactions.filter((t) => {
      const d = normalizeDateToYYYYMMDD(t.paymentDate || t.createdAt);
      return d === currentDate;
    });
  }, [transactions, currentDate, viewAllDates]);

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

  const displayDateLabel = viewAllDates 
    ? 'समस्त दर्ज तिथियाँ (All Recorded Dates)' 
    : currentDate;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      
      {/* Container */}
      <div className="bg-[#FDFCF8] rounded-3xl shadow-2xl max-w-4xl w-full border border-[#E6E2D3] flex flex-col max-h-[95vh] overflow-hidden my-auto print:max-h-none print:border-none print:shadow-none print:rounded-none print:w-full printable-settlement">
        
        {/* Modal Header (Hidden on Print) */}
        <div className="bg-[#2D2A26] text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-[#3E3A33] shrink-0 no-print">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#2E5B50] text-white rounded-xl">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>दैनिक रोकड़ पर्ची एवं क्लोजिंग ऑडिट (Day Book / Cashier Settlement)</span>
                <span className="bg-[#2E5B50] text-white text-[10px] font-mono px-2 py-0.5 rounded-full">
                  {dayTxns.length} Rec.
                </span>
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

        {/* Interactive Date Filter Bar (Hidden on Print) */}
        <div className="bg-[#EFECE1] px-5 py-3 border-b border-[#DDD8C5] flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-[#4A453E] flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#2E5B50]" />
              <span>दिनांक चुनें (Select Date):</span>
            </span>

            <input
              type="date"
              value={currentDate}
              onChange={(e) => {
                if (e.target.value) {
                  setCurrentDate(e.target.value);
                  setViewAllDates(false);
                }
              }}
              className="px-3 py-1.5 bg-white border border-[#DDD8C5] rounded-xl text-xs font-mono font-bold text-[#2D2A26] focus:outline-hidden focus:ring-2 focus:ring-[#2E5B50]"
            />

            {/* Quick Filter Buttons */}
            <button
              type="button"
              onClick={() => {
                setCurrentDate(todayStr);
                setViewAllDates(false);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                !viewAllDates && currentDate === todayStr
                  ? 'bg-[#2E5B50] text-white'
                  : 'bg-white text-[#4A453E] hover:bg-[#E2DDD0] border border-[#DDD8C5]'
              }`}
            >
              आज (Today)
            </button>

            {availableDates.length > 0 && availableDates[0].date !== todayStr && (
              <button
                type="button"
                onClick={() => {
                  setCurrentDate(availableDates[0].date);
                  setViewAllDates(false);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  !viewAllDates && currentDate === availableDates[0].date
                    ? 'bg-[#5A5A40] text-white'
                    : 'bg-white text-[#4A453E] hover:bg-[#E2DDD0] border border-[#DDD8C5]'
                }`}
                title={`Jump to latest date with records (${availableDates[0].date})`}
              >
                हालिया सक्रिय ({availableDates[0].date})
              </button>
            )}

            <button
              type="button"
              onClick={() => setViewAllDates(true)}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 ${
                viewAllDates
                  ? 'bg-[#2D2A26] text-white'
                  : 'bg-white text-[#4A453E] hover:bg-[#E2DDD0] border border-[#DDD8C5]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>समस्त लेन-देन ({transactions.length})</span>
            </button>
          </div>

          {/* Quick Date Dropdown */}
          {availableDates.length > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-[#787267]">
              <span>उपलब्ध तिथियाँ:</span>
              <select
                value={viewAllDates ? 'ALL' : currentDate}
                onChange={(e) => {
                  if (e.target.value === 'ALL') {
                    setViewAllDates(true);
                  } else {
                    setCurrentDate(e.target.value);
                    setViewAllDates(false);
                  }
                }}
                className="bg-white border border-[#DDD8C5] rounded-lg px-2 py-1 font-mono font-medium text-[#2D2A26]"
              >
                {availableDates.map((item) => (
                  <option key={item.date} value={item.date}>
                    {item.date} ({item.count} रसीदें)
                  </option>
                ))}
                <option value="ALL">समस्त तिथियाँ ({transactions.length} कुल)</option>
              </select>
            </div>
          )}
        </div>

        {/* Printable Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#FAF9F5] print:p-0 print:bg-white print:overflow-visible text-[#2D2A26] space-y-5">
          
          {/* Formal Institutional Header Template */}
          <div className="text-center border-b-2 border-slate-900 pb-3 space-y-1">
            <div className="flex items-center justify-center gap-2">
              <Building2 className="w-6 h-6 text-[#2E5B50] print:hidden" />
              <h1 className="text-xl font-black uppercase tracking-wide text-slate-900">
                {settings.name}
              </h1>
            </div>
            {settings.subTitle && (
              <p className="text-xs font-semibold text-slate-600">{settings.subTitle}</p>
            )}
            <p className="text-[11px] text-slate-600">
              {settings.address} {settings.code && `| College Code: ${settings.code}`}
            </p>
            <div className="pt-2">
              <span className="inline-block bg-slate-900 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider print:bg-black">
                दैनिक रोकड़ समाधान एवं शुल्क संग्रह विवरण (DAILY CASH & REVENUE CLOSING SHEET)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold pt-2 px-2 border-t border-dashed border-slate-300">
              <span>क्लोजिंग दिनांक (Date): <strong className="font-mono">{displayDateLabel}</strong></span>
              <span>सत्र (Session): <strong>{settings.academicYear}</strong></span>
              <span>कुल रसीदें: <strong className="font-mono">{dayTxns.length}</strong></span>
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
                Rs. {cashTotal.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">{cashTxns.length} रसीदें (Counter Cash)</p>
            </div>

            <div className="border border-slate-800 p-3 rounded-xl bg-slate-50 print:bg-white">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>ऑनलाइन UPI / QR (Bank Credit)</span>
                <QrCode className="w-4 h-4 text-teal-700 print:hidden" />
              </div>
              <p className="text-xl font-black font-mono text-slate-900 pt-1">
                Rs. {upiTotal.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">{upiTxns.length} रसीदें (Direct College A/C)</p>
            </div>

            <div className="border-2 border-slate-900 p-3 rounded-xl bg-slate-100 print:bg-white">
              <div className="flex items-center justify-between text-xs font-black text-slate-900">
                <span>दैनिक कुल संग्रह (Total Collection)</span>
                <CheckCircle2 className="w-4 h-4 text-[#2E5B50] print:hidden" />
              </div>
              <p className="text-xl font-black font-mono text-emerald-900 print:text-black pt-1">
                Rs. {totalCollected.toLocaleString('en-IN')}
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
                <strong className="font-mono text-sm">Rs. {totalBaseFee.toLocaleString('en-IN')}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">2. ऑनलाइन पोर्टल शुल्क (+Rs. 30 प्रति छात्र):</span>
                <strong className="font-mono text-sm">Rs. {totalOnlineCharges.toLocaleString('en-IN')}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">3. अन्य बैंक / कार्ड ट्रांजेक्शन:</span>
                <strong className="font-mono text-sm">Rs. {bankTotal.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-xs uppercase">
                दैनिक लेन-देन सूची (Day's Receipt Ledger)
              </h4>
              <span className="text-[11px] font-mono text-slate-600">
                Total Records: {dayTxns.length}
              </span>
            </div>

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
                  <th className="p-1 border border-slate-800">दिनांक / समय</th>
                </tr>
              </thead>
              <tbody>
                {dayTxns.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center bg-slate-50">
                      <div className="max-w-md mx-auto space-y-3">
                        <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                        <div>
                          <p className="font-bold text-slate-700 text-sm">
                            चयनित तिथि ({currentDate}) को कोई लेन-देन दर्ज नहीं मिला।
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            (No transactions logged for this date. Total recorded in system: {transactions.length})
                          </p>
                        </div>
                        {availableDates.length > 0 && (
                          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 no-print">
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentDate(availableDates[0].date);
                                setViewAllDates(false);
                              }}
                              className="px-3 py-1.5 bg-[#2E5B50] text-white rounded-xl text-xs font-bold hover:bg-[#254A41] transition shadow-xs"
                            >
                              सक्रिय तिथि ({availableDates[0].date}) खोलें
                            </button>
                            <button
                              type="button"
                              onClick={() => setViewAllDates(true)}
                              className="px-3 py-1.5 bg-[#5A5A40] text-white rounded-xl text-xs font-bold hover:bg-[#484833] transition shadow-xs"
                            >
                              समस्त {transactions.length} लेन-देन देखें
                            </button>
                          </div>
                        )}
                      </div>
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
                        Rs. {t.paidAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-1 border border-slate-800 font-mono text-[10px] text-slate-600">
                        {t.paymentDate || t.createdAt || '-'}
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
                      Rs. {totalCollected.toLocaleString('en-IN')}
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
              "प्रमाणित किया जाता है कि उपरोक्त विवरण के अनुसार कुल <strong>{dayTxns.length}</strong> छात्रों से कुल <strong>Rs. {totalCollected.toLocaleString('en-IN')}</strong> (नकद: Rs. {cashTotal.toLocaleString('en-IN')}, यूपीआई/ऑनलाइन: Rs. {upiTotal.toLocaleString('en-IN')}) परीक्षा शुल्क के रूप में प्राप्त कर रोकड़ बही (Day Book) में प्रविष्टि कर ली गई है।"
            </p>
          </div>

          {/* Institutional Signature Template */}
          <div className="pt-10 grid grid-cols-3 gap-6 text-center text-xs font-bold institutional-signature-block">
            <div className="border-t-2 border-slate-900 pt-2">
              <p>काउंटर लिपिक / रोकड़पाल</p>
              <p className="text-[10px] text-slate-500">(Cashier Signature)</p>
            </div>
            <div className="border-t-2 border-slate-900 pt-2">
              <p>लेखापाल / परीक्षा प्रभारी</p>
              <p className="text-[10px] text-slate-500">(Accountant / Exam In-charge)</p>
            </div>
            <div className="border-t-2 border-slate-900 pt-2">
              <p>प्रधानाध्यापक / प्राचार्य</p>
              <p className="text-[10px] text-slate-500">(Principal / Official Seal)</p>
            </div>
          </div>

        </div>

        {/* Footer (Hidden on Print) */}
        <div className="bg-[#F7F5EE] px-6 py-3 border-t border-[#E6E2D3] flex flex-wrap items-center justify-between gap-3 text-xs text-[#787267] no-print shrink-0">
          <div>
            Date: <strong>{displayDateLabel}</strong> | Receipts: <strong>{dayTxns.length}</strong> | Total: <strong className="text-[#2E5B50]">Rs. {totalCollected.toLocaleString('en-IN')}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#EFECE1] hover:bg-[#E6E2D3] text-[#4A453E] rounded-xl font-bold transition border border-[#DDD8C5]"
            >
              Close (बंद करें)
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

