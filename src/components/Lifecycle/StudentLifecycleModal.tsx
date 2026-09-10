import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  IndianRupee, 
  Printer, 
  ArrowRight, 
  Layers, 
  GraduationCap, 
  Sparkles, 
  Calendar, 
  CreditCard, 
  Receipt,
  FileCheck,
  ShieldCheck,
  User,
  School,
  ChevronRight,
  Edit3,
  Save,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Student, 
  RegistrationStudent, 
  InstituteSettings, 
  FeeStageKey, 
  FEE_STAGES_CONFIG, 
  StageFeeRecord, 
  PaymentMode,
  PaymentStatus
} from '../../types';

interface StudentLifecycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | RegistrationStudent | null;
  settings: InstituteSettings;
  onSaveStagePayment: (
    studentId: string, 
    stageKey: FeeStageKey, 
    paymentData: {
      paidAmount: number;
      paymentMode: PaymentMode;
      receiptNo: string;
      paymentDate: string;
      transactionRef?: string;
      remarks?: string;
    }
  ) => void;
  onUpdateStudentDetails?: (
    studentId: string,
    updates: {
      registrationNo?: string;
      session?: string;
      stagesData?: Record<FeeStageKey, { expectedFee: number; paidAmount: number; status: PaymentStatus; receiptNo?: string }>;
    }
  ) => void;
  onPrintStageReceipt?: (student: any, stageKey: FeeStageKey, stageRecord: StageFeeRecord) => void;
}

