import React, { useState, useRef } from 'react';
import { QrCode, RefreshCw, CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { QrCodeScan } from './components/QrCodeScan';
import ReportForm, { ReportFormHandle } from './components/ReportForm';
import logoImg from './assets/images/logo-mini.png';

interface NotificationState {
  type: 'success' | 'error';
  title: string;
  message: string;
}

export const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [qrScan, setQrScan] = useState<boolean>(false);
  const [qrScanValue, setQrScanValue] = useState<string>('');
  const [isCancel, setIsCancel] = useState<boolean>(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const reportFormRef = useRef<ReportFormHandle | null>(null);

  const showNotification = (type: 'success' | 'error', title: string, message: string) => {
    setNotification({ type, title, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.title === title ? null : curr));
    }, 6000);
  };

  return (
    <div id="app-root" className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {!qrScan ? (
        <div className="w-full flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
          {/* Main Card */}
          <main
            id="main-content-card"
            className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative"
          >
            {/* Top Bar with QR scan button */}
            <div className="flex justify-end p-4 pb-0">
              <button
                id="open-qr-scan-btn"
                type="button"
                onClick={() => setQrScan(true)}
                title="Scan QR Code"
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-[#002E62] rounded-xl border border-slate-200 transition active:scale-95 text-xs font-semibold"
              >
                <QrCode className="w-4 h-4 text-[#3C8DBC]" />
                <span>Scan QR</span>
              </button>
            </div>

            {/* Header / Brand info */}
            <header className="px-6 pt-2 pb-6 text-center">
              <div className="inline-flex items-center justify-center p-3 bg-slate-50 rounded-2xl mb-3 shadow-xs border border-slate-100">
                <img
                  src={logoImg}
                  alt="PGx Reports Logo"
                  className="w-16 h-16 object-contain"
                />
              </div>

              <h1 id="app-title" className="text-2xl sm:text-3xl font-bold text-[#002E62] tracking-tight">
                PGx Reports
              </h1>
              <p id="app-subtitle" className="mt-2 text-xs sm:text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                Enter or scan your report key to download and view your pharmacogenomics report
              </p>
            </header>

            {/* Form Section */}
            <section className="px-6 pb-8">
              <ReportForm
                ref={reportFormRef}
                loading={setLoading}
                scanValue={qrScanValue}
                cancel={isCancel}
                qrScanValue={setQrScanValue}
                onNotification={showNotification}
              />
            </section>
          </main>

          {/* Security & Verification Footer */}
          <footer className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>Secure Diagnostic Patient Portal</span>
          </footer>
        </div>
      ) : (
        <QrCodeScan
          onClear={() => setQrScan(false)}
          qrScanValue={(val) => {
            setQrScanValue(val);
            setQrScan(false);
            showNotification('success', 'QR Code Scanned', 'Report parameters loaded.');
          }}
        />
      )}

      {/* Global Loading Spinner */}
      {loading && (
        <div
          id="global-loading-overlay"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs text-white"
        >
          <div className="bg-slate-900/90 p-6 rounded-2xl flex flex-col items-center gap-3 border border-slate-800 shadow-2xl">
            <RefreshCw className="w-8 h-8 text-[#3C8DBC] animate-spin" />
            <p className="text-sm font-medium text-slate-200">Retrieving PGx Report...</p>
          </div>
        </div>
      )}

      {/* Global Toast Notification */}
      {notification && (
        <div
          id="app-toast"
          className="fixed bottom-6 right-6 left-6 sm:left-auto sm:max-w-sm z-50 flex items-start gap-3 p-4 bg-white rounded-2xl shadow-2xl border border-slate-200 animate-slideUp"
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs">
            <h4 className="font-semibold text-slate-900">{notification.title}</h4>
            <p className="text-slate-600 mt-0.5">{notification.message}</p>
          </div>
          <button
            id="close-toast-btn"
            type="button"
            onClick={() => setNotification(null)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
