import React from 'react';
import { 
  GraduationCap, 
  UserCheck, 
  FileText, 
  CreditCard, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  School, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Layers, 
  Settings, 
  Receipt,
  FileCheck2,
  Users
} from 'lucide-react';
import { Student, RegistrationStudent, InstituteSettings, Transaction } from '../types';

interface MainDashboardHubProps {
  students: Student[];
  registrationStudents: RegistrationStudent[];
  transactions: Transaction[];
  settings: InstituteSettings;
  onSelectExamination: () => void;
  onSelectRegistration: () => void;
  onOpenDailySettlement: () => void;
  onOpenSettings: () => void;
}

export const MainDashboardHub: React.FC<MainDashboardHubProps> = ({
  students,
  registrationStudents,
  transactions,
  settings,
  onSelectExamination,
  onSelectRegistration,
  onOpenDailySettlement,
  onOpenSettings,
}) => {
  // Exam metrics
  const examTotalCount = students.length;
  const examPaidCount = students.filter(s => s.paymentStatus === 'PAID').length;
  const examTotalFee = students.reduce((acc, s) => acc + (s.paidAmount || 0), 0);
  const examFormsSubmitted = students.filter(s => s.formIssueStatus === 'SUBMITTED').length;

  // Registration metrics
  const regTotalCount = registrationStudents.length;
  const regPaidCount = registrationStudents.filter(s => s.paymentStatus === 'PAID').length;
  const regTotalFee = regPaidCount * 515;
  const regMissingDocs = registrationStudents.filter(s => 
    s.documents?.transferCertificate?.status !== 'SUBMITTED' ||
    s.documents?.apaar?.status !== 'SUBMITTED' ||
    ((s.casteCategory === 'EBC' || s.casteCategory === 'SC' || s.casteCategory === 'ST') && s.documents?.casteCertificate?.status !== 'SUBMITTED')
  ).length;

  // Today transactions
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTxns = transactions.filter(t => t.paymentDate && t.paymentDate.startsWith(todayStr));
  const todayCollection = todayTxns.reduce((sum, t) => sum + (t.paidAmount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Top Glassmorphic Institutional Banner */}
      <div className="relative overflow-hidden bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-xl p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-300/15 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[#2E5B50] to-[#1F3D36] text-white flex items-center justify-center shadow-lg border border-white/30 shrink-0">
              <School className="w-9 h-9 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-3 py-1 bg-emerald-100 text-[#2E5B50] font-bold rounded-full text-xs border border-emerald-300">
                  बिहार विद्यालय परीक्षा समिति (BSEB) &bull; कोड: {settings.code || '31337'}
                </span>
                <span className="px-3 py-1 bg-amber-100 text-amber-900 font-bold rounded-full text-xs border border-amber-300">
                  सत्र {settings.academicYear || '2026-2027'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 mt-2 tracking-tight">
                {settings.name || 'उच्च माध्यमिक विद्यालय / इंटर कॉलेज'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                {settings.address || 'मुजफ्फरपुर, बिहार'} &bull; डिजिटल परीक्षा प्रपत्र, पंजीकरण एवं रसीद पोर्टल
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
            <button
              onClick={onOpenDailySettlement}
              className="px-4 py-2.5 rounded-2xl bg-white/90 hover:bg-white text-[#2E5B50] border border-emerald-300 font-bold text-xs flex items-center gap-2 shadow-sm hover:shadow-md transition"
            >
              <Receipt className="w-4 h-4 text-emerald-700" />
              <span>दैनिक रोकड़ पर्ची (Day Book)</span>
            </button>
            <button
              onClick={onOpenSettings}
              className="p-2.5 rounded-2xl bg-white/90 hover:bg-white text-gray-700 border border-gray-300 transition shadow-sm"
              title="सेटिंग्स"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Aggregate Mini Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-gray-200/60 text-xs">
          <div className="p-3 bg-white/60 rounded-2xl border border-white/80">
            <span className="text-gray-500 block text-[11px]">कुल परीक्षा परीक्षार्थी</span>
            <strong className="text-lg font-black text-gray-900">{examTotalCount} छात्र</strong>
          </div>
          <div className="p-3 bg-white/60 rounded-2xl border border-white/80">
            <span className="text-gray-500 block text-[11px]">कुल इंटरमीडिएट पंजीकरण</span>
            <strong className="text-lg font-black text-[#2E5B50]">{regTotalCount} छात्र</strong>
          </div>
          <div className="p-3 bg-white/60 rounded-2xl border border-white/80">
            <span className="text-gray-500 block text-[11px]">कुल परीक्षा शुल्क संकलित</span>
            <strong className="text-lg font-black text-emerald-700">₹{examTotalFee.toLocaleString('en-IN')}</strong>
          </div>
          <div className="p-3 bg-white/60 rounded-2xl border border-white/80">
            <span className="text-gray-500 block text-[11px]">कुल पंजीकरण शुल्क (₹515)</span>
            <strong className="text-lg font-black text-emerald-700">₹{regTotalFee.toLocaleString('en-IN')}</strong>
          </div>
        </div>
      </div>

      {/* SECTION: TWO MAIN CARD MODULES (Glassmorphic Hero Choice) */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-6">
          <span className="text-xs font-bold text-[#2E5B50] uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            कार्यक्षेत्र चयन (Select Module)
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-2">
            प्रबंधन मॉड्यूल का चयन करें
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            परीक्षा फॉर्म एवं परीक्षा शुल्क अथवा नए 11वीं/12वीं इंटर पंजीकरण में से चुनें।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ========================================================= */}
          {/* CARD 1: EXAMINATION MODULE (परीक्षा प्रपत्र एवं परीक्षा शुल्क) */}
          {/* ========================================================= */}
          <div 
            onClick={onSelectExamination}
            className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white/80 backdrop-blur-2xl border-2 border-emerald-200/90 hover:border-[#2E5B50] shadow-xl hover:shadow-2xl transition-all duration-300 p-7 flex flex-col justify-between hover:-translate-y-1"
          >
            {/* Top Accent Gradient */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-emerald-600 via-teal-600 to-[#2E5B50]" />

            <div>
              {/* Header inside Card */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-[#2E5B50] to-[#1F3D36] text-white flex items-center justify-center shadow-lg border border-white/40 group-hover:scale-105 transition">
                  <GraduationCap className="w-8 h-8 text-emerald-200" />
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-[#2E5B50] font-bold rounded-full text-xs border border-emerald-300">
                  कार्ड 1 &bull; सक्रिय मॉड्यूल
                </span>
              </div>

              <h3 className="text-xl font-black text-gray-900 group-hover:text-[#2E5B50] transition tracking-tight">
                1. परीक्षा मॉड्यूल (Examination Module)
              </h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                मैट्रिक (10वीं) एवं इंटर (12वीं) बोर्ड परीक्षा फॉर्म वितरण, परीक्षा फॉर्म जमा ट्रैकिंग, ₹1400 / ₹1140 शुल्क रसीद, OCR इम्पोर्ट एवं दैनिक रोकड़ प्रबंधन।
              </p>

              {/* Feature Chips */}
              <div className="grid grid-cols-2 gap-2 my-5 text-xs">
                <div className="p-2.5 bg-[#FAF9F5] rounded-xl border border-[#E8E4D5] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="text-gray-800 font-semibold">परीक्षा फॉर्म वितरण/जमा</span>
                </div>
                <div className="p-2.5 bg-[#FAF9F5] rounded-xl border border-[#E8E4D5] flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="text-gray-800 font-semibold">शुल्क स्लैब ₹1400 / ₹1140</span>
                </div>
                <div className="p-2.5 bg-[#FAF9F5] rounded-xl border border-[#E8E4D5] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="text-gray-800 font-semibold">AI PDF/इमेज OCR रीडर</span>
                </div>
                <div className="p-2.5 bg-[#FAF9F5] rounded-xl border border-[#E8E4D5] flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="text-gray-800 font-semibold">दैनिक रोकड़ पर्ची (Day Book)</span>
                </div>
              </div>

              {/* Progress Summary */}
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-950 font-bold">फॉर्म जमा प्रगति (Submission Status):</span>
                  <strong className="text-emerald-800 font-mono">
                    {examFormsSubmitted} / {examTotalCount} ({examTotalCount > 0 ? Math.round((examFormsSubmitted / examTotalCount) * 100) : 0}%)
                  </strong>
                </div>
                <div className="w-full h-2 bg-emerald-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${examTotalCount > 0 ? (examFormsSubmitted / examTotalCount) * 100 : 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-emerald-900 pt-1">
                  <span>पूर्ण भुगतान: {examPaidCount} छात्र</span>
                  <span className="font-mono font-bold">संकलन: ₹{examTotalFee.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="mt-6 pt-4 border-t border-gray-200/80 flex items-center justify-between">
              <span className="text-xs font-bold text-[#2E5B50] group-hover:underline">
                परीक्षा कार्यप्रणाली खोलें &rarr;
              </span>
              <div className="px-5 py-2.5 rounded-2xl bg-[#2E5B50] group-hover:bg-[#23463E] text-white font-bold text-xs shadow-md flex items-center gap-2 transition">
                <span>परीक्षा मॉड्यूल खोलें</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* CARD 2: REGISTRATION MODULE (इंटरमीडिएट पंजीकरण एवं ₹515 शुल्क) */}
          {/* ========================================================= */}
          <div 
            onClick={onSelectRegistration}
            className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white/80 backdrop-blur-2xl border-2 border-teal-200/90 hover:border-teal-600 shadow-xl hover:shadow-2xl transition-all duration-300 p-7 flex flex-col justify-between hover:-translate-y-1"
          >
            {/* Top Accent Gradient */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-teal-500 via-emerald-500 to-teal-700" />

            <div>
              {/* Header inside Card */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-teal-700 to-emerald-900 text-white flex items-center justify-center shadow-lg border border-white/40 group-hover:scale-105 transition">
                  <UserCheck className="w-8 h-8 text-teal-200" />
                </div>
                <span className="px-3 py-1 bg-teal-100 text-teal-900 font-bold rounded-full text-xs border border-teal-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-teal-700" />
                  <span>कार्ड 2 &bull; नया पंजीकरण मॉड्यूल</span>
                </span>
              </div>

              <h3 className="text-xl font-black text-gray-900 group-hover:text-teal-700 transition tracking-tight">
                2. पंजीकरण मॉड्यूल (Registration Module)
              </h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                इंटरमीडिएट (Science, Arts, Commerce, Vocational) छात्रों का नया ऑनलाइन पंजीकरण, <strong>प्रत्येक छात्र से ₹515 शुल्क संकलन</strong>, तथा आधार, अपार (कारण सहित), TC एवं जाति प्रमाणपत्र संकलन।
              </p>

              {/* Feature Chips */}
              <div className="grid grid-cols-2 gap-2 my-5 text-xs">
                <div className="p-2.5 bg-teal-50/50 rounded-xl border border-teal-200/70 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-teal-700 shrink-0" />
                  <span className="text-gray-800 font-semibold">निर्धारित शुल्क: ₹515 (Flat)</span>
                </div>
                <div className="p-2.5 bg-teal-50/50 rounded-xl border border-teal-200/70 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
                  <span className="text-gray-800 font-semibold">AADHAR, APAAR (Reason)</span>
                </div>
                <div className="p-2.5 bg-teal-50/50 rounded-xl border border-teal-200/70 flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-teal-700 shrink-0" />
                  <span className="text-gray-800 font-semibold">TC (All) & जाति (EBC/SC/ST)</span>
                </div>
                <div className="p-2.5 bg-teal-50/50 rounded-xl border border-teal-200/70 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-700 shrink-0" />
                  <span className="text-gray-800 font-semibold">इमेज / PDF / टेक्स्ट अपलोड</span>
                </div>
              </div>

              {/* Registration Metrics Box */}
              <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-teal-950 font-bold">पंजीकरण स्थिति (Registration Status):</span>
                  <strong className="text-teal-900 font-mono font-bold">
                    {regPaidCount} / {regTotalCount} छात्र शुल्क प्राप्त
                  </strong>
                </div>
                <div className="w-full h-2 bg-teal-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-teal-600 rounded-full transition-all duration-500"
                    style={{ width: `${regTotalCount > 0 ? (regPaidCount / regTotalCount) * 100 : 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-teal-900 pt-1">
                  <span>दस्तावेज अलर्ट: {regMissingDocs} छात्र</span>
                  <span className="font-mono font-bold">कुल ₹515 संकलन: ₹{regTotalFee.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="mt-6 pt-4 border-t border-gray-200/80 flex items-center justify-between">
              <span className="text-xs font-bold text-teal-700 group-hover:underline">
                नया पंजीकरण एवं ₹515 शुल्क लें &rarr;
              </span>
              <div className="px-5 py-2.5 rounded-2xl bg-teal-700 group-hover:bg-teal-800 text-white font-bold text-xs shadow-md flex items-center gap-2 transition">
                <span>पंजीकरण मॉड्यूल खोलें</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
