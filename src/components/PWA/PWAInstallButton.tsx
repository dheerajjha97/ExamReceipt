import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installing, setInstalling] = useState(false);

  // If already running as an installed PWA (Standalone app), hide the button
  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>PWA Installed</span>
      </div>
    );
  }

  const handleInstall = async () => {
    setInstalling(true);
    try {
      await install();
    } finally {
      setInstalling(false);
    }
  };

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={handleInstall}
        disabled={installing}
        className="flex items-center gap-2 rounded-2xl bg-linear-to-r from-emerald-600 to-teal-700 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:from-emerald-700 hover:to-teal-800 transition active:scale-95"
        title="ऐप को अपने मोबाइल / कंप्यूटर पर इंस्टॉल करें"
      >
        <Download className="w-4 h-4 animate-bounce" />
        <span>📲 ऐप इंस्टॉल करें (Install App)</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-2xl border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-[#2E5B50] hover:bg-emerald-50 transition shadow-2xs"
          title="iPhone / iPad पर होम स्क्रीन पर जोड़ें"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#2E5B50]" />
          <span>iOS पर इंस्टॉल करें</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-[#E8E4D5] animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#2E5B50] flex items-center justify-center font-bold">
                    📲
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">iPhone / iPad पर ऐप इंस्टॉल करें</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-xs text-gray-700">
                <div className="flex items-start gap-2.5 p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="font-bold font-mono text-emerald-800">1.</span>
                  <div>Safari ब्राउज़र के नीचे स्थित <strong className="inline-flex items-center gap-1 font-bold text-emerald-900"><Share2 className="w-3.5 h-3.5" /> Share (साझा)</strong> बटन दबाएं।</div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="font-bold font-mono text-emerald-800">2.</span>
                  <div>नीचे स्क्रॉल करके <strong className="inline-flex items-center gap-1 font-bold text-emerald-900"><PlusSquare className="w-3.5 h-3.5" /> Add to Home Screen</strong> पर टैप करें।</div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="font-bold font-mono text-emerald-800">3.</span>
                  <div>ऊपर दाईं ओर <strong>Add</strong> पर क्लिक करें। ऐप होम स्क्रीन पर आ जाएगा!</div>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-[#2E5B50] py-2.5 text-xs font-bold text-white hover:bg-[#23463E] transition shadow-xs"
              >
                समझ गया (Got it)
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback desktop / browser general trigger
  return (
    <button
      onClick={() => {
        alert('इस ऐप को मोबाइल या डेस्कटॉप ऐप की तरह चलाने के लिए ब्राउज़र मेनू (⋮) में जाकर "Add to Home screen" या "Install App" चुनें।');
      }}
      className="hidden sm:flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white/90 px-3 py-1.5 text-xs font-bold text-[#2E5B50] hover:bg-emerald-50 transition shadow-2xs"
      title="PWA के रूप में इंस्टॉल करें"
    >
      <Smartphone className="w-3.5 h-3.5 text-[#2E5B50]" />
      <span>PWA App</span>
    </button>
  );
};
