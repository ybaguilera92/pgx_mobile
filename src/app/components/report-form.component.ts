import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { View, Text, TextInput, Pressable } from '@ng-native/components';
import { ReportService } from '../services/report.service';
import { StorageService } from '../services/storage.service';
import { FileService } from '../services/file.service';
import { DownloadDialogComponent } from './download-dialog.component';
import { NotificationState, ReportFormValues } from '../models/report.model';

@Component({
  selector: 'app-report-form',
  standalone: true,
  imports: [CommonModule, View, Text, TextInput, Pressable, DownloadDialogComponent],
  template: `
    <view class="form-wrapper">
      <!-- Accession Number Field -->
      <view class="field-group">
        <text class="field-label">Accession Number</text>
        <text-input
          [value]="accessionNumber()"
          (changeText)="onAccessionChange($event)"
          placeholder="e.g. ACC-2024-987"
          class="input-box"
        />
        <text *ngIf="showAccessionError()" class="error-msg">
          Accession number is required!
        </text>
      </view>

      <!-- Report Key Field with show/hide password toggle -->
      <view class="field-group">
        <text class="field-label">Report Key</text>
        <view class="password-row">
          <text-input
            [value]="reportKey()"
            (changeText)="onKeyChange($event)"
            [secureTextEntry]="!isPasswordShow()"
            placeholder="Enter your security key"
            class="input-box password-input"
          />
          <pressable class="toggle-eye" (press)="togglePasswordShow()">
            <text class="toggle-eye-icon">{{ isPasswordShow() ? '🔒' : '👁️' }}</text>
          </pressable>
        </view>
        <text *ngIf="showKeyError()" class="error-msg">
          Report key is required!
        </text>
      </view>

      <!-- Action buttons -->
      <view class="buttons-stack">
        <pressable
          class="btn-primary"
          [class.btn-disabled]="!canSearch()"
          (press)="onSearch()"
        >
          <text class="btn-primary-text">Search</text>
        </pressable>

        <pressable
          class="btn-secondary"
          [class.btn-disabled]="!canDownload()"
          (press)="onDownload()"
        >
          <text class="btn-secondary-text">Download</text>
        </pressable>
      </view>

      <!-- Ready banner when report found -->
      <view *ngIf="pdfUrl()" class="ready-banner">
        <text class="ready-title">✓ Report ready for download!</text>
        <text class="ready-subtitle">Accession match verified.</text>
      </view>

      <!-- Download progress modal -->
      <app-download-dialog
        [show]="dialogVisible()"
        [downloadProgress]="downloadProgress()"
        [title]="downloadProgress() !== null && downloadProgress()! >= 100 ? 'Successfully downloaded!' : 'Downloading report...'"
        (cancelled)="onHideDialog()"
        (opened)="onOpenReport()"
      />
    </view>
  `,
  styles: `
    .form-wrapper {
      width: 100%;
      gap: 16px;
    }
    .field-group {
      gap: 6px;
    }
    .field-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
    }
    .input-box {
      width: 100%;
      padding: 12px 14px;
      font-size: 14px;
      border-radius: 12px;
      background-color: #f8fafc;
      border: 1px solid #cbd5e1;
      color: #0f172a;
    }
    .password-row {
      position: relative;
      flex-direction: row;
      align-items: center;
    }
    .password-input {
      padding-right: 48px;
    }
    .toggle-eye {
      position: absolute;
      right: 10px;
      padding: 8px;
      justify-content: center;
      align-items: center;
    }
    .toggle-eye-icon {
      font-size: 16px;
    }
    .error-msg {
      font-size: 11px;
      color: #ef4444;
      margin-top: 2px;
      padding-left: 4px;
    }
    .buttons-stack {
      gap: 10px;
      margin-top: 6px;
    }
    .btn-primary {
      width: 100%;
      padding: 14px;
      background-color: #002E62;
      border-radius: 14px;
      align-items: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .btn-primary-text {
      color: #ffffff;
      font-size: 15px;
      font-weight: 700;
    }
    .btn-secondary {
      width: 100%;
      padding: 14px;
      background-color: #0284c7;
      border-radius: 14px;
      align-items: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .btn-secondary-text {
      color: #ffffff;
      font-size: 15px;
      font-weight: 700;
    }
    .btn-disabled {
      opacity: 0.5;
    }
    .ready-banner {
      padding: 14px;
      background-color: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 12px;
      gap: 2px;
    }
    .ready-title {
      font-size: 13px;
      font-weight: 700;
      color: #1e40af;
    }
    .ready-subtitle {
      font-size: 11px;
      color: #3b82f6;
    }
    @media (prefers-color-scheme: dark) {
      .field-label {
        color: #94a3b8;
      }
      .input-box {
        background-color: #0f172a;
        border-color: #334155;
        color: #f8fafc;
      }
      .btn-primary {
        background-color: #0284c7;
      }
      .ready-banner {
        background-color: rgba(2, 132, 199, 0.15);
        border-color: #0284c7;
      }
      .ready-title {
        color: #38bdf8;
      }
      .ready-subtitle {
        color: #7dd3fc;
      }
    }
  `
})
export class ReportFormComponent implements OnInit {
  @Input() set scanValue(val: string) {
    if (!val) return;
    this.parseScanValue(val);
  }

