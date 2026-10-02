import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { View, Text, Pressable } from '@ng-native/components';
import jsQR from 'jsqr';

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule, View, Text, Pressable],
  template: `
    <view class="scanner-screen">
      <!-- Header -->
      <view class="scanner-header">
        <text class="scanner-header-title">
          {{ manualMode ? 'Upload QR Code' : 'Scan PGx QR Code' }}
        </text>
        <pressable class="btn-close" (press)="onClose()">
          <text class="btn-close-text">✕</text>
        </pressable>
      </view>

      <!-- Viewport area -->
      <view class="scanner-viewport">
        <!-- Live Viewfinder Target -->
        <view *ngIf="!manualMode" class="target-container">
          <view class="target-box">
            <view class="corner top-left"></view>
            <view class="corner top-right"></view>
            <view class="corner bottom-left"></view>
            <view class="corner bottom-right"></view>
            <view class="laser-bar"></view>
          </view>
          <text class="target-hint">Align the QR code within the frame</text>
        </view>

        <!-- Manual File Upload Area -->
        <view *ngIf="manualMode" class="upload-box">
          <text class="upload-title">Upload QR Code Image</text>
          <text class="upload-subtitle">
            Select a photo or screenshot containing your PGx report QR code to decode it.
          </text>

          <pressable class="btn-choose" (press)="openFileInput()">
            <text class="btn-choose-text">Choose Image</text>
          </pressable>

          <pressable *ngIf="hasCameraPermission === false" (press)="startCamera()">
            <text class="retry-link">Retry camera access</text>
          </pressable>
        </view>

        <!-- Error Banner -->
        <view *ngIf="errorMessage" class="error-banner">
          <text class="error-text">{{ errorMessage }}</text>
        </view>

        <!-- Loading spinner overlay -->
        <view *ngIf="isProcessing" class="loading-overlay">
          <text class="loading-text">Processing QR Code...</text>
        </view>
      </view>

      <!-- Bottom controls -->
      <view class="scanner-footer">
        <pressable class="btn-toggle-mode" (press)="toggleMode()">
          <text class="btn-toggle-text">
            {{ manualMode ? 'Switch to Live Camera' : 'Upload Image Instead' }}
          </text>
        </pressable>

        <pressable class="btn-cancel-scan" (press)="onClose()">
          <text class="btn-cancel-text">Cancel</text>
        </pressable>
      </view>
    </view>
  `,
  styles: `
    .scanner-screen {
      position: fixed;
      inset: 0;
      z-index: 50;
      background-color: #020617;
      justify-content: space-between;
    }
    .scanner-header {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background-color: rgba(15, 23, 42, 0.95);
      border-bottom: 1px solid #1e293b;
    }
    .scanner-header-title {
      color: #f8fafc;
      font-size: 16px;
      font-weight: 700;
    }
    .btn-close {
      padding: 8px 12px;
      border-radius: 9999px;
    }
    .btn-close-text {
      color: #94a3b8;
      font-size: 18px;
    }
    .scanner-viewport {
      flex: 1;
      justify-content: center;
      align-items: center;
      position: relative;
      background-color: #000000;
    }
    .target-container {
      align-items: center;
      gap: 20px;
    }
    .target-box {
      width: 250px;
      height: 250px;
      position: relative;
    }
    .corner {
      position: absolute;
      width: 28px;
      height: 28px;
      border-color: #38bdf8;
    }
    .top-left {
      top: 0;
      left: 0;
      border-top-width: 4px;
      border-left-width: 4px;
      border-top-left-radius: 8px;
    }
    .top-right {
      top: 0;
      right: 0;
      border-top-width: 4px;
      border-right-width: 4px;
      border-top-right-radius: 8px;
    }
    .bottom-left {
      bottom: 0;
      left: 0;
      border-bottom-width: 4px;
      border-left-width: 4px;
      border-bottom-left-radius: 8px;
    }
    .bottom-right {
      bottom: 0;
      right: 0;
      border-bottom-width: 4px;
      border-right-width: 4px;
      border-bottom-right-radius: 8px;
    }
    .laser-bar {
      position: absolute;
      top: 50%;
      left: 10px;
      right: 10px;
      height: 2px;
      background-color: #ef4444;
      box-shadow: 0 0 10px #ef4444;
    }
    .target-hint {
      color: #e2e8f0;
      font-size: 13px;
      font-weight: 500;
      padding: 6px 16px;
      background-color: rgba(15, 23, 42, 0.8);
      border-radius: 9999px;
      border: 1px solid #334155;
    }
    .upload-box {
      max-width: 340px;
      width: 90%;
      padding: 24px;
      background-color: rgba(15, 23, 42, 0.9);
      border-radius: 20px;
      border: 1px solid #1e293b;
      align-items: center;
      gap: 12px;
    }
    .upload-title {
      font-size: 18px;
      font-weight: 700;
      color: #ffffff;
      text-align: center;
    }
    .upload-subtitle {
      font-size: 13px;
      color: #94a3b8;
      text-align: center;
      line-height: 18px;
      margin-bottom: 8px;
    }
    .btn-choose {
      width: 100%;
      padding: 12px;
      background-color: #0284c7;
      border-radius: 12px;
      align-items: center;
    }
    .btn-choose-text {
      color: #ffffff;
      font-size: 15px;
      font-weight: 600;
    }
    .retry-link {
      color: #38bdf8;
      font-size: 13px;
      text-decoration: underline;
      margin-top: 8px;
    }
    .error-banner {
      position: absolute;
      bottom: 24px;
      left: 20px;
      right: 20px;
      padding: 12px;
      background-color: #ef4444;
      border-radius: 12px;
    }
    .error-text {
      color: #ffffff;
      font-size: 13px;
      font-weight: 500;
      text-align: center;
    }
    .loading-overlay {
      position: absolute;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.85);
      justify-content: center;
      align-items: center;
    }
    .loading-text {
      color: #ffffff;
      font-size: 15px;
      font-weight: 600;
    }
    .scanner-footer {
      padding: 16px;
      background-color: rgba(15, 23, 42, 0.95);
      border-top: 1px solid #1e293b;
      gap: 10px;
    }
    .btn-toggle-mode {
      padding: 12px;
      background-color: #1e293b;
      border-radius: 12px;
      align-items: center;
    }
    .btn-toggle-text {
      color: #e2e8f0;
      font-size: 14px;
      font-weight: 600;
    }
    .btn-cancel-scan {
      padding: 8px;
      align-items: center;
    }
    .btn-cancel-text {
      color: #94a3b8;
      font-size: 14px;
    }
  `
})
export class QrScannerComponent implements OnInit, OnDestroy {
  @Output() qrDetected = new EventEmitter<string>();
  @Output() closeScanner = new EventEmitter<void>();

