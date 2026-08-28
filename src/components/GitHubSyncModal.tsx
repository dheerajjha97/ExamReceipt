import React, { useState } from 'react';
import { 
  GitBranch, 
  Key, 
  FolderGit2, 
  UploadCloud, 
  DownloadCloud, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  FileCode, 
  ShieldCheck, 
  ExternalLink,
  Save,
  HelpCircle
} from 'lucide-react';
import { GitHubConfig, Student, Transaction } from '../types';
import { syncDatabaseWithGitHub } from '../services/storageService';
import githubCloudSync from '../assets/images/github_cloud_sync_1787937082775.jpg';

interface GitHubSyncModalProps {
  config: GitHubConfig;
  onSaveConfig: (updatedConfig: GitHubConfig) => void;
  students: Student[];
  transactions: Transaction[];
  onRefreshFromGitHub: (students: Student[], transactions: Transaction[]) => void;
}

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({
  config,
  onSaveConfig,
  students,
  transactions,
  onRefreshFromGitHub,
}) => {
  const [formData, setFormData] = useState<GitHubConfig>(config);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveSettings = () => {
    onSaveConfig(formData);
    setStatusMessage({
      type: 'success',
      text: 'GitHub configuration saved locally!',
    });
  };

  const handlePushToGitHub = async () => {
    if (!formData.token || !formData.owner || !formData.repo) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter your GitHub Personal Access Token, Owner, and Repository name.',
      });
      return;
    }

    setIsSyncing(true);
    setStatusMessage({ type: 'info', text: 'Pushing fee records database commit to GitHub...' });

    onSaveConfig(formData);

    const result = await syncDatabaseWithGitHub('PUSH', formData, students, transactions);
    setIsSyncing(false);

    if (result.success) {
      setStatusMessage({ type: 'success', text: result.message });
      onSaveConfig({ ...formData, lastSyncedAt: new Date().toISOString() });
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  const handlePullFromGitHub = async () => {
    if (!formData.token || !formData.owner || !formData.repo) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter your GitHub Personal Access Token, Owner, and Repository name.',
      });
      return;
    }

    setIsSyncing(true);
    setStatusMessage({ type: 'info', text: 'Fetching latest fee records database from GitHub...' });

    onSaveConfig(formData);

    const result = await syncDatabaseWithGitHub('PULL', formData);
    setIsSyncing(false);

    if (result.success && result.data) {
      setStatusMessage({ type: 'success', text: result.message });
      onRefreshFromGitHub(result.data.students, result.data.transactions);
      onSaveConfig({ ...formData, lastSyncedAt: new Date().toISOString() });
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Glassmorphic Banner with 3D Cloud Illustration */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#4A453E] to-[#3E3A33] text-white p-5 sm:p-6 rounded-3xl border border-white/20 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-white/30 shadow-2xl shrink-0 transform-gpu hover:scale-105 transition duration-300">
              <img 
                src={githubCloudSync} 
                alt="3D GitHub Cloud Sync" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-[#FDFCF8]">GitHub Repository as Database Sync</h2>
                <span className="bg-[#2E5B50]/80 backdrop-blur-md text-[#E2ECE9] text-[10px] px-2.5 py-0.5 rounded-full font-mono border border-[#3B6E62]">
                  Real-time Version Control
                </span>
              </div>
              <p className="text-xs text-[#C2BEB5] mt-1 max-w-xl">
                All student records, fee payments, and transaction history are automatically versioned and persisted inside your private GitHub Repository.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handlePushToGitHub}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#2E5B50] hover:bg-[#254A41] text-white rounded-2xl text-xs font-bold shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all transform-gpu disabled:opacity-50 border border-[#3B6E62]"
            >
              {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              <span>Push DB to GitHub</span>
            </button>

            <button
              onClick={handlePullFromGitHub}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-2xl text-xs font-bold shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all transform-gpu disabled:opacity-50 border border-[#737356]"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>Pull DB from GitHub</span>
            </button>
          </div>
        </div>
      </div>

      {/* Connection Config Form (Glassmorphism & Material 3) */}
      <div className="bg-[#FDFCF8]/90 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-[#E6E2D3] shadow-lg space-y-6">
        <div className="flex items-center justify-between border-b border-[#E6E2D3] pb-3">
          <h3 className="font-bold text-[#4A453E] text-sm flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-[#5A5A40]" />
            <span>GitHub Repository Settings</span>
          </h3>

          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="text-xs text-[#5A5A40] hover:text-[#484833] font-medium flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showInstructions ? 'Hide Setup Guide' : 'How to set up GitHub DB?'}</span>
          </button>
        </div>

        {/* Step-by-Step Instructions toggle */}
        {showInstructions && (
          <div className="bg-[#F7F5EE] border border-[#E6E2D3] rounded-xl p-4 text-xs text-[#4A453E] space-y-2">
            <p className="font-bold text-[#4A453E] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#5A5A40]" />
              <span>Easy 2-Minute GitHub Setup Instructions:</span>
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[#787267] pl-1">
              <li>Log in to GitHub and create a new repository (e.g. <code className="bg-[#FDFCF8] px-1 py-0.5 rounded text-[#4A453E] font-mono border border-[#DDD8C5]">fee-receipt-db</code>).</li>
              <li>Go to GitHub Settings &rarr; Developer Settings &rarr; Personal Access Tokens (Tokens classic).</li>
              <li>Generate a new token with <strong className="text-[#4A453E]">repo</strong> scope (full control of private repositories).</li>
              <li>Paste your GitHub username as <strong>Owner</strong>, repo name as <strong>Repository</strong>, and token below!</li>
            </ol>
          </div>
        )}

        {/* Status Alert */}
        {statusMessage && (
          <div
            className={`p-4 rounded-xl border text-xs flex items-center gap-2.5 ${
              statusMessage.type === 'success'
                ? 'bg-[#E2ECE9] border-[#3B6E62] text-[#2E5B50]'
                : statusMessage.type === 'error'
                ? 'bg-[#F9EAEA] border-[#E0A8A8] text-[#8C2B2B]'
                : 'bg-[#F7F5EE] border-[#E6E2D3] text-[#4A453E]'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#2E5B50] shrink-0" />
            ) : statusMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-[#8C2B2B] shrink-0" />
            ) : (
              <RefreshCw className="w-4 h-4 text-[#5A5A40] animate-spin shrink-0" />
            )}
            <span className="font-medium">{statusMessage.text}</span>
          </div>
        )}

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          <div className="space-y-1">
            <label className="block font-semibold text-[#4A453E]">GitHub Repository Owner / Username *</label>
            <input
              type="text"
              name="owner"
              placeholder="e.g. jhadheeraj97"
              value={formData.owner}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-[#4A453E]">Repository Name *</label>
            <input
              type="text"
              name="repo"
              placeholder="e.g. matric-inter-fee-db"
              value={formData.repo}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="block font-semibold text-[#4A453E] flex items-center justify-between">
              <span>GitHub Personal Access Token (PAT with repo scope) *</span>
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noreferrer"
                className="text-[#5A5A40] hover:underline inline-flex items-center gap-1 font-normal"
              >
                Get Token on GitHub <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <input
              type="password"
              name="token"
              placeholder="ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              value={formData.token}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg font-mono text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-[#4A453E]">Branch Name</label>
            <input
              type="text"
              name="branch"
              placeholder="main"
              value={formData.branch}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-[#4A453E]">Database File Path in Repo</label>
            <input
              type="text"
              name="filePath"
              placeholder="data/fee_database.json"
              value={formData.filePath}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg font-mono text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
            />
          </div>

          <div className="md:col-span-2 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-[#4A453E] font-semibold">
              <input
                type="checkbox"
                name="autoSync"
                checked={formData.autoSync}
                onChange={handleInputChange}
                className="rounded border-[#DDD8C5] text-[#5A5A40] focus:ring-[#5A5A40] w-4 h-4"
              />
              <span>Auto-commit database to GitHub repository whenever a payment is collected</span>
            </label>
          </div>

        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-[#E6E2D3] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-[#787267] font-mono">
            {formData.lastSyncedAt
              ? `Last synced with GitHub: ${new Date(formData.lastSyncedAt).toLocaleString('en-IN')}`
              : 'Not synced yet'}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveSettings}
              className="px-4 py-2 bg-[#EFECE1] hover:bg-[#E6E2D3] text-[#4A453E] rounded-lg font-semibold transition border border-[#DDD8C5] flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>

            <button
              type="button"
              onClick={handlePushToGitHub}
              disabled={isSyncing}
              className="px-5 py-2 bg-[#2E5B50] hover:bg-[#254A41] text-white rounded-lg font-semibold shadow transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Commit & Sync Now</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