  @Output() loadingState = new EventEmitter<boolean>();
  @Output() notify = new EventEmitter<NotificationState>();

  accessionNumber = signal('');
  reportKey = signal('');
  isPasswordShow = signal(false);
  pdfUrl = signal<string | null>(null);
  downloadProgress = signal<number | null>(null);
  dialogVisible = signal(false);

  showAccessionError = signal(false);
  showKeyError = signal(false);

  private reportService = inject(ReportService);
  private storageService = inject(StorageService);
  private fileService = inject(FileService);

  constructor() {}

  ngOnInit(): void {
    const saved = this.storageService.getAccessionNumber();
    if (saved) {
      this.accessionNumber.set(saved);
    }
  }

  onAccessionChange(val: string): void {
    this.accessionNumber.set(val);
    this.storageService.saveAccessionNumber(val);
    if (val.trim()) {
      this.showAccessionError.set(false);
    }
  }

  onKeyChange(val: string): void {
    this.reportKey.set(val);
    if (val.trim()) {
      this.showKeyError.set(false);
    }
  }

  togglePasswordShow(): void {
    this.isPasswordShow.set(!this.isPasswordShow());
  }

  canSearch(): boolean {
    return !!(this.accessionNumber().trim() && this.reportKey().trim());
  }

  canDownload(): boolean {
    return !!(this.pdfUrl() && this.canSearch());
  }

  parseScanValue(raw: string): void {
    try {
      const parsed = JSON.parse(raw);
      const acc = parsed.AccesionNumber || parsed.accessionNumber || '';
      const key = parsed.Key || parsed.key || '';
      if (acc) this.accessionNumber.set(acc);
      if (key) this.reportKey.set(key);
    } catch {
      this.reportKey.set(raw);
    }
  }

  async onSearch(): Promise<void> {
    if (!this.accessionNumber().trim()) {
      this.showAccessionError.set(true);
      return;
    }
    if (!this.reportKey().trim()) {
      this.showKeyError.set(true);
      return;
    }

    this.loadingState.emit(true);
    try {
      const values: ReportFormValues = {
        AccesionNumber: this.accessionNumber().trim(),
        Key: this.reportKey().trim(),
      };
      const url = await this.reportService.getReportUrl(values);
      this.pdfUrl.set(url);
      this.notify.emit({
        type: 'success',
        title: 'Report Found',
        message: 'Patient report URL retrieved successfully.',
      });
    } catch (err: any) {
      this.notify.emit({
        type: 'error',
        title: 'Error getting report',
        message: err?.message || 'Unable to retrieve report with provided parameters.',
      });
    } finally {
      this.loadingState.emit(false);
    }
  }

  async onDownload(): Promise<void> {
    const url = this.pdfUrl();
    if (!url) return;

    this.downloadProgress.set(0);
    this.dialogVisible.set(true);

    try {
      await this.fileService.downloadReport(url, (pct) => {
        this.downloadProgress.set(pct);
      });
      this.downloadProgress.set(100);
    } catch (err: any) {
      this.onHideDialog();
      this.notify.emit({
        type: 'error',
        title: 'Download Error',
        message: err?.message || 'Failed to download report document.',
      });
    }
  }

  onHideDialog(): void {
    this.fileService.cancelDownload();
    this.dialogVisible.set(false);
    this.downloadProgress.set(null);
  }

  onOpenReport(): void {
    const url = this.pdfUrl();
    if (url) {
      this.fileService.openReport(url);
    }
    this.onHideDialog();
  }
}