export const StudentLifecycleModal: React.FC<StudentLifecycleModalProps> = ({
  isOpen,
  onClose,
  student,
  settings,
  onSaveStagePayment,
  onUpdateStudentDetails,
  onPrintStageReceipt,
}) => {
  const [selectedStageKey, setSelectedStageKey] = useState<FeeStageKey>('ADM_11');
  const [isCollectingForStage, setIsCollectingForStage] = useState<FeeStageKey | null>(null);
  const [collectAmount, setCollectAmount] = useState<string>('');
  const [collectMode, setCollectMode] = useState<PaymentMode>('CASH');
  const [collectTxnRef, setCollectTxnRef] = useState<string>('');
  const [collectRemarks, setCollectRemarks] = useState<string>('');

  // Editable Student & Stage State
  const [isEditingData, setIsEditingData] = useState<boolean>(false);
  const [editRegNo, setEditRegNo] = useState<string>('');
  const [editSession, setEditSession] = useState<string>('');
  const [stageAmounts, setStageAmounts] = useState<Record<FeeStageKey, { expected: string; paid: string; receiptNo: string }>>({
    ADM_11: { expected: '', paid: '', receiptNo: '' },
    REG_11: { expected: '', paid: '', receiptNo: '' },
    ADM_12: { expected: '', paid: '', receiptNo: '' },
    EXAM_12: { expected: '', paid: '', receiptNo: '' },
  });

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  // Initialize editable fields whenever modal opens or student changes
  useEffect(() => {
    if (!student) return;

    const studentSession = (student as any).session || (
      (student as any).registrationFee !== undefined ? '2026-2028' : '2025-2027'
    );
    const reg = (student as any).registrationNo || (student as any).formNo || (student as any).bsebUniqueId || '';

    setEditRegNo(reg);
    setEditSession(studentSession);

    // Existing or entered lifecycle records
    const lf = student.feeLifecycle || {};

    // Initial stage values - strictly blank if not yet entered
    const adm11Exp = lf.adm_11?.expectedFee ? String(lf.adm_11.expectedFee) : '';
    const adm11Paid = lf.adm_11?.paidAmount ? String(lf.adm_11.paidAmount) : '';
    const adm11Rec = lf.adm_11?.receiptNo || '';

    const reg11Exp = lf.reg_11?.expectedFee 
      ? String(lf.reg_11.expectedFee) 
      : ((student as any).registrationFee ? String((student as any).registrationFee) : '');
    const reg11Paid = lf.reg_11?.paidAmount 
      ? String(lf.reg_11.paidAmount) 
      : ((student as any).registrationFee !== undefined && student.paidAmount ? String(student.paidAmount) : '');
    const reg11Rec = lf.reg_11?.receiptNo || (student as any).receiptNo || '';

    const adm12Exp = lf.adm_12?.expectedFee ? String(lf.adm_12.expectedFee) : '';
    const adm12Paid = lf.adm_12?.paidAmount ? String(lf.adm_12.paidAmount) : '';
    const adm12Rec = lf.adm_12?.receiptNo || '';

    const exam12Exp = lf.exam_12?.expectedFee 
      ? String(lf.exam_12.expectedFee) 
      : ((student as any).totalFee ? String((student as any).totalFee) : '');
    const exam12Paid = lf.exam_12?.paidAmount 
      ? String(lf.exam_12.paidAmount) 
      : ((student as any).totalFee !== undefined && student.paidAmount ? String(student.paidAmount) : '');
    const exam12Rec = lf.exam_12?.receiptNo || (student as any).lastReceiptNo || (student as any).receiptNo || '';

    setStageAmounts({
      ADM_11: { expected: adm11Exp, paid: adm11Paid, receiptNo: adm11Rec },
      REG_11: { expected: reg11Exp, paid: reg11Paid, receiptNo: reg11Rec },
      ADM_12: { expected: adm12Exp, paid: adm12Paid, receiptNo: adm12Rec },
      EXAM_12: { expected: exam12Exp, paid: exam12Paid, receiptNo: exam12Rec },
    });
  }, [student, isOpen]);

  if (!isOpen || !student) return null;

  const studentName = student.studentName;
  const fatherName = student.fatherName;
  const stream = (student as any).classOrStream || (student as any).stream || 'Intermediate';
  const caste = student.casteCategory || 'General';

  // Compute active lifecycle records from state dynamically
  const getStageRecord = (key: FeeStageKey): StageFeeRecord => {
    const conf = FEE_STAGES_CONFIG[key];
    const data = stageAmounts[key];
    const expected = Number(data.expected) || 0;
    const paid = Number(data.paid) || 0;
    const due = Math.max(0, expected - paid);
    
    let status: PaymentStatus = 'UNPAID';
    if (paid > 0 && paid >= expected && expected > 0) {
      status = 'PAID';
    } else if (paid > 0) {
      status = 'PARTIAL';
    } else {
      status = 'UNPAID';
    }

    return {
      stageKey: key,
      stageName: conf.name,
      stageHindi: conf.hindi,
      stageClass: conf.class,
      targetSession: editSession,
      expectedFee: expected,
      paidAmount: paid,
      dueAmount: due,
      paymentStatus: status,
      receiptNo: data.receiptNo || undefined,
      remarks: `${conf.name} Record`
    };
  };

  const lifecycleMap: Record<FeeStageKey, StageFeeRecord> = {
    ADM_11: getStageRecord('ADM_11'),
    REG_11: getStageRecord('REG_11'),
    ADM_12: getStageRecord('ADM_12'),
    EXAM_12: getStageRecord('EXAM_12'),
  };

  // Aggregated totals dynamically based on user entered values
  const totalLifecycleExpected = Object.values(lifecycleMap).reduce((acc, curr) => acc + curr.expectedFee, 0);
  const totalLifecyclePaid = Object.values(lifecycleMap).reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalLifecycleDue = Math.max(0, totalLifecycleExpected - totalLifecyclePaid);

  const handleStartCollect = (stageKey: FeeStageKey) => {
    const stage = lifecycleMap[stageKey];
    setIsCollectingForStage(stageKey);
    const amountToCollect = stage.dueAmount > 0 
      ? String(stage.dueAmount) 
      : (stage.expectedFee > 0 ? String(stage.expectedFee) : '');
    setCollectAmount(amountToCollect);
    setCollectMode('CASH');
    setCollectTxnRef('');
    setCollectRemarks(`${stage.stageName} Fee Collection`);
  };

  const handleConfirmCollect = () => {
    const amtNum = Number(collectAmount);
    if (!isCollectingForStage || amtNum <= 0) return;

    const stage = lifecycleMap[isCollectingForStage];
    const generatedReceipt = `REC-${isCollectingForStage}-${Date.now().toString().slice(-6)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    // Update local state amounts
    const currentExpected = Number(stageAmounts[isCollectingForStage].expected) || amtNum;
    const newPaid = amtNum;

    setStageAmounts(prev => ({
      ...prev,
      [isCollectingForStage]: {
        expected: String(currentExpected),
        paid: String(newPaid),
        receiptNo: generatedReceipt
      }
    }));

    onSaveStagePayment(student.id, isCollectingForStage, {
      paidAmount: amtNum,
      paymentMode: collectMode,
      receiptNo: generatedReceipt,
      paymentDate: nowStr,
      transactionRef: collectTxnRef || undefined,
      remarks: collectRemarks || `${stage.stageName} Paid`
    });

    setIsCollectingForStage(null);
  };

  // Save all custom amounts and registration number
  const handleSaveAllCustomDetails = () => {
    if (onUpdateStudentDetails) {
      const stagesData: Record<FeeStageKey, { expectedFee: number; paidAmount: number; status: PaymentStatus; receiptNo?: string }> = {
        ADM_11: {
          expectedFee: Number(stageAmounts.ADM_11.expected) || 0,
          paidAmount: Number(stageAmounts.ADM_11.paid) || 0,
          status: (Number(stageAmounts.ADM_11.paid) || 0) >= (Number(stageAmounts.ADM_11.expected) || 0) && (Number(stageAmounts.ADM_11.expected) || 0) > 0 ? 'PAID' : (Number(stageAmounts.ADM_11.paid) || 0) > 0 ? 'PARTIAL' : 'UNPAID',
          receiptNo: stageAmounts.ADM_11.receiptNo || undefined
        },
        REG_11: {
          expectedFee: Number(stageAmounts.REG_11.expected) || 0,
          paidAmount: Number(stageAmounts.REG_11.paid) || 0,
          status: (Number(stageAmounts.REG_11.paid) || 0) >= (Number(stageAmounts.REG_11.expected) || 0) && (Number(stageAmounts.REG_11.expected) || 0) > 0 ? 'PAID' : (Number(stageAmounts.REG_11.paid) || 0) > 0 ? 'PARTIAL' : 'UNPAID',
          receiptNo: stageAmounts.REG_11.receiptNo || undefined
        },
        ADM_12: {
          expectedFee: Number(stageAmounts.ADM_12.expected) || 0,
          paidAmount: Number(stageAmounts.ADM_12.paid) || 0,
          status: (Number(stageAmounts.ADM_12.paid) || 0) >= (Number(stageAmounts.ADM_12.expected) || 0) && (Number(stageAmounts.ADM_12.expected) || 0) > 0 ? 'PAID' : (Number(stageAmounts.ADM_12.paid) || 0) > 0 ? 'PARTIAL' : 'UNPAID',
          receiptNo: stageAmounts.ADM_12.receiptNo || undefined
        },
        EXAM_12: {
          expectedFee: Number(stageAmounts.EXAM_12.expected) || 0,
          paidAmount: Number(stageAmounts.EXAM_12.paid) || 0,
          status: (Number(stageAmounts.EXAM_12.paid) || 0) >= (Number(stageAmounts.EXAM_12.expected) || 0) && (Number(stageAmounts.EXAM_12.expected) || 0) > 0 ? 'PAID' : (Number(stageAmounts.EXAM_12.paid) || 0) > 0 ? 'PARTIAL' : 'UNPAID',
          receiptNo: stageAmounts.EXAM_12.receiptNo || undefined
        },
      };

      onUpdateStudentDetails(student.id, {
        registrationNo: editRegNo.trim(),
        session: editSession,
        stagesData
      });
    }

    setIsEditingData(false);
    setSaveSuccessMsg('पंजीयन संख्या एवं सभी 4 चरणों की राशि सफलतापूर्वक अपडेट कर दी गई है!');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900/50 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-3.5 z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-glow-indigo shrink-0">
              <div className="w-full h-full bg-slate-900/90 rounded-[14px] flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-indigo-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  4-चरणीय छात्र शुल्क पासबुक
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/30">
                  सत्र: {editSession || 'अनिर्धारित'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1 font-heading flex items-center gap-2">
                <span>{studentName}</span>
                <button
                  onClick={() => setIsEditingData(!isEditingData)}
                  className="px-2.5 py-1 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-200 text-xs font-semibold border border-indigo-400/30 flex items-center gap-1 transition"
                  title="पंजीयन संख्या व शुल्क राशि बदलें"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingData ? 'फॉर्म बंद करें' : 'विवरण व राशि एडिट करें'}</span>
                </button>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition border border-slate-700 z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert Banner */}
        {saveSuccessMsg && (
          <div className="bg-emerald-500 text-white px-6 py-2.5 text-xs font-bold flex items-center gap-2 shadow-inner">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Student Meta Summary Strip */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shrink-0">
          <div>
            <span className="text-slate-500 block text-[10px] font-bold uppercase">पिता का नाम:</span>
            <span className="font-bold text-slate-800 truncate block">{fatherName}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] font-bold uppercase">पंजीयन संख्या (Reg. No):</span>
            <span className="font-mono font-bold text-indigo-700 truncate block">
              {editRegNo || <span className="text-slate-400 italic">दर्ज नहीं (Blank)</span>}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] font-bold uppercase">संकाय (Stream) व कोटि:</span>
            <span className="font-bold text-slate-800 truncate block">{stream} ({caste})</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] font-bold uppercase">कुल 4-चरणीय शेष बकाया:</span>
            <span className={`font-mono font-black ${totalLifecycleDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {totalLifecycleDue > 0 ? `₹${totalLifecycleDue.toLocaleString('en-IN')}` : totalLifecyclePaid > 0 ? '₹0 (पूर्ण चुकता)' : '— (अनिर्धारित)'}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* EDIT FORM DRAWER: Update Reg No, Session & 4-Stage Custom Amounts */}
          <AnimatePresence>
            {isEditingData && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-indigo-50/70 rounded-3xl p-5 border-2 border-indigo-200 shadow-md space-y-4"
              >
                <div className="flex items-center justify-between pb-2 border-b border-indigo-200">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-indigo-700" />
                    <h3 className="text-sm font-black text-indigo-950 font-heading">
                      पंजीयन संख्या एवं चारों चरणों की राशि अपडेट करें (Customize Amounts & Reg No)
                    </h3>
                  </div>
                  <span className="text-[11px] text-indigo-700 font-medium">
                    * यदि राशि शून्य या अनिर्धारित रखनी हो, तो खाली (blank) छोड़ें
                  </span>
                </div>

                {/* Registration No & Session Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      पंजीयन संख्या (Registration No / Form No) *
                    </label>
                    <input
                      type="text"
                      placeholder="उदा: R-25-0108-001 या 24J1029384"
                      value={editRegNo}
                      onChange={(e) => setEditRegNo(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      सत्र (Target Session)
                    </label>
                    <select
                      value={editSession}
                      onChange={(e) => setEditSession(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 font-bold text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="2025-2027">सत्र 2025-2027 (12th Board Exam Form)</option>
                      <option value="2026-2028">सत्र 2026-2028 (11th BSEB Registration)</option>
                      <option value="2024-2026">सत्र 2024-2026</option>
                    </select>
                  </div>
                </div>

                {/* 4 Stages Custom Amount Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                  {(Object.keys(FEE_STAGES_CONFIG) as FeeStageKey[]).map((key) => {
                    const conf = FEE_STAGES_CONFIG[key];
                    const cur = stageAmounts[key];

                    return (
                      <div key={key} className="bg-white p-3 rounded-2xl border border-indigo-100 shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-900 font-heading truncate">
                            {conf.name}
                          </span>
                          <span className="text-[10px] text-slate-500">{conf.class}</span>
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 block">निर्धारित शुल्क (₹):</label>
                          <input
                            type="number"
                            placeholder="ब्लैंक / खाली रखें"
                            value={cur.expected}
                            onChange={(e) => setStageAmounts(prev => ({
                              ...prev,
                              [key]: { ...prev[key], expected: e.target.value }
                            }))}
                            className="w-full px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 block">जमा राशि (₹):</label>
                          <input
                            type="number"
                            placeholder="ब्लैंक / 0"
                            value={cur.paid}
                            onChange={(e) => setStageAmounts(prev => ({
                              ...prev,
                              [key]: { ...prev[key], paid: e.target.value }
                            }))}
                            className="w-full px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono font-bold text-emerald-700 focus:bg-white focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Save Button for Drawer */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingData(false)}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAllCustomDetails}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>अपडेट सेव करें (Save Changes)</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* 4-Stage Visual Pipeline Stepper */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>इंटरमीडिएट 4-चरणीय शुल्क यात्रा (Fee Lifecycle)</span>
              </h3>
              <span className="text-xs font-bold text-slate-600">
                कुल भुगतान: <strong className="text-emerald-700 font-mono">{totalLifecyclePaid > 0 ? `₹${totalLifecyclePaid.toLocaleString('en-IN')}` : '₹0'}</strong> {totalLifecycleExpected > 0 && <span>/ ₹{totalLifecycleExpected.toLocaleString('en-IN')}</span>}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(Object.keys(FEE_STAGES_CONFIG) as FeeStageKey[]).map((key, idx) => {
                const conf = FEE_STAGES_CONFIG[key];
                const stage = lifecycleMap[key];
                const isSelected = selectedStageKey === key;
                const isPaid = stage.paymentStatus === 'PAID';
                const isPartial = stage.paymentStatus === 'PARTIAL';
                const hasExpected = stage.expectedFee > 0;

                return (
                  <motion.div
                    key={key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedStageKey(key)}
                    className={`p-4 rounded-2xl border cursor-pointer transition relative overflow-hidden flex flex-col justify-between ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-md ring-2 ring-indigo-500/20' 
                        : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                          isPaid 
                            ? 'bg-emerald-500 text-white' 
                            : isPartial 
                            ? 'bg-amber-500 text-white' 
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <span className="text-xs font-black text-slate-900 block font-heading">
                            {conf.name}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {conf.hindi}
                          </span>
                        </div>
                      </div>

                      {isPaid ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : isPartial ? (
                        <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold shrink-0">
                          {hasExpected ? 'लंबित' : 'ब्लैंक'}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">शुल्क राशि:</span>
                        <strong className="font-mono font-bold text-slate-800">
                          {hasExpected ? `₹${stage.expectedFee}` : <span className="text-slate-400 font-normal">दर्ज नहीं (—)</span>}
                        </strong>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isPaid 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : isPartial 
                          ? 'bg-amber-100 text-amber-800' 
                          : hasExpected 
                          ? 'bg-rose-100 text-rose-800' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {isPaid ? 'पूर्ण जमा' : isPartial ? 'आंशिक' : hasExpected ? 'बकाया' : 'खाली'}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Selected Stage Comprehensive Details Card */}
          {(() => {
            const currentConf = FEE_STAGES_CONFIG[selectedStageKey];
            const currentRecord = lifecycleMap[selectedStageKey];
            const isPaid = currentRecord.paymentStatus === 'PAID';

            return (
              <div className="bg-gradient-to-br from-slate-50 to-indigo-50/40 rounded-3xl p-5 sm:p-6 border border-indigo-100 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20 shrink-0">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-black text-slate-900 font-heading flex items-center gap-2">
                        <span>{currentConf.name} ({currentConf.hindi})</span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                          कक्षा {currentConf.class}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {currentConf.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isPaid ? (
                      <button
                        onClick={() => onPrintStageReceipt && onPrintStageReceipt(student, selectedStageKey, currentRecord)}
                        className="px-3.5 py-2 bg-white hover:bg-slate-50 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-200 shadow-xs flex items-center gap-1.5 transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>रसीद प्रिंट करें</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartCollect(selectedStageKey)}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition"
                      >
                        <IndianRupee className="w-3.5 h-3.5 text-emerald-200" />
                        <span>+ फीस संकलन करें (Collect Fee)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Stage Financial Record Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">निर्धारित शुल्क (Expected)</span>
                    <span className="text-lg font-black font-mono text-slate-900 block mt-0.5">
                      {currentRecord.expectedFee > 0 ? `₹${currentRecord.expectedFee.toLocaleString('en-IN')}` : <span className="text-slate-400 font-normal">ब्लैंक (—)</span>}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block">जमा राशि (Paid)</span>
                    <span className="text-lg font-black font-mono text-emerald-700 block mt-0.5">
                      {currentRecord.paidAmount > 0 ? `₹${currentRecord.paidAmount.toLocaleString('en-IN')}` : '₹0'}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-bold text-rose-700 uppercase block">शेष बकाया (Due)</span>
                    <span className={`text-lg font-black font-mono block mt-0.5 ${currentRecord.dueAmount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                      {currentRecord.dueAmount > 0 ? `₹${currentRecord.dueAmount.toLocaleString('en-IN')}` : '₹0'}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase block">रसीद संख्या (Receipt No)</span>
                    <span className="text-xs font-mono font-bold text-indigo-700 block mt-1 truncate">
                      {currentRecord.receiptNo || 'रसीद जारी नहीं'}
                    </span>
                  </div>
                </div>

                {/* Additional Info / Dates */}
                {isPaid && (
                  <div className="bg-emerald-50/80 rounded-2xl p-3 border border-emerald-200 text-xs flex items-center justify-between flex-wrap gap-2 text-emerald-900">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>भुगतान माध्यम: <strong>{currentRecord.paymentMode || 'CASH'}</strong></span>
                      {currentRecord.transactionRef && (
                        <span>&bull; Ref: <code className="font-mono">{currentRecord.transactionRef}</code></span>
                      )}
                    </div>
                    {currentRecord.paymentDate && (
                      <span className="text-slate-600">तारीख: <strong>{currentRecord.paymentDate}</strong></span>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Inline Quick Fee Collection Panel */}
          <AnimatePresence>
            {isCollectingForStage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-emerald-50 rounded-3xl p-5 border border-emerald-300 shadow-lg space-y-4"
              >
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-emerald-700" />
                    <h4 className="text-sm font-bold text-emerald-900">
                      फीस संकलन: {FEE_STAGES_CONFIG[isCollectingForStage].name} ({FEE_STAGES_CONFIG[isCollectingForStage].hindi})
                    </h4>
                  </div>
                  <button
                    onClick={() => setIsCollectingForStage(null)}
                    className="text-slate-600 hover:text-slate-900 text-xs font-bold"
                  >
                    रद्द करें (Cancel)
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      जमा राशि (₹) *
                    </label>
                    <input
                      type="number"
                      placeholder="राशि दर्ज करें"
                      value={collectAmount}
                      onChange={(e) => setCollectAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 font-mono font-bold text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      भुगतान माध्यम (Mode) *
                    </label>
                    <select
                      value={collectMode}
                      onChange={(e) => setCollectMode(e.target.value as PaymentMode)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 font-bold text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="CASH">CASH (नकद)</option>
                      <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                      <option value="QR_CODE">College Counter QR</option>
                      <option value="NET_BANKING">Net Banking / NEFT</option>
                      <option value="CARD">Debit / Credit Card</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      यूटीआर / संदर्भ संख्या (Ref No.)
                    </label>
                    <input
                      type="text"
                      placeholder="उदा: UPI/2026/891234"
                      value={collectTxnRef}
                      onChange={(e) => setCollectTxnRef(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 font-mono text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCollectingForStage(null)}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmCollect}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md transition"
                  >
                    रसीद जारी करें एवं फीस सेव करें (Generate Receipt)
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-500">
            <School className="w-4 h-4 text-indigo-600" />
            <span>{settings.name} &bull; कोड: {settings.code}</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition shadow-sm"
          >
            बंद करें (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
