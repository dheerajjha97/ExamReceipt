import React, { useMemo, useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  IndianRupee, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  BarChart3, 
  PieChart as PieChartIcon, 
  ArrowUpRight, 
  Calendar, 
  Layers, 
  GraduationCap, 
  UserCheck, 
  Receipt, 
  Settings, 
  Menu,
  ShieldCheck,
  CreditCard,
  Building2,
  School,
  Sparkles,
  ArrowRight,
  Filter,
  DollarSign
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Student, RegistrationStudent, InstituteSettings, Transaction } from '../types';
import { PWAInstallButton } from './PWA/PWAInstallButton';

interface MainDashboardHubProps {
  students: Student[];
  registrationStudents: RegistrationStudent[];
  transactions: Transaction[];
  settings: InstituteSettings;
  onSelectExamination: () => void;
  onSelectRegistration: () => void;
  onSelectLifecycle?: () => void;
  onOpenDailySettlement: () => void;
  onOpenSettings: () => void;
  onOpenSessionManager?: () => void;
  onOpenDrawer?: () => void;
}

const STREAM_COLORS = ['#4f46e5', '#0d9488', '#d97706', '#9333ea', '#e11d48'];
const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
const PAYMENT_STATUS_COLORS = {
  PAID: '#10b981',
  UNPAID: '#ef4444',
  PARTIAL: '#f59e0b',
};

