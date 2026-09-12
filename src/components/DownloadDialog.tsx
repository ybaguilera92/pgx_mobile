import React from 'react';
import { X, ExternalLink, Download, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface DownloadDialogProps {
  show: boolean;
  onCancel: () => void;
  onOpen: () => void;
  downloadProgress: number | null;
  reportUrl: string | null;
  errorMessage?: string | null;
}

export const DownloadDialog: React.FC<DownloadDialogProps> = ({
  show,
  onCancel,
  onOpen,
  downloadProgress,
  reportUrl,
  errorMessage,
}) => {
  if (!show) return null;

  const isComplete = downloadProgress !== null && downloadProgress >= 100;

  const getTitle = () => {
    if (errorMessage) return 'Download Error';
    if (downloadProgress === null) return 'Preparing to download';
    if (downloadProgress < 100) return 'Downloading report';
    return 'Successfully downloaded!';
  };

  const handleDownloadFile = () => {
    if (!reportUrl) return;
    const a = document.createElement('a');
    a.href = reportUrl;
    a.target = '_blank';
    a.download = `PGx-Report-${Date.now() % 1000000}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      id="download-dialog-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fadeIn"
    >
      <div
        id="download-dialog-card"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-all border border-slate-100"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {isComplete ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : errorMessage ? (
              <AlertCircle className="w-5 h-5 text-red-600" />
            ) : (
              <FileText className="w-5 h-5 text-[#002E62]" />
            )}
            <h3 id="dialog-title" className="text-lg font-semibold text-slate-900">
              {getTitle()}
            </h3>
          </div>
          <button
            id="close-dialog-btn"
            onClick={onCancel}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-5">
          {errorMessage ? (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
              {errorMessage}
            </p>
          ) : !isComplete ? (
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-medium text-slate-500">
                <span>Status: In progress</span>
                <span>{downloadProgress !== null ? `${downloadProgress}%` : 'Connecting...'}</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#002E62] transition-all duration-300 rounded-full"
                  style={{ width: `${Math.max(5, downloadProgress ?? 15)}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 text-center pt-1">
                Fetching patient pharmacogenomics document...
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-sm text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="break-all text-xs">
                  <span className="font-semibold block mb-0.5">Report Ready:</span>
                  <span className="text-slate-600 font-mono text-[11px] line-clamp-2">
                    {reportUrl}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            id="dialog-cancel-btn"
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
          >
            Close
          </button>

          {isComplete && (
            <>
              <button
                id="dialog-download-btn"
                type="button"
                onClick={handleDownloadFile}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#002E62] bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                id="dialog-open-btn"
                type="button"
                onClick={onOpen}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#002E62] hover:bg-[#00224a] rounded-xl shadow-xs transition"
              >
                <ExternalLink className="w-4 h-4" />
                Open Report
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
