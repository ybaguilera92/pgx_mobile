import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { IconButton } from "react-native-paper";
import jsQR from "jsqr";

interface QrCodeScanProps {
  onClear: (val: boolean) => void;
  qrScanValue: (value: string) => void;
  isLandscape?: boolean;
}

export const QrCodeScan: React.FC<QrCodeScanProps> = ({
  onClear,
  qrScanValue,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualMode, setManualMode] = useState(false);

  // Web camera refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleQrDetected = (codeText: string) => {
    setIsProcessing(true);
    qrScanValue(codeText);
    stopWebCamera();
    onClear(false);
  };

  const startWebCamera = async () => {
    setErrorMessage("");
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
        requestAnimationFrame(scanTick);
      }
    } catch (err: any) {
      console.warn("Camera error:", err);
      setHasPermission(false);
      setErrorMessage(
        "Could not open camera. You can upload an image of your QR code below.",
      );
      setManualMode(true);
    }
  };

  const stopWebCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const scanTick = () => {
    if (
      !videoRef.current ||
      videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA
    ) {
      animationFrameRef.current = requestAnimationFrame(scanTick);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "attemptBoth",
    });

    if (code && code.data) {
      handleQrDetected(code.data);
      return;
    }

    animationFrameRef.current = requestAnimationFrame(scanTick);
  };

  useEffect(() => {
    startWebCamera();
    return () => {
      stopWebCamera();
    };
  }, []);

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage("");

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setIsProcessing(false);
          setErrorMessage("Failed to create decoding canvas.");
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "attemptBoth",
        });

        if (code && code.data) {
          handleQrDetected(code.data);
        } else {
          setIsProcessing(false);
          setErrorMessage(
            "No QR code found in this image. Please try another image.",
          );
        }
      };
      img.onerror = () => {
        setIsProcessing(false);
        setErrorMessage("Failed to read image file.");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <View />
        <IconButton
          icon="close"
          iconColor="#ffffff"
          size={24}
          onPress={() => {
            stopWebCamera();
            onClear(false);
          }}
        />
      </View>

      {/* Main Viewport */}
      <View style={styles.scannerArea}>
        <video
          ref={videoRef}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: manualMode ? "none" : "block",
          }}
          muted
        />
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* Viewfinder Target */}
        {!manualMode && (
          <View style={styles.targetContainer}>
            <View style={styles.targetBox}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              <View style={styles.laserLine} />
            </View>
            <Text style={styles.instructionText}>
              Align the QR code within the frame
            </Text>
          </View>
        )}

        {/* Manual Image Upload Mode */}
        {manualMode && (
          <View style={styles.manualContainer}>
            <Text style={styles.manualTitle}>Upload QR Code Image</Text>
            <Text style={styles.manualSubtitle}>
              Select an image containing your PGx report QR code to scan it.
            </Text>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageFile}
              style={{ display: "none" }}
            />

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
            >
              <Text style={styles.uploadButtonText}>Choose Image</Text>
            </TouchableOpacity>

            {hasPermission === false && (
              <TouchableOpacity
                onPress={startWebCamera}
                style={styles.retryBtn}
              >
                <Text style={styles.retryText}>Retry camera access</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Error notification */}
        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Processing Spinner */}
        {isProcessing && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#3C8DBC" />
            <Text style={styles.loadingText}>Processing QR Code...</Text>
          </View>
        )}
      </View>

      {/* Footer controls */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.toggleModeBtn}
          onPress={() => setManualMode(!manualMode)}
        >
          <Text style={styles.toggleModeText}>
            {manualMode ? "Switch to Live Camera" : "Upload Image Instead"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            stopWebCamera();
            onClear(false);
          }}
          style={styles.cancelBtn}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    zIndex: 10,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  scannerArea: {
    flex: 1,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  targetContainer: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  targetBox: {
    width: 250,
    height: 250,
    position: "relative",
    backgroundColor: "transparent",
  },
  corner: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: "#38bdf8",
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 6,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 6,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 6,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 6,
  },
  laserLine: {
    position: "absolute",
    top: "50%",
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: "#ef4444",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  instructionText: {
    color: "#e2e8f0",
    marginTop: 24,
    fontSize: 14,
    fontWeight: "500",
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    textAlign: "center",
  },
  manualContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    borderRadius: 16,
    marginHorizontal: 24,
    maxWidth: 360,
    zIndex: 5,
  },
  manualTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
    textAlign: "center",
  },
  manualSubtitle: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 18,
  },
  uploadButton: {
    backgroundColor: "#0284c7",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  uploadButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  retryBtn: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  retryText: {
    color: "#38bdf8",
    fontSize: 13,
    textDecorationLine: "underline",
  },
  errorBanner: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#ef4444",
    padding: 12,
    borderRadius: 8,
    zIndex: 10,
  },
  errorBannerText: {
    color: "#ffffff",
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(2, 6, 23, 0.85)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },
  loadingText: {
    color: "#ffffff",
    marginTop: 12,
    fontSize: 14,
  },
  footer: {
    padding: 16,
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    alignItems: "center",
    gap: 12,
    zIndex: 10,
  },
  toggleModeBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    width: "100%",
    alignItems: "center",
  },
  toggleModeText: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "500",
  },
  cancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 20,
  },
  cancelText: {
    color: "#94a3b8",
    fontSize: 14,
  },
});

export default QrCodeScan;
