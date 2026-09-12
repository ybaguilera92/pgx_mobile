import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { Search, Download, Eye, EyeOff, FileText, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { DownloadDialog } from './DownloadDialog';
import { reportService, ReportFormValues } from '../services/ReportService';
import { checkIsJsonService } from '../services/CheckIsJsonService';
import { storageService } from '../services/StorageService';

interface ReportFormProps {
  loading: (state: boolean) => void;
  scanValue: string;
  cancel: boolean;
  qrScanValue: (val: string) => void;
  onNotification?: (type: 'success' | 'error', title: string, message: string) => void;
}

export interface ReportFormHandle {
  openReport: () => void;
}

const ReportForm = forwardRef<ReportFormHandle, ReportFormProps>(
  ({ loading, scanValue, cancel, qrScanValue, onNotification }, ref) => {
    const [reportKeyVisible, setReportKeyVisible] = useState(false);
    const [progress, setProgress] = useState<number | null>(null);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [downloadError, setDownloadError] = useState<string | null>(null);

    const {
      register,
      handleSubmit,
      reset,
      watch,
      setValue,
      formState: { errors, isValid },
    } = useForm<ReportFormValues>({
      mode: 'onChange',
      defaultValues: {
        AccesionNumber: storageService.getAccessionNumber() || '',
        Key: '',
      },
    });

    // Handle cancel triggered from parent
    useEffect(() => {
      if (cancel) {
        cancelDownload();
      }
    }, [cancel]);

    // Handle QR Scan parsed values
    useEffect(() => {
      if (!scanValue) return;

      if (checkIsJsonService.isJson(scanValue)) {
        try {
          const parsed = typeof scanValue === 'string' ? JSON.parse(scanValue) : scanValue;
          setValue('AccesionNumber', parsed.AccesionNumber || parsed.accessionNumber || '', {
            shouldValidate: true,
          });
          setValue('Key', parsed.Key || parsed.key || '', { shouldValidate: true });
        } catch {
          setValue('Key', scanValue, { shouldValidate: true });
        }
      } else {
        const savedAcc = storageService.getAccessionNumber();
        if (savedAcc) {
          setValue('AccesionNumber', savedAcc, { shouldValidate: true });
        }
        setValue('Key', scanValue, { shouldValidate: true });
      }
    }, [scanValue, setValue]);

    // Persist accession number changes
    useEffect(() => {
      const subscription = watch((value) => {
        if (value.AccesionNumber) {
          storageService.saveAccessionNumber(value.AccesionNumber);
        }
      });
      return () => subscription.unsubscribe();
    }, [watch]);

    const showDialog = () => {
      setProgress(0);
      setDownloadError(null);
      setDialogVisible(true);
    };

    const hideDialog = () => {
      setDialogVisible(false);
      setProgress(null);
      setDownloadError(null);
    };

    const cancelDownload = () => {
      hideDialog();
      setPdfUrl(null);
    };

    const openReport = () => {
      if (pdfUrl) {
        window.open(pdfUrl, '_blank', 'noopener,noreferrer');
      }
      hideDialog();
    };

    useImperativeHandle(ref, () => ({
      openReport: () => {
        openReport();
      },
    }));

    const onSubmit = async (data: ReportFormValues) => {
      loading(true);
      try {
        const url = await reportService.getReportUrl(data);
        setPdfUrl(url);
        if (onNotification) {
          onNotification('success', 'Report Found', 'Patient report URL successfully retrieved.');
        }
      } catch (err: any) {
        const errMsg = err?.message || 'Error getting report';
        if (onNotification) {
          onNotification('error', 'Error getting report', errMsg);
        }
      } finally {
        loading(false);
      }
    };

    const handleDownload = (urlToDownload: string) => {
      showDialog();

      // Simulate network download progress for responsive UX before open
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 20;
        setProgress(Math.min(currentProgress, 95));

        if (currentProgress >= 100) {
          clearInterval(interval);
          setProgress(100);
          if (onNotification) {
            onNotification('success', 'Download Complete', 'Report is ready to open or download.');
          }
        }
      }, 150);
    };

    // Quick demo action so user can test the workflow immediately
    const loadSampleReport = () => {
      setValue('AccesionNumber', 'PGX-2024-8841', { shouldValidate: true });
      setValue('Key', 'DEMO-SECURE-KEY-99', { shouldValidate: true });
      setPdfUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
      if (onNotification) {
        onNotification('success', 'Sample Data Loaded', 'Ready to test Search and Download flow.');
      }
    };

    return (
      <div id="report-form-container" className="w-full max-w-md mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Accession Number Field */}
          <div>
            <label
              htmlFor="accession-number-input"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Accession Number
            </label>
            <div className="relative">
              <input
                id="accession-number-input"
                type="text"
                placeholder="e.g. PGX-00123"
                {...register('AccesionNumber', {
                  required: 'Accession number is required!',
                })}
                className={`w-full px-4 py-3 bg-white border ${
                  errors.AccesionNumber ? 'border-red-500' : 'border-slate-300'
                } rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002E62] focus:border-transparent transition shadow-xs`}
              />
            </div>
            {errors.AccesionNumber && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.AccesionNumber.message}
              </p>
            )}
          </div>

          {/* Report Key Field */}
          <div>
            <label
              htmlFor="report-key-input"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Report Key
            </label>
            <div className="relative">
              <input
                id="report-key-input"
                type={reportKeyVisible ? 'text' : 'password'}
                placeholder="Enter report security key"
                {...register('Key', {
                  required: 'Report key is required!',
                })}
                className={`w-full px-4 py-3 pr-11 bg-white border ${
                  errors.Key ? 'border-red-500' : 'border-slate-300'
                } rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002E62] focus:border-transparent transition shadow-xs`}
              />
              <button
                id="toggle-report-key-visibility-btn"
                type="button"
                onClick={() => setReportKeyVisible(!reportKeyVisible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition"
                aria-label={reportKeyVisible ? 'Hide report key' : 'Show report key'}
              >
                {reportKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.Key && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.Key.message}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-3">
            <button
              id="search-report-btn"
              type="submit"
              disabled={!isValid}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm transition shadow-xs ${
                isValid
                  ? 'bg-[#002E62] hover:bg-[#00224a] text-white cursor-pointer active:scale-[0.99]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Search className="w-4 h-4" />
              Search
            </button>

            <button
              id="download-report-btn"
              type="button"
              disabled={!pdfUrl || !isValid}
              onClick={() => pdfUrl && handleDownload(pdfUrl)}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm transition shadow-xs ${
                pdfUrl && isValid
                  ? 'bg-[#3C8DBC] hover:bg-[#347ca5] text-white cursor-pointer active:scale-[0.99]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>

          {/* Report Ready Info Banner */}
          {pdfUrl && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900">
                <span className="font-semibold block">Report ready for download!</span>
                <p className="text-slate-600 mt-0.5 break-all line-clamp-1">{pdfUrl}</p>
              </div>
            </div>
          )}

          {/* Quick Demo Helper */}
          <div className="pt-4 border-t border-slate-200 flex justify-center">
            <button
              id="demo-test-fill-btn"
              type="button"
              onClick={loadSampleReport}
              className="text-xs text-slate-500 hover:text-[#002E62] hover:underline flex items-center gap-1 transition"
            >
              <FileText className="w-3.5 h-3.5" />
              Fill sample test credentials
            </button>
          </div>
        </form>

        {/* Download Modal Dialog */}
        <DownloadDialog
          show={dialogVisible}
          downloadProgress={progress}
          onCancel={cancelDownload}
          onOpen={openReport}
          reportUrl={pdfUrl}
          errorMessage={downloadError}
        />
      </div>
    );
  }
);

export default ReportForm;