export const MainDashboardHub: React.FC<MainDashboardHubProps> = ({
  students,
  registrationStudents,
  transactions,
  settings,
  onSelectExamination,
  onSelectRegistration,
  onSelectLifecycle,
  onOpenDailySettlement,
  onOpenSettings,
  onOpenSessionManager,
  onOpenDrawer,
}) => {
  const [timeFilter, setTimeFilter] = useState<'ALL' | '7D' | '30D'>('ALL');

  // ----------------------------------------------------
  // 1. CORE AGGREGATED NUMBERS & METRICS
  // ----------------------------------------------------
  const metrics = useMemo(() => {
    // 12th Exam numbers
    const examTotal = students.length;
    const examPaidStudents = students.filter(s => s.paymentStatus === 'PAID');
    const examPaidCount = examPaidStudents.length;
    const examUnpaidCount = examTotal - examPaidCount;
    const examCollected = students.reduce((sum, s) => sum + (s.paidAmount || 0), 0);
    const examExpectedFee = students.reduce((sum, s) => {
      const base = s.totalFee || (s.examType === 'REGULAR' ? settings.regularExamFee : settings.bettermentExamFee) || 1400;
      return sum + base;
    }, 0);
    const examDue = Math.max(0, examExpectedFee - examCollected);
    const examFormsSubmitted = students.filter(s => s.formIssueStatus === 'SUBMITTED').length;

    // 11th Registration numbers
    const regTotal = registrationStudents.length;
    const regPaidStudents = registrationStudents.filter(s => s.paymentStatus === 'PAID');
    const regPaidCount = regPaidStudents.length;
    const regUnpaidCount = regTotal - regPaidCount;
    const regCollected = registrationStudents.reduce((sum, s) => {
      if (s.paymentStatus === 'PAID') {
        return sum + (s.paidAmount || s.registrationFee || (s.feeBreakup?.totalFee) || 515);
      }
      return sum + (s.paidAmount || 0);
    }, 0);
    const regExpectedFee = registrationStudents.reduce((sum, s) => {
      return sum + (s.registrationFee || (s.boardName?.toUpperCase().includes('BSEB') ? 515 : 715));
    }, 0);
    const regDue = Math.max(0, regExpectedFee - regCollected);

    // Online Charges
    const totalOnlineCharges = students.reduce((sum, s) => sum + (s.onlineCharge || 0), 0);

    // Grand Totals
    const grandTotalStudents = examTotal + regTotal;
    const grandTotalPaid = examPaidCount + regPaidCount;
    const grandTotalUnpaid = examUnpaidCount + regUnpaidCount;
    const grandTotalCollected = examCollected + regCollected;
    const grandTotalExpected = examExpectedFee + regExpectedFee;
    const grandTotalDue = examDue + regDue;
    const overallClearanceRate = grandTotalStudents > 0 ? Math.round((grandTotalPaid / grandTotalStudents) * 100) : 0;

    // Today's Live Counter
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayTxns = transactions.filter(t => t.paymentDate && t.paymentDate.startsWith(todayStr));
    const todayCollection = todayTxns.reduce((sum, t) => sum + (t.paidAmount || 0), 0);
    const todayCount = todayTxns.length;
    const todayCash = todayTxns.filter(t => t.paymentMode === 'CASH').reduce((sum, t) => sum + (t.paidAmount || 0), 0);
    const todayOnline = todayCollection - todayCash;

    return {
      examTotal,
      examPaidCount,
      examUnpaidCount,
      examCollected,
      examExpectedFee,
      examDue,
      examFormsSubmitted,
      regTotal,
      regPaidCount,
      regUnpaidCount,
      regCollected,
      regExpectedFee,
      regDue,
      totalOnlineCharges,
      grandTotalStudents,
      grandTotalPaid,
      grandTotalUnpaid,
      grandTotalCollected,
      grandTotalExpected,
      grandTotalDue,
      overallClearanceRate,
      todayCollection,
      todayCount,
      todayCash,
      todayOnline,
    };
  }, [students, registrationStudents, transactions, settings]);

  // ----------------------------------------------------
  // 2. TIMELINE COLLECTION GRAPH DATA (Area Chart)
  // ----------------------------------------------------
  const timelineData = useMemo(() => {
    const dateMap: { [date: string]: { date: string; exam: number; reg: number; total: number } } = {};

    // From transactions
    transactions.forEach(t => {
      const d = t.paymentDate ? t.paymentDate.slice(0, 10) : '2026-09-01';
      if (!dateMap[d]) {
        dateMap[d] = { date: d, exam: 0, reg: 0, total: 0 };
      }
      dateMap[d].exam += t.paidAmount || 0;
      dateMap[d].total += t.paidAmount || 0;
    });

    // From registration students
    registrationStudents.forEach(s => {
      if (s.paymentStatus === 'PAID' && s.paymentDate) {
        const d = s.paymentDate.slice(0, 10);
        if (!dateMap[d]) {
          dateMap[d] = { date: d, exam: 0, reg: 0, total: 0 };
        }
        const amt = s.paidAmount || s.registrationFee || 515;
        dateMap[d].reg += amt;
        dateMap[d].total += amt;
      }
    });

    const sorted = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));

    // If no transactions exist, create sample smooth curve representation
    if (sorted.length === 0) {
      return [
        { date: '01 Sep', exam: 4200, reg: 2575, total: 6775 },
        { date: '03 Sep', exam: 8400, reg: 4120, total: 12520 },
        { date: '05 Sep', exam: 14000, reg: 7725, total: 21725 },
        { date: '07 Sep', exam: 22400, reg: 12875, total: 35275 },
        { date: '09 Sep', exam: 33600, reg: 18025, total: 51625 },
        { date: '11 Sep', exam: metrics.examCollected || 45000, reg: metrics.regCollected || 25000, total: metrics.grandTotalCollected || 70000 },
      ];
    }

    return sorted.map(item => {
      const parts = item.date.split('-');
      const formatted = parts.length === 3 ? `${parts[2]}/${parts[1]}` : item.date;
      return {
        ...item,
        date: formatted,
      };
    });
  }, [transactions, registrationStudents, metrics]);

  // ----------------------------------------------------
  // 3. STREAM DISTRIBUTION GRAPH DATA (Science, Arts, Commerce)
  // ----------------------------------------------------
  const streamData = useMemo(() => {
    const streams: { [key: string]: { name: string; examCount: number; regCount: number; totalCount: number; totalFee: number } } = {
      'Science': { name: 'Science (I.Sc)', examCount: 0, regCount: 0, totalCount: 0, totalFee: 0 },
      'Arts': { name: 'Arts (I.A)', examCount: 0, regCount: 0, totalCount: 0, totalFee: 0 },
      'Commerce': { name: 'Commerce (I.Com)', examCount: 0, regCount: 0, totalCount: 0, totalFee: 0 },
      'Vocational': { name: 'Vocational', examCount: 0, regCount: 0, totalCount: 0, totalFee: 0 },
    };

    students.forEach(s => {
      const str = (s.stream || '').toLowerCase();
      let key = 'Arts';
      if (str.includes('sci')) key = 'Science';
      else if (str.includes('com')) key = 'Commerce';
      else if (str.includes('voc')) key = 'Vocational';
      
      streams[key].examCount += 1;
      streams[key].totalCount += 1;
      streams[key].totalFee += (s.paidAmount || 0);
    });

    registrationStudents.forEach(s => {
      const str = (s.stream || '').toLowerCase();
      let key = 'Arts';
      if (str.includes('sci')) key = 'Science';
      else if (str.includes('com')) key = 'Commerce';
      else if (str.includes('voc')) key = 'Vocational';

      streams[key].regCount += 1;
      streams[key].totalCount += 1;
      if (s.paymentStatus === 'PAID') {
        streams[key].totalFee += (s.paidAmount || s.registrationFee || 515);
      }
    });

    return Object.values(streams).filter(item => item.totalCount > 0);
  }, [students, registrationStudents]);

  // ----------------------------------------------------
  // 4. CATEGORY BREAKDOWN DATA (General, BC, EBC, SC, ST)
  // ----------------------------------------------------
  const categoryData = useMemo(() => {
    const cats: { [key: string]: { name: string; count: number; fee: number } } = {
      'General': { name: 'General', count: 0, fee: 0 },
      'BC': { name: 'BC (OBC-2)', count: 0, fee: 0 },
      'EBC': { name: 'EBC (OBC-1)', count: 0, fee: 0 },
      'SC': { name: 'SC (अनु. जाति)', count: 0, fee: 0 },
      'ST': { name: 'ST (अनु. जन.)', count: 0, fee: 0 },
    };

    students.forEach(s => {
      const c = (s.casteCategory || 'General') as string;
      if (cats[c]) {
        cats[c].count += 1;
        cats[c].fee += (s.paidAmount || 0);
      } else {
        cats['General'].count += 1;
        cats['General'].fee += (s.paidAmount || 0);
      }
    });

    registrationStudents.forEach(s => {
      const c = (s.casteCategory || 'General') as string;
      if (cats[c]) {
        cats[c].count += 1;
        if (s.paymentStatus === 'PAID') {
          cats[c].fee += (s.paidAmount || s.registrationFee || 515);
        }
      } else {
        cats['General'].count += 1;
        if (s.paymentStatus === 'PAID') {
          cats['General'].fee += (s.paidAmount || s.registrationFee || 515);
        }
      }
    });

    return Object.values(cats).filter(c => c.count > 0);
  }, [students, registrationStudents]);

  // ----------------------------------------------------
  // 5. PAYMENT MODE & STATUS PIE DATA
  // ----------------------------------------------------
  const paymentStatusPie = useMemo(() => {
    return [
      { name: 'शुल्क पूर्ण (Paid)', value: metrics.grandTotalPaid, color: '#10b981' },
      { name: 'शुल्क शेष (Unpaid)', value: metrics.grandTotalUnpaid, color: '#ef4444' },
    ].filter(item => item.value > 0);
  }, [metrics]);

  const paymentModeData = useMemo(() => {
    let cash = 0;
    let upi = 0;
    let online = 0;

    transactions.forEach(t => {
      if (t.paymentMode === 'CASH') cash += (t.paidAmount || 0);
      else if (t.paymentMode === 'UPI') upi += (t.paidAmount || 0);
      else online += (t.paidAmount || 0);
    });

    registrationStudents.forEach(s => {
      if (s.paymentStatus === 'PAID') {
        const amt = s.paidAmount || s.registrationFee || 515;
        if (s.paymentMode === 'CASH') cash += amt;
        else if (s.paymentMode === 'UPI') upi += amt;
        else online += amt;
      }
    });

    return [
      { name: 'नकद (Cash Counter)', amount: cash, count: transactions.filter(t => t.paymentMode === 'CASH').length },
      { name: 'UPI / QR Code', amount: upi, count: transactions.filter(t => t.paymentMode === 'UPI').length },
      { name: 'नेट बैंकिंग / कार्ड', amount: online, count: transactions.filter(t => t.paymentMode !== 'CASH' && t.paymentMode !== 'UPI').length },
    ].filter(item => item.amount > 0 || item.count > 0);
  }, [transactions, registrationStudents]);

  // ----------------------------------------------------
  // 6. MODULE COMPARISON DATA (12th Exam vs 11th Reg)
  // ----------------------------------------------------
  const moduleComparisonData = useMemo(() => {
    return [
      {
        module: '12वीं परीक्षा फॉर्म',
        कुल_छात्र: metrics.examTotal,
        पूर्ण_छात्र: metrics.examPaidCount,
        संकलित_राशि: metrics.examCollected,
        अपेक्षित_राशि: metrics.examExpectedFee,
      },
      {
        module: '11वीं पंजीयन',
        कुल_छात्र: metrics.regTotal,
        पूर्ण_छात्र: metrics.regPaidCount,
        संकलित_राशि: metrics.regCollected,
        अपेक्षित_राशि: metrics.regExpectedFee,
      }
    ];
  }, [metrics]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 font-sans">
      
      {/* ======================================================== */}
      {/* 1. TOP INSTITUTION & LIVE EXECUTIVE ACTION BAR */}
      {/* ======================================================== */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <School className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 font-bold rounded-full text-xs border border-indigo-400/30">
                  BSEB CODE: {settings.code || '31337'}
                </span>
                <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 font-bold rounded-full text-xs border border-amber-400/30">
                  सत्र: {settings.academicYear || '2025-2027'}
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-semibold rounded-full text-xs flex items-center gap-1.5 border border-emerald-400/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>लाइव एनालिटिक्स</span>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight">
                {settings.name || 'उच्च माध्यमिक विद्यालय / इंटर कॉलेज'}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {settings.address || 'बिहार'} &bull; केंद्रीय सांख्यिकी एवं वित्तीय ग्राफ डैशबोर्ड
              </p>
            </div>
          </div>

          {/* Action Navigation Controls */}
          <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto justify-start lg:justify-end">
            {onOpenDrawer && (
              <button
                onClick={onOpenDrawer}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
                title="नेविगेशन ड्रॉवर खोलें"
              >
                <Menu className="w-4 h-4" />
                <span>मेनू ड्रॉवर</span>
              </button>
            )}

            <button
              onClick={onSelectExamination}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              <span>12वीं परीक्षा</span>
            </button>

            <button
              onClick={onSelectRegistration}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>11वीं पंजीयन</span>
            </button>

            {onSelectLifecycle && (
              <button
                onClick={onSelectLifecycle}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>4-चरण पासबुक</span>
              </button>
            )}

            <button
              onClick={onOpenDailySettlement}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-100" />
              <span>दैनिक रोकड़</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="सेटिंग्स"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. TOP NUMERICAL KPI CARDS (THE NUMBERS) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Gross Collection */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">कुल संकलित शुल्क</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              ₹{metrics.grandTotalCollected.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              {metrics.overallClearanceRate}%
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>12th Exam: <strong>₹{metrics.examCollected.toLocaleString('en-IN')}</strong></span>
            <span>11th Reg: <strong>₹{metrics.regCollected.toLocaleString('en-IN')}</strong></span>
          </div>
        </div>

        {/* KPI 2: Total Students Enrolled */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">कुल नामांकित छात्र</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {metrics.grandTotalStudents}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              कुल छात्र (2 सत्र)
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>12वीं: <strong>{metrics.examTotal} छात्र</strong></span>
            <span>11वीं: <strong>{metrics.regTotal} छात्र</strong></span>
          </div>
        </div>

        {/* KPI 3: Clearance vs Pending Due */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">भुगतान स्थिति (Clearance)</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
              {metrics.grandTotalPaid}
            </span>
            <span className="text-xs font-bold text-slate-500">
              / {metrics.grandTotalStudents} पूर्ण
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="text-rose-600 font-bold">शेष बकाया: {metrics.grandTotalUnpaid} छात्र</span>
            <span className="font-mono font-bold text-slate-700">₹{metrics.grandTotalDue.toLocaleString('en-IN')} Due</span>
          </div>
        </div>

        {/* KPI 4: Today's Live Settlement Counter */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">आज का लाइव संकलन (Today)</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">
              ₹{metrics.todayCollection.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
              {metrics.todayCount} रसीदें
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>नकद: <strong>₹{metrics.todayCash.toLocaleString('en-IN')}</strong></span>
            <span>ऑनलाइन/UPI: <strong>₹{metrics.todayOnline.toLocaleString('en-IN')}</strong></span>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 3. PRIMARY ANALYTICS GRAPHS (THE GRAPHS) */}
      {/* ======================================================== */}

      {/* ROW 1: REVENUE TIMELINE GRAPH + STREAM DISTRIBUTION GRAPH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRAPH 1: Collection Timeline (Area Chart) - Spans 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  दैनिक शुल्क संकलन प्रवाह (Revenue Timeline Trend)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                दिनांकवार 12वीं परीक्षा एवं 11वीं पंजीयन शुल्क वसूली की गति
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 font-semibold block">कुल संकलन</span>
              <span className="text-sm font-black text-indigo-700 font-mono">₹{metrics.grandTotalCollected.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="examRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip 
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'राशि']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  name="कुल संकलन (₹ Total)" 
                  stroke="#4f46e5" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#totalRevenueGrad)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="exam" 
                  name="12वीं परीक्षा शुल्क (₹ Exam)" 
                  stroke="#0d9488" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#examRevenueGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAPH 2: Stream Distribution (Pie / Donut Chart) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-teal-600" />
                <h2 className="text-base font-black text-slate-900">
                  संकायवार छात्र वितरण
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Science, Arts, Commerce अनुपात</p>
            </div>
          </div>

          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={streamData}
                  dataKey="totalCount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {streamData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STREAM_COLORS[index % STREAM_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any, name: any) => [`${val} छात्र`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900 font-mono">{metrics.grandTotalStudents}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">कुल छात्र</span>
            </div>
          </div>

          {/* Stream Legend / Numbers Strip */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            {streamData.map((s, idx) => (
              <div key={s.name} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STREAM_COLORS[idx % STREAM_COLORS.length] }} />
                  <span className="font-bold text-slate-700 truncate">{s.name.split(' ')[0]}</span>
                </div>
                <strong className="font-mono text-slate-900 ml-1">{s.totalCount}</strong>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ROW 2: MODULE COMPARISON BAR GRAPH + CATEGORY WISE DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* GRAPH 3: Module Targets vs Realization (Bar Chart) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  12वीं परीक्षा बनाम 11वीं पंजीयन वित्तीय तुलना
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">अपेक्षित बजट (Target) बनाम वास्तविक प्राप्त शुल्क</p>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moduleComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="module" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'राशि']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="अपेक्षित_राशि" name="अपेक्षित लक्ष्य (Target ₹)" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="संकलित_राशि" name="प्राप्त शुल्क (Collected ₹)" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAPH 4: Category Distribution (General, BC, EBC, SC, ST) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" />
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  कोटिवार छात्र संख्या एवं शुल्क योगदान (Category-Wise)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">General, BC, EBC, SC, ST आरक्षण आँकड़े</p>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                <Tooltip 
                  formatter={(val: any, name: any) => [name === 'fee' ? `₹${Number(val).toLocaleString('en-IN')}` : `${val} छात्र`, name === 'fee' ? 'संकलित शुल्क' : 'छात्र संख्या']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="छात्र संख्या" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 4. COMPREHENSIVE NUMERICAL DATA TABLES (THE NUMBERS) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* NUMERICAL TABLE 1: Stream Breakdown Matrix */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm">
          <h3 className="text-base font-black text-slate-900 mb-3 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span>संकायवार संख्यात्मक विवरण तालिका (Stream Matrix)</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">संकाय (Stream)</th>
                  <th className="py-2.5 px-2 text-center">12वीं</th>
                  <th className="py-2.5 px-2 text-center">11वीं</th>
                  <th className="py-2.5 px-2 text-center">कुल छात्र</th>
                  <th className="py-2.5 px-3 text-right">संकलित राशि</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {streamData.map((item, idx) => (
                  <tr key={item.name} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STREAM_COLORS[idx % STREAM_COLORS.length] }} />
                      <span>{item.name}</span>
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono">{item.examCount}</td>
                    <td className="py-2.5 px-2 text-center font-mono">{item.regCount}</td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-900 bg-slate-50 rounded-md">
                      {item.totalCount}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                      ₹{item.totalFee.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100/70 font-bold text-slate-900 border-t border-slate-200">
                <tr>
                  <td className="py-2.5 px-3">महायोग (Grand Total)</td>
                  <td className="py-2.5 px-2 text-center font-mono">{metrics.examTotal}</td>
                  <td className="py-2.5 px-2 text-center font-mono">{metrics.regTotal}</td>
                  <td className="py-2.5 px-2 text-center font-mono font-black">{metrics.grandTotalStudents}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-800">
                    ₹{metrics.grandTotalCollected.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* NUMERICAL TABLE 2: Category Breakdown Matrix */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm">
          <h3 className="text-base font-black text-slate-900 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-600" />
            <span>कोटिवार आरक्षण एवं शुल्क तालिका (Category Matrix)</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">श्रेणी (Caste Category)</th>
                  <th className="py-2.5 px-2 text-center">कुल छात्र</th>
                  <th className="py-2.5 px-2 text-center">प्रतिशत (%)</th>
                  <th className="py-2.5 px-3 text-right">संकलित राशि</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categoryData.map((c, idx) => (
                  <tr key={c.name} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }} />
                      <span>{c.name}</span>
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-900">
                      {c.count} छात्र
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono text-slate-600">
                      {metrics.grandTotalStudents > 0 ? Math.round((c.count / metrics.grandTotalStudents) * 100) : 0}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-700">
                      ₹{c.fee.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100/70 font-bold text-slate-900 border-t border-slate-200">
                <tr>
                  <td className="py-2.5 px-3">कुल छात्र व राशि</td>
                  <td className="py-2.5 px-2 text-center font-mono font-black">{metrics.grandTotalStudents}</td>
                  <td className="py-2.5 px-2 text-center font-mono font-black">100%</td>
                  <td className="py-2.5 px-3 text-right font-mono font-black text-indigo-900">
                    ₹{metrics.grandTotalCollected.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 5. PAYMENT METHODS & CASHIER SHIFT NUMBERS */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider block">वित्तीय माध्यम विश्लेषण</span>
            <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
              भुगतान माध्यम एवं दैनिक रोकड़ वितरण (Payment Modes & Counters)
            </h3>
          </div>
          <button
            onClick={onOpenDailySettlement}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Receipt className="w-4 h-4" />
            <span>दैनिक रोकड़ पर्ची खोलें &rarr;</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {paymentModeData.map((mode, i) => (
            <div key={mode.name} className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60">
              <span className="text-xs text-slate-400 font-semibold block">{mode.name}</span>
              <div className="mt-1 flex items-baseline justify-between">
                <strong className="text-xl font-black text-white font-mono">₹{mode.amount.toLocaleString('en-IN')}</strong>
                <span className="text-xs text-indigo-300 font-mono font-bold">{mode.count} ट्रांजेक्शन</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
