import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    TranslateModule
  ],
  template: `
    <div class="empty-state">
      <div class="empty-state-content">
        <div class="empty-state-icon">
          <mat-icon [class]="iconClass">{{ icon }}</mat-icon>
        </div>
        <h3 class="empty-state-title">{{ title | translate }}</h3>
        <p class="empty-state-description">{{ description | translate }}</p>
        @if (actionText && actionClick) {
          <button 
            mat-raised-button 
            color="primary" 
            (click)="actionClick()"
            class="empty-state-action">
            {{ actionText | translate }}
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      padding: 40px 20px;
      text-align: center;
    }

    .empty-state-content {
      max-width: 400px;
    }

    .empty-state-icon {
      margin-bottom: 24px;
    }

    .empty-state-icon mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #94a3b8;
    }

    .empty-state-icon .primary {
      color: #3b82f6;
    }

    .empty-state-icon .success {
      color: #10b981;
    }

    .empty-state-icon .warning {
      color: #f59e0b;
    }

    .empty-state-icon .error {
      color: #ef4444;
    }

    .empty-state-title {
      margin: 0 0 12px 0;
      font-size: 20px;
      font-weight: 600;
      color: #1e293b;
    }

    .empty-state-description {
      margin: 0 0 24px 0;
      font-size: 14px;
      color: #64748b;
      line-height: 1.5;
    }

    .empty-state-action {
      margin-top: 16px;
    }

    @media (max-width: 768px) {
      .empty-state {
        min-height: 300px;
        padding: 20px;
      }

      .empty-state-icon mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }

      .empty-state-title {
        font-size: 18px;
      }

      .empty-state-description {
        font-size: 13px;
      }
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() iconClass = '';
  @Input() title = 'No data available';
  @Input() description = 'There are no items to display at the moment.';
  @Input() actionText?: string;
  @Input() actionClick?: () => void;
}
