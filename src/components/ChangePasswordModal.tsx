import React, { useState } from 'react';
import { X, KeyRound, CheckCircle2, ShieldCheck } from 'lucide-react';
import { verifySchoolPassword, updateSchoolPassword } from '../services/authService';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolCode: string;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  schoolCode,
}) => {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentPass) {
      setErrorMsg('वर्तमान पासवर्ड दर्ज करें');
      return;
    }

    if (!newPass) {
      setErrorMsg('नया पासवर्ड दर्ज करें');
      return;
    }

    if (newPass.length < 4) {
      setErrorMsg('नया पासवर्ड कम से कम 4 अक्षरों का होना चाहिए');
      return;
    }

    if (newPass !== confirmPass) {
      setErrorMsg('नया पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते');
      return;
    }

    setIsSaving(true);

    try {
      const isValid = await verifySchoolPassword(schoolCode, currentPass);
      if (!isValid) {
        setErrorMsg('वर्तमान पासवर्ड गलत है');
        setIsSaving(false);
        return;
      }

      await updateSchoolPassword(schoolCode, newPass);
      setSuccessMsg('पासवर्ड सफलतापूर्वक बदल दिया गया है! (Password updated successfully)');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');

      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 1800);
    } catch (err) {
      console.error(err);
      setErrorMsg('पासवर्ड अपडेट करने में त्रुटि आई');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#FDFCF8] rounded-3xl shadow-2xl border border-[#E6E2D3] overflow-hidden text-[#4A453E]">
        
        {/* Modal Header */}
        <div className="bg-[#4A453E] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-300" />
            <h2 className="text-sm font-black">पासवर्ड बदलें (School Code: {schoolCode})</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#4A453E]">वर्तमान पासवर्ड (Current Password)</label>
            <input
              type="password"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              placeholder="वर्तमान पासवर्ड (Default: 12345)"
              className="w-full px-4 py-2.5 rounded-xl bg-[#F7F5EE] border border-[#E6E2D3] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#8C5A2B]"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#4A453E]">नया पासवर्ड (New Password)</label>
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="नया पासवर्ड दर्ज करें"
              className="w-full px-4 py-2.5 rounded-xl bg-[#F7F5EE] border border-[#E6E2D3] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#2E5B50]"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#4A453E]">नया पासवर्ड फिर से दर्ज करें (Confirm New Password)</label>
            <input
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="पुष्टि हेतु नया पासवर्ड पुनः दर्ज करें"
              className="w-full px-4 py-2.5 rounded-xl bg-[#F7F5EE] border border-[#E6E2D3] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#2E5B50]"
              required
            />
          </div>

          <div className="pt-2 flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E6E2D3] bg-[#F7F5EE] text-xs font-bold text-[#787267] hover:bg-[#E6E2D3] transition"
            >
              रद्द करें (Cancel)
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-[#2E5B50] hover:bg-[#254A41] text-white text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              {isSaving ? 'सहेज रहे हैं...' : 'सुरक्षित करें (Save Password)'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
