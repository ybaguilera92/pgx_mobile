import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Camera, Upload, X, AlertCircle, RefreshCw, Check } from 'lucide-react';

interface QrCodeScanProps {
  onClear: () => void;
  qrScanValue: (value: string) => void;
  isLandscape?: boolean;
}

export const QrCodeScan: React.FC<QrCodeScanProps> = ({ onClear, qrScanValue }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualMode, setManualMode] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Validate QR payload structure
  const handleQrDetected = (codeText: string) => {
    setIsProcessing(true);
    try {
      // Check if it's JSON with Key and AccesionNumber or plain string
      qrScanValue(codeText);
      stopCamera();
      onClear();
    } catch (err: any) {
      setErrorMessage('Could not process the detected QR code.');
      setIsProcessing(false);
    }
  };

  const startCamera = async () => {
    setErrorMessage('');
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS safari
        await videoRef.current.play();
        requestAnimationFrame(tick);
      }
    } catch (err: any) {
      console.warn('Camera access failed:', err);
      setHasPermission(false);
      setErrorMessage(
        err.name === 'NotAllowedError'
          ? 'Camera permission was denied. You can grant camera access or upload an image of your QR code below.'
          : 'Could not access device camera. You can upload an image of your QR code below.'
      );
      setManualMode(true);
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const tick = () => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(tick);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth',
    });

    if (code && code.data) {
      handleQrDetected(code.data);
      return;
    }

    animationFrameRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Image file QR decoder (matching mobile QRLocalImage capability)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsProcessing(false);
          setErrorMessage('Could not initialize canvas context.');
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (code && code.data) {
          handleQrDetected(code.data);
        } else {
          setIsProcessing(false);
          setErrorMessage('No QR code could be detected in this image. Please ensure the code is clear and try again.');
        }
      };
      img.onerror = () => {
        setIsProcessing(false);
        setErrorMessage('Failed to load the selected image file.');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      id="qr-scan-container"
      className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white animate-fadeIn"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-10">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-[#3C8DBC]" />
          <h2 className="text-base font-semibold text-white">Scan PGx QR Code</h2>
        </div>
        <button
          id="close-qr-scan-btn"
          type="button"
          onClick={() => {
            stopCamera();
            onClear();
          }}
          className="rounded-full p-2 text-slate-300 hover:text-white hover:bg-slate-800 transition"
          aria-label="Close scanner"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Viewport */}
      <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover ${manualMode ? 'hidden' : 'block'}`}
          muted
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Viewfinder Overlay */}
        {!manualMode && hasPermission && (
          <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
            <div className="w-64 h-64 sm:w-80 sm:h-80 border-2 border-white/80 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
              {/* Corner markers */}
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-[#3C8DBC] rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-[#3C8DBC] rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-[#3C8DBC] rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-[#3C8DBC] rounded-br-lg" />

              {/* Scanning laser effect */}
              <div className="absolute inset-x-0 top-0 h-1 bg-[#3C8DBC] shadow-[0_0_8px_#3C8DBC] animate-pulse" />
            </div>
            <p className="mt-6 text-sm font-medium text-slate-200 bg-slate-900/70 px-4 py-1.5 rounded-full backdrop-blur-sm">
              Align the QR code within the box
            </p>
          </div>
        )}

        {/* Fallback / Upload / Manual view */}
        {manualMode && (
          <div className="z-10 max-w-md w-full p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <Upload className="w-8 h-8 text-[#3C8DBC]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Upload QR Code Image</h3>
            <p className="text-sm text-slate-400 mb-6">
              Select or drag an image containing your PGx report QR code to scan it automatically.
            </p>

            <label
              id="upload-qr-input-label"
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#002E62] hover:bg-[#00224a] text-white font-medium text-sm rounded-xl cursor-pointer shadow-lg transition border border-[#3C8DBC]/30"
            >
              <Upload className="w-4 h-4" />
              Choose QR Image
              <input
                id="upload-qr-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {hasPermission === false && (
              <button
                type="button"
                onClick={startCamera}
                className="block mt-4 mx-auto text-xs text-[#3C8DBC] hover:underline"
              >
                Retry camera access
              </button>
            )}
          </div>
        )}

        {/* Error message banner */}
        {errorMessage && (
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center gap-2 p-3 bg-red-900/90 border border-red-700 text-red-100 rounded-xl text-xs backdrop-blur-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Processing indicator */}
        {isProcessing && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70 backdrop-blur-xs">
            <RefreshCw className="w-10 h-10 text-[#3C8DBC] animate-spin mb-3" />
            <p className="text-sm font-semibold text-white">Processing QR Code...</p>
          </div>
        )}
      </div>

      {/* Footer controls */}
      <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between z-10">
        <button
          id="toggle-upload-mode-btn"
          type="button"
          onClick={() => setManualMode(!manualMode)}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
        >
          {manualMode ? (
            <>
              <Camera className="w-4 h-4 text-[#3C8DBC]" />
              Switch to Live Camera
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 text-[#3C8DBC]" />
              Upload Image Instead
            </>
          )}
        </button>

        <button
          id="cancel-qr-scan-btn"
          type="button"
          onClick={() => {
            stopCamera();
            onClear();
          }}
          className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
