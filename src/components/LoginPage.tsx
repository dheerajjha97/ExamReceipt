import React, { useState } from 'react';
import { KeyRound, Building2, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { verifySchoolPassword } from '../services/authService';
import feeReceiptHero from '../assets/images/fee_receipt_hero_1787937064672.jpg';

interface LoginPageProps {
  onLoginSuccess: (schoolCode: string) => void;
  defaultSchoolCode?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  defaultSchoolCode = '31337',
}) => {
  const [schoolCode, setSchoolCode] = useState(defaultSchoolCode);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanCode = schoolCode.trim();
    const cleanPass = password.trim();

    if (!cleanCode) {
      setErrorMsg('कृपया स्कूल / कॉलेज कोड दर्ज करें (Please enter School Code)');
      return;
    }

    if (!cleanPass) {
      setErrorMsg('कृपया पासवर्ड दर्ज करें (Please enter Password)');
      return;
    }

    setIsLoading(true);

    try {
      const isValid = await verifySchoolPassword(cleanCode, cleanPass);
      if (isValid) {
        onLoginSuccess(cleanCode);
      } else {
        setErrorMsg('गलत पासवर्ड! डिफ़ॉल्ट पासवर्ड 12345 है। (Incorrect password! Default is 12345)');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('लॉगिन करने में त्रुटि आई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans text-slate-100">
      {/* Background radial glow blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden relative z-10">
        
        {/* Header Hero Banner */}
        <div className="bg-slate-950/60 p-6 text-white text-center border-b border-white/10 relative">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-teal-500 to-indigo-600 p-0.5 shadow-lg shadow-teal-500/20 overflow-hidden mb-3">
            <div className="w-full h-full rounded-[14px] overflow-hidden bg-slate-900">
              <img 
                src={feeReceiptHero} 
                alt="Fee Receipt Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          
          <h1 className="text-xl font-black text-white tracking-tight">
            Matric & Inter Fee Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Board Examination Fee Management Portal
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cloud Firestore Secured Portal</span>
          </div>
        </div>

        {/* Form Area */}
        <form onSubmit={handleLogin} className="p-6 sm:p-8 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold backdrop-blur-md">
              {errorMsg}
            </div>
          )}

          {/* School Code Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-teal-400" />
              <span>स्कूल / कॉलेज कोड (School Code)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value)}
                placeholder="उदा. 31337"
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 backdrop-blur-md transition"
                required
              />
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              डिफ़ॉल्ट स्कूल कोड: <strong className="font-mono text-teal-300">31337</strong>
            </p>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <span>पासवर्ड (Password)</span>
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="पासवर्ड दर्ज करें"
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 backdrop-blur-md transition"
                required
              />
            </div>
            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              प्रथम बार लॉगिन हेतु डिफ़ॉल्ट पासवर्ड: <strong className="font-mono text-emerald-300">12345</strong>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 active:from-teal-600 active:to-emerald-700 text-white font-bold text-sm shadow-xl shadow-teal-500/25 transition-all transform-gpu hover:-translate-y-0.5 flex items-center justify-center gap-2 border border-teal-400/40 disabled:opacity-50"
          >
            {isLoading ? (
              <span>जांच जारी है...</span>
            ) : (
              <>
                <span>लॉगिन करें (Login)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Footer Helper Note */}
          <div className="pt-3 border-t border-white/10 text-center">
            <p className="text-[11px] text-slate-400">
              लॉगिन करने के बाद आप ऊपर हेडर में <strong className="text-slate-200">"पासवर्ड"</strong> बटन दबाकर नया पासवर्ड सेट कर सकते हैं।
            </p>
          </div>
        </form>

      </div>
    </div>
  );
};

