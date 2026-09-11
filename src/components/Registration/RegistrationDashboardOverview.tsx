import React from 'react';
import { 
  Users, 
  IndianRupee, 
  Clock, 
  CheckCircle2, 
  FileCheck, 
  AlertTriangle, 
  Building2, 
  Award, 
  Layers, 
  TrendingUp,
  FileText,
  ShieldCheck,
  Percent,
  School,
  Sparkles
} from 'lucide-react';
import { RegistrationStudent, InstituteSettings, isBSEBBoard, isStreamMatching } from '../../types';

interface RegistrationDashboardOverviewProps {
  students: RegistrationStudent[];
  settings: InstituteSettings;
  onNavigateTab: (tab: 'students' | 'ledger' | 'audit' | 'daybook') => void;
}

export const RegistrationDashboardOverview: React.FC<RegistrationDashboardOverviewProps> = ({
  students,
  settings,
  onNavigateTab,
}) => {
  const totalStudents = students.length;
  const paidStudents = students.filter(s => s.paymentStatus === 'PAID');
  const unpaidStudents = students.filter(s => s.paymentStatus !== 'PAID');

  const totalCollected = paidStudents.reduce((acc, s) => {
    return acc + (s.paidAmount || (isBSEBBoard(s.boardName || s.matricBoard) ? 515 : 715));
  }, 0);

  const totalOutstanding = unpaidStudents.reduce((acc, s) => {
    return acc + (s.registrationFee || (isBSEBBoard(s.boardName || s.matricBoard) ? 515 : 715));
  }, 0);

  // Stream counts
  const artsStudents = students.filter(s => isStreamMatching(s.stream, 'Arts'));
  const scienceStudents = students.filter(s => isStreamMatching(s.stream, 'Science'));
  const commerceStudents = students.filter(s => isStreamMatching(s.stream, 'Commerce'));

  // Board rates counts
  const bsebCount = students.filter(s => isBSEBBoard(s.boardName || s.matricBoard) || s.registrationFee === 515);
  const otherBoardCount = students.filter(s => !isBSEBBoard(s.boardName || s.matricBoard) && s.registrationFee !== 515);

  // Form Workflow
  const formIssuedCount = students.filter(s => s.isFormIssued).length;
  const formSubmittedCount = students.filter(s => s.isFormSubmitted).length;

  // Documents
  const tcSubmitted = students.filter(s => s.documents?.transferCertificate?.status === 'SUBMITTED').length;
  const aadharSubmitted = students.filter(s => s.documents?.aadhar?.status === 'SUBMITTED').length;
  const marksheetSubmitted = students.filter(s => s.documents?.matricMarksheet?.status === 'SUBMITTED').length;

  const collectionPercent = totalStudents > 0 ? Math.round((paidStudents.length / totalStudents) * 100) : 0;
  const formSubmissionPercent = totalStudents > 0 ? Math.round((formSubmittedCount / totalStudents) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* 1. Top Executive Banner */}
      <div className="bg-linear-to-r from-[#0F766E] via-[#0D9488] to-[#1E3A8A] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold mb-3 border border-white/20 text-emerald-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>11वीं सूचीकरण / पंजीयन डैशबोर्ड (सत्र 2026-2028)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            {settings.name}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-2 font-medium">
            संस्थान कोड: <strong>{settings.code}</strong> • BSEB शुल्क दर: <strong>₹515</strong> • अन्य बोर्ड: <strong>₹715</strong>
          </p>

          <div className="flex items-center gap-3 mt-6 flex-wrap">
            <button
              onClick={() => onNavigateTab('students')}
              className="px-4 py-2.5 bg-white text-[#0F766E] hover:bg-emerald-50 rounded-2xl text-xs font-black transition shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>छात्र सूची खोलें ({totalStudents})</span>
            </button>
            <button
              onClick={() => onNavigateTab('ledger')}
              className="px-4 py-2.5 bg-emerald-950/40 hover:bg-emerald-950/60 text-white border border-white/20 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer backdrop-blur-sm"
            >
              <IndianRupee className="w-4 h-4" />
              <span>पंजीयन लेज़र (₹{totalCollected.toLocaleString('en-IN')})</span>
            </button>
            <button
              onClick={() => onNavigateTab('audit')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer backdrop-blur-sm"
            >
              <FileCheck className="w-4 h-4" />
              <span>दस्तावेज़ ऑडिट</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>कुल पंजीकृत छात्र</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{totalStudents}</div>
          <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>BSEB: <strong>{bsebCount.length}</strong></span>
            <span>अन्य बोर्ड: <strong>{otherBoardCount.length}</strong></span>
          </div>
        </div>

        {/* Collection Amount */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>कुल शुल्क वसूली (Realized)</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-700 mt-2">
            ₹{totalCollected.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            <strong>{collectionPercent}%</strong> वसूली पूर्ण ({paidStudents.length} छात्र)
          </div>
        </div>

        {/* Outstanding Dues */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>कुल बकाया शुल्क (Pending)</span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-black text-rose-700 mt-2">
            ₹{totalOutstanding.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-rose-600 mt-2 font-bold">
            {unpaidStudents.length} छात्रों का भुगतान बाकी
          </div>
        </div>

        {/* Form Submission Pipeline */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>फॉर्म जमा स्थिति (Submitted)</span>
            <FileCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-indigo-900 mt-2">
            {formSubmittedCount} / {totalStudents}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            <strong>{formSubmissionPercent}%</strong> फॉर्म काउंटर पर जमा
          </div>
        </div>
      </div>

      {/* 3. Stream-wise & Board Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stream Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" />
              <span>संकायवार 11वीं पंजीकरण सांख्यिकी</span>
            </h3>
            <span className="text-xs font-bold text-slate-400">3 संकाय</span>
          </div>

          <div className="space-y-3">
            {/* Arts */}
            <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-black text-amber-900">Arts (कला संकाय)</div>
                <div className="text-[11px] text-amber-700 mt-0.5">
                  जमा शुल्क: ₹{artsStudents.filter(s => s.paymentStatus === 'PAID').length * 515}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-amber-900">{artsStudents.length} छात्र</div>
                <div className="text-[10px] text-amber-600 font-bold">
                  {totalStudents > 0 ? Math.round((artsStudents.length / totalStudents) * 100) : 0}% कुल का
                </div>
              </div>
            </div>

            {/* Science */}
            <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-black text-blue-900">Science (विज्ञान संकाय)</div>
                <div className="text-[11px] text-blue-700 mt-0.5">
                  जमा शुल्क: ₹{scienceStudents.filter(s => s.paymentStatus === 'PAID').length * 515}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-blue-900">{scienceStudents.length} छात्र</div>
                <div className="text-[10px] text-blue-600 font-bold">
                  {totalStudents > 0 ? Math.round((scienceStudents.length / totalStudents) * 100) : 0}% कुल का
                </div>
              </div>
            </div>

            {/* Commerce */}
            <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-black text-emerald-900">Commerce (वाणिज्य संकाय)</div>
                <div className="text-[11px] text-emerald-700 mt-0.5">
                  जमा शुल्क: ₹{commerceStudents.filter(s => s.paymentStatus === 'PAID').length * 515}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-emerald-900">{commerceStudents.length} छात्र</div>
                <div className="text-[10px] text-emerald-600 font-bold">
                  {totalStudents > 0 ? Math.round((commerceStudents.length / totalStudents) * 100) : 0}% कुल का
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5 Mandatory Document Verification Progress */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>5 अनिवार्य दस्तावेज़ संकलन प्रगति</span>
            </h3>
            <button
              onClick={() => onNavigateTab('audit')}
              className="text-xs font-bold text-teal-700 hover:underline cursor-pointer"
            >
              पूर्ण मैट्रिक्स देखें →
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* 1. SLC / TC */}
            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span>1. विद्यालय परित्याग प्रमाण पत्र (SLC / TC)</span>
                <span className="text-teal-700">{tcSubmitted} / {totalStudents}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-teal-600 h-full rounded-full transition-all"
                  style={{ width: `${totalStudents > 0 ? (tcSubmitted / totalStudents) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* 2. Aadhar */}
            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span>2. आधार कार्ड प्रति (Aadhar Card)</span>
                <span className="text-blue-700">{aadharSubmitted} / {totalStudents}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{ width: `${totalStudents > 0 ? (aadharSubmitted / totalStudents) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* 3. Matric Marksheet */}
            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span>3. 10वीं अंक पत्र (Matric Marksheet)</span>
                <span className="text-emerald-700">{marksheetSubmitted} / {totalStudents}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{ width: `${totalStudents > 0 ? (marksheetSubmitted / totalStudents) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
