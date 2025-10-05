import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

export type StatusType = 'active' | 'inactive' | 'pending' | 'draft' | 'disabled' | 'success' | 'warning' | 'error' | 'info';

@Component({
  selector: 'app-status-chip',
  standalone: true,
  imports: [
    CommonModule,
    MatChipsModule,
    MatTooltipModule,
    MatIconModule,
    TranslateModule
  ],
  template: `
    <mat-chip 
      [class]="getChipClass()"
      [matTooltip]="tooltip"
      [matTooltipPosition]="tooltipPosition"
      class="status-chip">
      
      @if (showIcon) {
        <mat-icon class="chip-icon">{{ getIcon() }}</mat-icon>
      }
      
      <span class="chip-text">{{ displayTextValue }}</span>
    </mat-chip>
  `,
  styles: [`
    .status-chip {
      font-weight: 600;
      font-size: 12px;
      padding: 4px 12px;
      border-radius: 16px;
      transition: all 0.2s ease;
      cursor: default;
    }

    .status-chip:hover {
      transform: translateY(-1px);
      box-shadow: var(--elevation-2);
    }

    /* Status-specific colors */
    .status-chip.status-active {
      background: var(--success-color);
      color: white;
    }

    .status-chip.status-active .chip-icon {
      color: white;
    }

    .status-chip.status-inactive {
      background: var(--error-color);
      color: white;
    }

    .status-chip.status-inactive .chip-icon {
      color: white;
    }

    .status-chip.status-pending {
      background: var(--warning-color);
      color: white;
    }

    .status-chip.status-pending .chip-icon {
      color: white;
    }

    .status-chip.status-draft {
      background: #6b7280;
      color: white;
    }

    .status-chip.status-draft .chip-icon {
      color: white;
    }

    .status-chip.status-disabled {
      background: #9ca3af;
      color: white;
    }

    .status-chip.status-disabled .chip-icon {
      color: white;
    }

    .status-chip.status-success {
      background: var(--success-color);
      color: white;
    }

    .status-chip.status-success .chip-icon {
      color: white;
    }

    .status-chip.status-warning {
      background: var(--warning-color);
      color: white;
    }

    .status-chip.status-warning .chip-icon {
      color: white;
    }

    .status-chip.status-error {
      background: var(--error-color);
      color: white;
    }

    .status-chip.status-error .chip-icon {
      color: white;
    }

    .status-chip.status-info {
      background: var(--info-color);
      color: white;
    }

    .status-chip.status-info .chip-icon {
      color: white;
    }

    .chip-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      margin-right: 4px;
    }

    .chip-text {
      font-size: 12px;
      font-weight: 600;
    }

    /* Size variants */
    .status-chip.size-small {
      font-size: 10px;
      padding: 2px 8px;
    }
    
    .status-chip.size-small .chip-icon {
      font-size: 12px;
      width: 12px;
      height: 12px;
    }
    
    .status-chip.size-small .chip-text {
      font-size: 10px;
    }
    
    .status-chip.size-large {
      font-size: 14px;
      padding: 6px 16px;
    }
    
    .status-chip.size-large .chip-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    
    .status-chip.size-large .chip-text {
      font-size: 14px;
    }
  `]
})
export class StatusChipComponent {
  @Input() status: StatusType = 'active';
  @Input() displayText?: string;
  @Input() tooltip?: string;
  @Input() tooltipPosition: 'above' | 'below' | 'left' | 'right' | 'before' | 'after' = 'above';
  @Input() showIcon: boolean = true;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  protected getChipClass(): string {
    const sizeClass = this.size !== 'medium' ? `size-${this.size}` : '';
    return `status-${this.status} ${sizeClass}`.trim();
  }

  protected getIcon(): string {
    switch (this.status) {
      case 'active':
      case 'success':
        return 'check_circle';
      case 'inactive':
      case 'disabled':
        return 'cancel';
      case 'pending':
      case 'warning':
        return 'schedule';
      case 'draft':
        return 'edit';
      case 'error':
        return 'error';
      case 'info':
        return 'info';
      default:
        return 'help';
    }
  }

  protected get displayTextValue(): string {
    if (this.displayText) {
      return this.displayText;
    }
    
    switch (this.status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'pending': return 'Pending';
      case 'draft': return 'Draft';
      case 'disabled': return 'Disabled';
      case 'success': return 'Success';
      case 'warning': return 'Warning';
      case 'error': return 'Error';
      case 'info': return 'Info';
      default: return 'Unknown';
    }
  }
}
