import React from 'react';
import { 
  Receipt, 
  Users, 
  UploadCloud, 
  CreditCard, 
  GitBranch, 
  Settings, 
  Plus, 
  CheckCircle2, 
  Clock, 
  IndianRupee,
  Sparkles
} from 'lucide-react';
import { GitHubConfig, InstituteSettings } from '../types';

interface HeaderProps {
  activeTab: 'students' | 'upload' | 'transactions' | 'github' | 'settings';
  setActiveTab: (tab: 'students' | 'upload' | 'transactions' | 'github' | 'settings') => void;
  totalStudentsCount: number;
  paidStudentsCount: number;
  totalCollected: number;
  totalOnlineCharges: number;
  githubConfig: GitHubConfig;
  onOpenAddStudent: () => void;
  onOpenUploadPdf: () => void;
  settings: InstituteSettings;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  totalStudentsCount,
  paidStudentsCount,
  totalCollected,
  totalOnlineCharges,
  githubConfig,
  onOpenAddStudent,
  onOpenUploadPdf,
  settings,
}) => {
  const unpaidCount = totalStudentsCount - paidStudentsCount;

  return (
    <header className="bg-[#4A453E] text-white border-b border-[#3E3A33] sticky top-0 z-30 shadow-md">
      {/* Top Banner with Institute Name */}
      <div className="bg-[#3E3A33] px-4 py-2 border-b border-[#5A554A]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="bg-[#8C5A2B]/30 text-[#E8D0B8] font-semibold px-2 py-0.5 rounded border border-[#8C5A2B]/40">
              {settings.code ? `CODE: ${settings.code}` : 'EXAM CELL'}
            </span>
            <span className="text-[#DDD8C5] font-medium truncate max-w-md">
              {settings.name} &bull; {settings.academicYear}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[#DDD8C5]">
            <span className="flex items-center gap-1.5 text-xs">
              <span className="inline-block w-2 h-2 rounded-full bg-[#A3C9A8] animate-pulse"></span>
              Online Charge Included: <strong className="text-[#A3C9A8] font-semibold">+₹{settings.defaultOnlineCharge}</strong>
            </span>

            {/* GitHub Sync Pill Status */}
            <button
              onClick={() => setActiveTab('github')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                githubConfig.token && githubConfig.repo
                  ? 'bg-[#2E5B50] text-[#E2ECE9] border border-[#B8D5CE]/50 hover:bg-[#254A41]'
                  : 'bg-[#8C5A2B]/40 text-[#FAF0E6] border border-[#E8D0B8]/50 hover:bg-[#8C5A2B]/60'
              }`}
              title="GitHub Database Sync Status"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>
                {githubConfig.token && githubConfig.repo
                  ? `GitHub DB: ${githubConfig.owner}/${githubConfig.repo}`
                  : 'Setup GitHub DB'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5A5A40] border border-[#737356] flex items-center justify-center text-white shadow-sm">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-[#FDFCF8]">
                  Matric & Inter Fee Receipt
                </h1>
                <span className="text-[10px] bg-[#5A5A40]/60 text-[#E6E2D3] border border-[#737356] px-2 py-0.5 rounded-full font-semibold">
                  Board Exam 2027
                </span>
              </div>
              <p className="text-xs text-[#C2BEB5]">
                Fee Management, PDF OCR Extraction & Traditional Slip Generator
              </p>
            </div>
          </div>

          {/* Quick Stat Counter Cards */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <div className="bg-[#3E3A33]/80 border border-[#5A554A] rounded-lg px-3 py-1.5 flex items-center gap-2.5 min-w-max">
              <div className="p-1.5 bg-[#5A5A40]/40 text-[#E6E2D3] rounded-md">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-[#C2BEB5] font-medium">Total Registered</p>
                <p className="text-sm font-bold text-[#FDFCF8]">{totalStudentsCount} Students</p>
              </div>
            </div>

            <div className="bg-[#3E3A33]/80 border border-[#5A554A] rounded-lg px-3 py-1.5 flex items-center gap-2.5 min-w-max">
              <div className="p-1.5 bg-[#2E5B50]/40 text-[#A3C9A8] rounded-md">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-[#C2BEB5] font-medium">Fee Paid</p>
                <p className="text-sm font-bold text-[#A3C9A8]">{paidStudentsCount} <span className="text-xs text-[#C2BEB5] font-normal">/ {totalStudentsCount}</span></p>
              </div>
            </div>

            <div className="bg-[#3E3A33]/80 border border-[#5A554A] rounded-lg px-3 py-1.5 flex items-center gap-2.5 min-w-max">
              <div className="p-1.5 bg-[#8C5A2B]/40 text-[#E8D0B8] rounded-md">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-[#C2BEB5] font-medium">Pending Unpaid</p>
                <p className="text-sm font-bold text-[#E8D0B8]">{unpaidCount}</p>
              </div>
            </div>

            <div className="bg-[#3E3A33]/80 border border-[#5A554A] rounded-lg px-3 py-1.5 flex items-center gap-2.5 min-w-max">
              <div className="p-1.5 bg-[#5A5A40]/40 text-[#E6E2D3] rounded-md">
                <IndianRupee className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-[#C2BEB5] font-medium">Total Revenue Collected</p>
                <p className="text-sm font-bold text-white">₹{totalCollected.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenUploadPdf}
              className="flex items-center gap-1.5 bg-[#5A5A40] hover:bg-[#484833] text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition border border-[#737356]"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload PDF / Image</span>
            </button>

            <button
              onClick={onOpenAddStudent}
              className="flex items-center gap-1.5 bg-[#3E3A33] hover:bg-[#34302A] text-[#DDD8C5] border border-[#5A554A] px-3 py-2 rounded-lg text-xs font-medium transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Student</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 mt-4 pt-2 border-t border-[#5A554A] overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md font-medium transition whitespace-nowrap ${
              activeTab === 'students'
                ? 'bg-[#5A5A40] text-white shadow-sm'
                : 'text-[#C2BEB5] hover:text-white hover:bg-[#3E3A33]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Students List & Fee Status</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md font-medium transition whitespace-nowrap ${
              activeTab === 'upload'
                ? 'bg-[#5A5A40] text-white shadow-sm'
                : 'text-[#C2BEB5] hover:text-white hover:bg-[#3E3A33]'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span className="flex items-center gap-1">
              Extract PDF List
              <span className="bg-[#A3C9A8]/20 text-[#A3C9A8] text-[9px] px-1.5 py-0.2 rounded font-mono border border-[#A3C9A8]/30">AI OCR</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md font-medium transition whitespace-nowrap ${
              activeTab === 'transactions'
                ? 'bg-[#5A5A40] text-white shadow-sm'
                : 'text-[#C2BEB5] hover:text-white hover:bg-[#3E3A33]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Transaction Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md font-medium transition whitespace-nowrap ${
              activeTab === 'github'
                ? 'bg-[#5A5A40] text-white shadow-sm'
                : 'text-[#C2BEB5] hover:text-white hover:bg-[#3E3A33]'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>GitHub Sync DB</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md font-medium transition whitespace-nowrap ml-auto ${
              activeTab === 'settings'
                ? 'bg-[#5A5A40] text-white shadow-sm'
                : 'text-[#C2BEB5] hover:text-white hover:bg-[#3E3A33]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>College Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};
