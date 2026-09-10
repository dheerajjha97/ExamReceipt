import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Layers, 
  GraduationCap, 
  IndianRupee, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Printer, 
  Download, 
  Calendar, 
  School, 
  ArrowLeft, 
  Receipt,
  Check,
  ChevronRight,
  Eye,
  CreditCard,
  Edit3,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
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
import { StudentLifecycleModal } from './StudentLifecycleModal';

interface StudentLifecycleModuleProps {
  students: Student[];
  registrationStudents: RegistrationStudent[];
  settings: InstituteSettings;
  onBackToHub: () => void;
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
}

export const StudentLifecycleModule: React.FC<StudentLifecycleModuleProps> = ({
  students,
  registrationStudents,
  settings,
  onBackToHub,
  onSaveStagePayment,
  onUpdateStudentDetails,
}) => {
  const [sessionFilter, setSessionFilter] = useState<string>('ALL');
  const [streamFilter, setStreamFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<any | null>(null);

  // Unify all students into a normalized lifecycle list without hardcoded preset amounts
  const unifiedStudentList = useMemo(() => {
    // 1. Session 2025-2027 students (Exam Form students)
    const s25 = students.map((s, idx) => {
      const session = s.session || '2025-2027';
      const caste = s.casteCategory || 'General';
      const lf = s.feeLifecycle || {};

      // Stage 1 (11th Admission)
      const adm11Paid = lf.adm_11?.paidAmount || 0;
      const adm11Exp = lf.adm_11?.expectedFee || adm11Paid || 0;

      // Stage 2 (11th Registration)
      const reg11Paid = lf.reg_11?.paidAmount || 0;
      const reg11Exp = lf.reg_11?.expectedFee || reg11Paid || 0;

      // Stage 3 (12th Admission)
      const adm12Paid = lf.adm_12?.paidAmount || 0;
      const adm12Exp = lf.adm_12?.expectedFee || adm12Paid || 0;

      // Stage 4 (12th Exam Form)
      const examPaid = lf.exam_12?.paidAmount ?? (s.paidAmount || 0);
      const examExp = lf.exam_12?.expectedFee ?? (s.totalFee || 0);

      const isExamPaid = (s.paymentStatus === 'PAID' || (examPaid > 0 && examPaid >= examExp && examExp > 0));

      return {
        id: s.id,
        sNo: s.sNo || idx + 1,
        studentName: s.studentName,
        fatherName: s.fatherName,
        motherName: s.motherName,
        registrationNo: s.registrationNo || '',
        rollNo: s.rollNo,
        casteCategory: caste,
        stream: s.classOrStream,
        session: session,
        mobile: s.phone || '',
        dob: s.dob,
        stages: {
          ADM_11: { 
            status: adm11Paid > 0 ? (adm11Exp > 0 && adm11Paid >= adm11Exp ? 'PAID' : 'PARTIAL') : 'UNPAID', 
            paid: adm11Paid, 
            due: Math.max(0, adm11Exp - adm11Paid), 
            total: adm11Exp, 
            receiptNo: lf.adm_11?.receiptNo 
          },
          REG_11: { 
            status: reg11Paid > 0 ? (reg11Exp > 0 && reg11Paid >= reg11Exp ? 'PAID' : 'PARTIAL') : 'UNPAID', 
            paid: reg11Paid, 
            due: Math.max(0, reg11Exp - reg11Paid), 
            total: reg11Exp, 
            receiptNo: lf.reg_11?.receiptNo 
          },
          ADM_12: { 
            status: adm12Paid > 0 ? (adm12Exp > 0 && adm12Paid >= adm12Exp ? 'PAID' : 'PARTIAL') : 'UNPAID', 
            paid: adm12Paid, 
            due: Math.max(0, adm12Exp - adm12Paid), 
            total: adm12Exp, 
            receiptNo: lf.adm_12?.receiptNo 
          },
          EXAM_12: { 
            status: isExamPaid ? 'PAID' : examPaid > 0 ? 'PARTIAL' : 'UNPAID', 
            paid: examPaid, 
            due: Math.max(0, examExp - examPaid), 
            total: examExp,
            receiptNo: lf.exam_12?.receiptNo || s.lastReceiptNo || (isExamPaid ? s.lastReceiptNo : undefined)
          }
        },
        rawStudent: s
      };
    });

    // 2. Session 2026-2028 students (11th Registration students)
    const s26 = registrationStudents.map((s, idx) => {
      const session = s.session || '2026-2028';
      const caste = s.casteCategory || 'General';
      const lf = s.feeLifecycle || {};

      // Stage 1 (11th Admission)
      const adm11Paid = lf.adm_11?.paidAmount || 0;
      const adm11Exp = lf.adm_11?.expectedFee || adm11Paid || 0;

      // Stage 2 (11th Registration)
      const regPaid = lf.reg_11?.paidAmount ?? (s.paidAmount || 0);
      const regExp = lf.reg_11?.expectedFee ?? (s.registrationFee || 0);
      const isRegPaid = (s.paymentStatus === 'PAID' || (regPaid > 0 && regPaid >= regExp && regExp > 0));

      // Stage 3 (12th Admission)
      const adm12Paid = lf.adm_12?.paidAmount || 0;
      const adm12Exp = lf.adm_12?.expectedFee || adm12Paid || 0;

      // Stage 4 (12th Exam Form)
      const examPaid = lf.exam_12?.paidAmount || 0;
      const examExp = lf.exam_12?.expectedFee || 0;

      return {
        id: s.id,
        sNo: s.sNo || idx + 1,
        studentName: s.studentName,
        fatherName: s.fatherName,
        motherName: s.motherName,
        registrationNo: s.formNo || s.bsebUniqueId || '',
        rollNo: s.matricRollNo,
        casteCategory: caste,
        stream: s.stream,
        session: session,
        mobile: s.mobile || '',
        dob: s.dob,
        stages: {
          ADM_11: { 
            status: adm11Paid > 0 ? (adm11Exp > 0 && adm11Paid >= adm11Exp ? 'PAID' : 'PARTIAL') : 'UNPAID', 
            paid: adm11Paid, 
            due: Math.max(0, adm11Exp - adm11Paid), 
            total: adm11Exp, 
            receiptNo: lf.adm_11?.receiptNo 
          },
          REG_11: { 
            status: isRegPaid ? 'PAID' : regPaid > 0 ? 'PARTIAL' : 'UNPAID', 
            paid: regPaid, 
            due: Math.max(0, regExp - regPaid), 
            total: regExp,
            receiptNo: lf.reg_11?.receiptNo || s.receiptNo
          },
          ADM_12: { 
            status: adm12Paid > 0 ? (adm12Exp > 0 && adm12Paid >= adm12Exp ? 'PAID' : 'PARTIAL') : 'UNPAID', 
            paid: adm12Paid, 
            due: Math.max(0, adm12Exp - adm12Paid), 
            total: adm12Exp, 
            receiptNo: lf.adm_12?.receiptNo 
          },
          EXAM_12: { 
            status: examPaid > 0 ? (examExp > 0 && examPaid >= examExp ? 'PAID' : 'PARTIAL') : 'UNPAID', 
            paid: examPaid, 
            due: Math.max(0, examExp - examPaid), 
            total: examExp, 
            receiptNo: lf.exam_12?.receiptNo 
          }
        },
        rawStudent: s
      };
    });

    return [...s25, ...s26];
  }, [students, registrationStudents]);

  // Filtering
  const filteredList = useMemo(() => {
    return unifiedStudentList.filter(stu => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        stu.studentName.toLowerCase().includes(q) ||
        stu.fatherName.toLowerCase().includes(q) ||
        stu.registrationNo.toLowerCase().includes(q) ||
        stu.mobile.includes(q);

      const matchSession = sessionFilter === 'ALL' || stu.session === sessionFilter;
      const matchStream = streamFilter === 'ALL' || (stu.stream && stu.stream.toLowerCase().includes(streamFilter.toLowerCase()));

      return matchSearch && matchSession && matchStream;
    });
  }, [unifiedStudentList, searchQuery, sessionFilter, streamFilter]);

  // Totals calculations
  const totalCount = filteredList.length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-fade-in">
      
      {/* Top Banner Navigation */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToHub}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition backdrop-blur-md shrink-0"
            title="मुख्य डैशबोर्ड पर वापस जाएं"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-bold border border-indigo-400/30">
                मल्टी-सत्र छात्र पासबुक प्रणाली
              </span>
              <span className="px-3 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-xs font-bold border border-emerald-400/30">
                डायनामिक शुल्क अपडेट
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1.5 font-heading">
              छात्र 4-चरणीय शुल्क पासबुक (Student Fee Passbook)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              पंजीयन संख्या एवं छात्रों के अनुसार राशि अपडेट करें &bull; कोई पूर्व-निर्धारित राशि बाध्यकारी नहीं है
            </p>
          </div>
        </div>

        {/* Active Session Badges */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
          <button
            onClick={() => setSessionFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${sessionFilter === 'ALL' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'}`}
          >
            सभी छात्र ({totalCount})
          </button>
          <button
            onClick={() => setSessionFilter('2025-2027')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${sessionFilter === '2025-2027' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'}`}
          >
            सत्र 2025-2027 (12th)
          </button>
          <button
            onClick={() => setSessionFilter('2026-2028')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${sessionFilter === '2026-2028' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'}`}
          >
            सत्र 2026-2028 (11th)
          </button>
        </div>
      </div>

      {/* 4 Stages Informational Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {(Object.keys(FEE_STAGES_CONFIG) as FeeStageKey[]).map((key, idx) => {
          const conf = FEE_STAGES_CONFIG[key];
          return (
            <div key={key} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-black text-sm shrink-0">
                {idx + 1}
              </div>
              <div>
                <strong className="text-xs font-bold text-slate-900 block font-heading">
                  {conf.name}
                </strong>
                <span className="text-[11px] text-slate-500 block">
                  {conf.hindi}
                </span>
                <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
                  राशि: छात्र अनुसार लचीली (Dynamic)
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="नाम, पिता का नाम, पंजीयन सं. या मोबाइल खोजें..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={streamFilter}
            onChange={(e) => setStreamFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">सभी संकाय (All Streams)</option>
            <option value="Science">Science (विज्ञान)</option>
            <option value="Arts">Arts (कला)</option>
            <option value="Commerce">Commerce (वाणिज्य)</option>
          </select>
        </div>
      </div>

      {/* Main Student Lifecycle Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4">क्र.</th>
                <th className="py-3.5 px-4">विद्यार्थी एवं विवरण</th>
                <th className="py-3.5 px-3">सत्र</th>
                <th className="py-3.5 px-3 text-center">1. 11th Admission</th>
                <th className="py-3.5 px-3 text-center">2. 11th Registration</th>
                <th className="py-3.5 px-3 text-center">3. 12th Admission</th>
                <th className="py-3.5 px-3 text-center">4. 12th Exam Form</th>
                <th className="py-3.5 px-4 text-right">कार्य (Action)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((stu, index) => {
                const s1 = stu.stages.ADM_11;
                const s2 = stu.stages.REG_11;
                const s3 = stu.stages.ADM_12;
                const s4 = stu.stages.EXAM_12;

                return (
                  <tr key={stu.id} className="hover:bg-indigo-50/30 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                      {index + 1}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm font-heading">
                        {stu.studentName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        पिता: {stu.fatherName} &bull; <span className="font-mono text-indigo-700 font-bold">{stu.registrationNo || <span className="text-slate-400 italic">पंजीयन सं. खाली</span>}</span>
                      </div>
                      <div className="text-[10px] text-slate-600 font-semibold mt-0.5">
                        {stu.stream} &bull; {stu.casteCategory}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        stu.session === '2025-2027' 
                          ? 'bg-amber-50 text-amber-800 border-amber-200' 
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {stu.session}
                      </span>
                    </td>

                    {/* Stage 1: 11th Admission */}
                    <td className="py-3.5 px-3 text-center">
                      {s1.paid > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 bg-emerald-100 text-emerald-800">
                          <Check className="w-3 h-3" />
                          <span>₹{s1.paid}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">—</span>
                      )}
                    </td>

                    {/* Stage 2: 11th Registration */}
                    <td className="py-3.5 px-3 text-center">
                      {s2.paid > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 bg-emerald-100 text-emerald-800">
                          <Check className="w-3 h-3" />
                          <span>₹{s2.paid}</span>
                        </span>
                      ) : s2.total > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 bg-rose-100 text-rose-800">
                          <span>₹{s2.total} (बकाया)</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">—</span>
                      )}
                    </td>

                    {/* Stage 3: 12th Admission */}
                    <td className="py-3.5 px-3 text-center">
                      {s3.paid > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 bg-emerald-100 text-emerald-800">
                          <Check className="w-3 h-3" />
                          <span>₹{s3.paid}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">—</span>
                      )}
                    </td>

                    {/* Stage 4: 12th Exam Form */}
                    <td className="py-3.5 px-3 text-center">
                      {s4.paid > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 bg-emerald-100 text-emerald-800">
                          <Check className="w-3 h-3" />
                          <span>₹{s4.paid}</span>
                        </span>
                      ) : s4.total > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 bg-rose-100 text-rose-800">
                          <span>₹{s4.total} (बकाया)</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedStudentForModal(stu.rawStudent)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 ml-auto shadow-xs transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>राशि / पासबुक</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4-Stage Student Lifecycle Modal */}
      {selectedStudentForModal && (
        <StudentLifecycleModal
          isOpen={!!selectedStudentForModal}
          onClose={() => setSelectedStudentForModal(null)}
          student={selectedStudentForModal}
          settings={settings}
          onSaveStagePayment={onSaveStagePayment}
          onUpdateStudentDetails={onUpdateStudentDetails}
        />
      )}

    </div>
  );
};
