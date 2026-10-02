import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { View, Text, Pressable } from '@ng-native/components';

@Component({
  selector: 'app-download-dialog',
  standalone: true,
  imports: [CommonModule, View, Text, Pressable],
  template: `
    <view *ngIf="show" class="backdrop" (press)="onCancel()">
      <view class="dialog-box" (press)="$event.stopPropagation()">
        <text class="dialog-title">{{ title }}</text>

        <view class="progress-container">
          <view class="progress-track">
            <view class="progress-bar" [style.width.%]="progress"></view>
          </view>
          <text class="progress-percent">{{ progress }}%</text>

          <text *ngIf="isComplete" class="complete-message">
            Report downloaded successfully. Tap Open to view your document.
          </text>
        </view>

        <view class="actions-row">
          <pressable class="btn-cancel" (press)="onCancel()">
            <text class="btn-cancel-text">Cancel</text>
          </pressable>

          <pressable *ngIf="isComplete" class="btn-open" (press)="onOpen()">
            <text class="btn-open-text">Open Report</text>
          </pressable>
        </view>
      </view>
    </view>
  `,
  styles: `
    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 50;
      background-color: rgba(0, 0, 0, 0.65);
      justify-content: center;
      align-items: center;
      padding: 16px;
    }
    .dialog-box {
      width: 100%;
      max-width: 360px;
      background-color: #ffffff;
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
    }
    .dialog-title {
      font-size: 18px;
      font-weight: 700;
      color: #002E62;
      text-align: center;
      margin-bottom: 16px;
    }
    .progress-container {
      margin-vertical: 8px;
      align-items: center;
      gap: 8px;
    }
    .progress-track {
      width: 100%;
      height: 10px;
      border-radius: 5px;
      background-color: #e2e8f0;
      overflow: hidden;
    }
    .progress-bar {
      height: 100%;
      background-color: #002E62;
      border-radius: 5px;
      transition: width 0.3s ease;
    }
    .progress-percent {
      font-size: 14px;
      font-weight: 600;
      color: #64748b;
    }
    .complete-message {
      font-size: 12px;
      color: #16a34a;
      text-align: center;
      margin-top: 4px;
    }
    .actions-row {
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
      gap: 12px;
      margin-top: 20px;
    }
    .btn-cancel {
      padding: 10px 16px;
      border-radius: 10px;
    }
    .btn-cancel-text {
      color: #64748b;
      font-size: 14px;
      font-weight: 500;
    }
    .btn-open {
      padding: 10px 18px;
      background-color: #002E62;
      border-radius: 10px;
    }
    .btn-open-text {
      color: #ffffff;
      font-size: 14px;
      font-weight: 600;
    }
    @media (prefers-color-scheme: dark) {
      .dialog-box {
        background-color: #1e293b;
        border: 1px solid #334155;
      }
      .dialog-title {
        color: #38bdf8;
      }
      .progress-track {
        background-color: #0f172a;
      }
      .progress-bar {
        background-color: #38bdf8;
      }
      .progress-percent {
        color: #94a3b8;
      }
      .btn-cancel-text {
        color: #94a3b8;
      }
      .btn-open {
        background-color: #0284c7;
      }
    }
  `
})
export class DownloadDialogComponent {
  @Input() show = false;
  @Input() downloadProgress: number | null = null;
  @Input() title = 'Downloading report...';

  @Output() cancelled = new EventEmitter<void>();
  @Output() opened = new EventEmitter<void>();

  get progress(): number {
    if (this.downloadProgress === null) return 0;
    return Math.min(100, Math.max(0, Math.round(this.downloadProgress)));
  }

  get isComplete(): boolean {
    return this.progress >= 100;
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onOpen(): void {
    this.opened.emit();
  }
}