  hasCameraPermission: boolean | null = null;
  errorMessage = '';
  isProcessing = false;
  manualMode = false;

  private videoEl: HTMLVideoElement | null = null;
  private canvasEl: HTMLCanvasElement | null = null;
  private stream: MediaStream | null = null;
  private animId: number | null = null;
  private fileInput: HTMLInputElement | null = null;

  ngOnInit(): void {
    this.startCamera();
  }

  ngOnDestroy(): void {
    this.stopCamera();
    if (this.videoEl && this.videoEl.parentNode) {
      this.videoEl.parentNode.removeChild(this.videoEl);
    }
  }

  async startCamera(): Promise<void> {
    this.errorMessage = '';
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.stream = stream;
      this.hasCameraPermission = true;

      if (!this.videoEl) {
        this.videoEl = document.createElement('video');
        this.videoEl.style.position = 'absolute';
        this.videoEl.style.inset = '0';
        this.videoEl.style.width = '100%';
        this.videoEl.style.height = '100%';
        this.videoEl.style.objectFit = 'cover';
        this.videoEl.style.zIndex = '0';
        this.videoEl.setAttribute('playsinline', 'true');
        this.videoEl.muted = true;
        document.body.appendChild(this.videoEl);
      }

      this.videoEl.style.display = this.manualMode ? 'none' : 'block';
      this.videoEl.srcObject = stream;
      await this.videoEl.play();

      this.animId = requestAnimationFrame(() => this.scanLoop());
    } catch (err: any) {
      console.warn('Camera error:', err);
      this.hasCameraPermission = false;
      this.errorMessage = 'Could not open camera. You can upload an image of your QR code.';
      this.manualMode = true;
    }
  }

  stopCamera(): void {
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.videoEl) {
      this.videoEl.style.display = 'none';
    }
  }

  private scanLoop(): void {
    if (!this.videoEl || this.videoEl.readyState !== this.videoEl.HAVE_ENOUGH_DATA) {
      if (!this.manualMode) {
        this.animId = requestAnimationFrame(() => this.scanLoop());
      }
      return;
    }

    if (!this.canvasEl) {
      this.canvasEl = document.createElement('canvas');
    }

    this.canvasEl.width = this.videoEl.videoWidth;
    this.canvasEl.height = this.videoEl.videoHeight;
    const ctx = this.canvasEl.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      ctx.drawImage(this.videoEl, 0, 0, this.canvasEl.width, this.canvasEl.height);
      const imgData = ctx.getImageData(0, 0, this.canvasEl.width, this.canvasEl.height);
      const code = jsQR(imgData.data, imgData.width, imgData.height, {
        inversionAttempts: 'attemptBoth',
      });

      if (code && code.data) {
        this.isProcessing = true;
        this.stopCamera();
        this.qrDetected.emit(code.data);
        return;
      }
    }

    if (!this.manualMode) {
      this.animId = requestAnimationFrame(() => this.scanLoop());
    }
  }

  toggleMode(): void {
    this.manualMode = !this.manualMode;
    this.errorMessage = '';
    if (this.manualMode) {
      this.stopCamera();
    } else {
      this.startCamera();
    }
  }

  openFileInput(): void {
    if (!this.fileInput) {
      this.fileInput = document.createElement('input');
      this.fileInput.type = 'file';
      this.fileInput.accept = 'image/*';
      this.fileInput.style.display = 'none';
      this.fileInput.addEventListener('change', (e) => this.onFileChange(e));
      document.body.appendChild(this.fileInput);
    }
    this.fileInput.value = '';
    this.fileInput.click();
  }

  private onFileChange(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.isProcessing = true;
    this.errorMessage = '';

    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imgData.data, imgData.width, imgData.height, {
            inversionAttempts: 'attemptBoth',
          });
          if (code && code.data) {
            this.stopCamera();
            this.qrDetected.emit(code.data);
            return;
          }
        }
        this.isProcessing = false;
        this.errorMessage = 'No QR code found in this image. Please try another image.';
      };
      img.onerror = () => {
        this.isProcessing = false;
        this.errorMessage = 'Failed to read image file.';
      };
      img.src = evt.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  onClose(): void {
    this.stopCamera();
    this.closeScanner.emit();
  }
}
