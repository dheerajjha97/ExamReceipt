import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  FileText, 
  CheckCircle2, 
  Building2, 
  Users, 
  Receipt,
  Download,
  Layers
} from 'lucide-react';
import { Student, InstituteSettings } from '../types';
import { numberToWordsInINR } from '../services/storageService';

interface BulkStudentPrintModalProps {
  isOpen: boolean;
  selectedStudents: Student[];
  settings: InstituteSettings;
  onClose: () => void;
}

export const BulkStudentPrintModal: React.FC<BulkStudentPrintModalProps> = ({
  isOpen,
  selectedStudents,
  settings,
  onClose,
}) => {
  const [printLayout, setPrintLayout] = useState<'register' | 'slips'>('register');

  if (!isOpen || selectedStudents.length === 0) return null;

  const totalBaseFee = selectedStudents.reduce((acc, s) => acc + s.baseFee, 0);
  const totalOnlineCharges = selectedStudents.reduce((acc, s) => acc + (s.onlineCharges || settings.defaultOnlineCharge || 30), 0);
  const totalPayable = selectedStudents.reduce((acc, s) => acc + (s.totalFee || (s.baseFee + (s.onlineCharges || 30))), 0);
  const totalPaid = selectedStudents.reduce((acc, s) => acc + s.paidAmount, 0);
  const totalDue = totalPayable - totalPaid;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      
      {/* Container */}
      <div className="bg-[#FDFCF8] rounded-3xl shadow-2xl max-w-5xl w-full border border-[#E6E2D3] flex flex-col max-h-[95vh] overflow-hidden my-auto print:max-h-none print:border-none print:shadow-none print:rounded-none print:w-full">
        
        {/* Modal Header (Hidden on Print) */}
        <div className="bg-[#2D2A26] text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-[#3E3A33] shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#5A5A40] text-white rounded-xl">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>चयनित छात्र रिकॉर्ड प्रिंट (Student Ledger & Slip Print)</span>
                <span className="bg-[#2E5B50] text-[#E2ECE9] text-[10px] px-2.5 py-0.5 rounded-full font-mono">
                  {selectedStudents.length} Students Selected
                </span>
              </h2>
              <p className="text-[11px] text-slate-300">
                Print master ledger sheet or student-wise fee receipts for selected students
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setPrintLayout('register')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  printLayout === 'register'
                    ? 'bg-[#5A5A40] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Master Ledger Register</span>
              </button>

              <button
                type="button"
                onClick={() => setPrintLayout('slips')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  printLayout === 'slips'
                    ? 'bg-[#5A5A40] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Student Fee Slips</span>
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#2E5B50] hover:bg-[#254A41] text-white text-xs font-bold rounded-xl shadow-lg transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Now (प्रिंट करें)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-[#FAF9F5] print:p-0 print:bg-white print:overflow-visible">
          
          {/* LAYOUT 1: CONSOLIDATED MASTER REGISTER */}
          {printLayout === 'register' && (
            <div className="bg-white p-6 rounded-2xl border border-[#DDD8C5] shadow-xs space-y-4 print:p-2 print:border-none print:shadow-none text-[#2D2A26]">
              
              {/* Institution Official Header */}
              <div className="text-center border-b-2 border-[#2D2A26] pb-3 space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <Building2 className="w-5 h-5 text-[#5A5A40] print:hidden" />
                  <h1 className="text-lg sm:text-xl font-black uppercase tracking-wide">
                    {settings.name}
                  </h1>
                </div>
                {settings.subTitle && (
                  <p className="text-xs font-semibold text-slate-600">{settings.subTitle}</p>
                )}
                <p className="text-[11px] text-slate-600">{settings.address}</p>
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold pt-1 border-t border-dashed border-slate-300">
                  <span>Centre / College Code: <strong className="font-mono">{settings.code}</strong></span>
                  <span>Academic Session: <strong>{settings.academicYear}</strong></span>
                  <span>Print Date: <strong>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></span>
                </div>
                <div className="pt-1">
                  <span className="inline-block bg-[#2D2A26] text-white text-[11px] font-black px-4 py-0.5 rounded-full uppercase tracking-wider print:bg-black">
                    छात्र परीक्षा शुल्क एवं पंजीकरण लेज़र पंजी (STUDENT FEE LEDGER REGISTER)
                  </span>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[11px] border border-slate-800">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-slate-800 text-slate-800 uppercase">
                      <th className="p-1.5 border border-slate-800 text-center w-8">क्र.</th>
                      <th className="p-1.5 border border-slate-800">पंजीकरण संख्या (Reg No)</th>
                      <th className="p-1.5 border border-slate-800">छात्र का नाम (Student Name)</th>
                      <th className="p-1.5 border border-slate-800">पिता का नाम (Father's Name)</th>
                      <th className="p-1.5 border border-slate-800">संकाय / कक्षा</th>
                      <th className="p-1.5 border border-slate-800 text-center">कोटि (Category)</th>
                      <th className="p-1.5 border border-slate-800 text-right">मूल शुल्क</th>
                      <th className="p-1.5 border border-slate-800 text-right">+ऑनलाइन</th>
                      <th className="p-1.5 border border-slate-800 text-right">कुल शुल्क</th>
                      <th className="p-1.5 border border-slate-800 text-right">जमा राशि</th>
                      <th className="p-1.5 border border-slate-800 text-right">बकाया राशि</th>
                      <th className="p-1.5 border border-slate-800 text-center">स्थिति</th>
                      <th className="p-1.5 border border-slate-800 text-center">रसीद संख्या</th>
                      <th className="p-1.5 border border-slate-800 text-center w-24">हस्ताक्षर / रिमार्क</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {selectedStudents.map((s, idx) => {
                      const onlineCharge = s.onlineCharges || settings.defaultOnlineCharge || 30;
                      const total = s.totalFee || (s.baseFee + onlineCharge);
                      const due = Math.max(0, total - s.paidAmount);
                      return (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="p-1.5 border border-slate-800 text-center font-mono">{idx + 1}</td>
                          <td className="p-1.5 border border-slate-800 font-mono font-bold">{s.registrationNo}</td>
                          <td className="p-1.5 border border-slate-800 font-bold">{s.studentName}</td>
                          <td className="p-1.5 border border-slate-800 text-slate-700">{s.fatherName}</td>
                          <td className="p-1.5 border border-slate-800">{s.classOrStream}</td>
                          <td className="p-1.5 border border-slate-800 text-center font-semibold">{s.casteCategory}</td>
                          <td className="p-1.5 border border-slate-800 text-right font-mono">₹{(s.baseFee || 0).toLocaleString('en-IN')}</td>
                          <td className="p-1.5 border border-slate-800 text-right font-mono font-semibold">+₹{(onlineCharge || 30).toLocaleString('en-IN')}</td>
                          <td className="p-1.5 border border-slate-800 text-right font-mono font-bold">₹{(total || 0).toLocaleString('en-IN')}</td>
                          <td className="p-1.5 border border-slate-800 text-right font-mono font-bold text-emerald-800 print:text-black">₹{(s.paidAmount || 0).toLocaleString('en-IN')}</td>
                          <td className="p-1.5 border border-slate-800 text-right font-mono font-bold text-rose-800 print:text-black">₹{(due || 0).toLocaleString('en-IN')}</td>
                          <td className="p-1.5 border border-slate-800 text-center font-bold">
                            <span className={`px-1 py-0.5 rounded text-[10px] ${
                              s.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {s.paymentStatus}
                            </span>
                          </td>
                          <td className="p-1.5 border border-slate-800 font-mono text-center text-[10px]">
                            {s.lastReceiptNo || '-'}
                          </td>
                          <td className="p-1.5 border border-slate-800"></td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* Summary Totals Row */}
                  <tfoot>
                    <tr className="bg-slate-200 font-black border-t-2 border-slate-900">
                      <td colSpan={6} className="p-2 border border-slate-800 text-right uppercase">
                        कुल महायोग (GRAND TOTAL - {selectedStudents.length} छात्र):
                      </td>
                      <td className="p-2 border border-slate-800 text-right font-mono">₹{totalBaseFee.toLocaleString('en-IN')}</td>
                      <td className="p-2 border border-slate-800 text-right font-mono">₹{totalOnlineCharges.toLocaleString('en-IN')}</td>
                      <td className="p-2 border border-slate-800 text-right font-mono">₹{totalPayable.toLocaleString('en-IN')}</td>
                      <td className="p-2 border border-slate-800 text-right font-mono text-emerald-800 print:text-black">₹{totalPaid.toLocaleString('en-IN')}</td>
                      <td className="p-2 border border-slate-800 text-right font-mono text-rose-800 print:text-black">₹{totalDue.toLocaleString('en-IN')}</td>
                      <td colSpan={3} className="p-2 border border-slate-800 text-center text-[10px]">
                        सत्यापित एवं प्रमाणित
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Signatures Footer */}
              <div className="pt-12 grid grid-cols-3 gap-8 text-center text-xs font-bold">
                <div className="border-t border-slate-900 pt-1.5">
                  <p>रोकड़पाल / लिपिक (Cashier / Dealing Assistant)</p>
                  <p className="text-[10px] text-slate-500">काउंटर शुल्क संग्रहकर्ता</p>
                </div>
                <div className="border-t border-slate-900 pt-1.5">
                  <p>परीक्षा नियंत्रक / नोडल प्रभारी</p>
                  <p className="text-[10px] text-slate-500">जांचकर्ता अधिकारी</p>
                </div>
                <div className="border-t border-slate-900 pt-1.5">
                  <p>प्रधानाध्यापक / प्राचार्य (Principal)</p>
                  <p className="text-[10px] text-slate-500">सील एवं पूर्ण हस्ताक्षर</p>
                </div>
              </div>

            </div>
          )}

          {/* LAYOUT 2: INDIVIDUAL STUDENT RECEIPTS (3 SLIPS PER A4 PAGE) */}
          {printLayout === 'slips' && (
            <div className="space-y-6 print:space-y-4">
              {selectedStudents.map((s, index) => {
                const onlineCharge = s.onlineCharges || settings.defaultOnlineCharge || 30;
                const total = s.totalFee || (s.baseFee + onlineCharge);
                const due = Math.max(0, total - s.paidAmount);
                const rcptNo = s.lastReceiptNo || `REC/${settings.academicYear.slice(2, 4)}/${(index + 1).toString().padStart(4, '0')}`;
                const amountInWords = numberToWordsInINR(s.paidAmount > 0 ? s.paidAmount : total);

                return (
                  <div 
                    key={s.id} 
                    className="bg-white p-5 rounded-2xl border-2 border-dashed border-slate-400 print:border-black print:rounded-none shadow-xs space-y-3 break-inside-avoid print:mb-6"
                  >
                    {/* Header */}
                    <div className="text-center border-b border-slate-300 pb-2">
                      <h3 className="font-black text-base uppercase text-slate-900">{settings.name}</h3>
                      <p className="text-[10px] text-slate-600">{settings.subTitle} - Code: {settings.code}</p>
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold mt-1 text-slate-700">
                        <span>रसीद सं. (Receipt No): <strong>{rcptNo}</strong></span>
                        <span className="bg-slate-200 px-2 py-0.5 rounded text-black uppercase font-sans">
                          बोर्ड परीक्षा एवं पंजीकरण शुल्क रसीद
                        </span>
                        <span>दिनांक: {s.paymentDate || new Date().toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Student Info Box */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs border border-slate-200 p-2.5 rounded-lg bg-slate-50/50 print:bg-white">
                      <div>
                        <span className="text-[10px] text-slate-500 block">छात्र का नाम (Student Name):</span>
                        <strong className="text-slate-900 font-bold">{s.studentName}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">पंजीकरण संख्या (Reg No):</span>
                        <strong className="font-mono text-slate-900">{s.registrationNo}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">कक्षा / संकाय (Stream):</span>
                        <strong className="text-slate-900">{s.classOrStream}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">पिता का नाम (Father's Name):</span>
                        <span className="text-slate-800 font-medium">{s.fatherName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">कोटि (Category):</span>
                        <span className="text-slate-800 font-semibold">{s.casteCategory} ({s.examType})</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">भुगतान माध्यम (Mode):</span>
                        <span className="font-bold text-slate-800">{s.paymentMode || 'Counter Cash'}</span>
                      </div>
                    </div>

                    {/* Fee Details Table */}
                    <table className="w-full text-xs border border-slate-300">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold text-[10px]">
                          <th className="p-1.5 border border-slate-300 text-left">मद विवरण (Fee Particulars)</th>
                          <th className="p-1.5 border border-slate-300 text-right w-24">मूल शुल्क (₹)</th>
                          <th className="p-1.5 border border-slate-300 text-right w-24">ऑनलाइन चार्ज (₹)</th>
                          <th className="p-1.5 border border-slate-300 text-right w-24">कुल देय (₹)</th>
                          <th className="p-1.5 border border-slate-300 text-right w-24 font-black">प्राप्त राशि (₹)</th>
                          <th className="p-1.5 border border-slate-300 text-right w-20 text-rose-700">बकाया (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-1.5 border border-slate-300 font-medium">
                            बिहार विद्यालय परीक्षा समिति परीक्षा शुल्क सत्र {settings.academicYear}
                          </td>
                          <td className="p-1.5 border border-slate-300 text-right font-mono">₹{(s.baseFee || 0).toLocaleString('en-IN')}</td>
                          <td className="p-1.5 border border-slate-300 text-right font-mono font-bold text-teal-800">+₹{(onlineCharge || 30).toLocaleString('en-IN')}</td>
                          <td className="p-1.5 border border-slate-300 text-right font-mono font-bold">₹{(total || 0).toLocaleString('en-IN')}</td>
                          <td className="p-1.5 border border-slate-300 text-right font-mono font-black text-emerald-800 print:text-black">₹{(s.paidAmount || 0).toLocaleString('en-IN')}</td>
                          <td className="p-1.5 border border-slate-300 text-right font-mono font-bold text-rose-700 print:text-black">₹{(due || 0).toLocaleString('en-IN')}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Amount In Words & Signatures */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 text-xs">
                      <div className="text-[11px] text-slate-700">
                        <span>शब्दों में: </span>
                        <strong className="capitalize">{amountInWords}</strong>
                      </div>

                      <div className="flex items-center gap-12 self-end pt-3 sm:pt-0">
                        <div className="text-center text-[10px]">
                          <div className="w-24 border-b border-slate-800 mb-0.5"></div>
                          <span>छात्र हस्ताक्षर</span>
                        </div>
                        <div className="text-center text-[10px] font-bold">
                          <div className="w-28 border-b border-slate-800 mb-0.5"></div>
                          <span>अधिकृत रोकड़पाल हस्ताक्षर</span>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Modal Footer (Hidden on Print) */}
        <div className="bg-[#F7F5EE] px-6 py-3 border-t border-[#E6E2D3] flex items-center justify-between text-xs text-[#787267] print:hidden shrink-0">
          <div>
            Total Selected: <strong className="text-[#4A453E]">{selectedStudents.length} Students</strong> | Total Collected: <strong className="text-emerald-700 font-mono">₹{totalPaid.toLocaleString('en-IN')}</strong>
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
              <span>Print {selectedStudents.length} Records</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
