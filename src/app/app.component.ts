import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { View, Text, Pressable, ScrollView, Image } from '@ng-native/components';
import { StorageService } from './services/storage.service';
import { ReportFormComponent } from './components/report-form.component';
import { QrScannerComponent } from './components/qr-scanner.component';
import { NotificationState } from './models/report.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ScrollView, View, Text, Pressable, Image, ReportFormComponent, QrScannerComponent],
  template: `
    <view class="screen-root" [class.dark-theme]="isDark()">
      <!-- Scrollable Main Content -->
      <scroll-view class="scroll-container">
        <view class="content-wrapper">
          <view class="app-card">
            <!-- Top Bar with Theme and QR buttons -->
            <view class="top-bar">
              <pressable class="action-btn" (press)="toggleTheme()">
                <text class="action-btn-icon">{{ isDark() ? '☀️' : '🌙' }}</text>
              </pressable>

              <pressable class="action-btn" (press)="isScanning.set(true)">
                <text class="action-btn-icon">📷</text>
              </pressable>
            </view>

            <!-- Header Branding -->
            <view class="header-section">
              <view class="logo-wrapper">
                <image source="/src/assets/images/logo-mini.png" class="logo-img" />
              </view>
              <text class="app-title">PGx Reports</text>
              <text class="app-subtitle">
                Enter or scan your report key to download your PGx report
              </text>
            </view>

            <!-- Form Component -->
            <app-report-form
              [scanValue]="scannedValue()"
              (loadingState)="isLoading.set($event)"
              (notify)="showNotification($event)"
            />
          </view>
        </view>
      </scroll-view>

      <!-- Live QR Scanner View -->
      <app-qr-scanner
        *ngIf="isScanning()"
        (qrDetected)="onQrScanned($event)"
        (closeScanner)="isScanning.set(false)"
      />

      <!-- Global Loading Overlay -->
      <view *ngIf="isLoading()" class="loading-overlay">
        <view class="loading-card">
          <text class="loading-text">Loading PGx Report...</text>
        </view>
      </view>

      <!-- Toast / Notification Banner -->
      <view *ngIf="notification()" class="toast-banner" [class.toast-error]="notification()?.type === 'error'">
        <view class="toast-content">
          <text class="toast-title">{{ notification()?.title }}</text>
          <text class="toast-message">{{ notification()?.message }}</text>
        </view>
        <pressable class="toast-close" (press)="notification.set(null)">
          <text class="toast-close-text">✕</text>
        </pressable>
      </view>
    </view>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      width: 100%;
      min-height: 100vh;
    }
    .screen-root {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      width: 100%;
      min-height: 100vh;
      background-color: #f8fafc;
    }
    .dark-theme {
      background-color: #0b1329;
    }
    .scroll-container {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      width: 100%;
      min-height: 100vh;
    }
    .content-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      min-height: 100vh;
      padding: 32px 16px;
      box-sizing: border-box;
    }
    .app-card {
      width: 100%;
      max-width: 440px;
      background-color: #ffffff;
      border-radius: 28px;
      padding: 24px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
      gap: 16px;
    }
    .top-bar {
      flex-direction: row;
      justify-content: flex-end;
      gap: 8px;
    }
    .action-btn {
      width: 40px;
      height: 40px;
      border-radius: 20px;
      background-color: #f1f5f9;
      justify-content: center;
      align-items: center;
    }
    .action-btn-icon {
      font-size: 18px;
    }
    .header-section {
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
    }
    .logo-wrapper {
      padding: 10px;
      border-radius: 20px;
      background-color: #f8fafc;
      border: 1px solid #f1f5f9;
      margin-bottom: 6px;
    }
    .logo-img {
      width: 64px;
      height: 64px;
      object-fit: contain;
    }
    .app-title {
      font-size: 22px;
      font-weight: 800;
      color: #002E62;
      text-align: center;
    }
    .app-subtitle {
      font-size: 13px;
      color: #64748b;
      text-align: center;
      max-width: 280px;
      line-height: 18px;
    }
    .loading-overlay {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.6);
      justify-content: center;
      align-items: center;
      z-index: 50;
    }
    .loading-card {
      padding: 24px 32px;
      background-color: #ffffff;
      border-radius: 18px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
    }
    .loading-text {
      font-size: 15px;
      font-weight: 700;
      color: #002E62;
    }
    .toast-banner {
      position: fixed;
      bottom: 24px;
      left: 20px;
      right: 20px;
      max-width: 400px;
      margin-horizontal: auto;
      background-color: #065f46;
      border-radius: 16px;
      padding: 14px 18px;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      z-index: 60;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
    }
    .toast-error {
      background-color: #991b1b;
    }
    .toast-content {
      flex: 1;
      gap: 2px;
    }
    .toast-title {
      color: #ffffff;
      font-size: 13px;
      font-weight: 700;
    }
    .toast-message {
      color: rgba(255, 255, 255, 0.9);
      font-size: 12px;
    }
    .toast-close {
      padding: 6px;
    }
    .toast-close-text {
      color: #ffffff;
      font-size: 14px;
    }
    @media (prefers-color-scheme: dark) {
      .app-card {
        background-color: #1e293b;
        border-color: #334155;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
      }
      .action-btn {
        background-color: #334155;
      }
      .logo-wrapper {
        background-color: #0f172a;
        border-color: #1e293b;
      }
      .app-title {
        color: #38bdf8;
      }
      .app-subtitle {
        color: #94a3b8;
      }
      .loading-card {
        background-color: #1e293b;
      }
      .loading-text {
        color: #38bdf8;
      }
    }
  `
})
export class App implements OnInit {
  isDark = signal(false);
  isScanning = signal(false);
  isLoading = signal(false);
  scannedValue = signal('');
  notification = signal<NotificationState | null>(null);

  private storageService = inject(StorageService);
  private notifTimer: any = null;

  constructor() {}

  ngOnInit(): void {
    const saved = this.storageService.getThemeMode();
    if (saved === 'dark') {
      this.isDark.set(true);
    } else if (saved === 'light') {
      this.isDark.set(false);
    } else {
      this.isDark.set(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }

  toggleTheme(): void {
    const next = !this.isDark();
    this.isDark.set(next);
    this.storageService.saveThemeMode(next ? 'dark' : 'light');
  }

  onQrScanned(code: string): void {
    this.scannedValue.set(code);
    this.isScanning.set(false);
    this.showNotification({
      type: 'success',
      title: 'QR Code Scanned',
      message: 'Parameters loaded from QR.',
    });
  }

  showNotification(notify: NotificationState): void {
    this.notification.set(notify);
    if (this.notifTimer) {
      clearTimeout(this.notifTimer);
    }
    this.notifTimer = setTimeout(() => {
      this.notification.set(null);
    }, 6000);
  }
}
