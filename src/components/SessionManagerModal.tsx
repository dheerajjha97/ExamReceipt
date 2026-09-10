import React, { useState } from 'react';
import { 
  Calendar, 
  Trash2, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  X, 
  ShieldAlert, 
  RefreshCw, 
  Users, 
  UserCheck, 
  GraduationCap, 
  FileSpreadsheet,
  Layers,
  Building2,
  Database
} from 'lucide-react';
import { Student, RegistrationStudent, Transaction, InstituteSettings } from '../types';

interface SessionManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: InstituteSettings;
  students: Student[];
  registrationStudents: RegistrationStudent[];
  transactions: Transaction[];
  onClearExamStudents: () => void;
  onClearAllRegistrationStudents: () => void;
  onPromote11thTo12th: (newSession: string) => void;
  onFullSessionReset: (newSession: string, clearTxns: boolean) => void;
  onUpdateAcademicYear: (newYear: string) => void;
}

export const SessionManagerModal: React.FC<SessionManagerModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  students,
  registrationStudents,
  transactions,
  onClearExamStudents,
  onClearAllRegistrationStudents,
  onPromote11thTo12th,
  onFullSessionReset,
  onUpdateAcademicYear,
}) => {
  const [selectedAction, setSelectedAction] = useState<'CLEAR_EXAM' | 'PROMOTE' | 'FULL_RESET' | null>(null);
  const [newSessionName, setNewSessionName] = useState<string>('2026-2028');
  const [clearTxnsWithReset, setClearTxnsWithReset] = useState<boolean>(true);
  const [confirmKeyword, setConfirmKeyword] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate session metrics
  const totalExamStudents = students.length;
  const totalRegStudents = registrationStudents.length;
  const totalTxnsCount = transactions.length;
  const totalCollected = transactions.reduce((sum, t) => sum + (t.paidAmount || 0), 0);

  // 1. Download Backup as JSON
  const handleDownloadJsonBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      schoolCode: currentSettings.code,
      schoolName: currentSettings.name,
      academicSession: currentSettings.academicYear,
      examStudents: students,
      registrationStudents: registrationStudents,
      transactions: transactions,
      summary: {
        totalExamStudents,
        totalRegStudents,
        totalTxnsCount,
        totalCollected
      }
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BSEB_Session_Backup_${currentSettings.academicYear.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 2. Download Backup as Excel-Compatible CSV
  const handleDownloadCsvBackup = () => {
    const headers = [
      'क्रमांक (S.No)',
      'प्रकार (Category)',
      'पंजीयन / फॉर्म संख्या',
      'छात्र का नाम (Student Name)',
      'पिता का नाम (Father Name)',
      'संकाय (Stream/Class)',
      'कुल निर्धारित शुल्क',
      'जमा शुल्क (Paid)',
      'शेष शुल्क (Due)',
      'भुगतान स्थिति',
      'रसीद संख्या',
      'जमा तिथि'
    ];

    const examRows = students.map((s, idx) => [
      idx + 1,
      '12th Board Exam',
      `"${s.registrationNo || s.formNo || ''}"`,
      `"${s.studentName || ''}"`,
      `"${s.fatherName || ''}"`,
      `"${s.classOrStream || ''}"`,
      s.totalFee || (s.baseFee + (s.onlineCharges || 30)),
      s.paidAmount || 0,
      Math.max(0, (s.totalFee || (s.baseFee + (s.onlineCharges || 30))) - s.paidAmount),
      s.paymentStatus || 'UNPAID',
      `"${s.lastReceiptNo || ''}"`,
      `"${s.paymentDate || ''}"`
    ]);

    const regRows = registrationStudents.map((s, idx) => [
      students.length + idx + 1,
      '11th Registration',
      `"${s.formNo || ''}"`,
      `"${s.studentName || ''}"`,
      `"${s.fatherName || ''}"`,
      `"${s.stream || ''}"`,
      s.registrationFee || 515,
      s.paidAmount || 0,
      s.paymentStatus === 'PAID' ? 0 : (s.registrationFee || 515),
      s.paymentStatus || 'UNPAID',
      `"${s.receiptNo || ''}"`,
      `"${s.paymentDate || ''}"`
    ]);

    const csvContent = [
      `"विद्यालय/कॉलेज: ${currentSettings.name}"`,
      `"BSEB कोड: ${currentSettings.code}"`,
      `"सत्र: ${currentSettings.academicYear}"`,
      `"बैकअप दिनांक: ${new Date().toLocaleDateString('hi-IN')}"`,
      '',
      headers.join(','),
      ...examRows.map(r => r.join(',')),
      ...regRows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BSEB_Students_Fee_Ledger_${currentSettings.academicYear.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExecuteAction = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      if (selectedAction === 'CLEAR_EXAM') {
        onClearExamStudents();
        setSuccessNotice('12वीं परीक्षा सत्र का पुराना रिकॉर्ड सफलतापूर्वक क्लियर कर दिया गया है। नया बैच जोड़ने हेतु पोर्टल तैयार है!');
      } else if (selectedAction === 'PROMOTE') {
        onPromote11thTo12th(newSessionName);
        setSuccessNotice(`11वीं के छात्रों को 12वीं में प्रमोट कर दिया गया है और 11वीं सूची नए सत्र (${newSessionName}) हेतु रिक्त कर दी गई है!`);
      } else if (selectedAction === 'FULL_RESET') {
        onFullSessionReset(newSessionName, clearTxnsWithReset);
        setSuccessNotice(`नया सत्र (${newSessionName}) प्रारंभ कर दिया गया है। संपूर्ण रिकॉर्ड रीसेट हो गया है!`);
      }
      
      setIsProcessing(false);
      setSelectedAction(null);
      setConfirmKeyword('');
      
      setTimeout(() => {
        setSuccessNotice(null);
        onClose();
      }, 2500);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FDFCF8] rounded-3xl border border-[#E6E2D3] shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white shadow-lg">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[11px] font-bold">
                <Sparkles className="w-3 h-3" />
                <span>सत्र समापन एवं नया सत्र प्रारंभ प्रबंधक</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                New Session & Academic Transition
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-[#4A453E]">
          
          {successNotice && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 font-bold flex items-center gap-3 shadow-xs">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <span className="text-sm">{successNotice}</span>
            </div>
          )}

          {/* Current Session Snapshot */}
          <div className="bg-gradient-to-br from-slate-50 to-indigo-50/50 p-4.5 rounded-2xl border border-indigo-100/80">
            <div className="flex items-center justify-between border-b border-indigo-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-700" />
                <span className="font-bold text-slate-800 text-sm">{currentSettings.name}</span>
              </div>
              <span className="px-3 py-1 bg-indigo-600 text-white font-bold rounded-xl text-xs shadow-2xs">
                वर्तमान सत्र: {currentSettings.academicYear || '2025-2027'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white p-3 rounded-xl border border-indigo-50 shadow-2xs">
                <span className="text-[10px] text-slate-500 block font-semibold">12वीं बोर्ड परीक्षा छात्र</span>
                <strong className="text-base font-black text-indigo-950 mt-0.5 block">{totalExamStudents} छात्र</strong>
              </div>
              <div className="bg-white p-3 rounded-xl border border-indigo-50 shadow-2xs">
                <span className="text-[10px] text-slate-500 block font-semibold">11वीं सूचीकरण (Reg) छात्र</span>
                <strong className="text-base font-black text-teal-900 mt-0.5 block">{totalRegStudents} छात्र</strong>
              </div>
              <div className="bg-white p-3 rounded-xl border border-indigo-50 shadow-2xs">
                <span className="text-[10px] text-slate-500 block font-semibold">कुल रोकड़ संकलन</span>
                <strong className="text-base font-black text-emerald-700 mt-0.5 block">₹{totalCollected.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>

          {/* STEP 1: SAFETY BACKUP */}
          <div className="bg-amber-50/80 border border-amber-200/90 p-4 rounded-2xl">
            <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-amber-950 text-sm">
                    चरण 1: पुराने सत्र का सुरक्षित बैकअप डाउनलोड करें
                  </h4>
                  <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                    परीक्षा समाप्ति के बाद डेटा हटाने या रीसेट करने से पहले, कॉलेज रिकॉर्ड हेतु एक्सेल (CSV) या JSON बैकअप सुरक्षित कर लें।
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0">
                <button
                  onClick={handleDownloadCsvBackup}
                  className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>एक्सेल (CSV) बैकअप</span>
                </button>
                <button
                  onClick={handleDownloadJsonBackup}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>JSON बैकअप</span>
                </button>
              </div>
            </div>
          </div>

          {/* STEP 2: SELECT RESET / TRANSITION ACTION */}
          <div className="space-y-3">
            <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <span>चरण 2: सत्र नवीनीकरण का विकल्प चुनें</span>
            </h4>

            <div className="grid grid-cols-1 gap-3">
              
              {/* Option A: Clear Finished 12th Exam Batch */}
              <div 
                onClick={() => setSelectedAction('CLEAR_EXAM')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedAction === 'CLEAR_EXAM'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-200'
                    : 'border-[#E6E2D3] bg-white hover:border-indigo-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl shrink-0 mt-0.5">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-sm font-black text-slate-900 block">
                        विकल्प 1: केवल 12वीं परीक्षा सत्र का रिकॉर्ड क्लियर करें
                      </strong>
                      <p className="text-[#787267] text-[11px] mt-1 leading-relaxed">
                        परीक्षा समाप्त होने पर 12वीं के <strong>{totalExamStudents} छात्र रिकॉर्ड</strong> पोर्टल और क्लाउड से हटा दिए जाएंगे। 11वीं का डेटा सुरक्षित रहेगा और नए 12वीं परीक्षा फॉर्म जोड़े जा सकेंगे।
                      </p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="sessionAction"
                    checked={selectedAction === 'CLEAR_EXAM'}
                    onChange={() => setSelectedAction('CLEAR_EXAM')}
                    className="mt-1.5 h-4 w-4 text-indigo-600"
                  />
                </div>
              </div>

              {/* Option B: Promote 11th to 12th */}
              <div 
                onClick={() => setSelectedAction('PROMOTE')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedAction === 'PROMOTE'
                    ? 'border-teal-600 bg-teal-50/50 shadow-md ring-2 ring-teal-200'
                    : 'border-[#E6E2D3] bg-white hover:border-teal-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-teal-100 text-teal-700 rounded-xl shrink-0 mt-0.5">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-sm font-black text-slate-900 block">
                        विकल्प 2: 11वीं को 12वीं में प्रमोट करें & 11वीं में नए छात्र लाएं
                      </strong>
                      <p className="text-[#787267] text-[11px] mt-1 leading-relaxed">
                        वर्तमान 11वीं के छात्र (11th Registration) अब 12वीं (12th Board Exam) में आ जाएंगे। 11वीं का मॉड्यूल खाली हो जाएगा ताकि नए सत्र के नए छात्र नामांकित हो सकें।
                      </p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="sessionAction"
                    checked={selectedAction === 'PROMOTE'}
                    onChange={() => setSelectedAction('PROMOTE')}
                    className="mt-1.5 h-4 w-4 text-teal-600"
                  />
                </div>
              </div>

              {/* Option C: Full Reset & Fresh Academic Year */}
              <div 
                onClick={() => setSelectedAction('FULL_RESET')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedAction === 'FULL_RESET'
                    ? 'border-red-600 bg-red-50/50 shadow-md ring-2 ring-red-200'
                    : 'border-[#E6E2D3] bg-white hover:border-red-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-red-100 text-red-700 rounded-xl shrink-0 mt-0.5">
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-sm font-black text-slate-900 block">
                        विकल्प 3: संपूर्ण फ्रेश नया सत्र (Clean Slate All Reset)
                      </strong>
                      <p className="text-[#787267] text-[11px] mt-1 leading-relaxed">
                        11वीं एवं 12वीं दोनों के सभी छात्र रिकॉर्ड पूरी तरह हटाकर एक नया सत्र वर्ष सेट करें। नए सत्र के सभी नए छात्रों की फ्रेश एंट्री/OCR अपलोड करें।
                      </p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="sessionAction"
                    checked={selectedAction === 'FULL_RESET'}
                    onChange={() => setSelectedAction('FULL_RESET')}
                    className="mt-1.5 h-4 w-4 text-red-600"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* CONFIGURATION & CONFIRMATION BOX (when an action is selected) */}
          {selectedAction && (
            <div className="p-4.5 bg-white rounded-2xl border-2 border-indigo-600/30 space-y-4 shadow-sm animate-in fade-in duration-200">
              <h5 className="font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>सत्र विवरण एवं पुष्टि (Confirmation)</span>
              </h5>

              {(selectedAction === 'PROMOTE' || selectedAction === 'FULL_RESET') && (
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">
                    आगामी नया शैक्षणिक सत्र वर्ष (New Academic Session Year) *
                  </label>
                  <input
                    type="text"
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    placeholder="उदा. 2026-2028 या 2027-2029"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500">
                    यह नया सत्र रसीदों, हेडर एवं पासबुक पर स्वतः अपडेट हो जाएगा।
                  </p>
                </div>
              )}

              {selectedAction === 'FULL_RESET' && (
                <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clearTxnsWithReset}
                    onChange={(e) => setClearTxnsWithReset(e.target.checked)}
                    className="rounded text-red-600 h-4 w-4"
                  />
                  <span className="font-semibold text-slate-800 text-[11px]">
                    पुराने वित्तीय लेन-देन व रोकड़ पर्चियों (Day Book Receipts) को भी रीसेट करें
                  </span>
                </label>
              )}

              <div className="p-3 bg-red-50/80 border border-red-200 rounded-xl space-y-2">
                <span className="font-bold text-red-900 block text-[11px]">
                  ⚠️ पुष्टि हेतु नीचे इनपुट बॉक्स में <strong>CONFIRM</strong> टाइप करें:
                </span>
                <input
                  type="text"
                  value={confirmKeyword}
                  onChange={(e) => setConfirmKeyword(e.target.value)}
                  placeholder="CONFIRM टाइप करें"
                  className="w-full px-3 py-1.5 bg-white border border-red-300 rounded-lg font-mono font-bold text-red-950 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAction(null);
                    setConfirmKeyword('');
                  }}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl font-semibold text-slate-700 transition"
                >
                  रद्द करें
                </button>

                <button
                  type="button"
                  disabled={confirmKeyword.trim().toUpperCase() !== 'CONFIRM' || isProcessing}
                  onClick={handleExecuteAction}
                  className={`px-5 py-2.5 rounded-xl font-bold text-white shadow-md flex items-center gap-2 transition ${
                    confirmKeyword.trim().toUpperCase() === 'CONFIRM' && !isProcessing
                      ? selectedAction === 'FULL_RESET' 
                        ? 'bg-red-600 hover:bg-red-700 cursor-pointer' 
                        : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
                      : 'bg-slate-400 cursor-not-allowed opacity-60'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>प्रक्रिया जारी है...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>कार्रवाई पूर्ण करें</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-[#E6E2D3] flex items-center justify-between text-[11px] text-slate-500">
          <span>सुरक्षा: डेटा हटाने के बाद भी 10 सेकंड तक पूर्ववत (Undo) बटन उपलब्ध रहेगा।</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl"
          >
            बंद करें
          </button>
        </div>

      </div>
    </div>
  );
};
