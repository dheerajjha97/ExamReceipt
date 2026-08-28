import React, { useState } from 'react';
import { Settings, Save, Building2, CheckCircle2 } from 'lucide-react';
import { InstituteSettings } from '../types';

interface SettingsModalProps {
  settings: InstituteSettings;
  onSaveSettings: (newSettings: InstituteSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<InstituteSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="bg-[#FDFCF8] p-6 rounded-2xl border border-[#E6E2D3] shadow-sm space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 border-b border-[#E6E2D3] pb-4">
        <div className="p-3 bg-[#EFECE1] text-[#5A5A40] rounded-xl border border-[#DDD8C5]">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#4A453E]">College & Examination Cell Settings</h2>
          <p className="text-xs text-[#787267]">
            Configure header branding printed on traditional school fee receipts
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-[#E2ECE9] border border-[#3B6E62] rounded-xl text-[#2E5B50] text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#2E5B50] shrink-0" />
          <span>College settings updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="space-y-1 sm:col-span-2">
            <label className="block font-semibold text-[#4A453E]">School / College Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-[#4A453E] font-bold focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="block font-semibold text-[#4A453E]">Sub-Title / Department</label>
            <input
              type="text"
              value={formData.subTitle}
              onChange={(e) => setFormData({ ...formData, subTitle: e.target.value })}
              className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="block font-semibold text-[#4A453E]">Address & District</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-[#4A453E]">College / Center Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-[#4A453E]">Academic Year / Session</label>
            <input
              type="text"
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-[#4A453E]">Default Online Charges (₹) *</label>
            <input
              type="number"
              required
              value={formData.defaultOnlineCharge}
              onChange={(e) => setFormData({ ...formData, defaultOnlineCharge: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-[#4A453E] font-bold focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
            />
            <p className="text-[10px] text-[#787267]">Automatically added as online processing charges to fee slips</p>
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-[#4A453E]">Fee Counter Clerk Name</label>
            <input
              type="text"
              value={formData.cashierName}
              onChange={(e) => setFormData({ ...formData, cashierName: e.target.value })}
              className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
            />
          </div>

        </div>

        <div className="pt-4 border-t border-[#E6E2D3] flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-lg font-semibold shadow transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>

      </form>
    </div>
  );
};
