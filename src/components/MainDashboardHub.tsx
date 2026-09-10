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
  Users,
  TrendingUp,
  Sparkle
} from 'lucide-react';
import { Student, RegistrationStudent, InstituteSettings, Transaction } from '../types';
import { PWAInstallButton } from './PWA/PWAInstallButton';

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
  const regTotalFee = registrationStudents.reduce((acc, s) => {
    if (s.paymentStatus === 'PAID') {
      return acc + (s.registrationFee || (s.feeBreakup?.totalFee) || 515);
    }
    return acc;
  }, 0);
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
      {/* Top Vibrant Hero Institutional Banner */}
      <div className="relative overflow-hidden rounded-3xl sm:rounded-4xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-9 shadow-2xl border border-indigo-800/40">
        {/* Dynamic Colorful Glow Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/30 to-purple-500/20 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-0.5 shadow-glow-indigo shrink-0">
              <div className="w-full h-full bg-slate-900/90 rounded-[14px] sm:rounded-[22px] flex items-center justify-center backdrop-blur-md">
                <School className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 font-bold rounded-full text-xs border border-indigo-400/30 shadow-sm backdrop-blur-md">
                  BSEB कोड: {settings.code || '31337'}
                </span>
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 font-bold rounded-full text-xs border border-amber-400/30 shadow-sm backdrop-blur-md">
                  सत्र {settings.academicYear || '2026-2027'}
                </span>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-semibold rounded-full text-xs border border-emerald-400/30 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>क्लाउड सिंक सक्रिय</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-2.5 tracking-tight font-heading">
                {settings.name || 'उच्च माध्यमिक विद्यालय / इंटर कॉलेज'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
                <span>{settings.address || 'बिहार'}</span>
                <span>&bull;</span>
                <span className="text-indigo-300 font-medium">डिजिटल परीक्षा प्रपत्र, पंजीकरण एवं रसीद पोर्टल (M3 Vibrant)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
            <PWAInstallButton />
            <button
              onClick={onOpenDailySettlement}
              className="px-4.5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 hover:shadow-emerald-500/30 transition transform hover:-translate-y-0.5 active:scale-95"
            >
              <Receipt className="w-4 h-4 text-emerald-200" />
              <span>दैनिक रोकड़ पर्ची (Day Book)</span>
            </button>
            <button
              onClick={onOpenSettings}
              className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition shadow-md hover:scale-105"
              title="सेटिंग्स"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Aggregate Mini Ribbon with Vibrant Gradient Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-7 pt-6 border-t border-slate-800/80">
          <div className="p-3.5 bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-2xl border border-slate-700/60 backdrop-blur-md">
            <span className="text-slate-400 block text-[11px] font-medium">कुल परीक्षा परीक्षार्थी</span>
            <div className="flex items-baseline justify-between mt-1">
              <strong className="text-xl font-black text-white">{examTotalCount} छात्र</strong>
              <span className="text-[10px] text-indigo-400 font-bold px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-800">10th/12th</span>
            </div>
          </div>
          <div className="p-3.5 bg-gradient-to-br from-indigo-950/60 to-purple-950/40 rounded-2xl border border-indigo-700/40 backdrop-blur-md">
            <span className="text-indigo-300 block text-[11px] font-medium">कुल इंटर पंजीकरण</span>
            <div className="flex items-baseline justify-between mt-1">
              <strong className="text-xl font-black text-indigo-200">{regTotalCount} छात्र</strong>
              <span className="text-[10px] text-indigo-300 font-bold px-2 py-0.5 rounded-full bg-indigo-900/80 border border-indigo-600/40">11th/12th</span>
            </div>
          </div>
          <div className="p-3.5 bg-gradient-to-br from-emerald-950/60 to-teal-950/40 rounded-2xl border border-emerald-700/40 backdrop-blur-md">
            <span className="text-emerald-300 block text-[11px] font-medium">कुल परीक्षा शुल्क संकलित</span>
            <div className="flex items-baseline justify-between mt-1">
              <strong className="text-xl font-black text-emerald-300">₹{examTotalFee.toLocaleString('en-IN')}</strong>
              <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-900/80 border border-emerald-600/40">प्राप्त</span>
            </div>
          </div>
          <div className="p-3.5 bg-gradient-to-br from-teal-950/60 to-cyan-950/40 rounded-2xl border border-teal-700/40 backdrop-blur-md">
            <span className="text-teal-300 block text-[11px] font-medium">कुल पंजीकरण शुल्क संकलन</span>
            <div className="flex items-baseline justify-between mt-1">
              <strong className="text-xl font-black text-teal-300">₹{regTotalFee.toLocaleString('en-IN')}</strong>
              <span className="text-[10px] text-teal-400 font-bold px-2 py-0.5 rounded-full bg-teal-900/80 border border-teal-600/40">₹515/₹715</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: TWO MAIN VIBRANT GRADIENT MODULE CARDS (Material 3 Style) */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold uppercase tracking-wider shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>कार्यक्षेत्र चयन (Select Module)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-heading tracking-tight">
            प्रबंधन मॉड्यूल का चयन करें
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            परीक्षा फॉर्म एवं परीक्षा शुल्क अथवा नए 11वीं/12वीं इंटर पंजीकरण में से चुनें।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ========================================================= */}
          {/* CARD 1: EXAMINATION MODULE (Modern Indigo Gradient Card) */}
          {/* ========================================================= */}
          <div 
            onClick={onSelectExamination}
            className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white border border-indigo-100 shadow-xl shadow-indigo-500/10 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 p-7 flex flex-col justify-between hover:-translate-y-1.5 active:scale-[0.99]"
          >
            {/* Top Accent Gradient Ribbon */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500" />

            <div>
              {/* Header inside Card */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition">
                  <GraduationCap className="w-9 h-9 text-indigo-100" />
                </div>
                <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-bold rounded-full text-xs border border-indigo-200 flex items-center gap-1 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  <span>कार्ड 1 &bull; सक्रिय मॉड्यूल</span>
                </span>
              </div>

              <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition tracking-tight font-heading">
                1. परीक्षा मॉड्यूल (Examination Module)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                मैट्रिक (10वीं) एवं इंटर (12वीं) बोर्ड परीक्षा फॉर्म वितरण, परीक्षा फॉर्म जमा ट्रैकिंग, ₹1400 / ₹1140 शुल्क रसीद, OCR इम्पोर्ट एवं दैनिक रोकड़ प्रबंधन।
              </p>

              {/* Feature Chips */}
              <div className="grid grid-cols-2 gap-2.5 my-5 text-xs">
                <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100/80 flex items-center gap-2.5 transition group-hover:bg-indigo-50">
                  <div className="p-1.5 rounded-xl bg-indigo-600 text-white shrink-0">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-800 font-semibold">परीक्षा फॉर्म वितरण/जमा</span>
                </div>
                <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100/80 flex items-center gap-2.5 transition group-hover:bg-indigo-50">
                  <div className="p-1.5 rounded-xl bg-indigo-600 text-white shrink-0">
                    <CreditCard className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-800 font-semibold">शुल्क ₹1400 / ₹1140</span>
                </div>
                <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100/80 flex items-center gap-2.5 transition group-hover:bg-indigo-50">
                  <div className="p-1.5 rounded-xl bg-indigo-600 text-white shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-800 font-semibold">AI PDF/इमेज OCR रीडर</span>
                </div>
                <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100/80 flex items-center gap-2.5 transition group-hover:bg-indigo-50">
                  <div className="p-1.5 rounded-xl bg-indigo-600 text-white shrink-0">
                    <Receipt className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-800 font-semibold">दैनिक रोकड़ (Day Book)</span>
                </div>
              </div>

              {/* Progress Summary Card */}
              <div className="p-4.5 bg-gradient-to-br from-indigo-50/90 to-purple-50/60 rounded-2xl border border-indigo-100 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-indigo-950 font-bold">फॉर्म जमा प्रगति (Submission Status):</span>
                  <strong className="text-indigo-700 font-mono font-bold">
                    {examFormsSubmitted} / {examTotalCount} ({examTotalCount > 0 ? Math.round((examFormsSubmitted / examTotalCount) * 100) : 0}%)
                  </strong>
                </div>
                <div className="w-full h-2.5 bg-indigo-200/80 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${examTotalCount > 0 ? (examFormsSubmitted / examTotalCount) * 100 : 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-indigo-900 pt-0.5 font-medium">
                  <span>पूर्ण भुगतान: <strong>{examPaidCount} छात्र</strong></span>
                  <span className="font-mono font-bold text-indigo-700">संकलन: ₹{examTotalFee.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 group-hover:underline">
                परीक्षा कार्यप्रणाली खोलें &rarr;
              </span>
              <div className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:from-indigo-700 group-hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-2 transition">
                <span>परीक्षा मॉड्यूल खोलें</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* CARD 2: REGISTRATION MODULE (Modern Emerald & Teal Gradient Card) */}
          {/* ========================================================= */}
          <div 
            onClick={onSelectRegistration}
            className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white border border-teal-100 shadow-xl shadow-teal-500/10 hover:shadow-2xl hover:shadow-teal-500/20 transition-all duration-300 p-7 flex flex-col justify-between hover:-translate-y-1.5 active:scale-[0.99]"
          >
            {/* Top Accent Gradient Ribbon */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500" />

            <div>
              {/* Header inside Card */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-700 text-white flex items-center justify-center shadow-lg shadow-teal-500/30 group-hover:scale-105 transition">
                  <UserCheck className="w-9 h-9 text-teal-100" />
                </div>
                <span className="px-3 py-1.5 bg-teal-50 text-teal-800 font-bold rounded-full text-xs border border-teal-200 flex items-center gap-1 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>कार्ड 2 &bull; नया पंजीकरण मॉड्यूल</span>
                </span>
              </div>

              <h3 className="text-2xl font-black text-slate-900 group-hover:text-teal-700 transition tracking-tight font-heading">
                2. पंजीकरण मॉड्यूल (Registration Module)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                इंटरमीडिएट (Science, Arts, Commerce, Vocational) छात्रों का नया ऑनलाइन पंजीकरण, <strong>₹515 / ₹715 शुल्क संकलन</strong>, तथा आधार, अपार (कारण सहित), TC एवं जाति प्रमाणपत्र ऑडिट।
              </p>

              {/* Feature Chips */}
              <div className="grid grid-cols-2 gap-2.5 my-5 text-xs">
                <div className="p-3 bg-teal-50/60 rounded-2xl border border-teal-100/80 flex items-center gap-2.5 transition group-hover:bg-teal-50">
                  <div className="p-1.5 rounded-xl bg-teal-600 text-white shrink-0">
                    <CreditCard className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-800 font-semibold">शुल्क: ₹515 / ₹715</span>
                </div>
                <div className="p-3 bg-teal-50/60 rounded-2xl border border-teal-100/80 flex items-center gap-2.5 transition group-hover:bg-teal-50">
                  <div className="p-1.5 rounded-xl bg-teal-600 text-white shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-800 font-semibold">AADHAR, APAAR (Reason)</span>
                </div>
                <div className="p-3 bg-teal-50/60 rounded-2xl border border-teal-100/80 flex items-center gap-2.5 transition group-hover:bg-teal-50">
                  <div className="p-1.5 rounded-xl bg-teal-600 text-white shrink-0">
                    <FileCheck2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-800 font-semibold">TC & जाति (EBC/SC/ST)</span>
                </div>
                <div className="p-3 bg-teal-50/60 rounded-2xl border border-teal-100/80 flex items-center gap-2.5 transition group-hover:bg-teal-50">
                  <div className="p-1.5 rounded-xl bg-teal-600 text-white shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-800 font-semibold">इमेज / PDF / OCR अपलोड</span>
                </div>
              </div>

              {/* Registration Metrics Box */}
              <div className="p-4.5 bg-gradient-to-br from-teal-50/90 to-emerald-50/60 rounded-2xl border border-teal-100 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-teal-950 font-bold">पंजीकरण स्थिति (Registration Status):</span>
                  <strong className="text-teal-800 font-mono font-bold">
                    {regPaidCount} / {regTotalCount} छात्र शुल्क प्राप्त
                  </strong>
                </div>
                <div className="w-full h-2.5 bg-teal-200/80 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-teal-600 to-emerald-600 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${regTotalCount > 0 ? (regPaidCount / regTotalCount) * 100 : 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-teal-900 pt-0.5 font-medium">
                  <span>दस्तावेज अलर्ट: <strong>{regMissingDocs} छात्र</strong></span>
                  <span className="font-mono font-bold text-teal-700">कुल संकलन: ₹{regTotalFee.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-teal-700 group-hover:underline">
                नया पंजीकरण एवं शुल्क लें &rarr;
              </span>
              <div className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 group-hover:from-teal-700 group-hover:to-emerald-700 text-white font-bold text-xs shadow-md shadow-teal-600/30 flex items-center gap-2 transition">
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
