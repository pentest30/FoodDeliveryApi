import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { TranslateModule } from '@ngx-translate/core';

export interface SegmentedControlOption {
  value: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-segmented-control',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatRippleModule,
    TranslateModule
  ],
  template: `
    <div class="segmented-control" [class.disabled]="disabled">
      <div class="segmented-control-container">
        @for (option of options; track option.value; let i = $index) {
          <button
            mat-button
            [class]="getButtonClass(option.value)"
            [disabled]="option.disabled || disabled"
            (click)="selectOption(option.value)"
            class="segmented-button"
            [attr.aria-pressed]="selectedValue() === option.value"
            [attr.aria-label]="option.label">
            
            @if (option.icon) {
              <mat-icon class="button-icon">{{ option.icon }}</mat-icon>
            }
            <span class="button-label">{{ option.label | translate }}</span>
            
            <!-- Active indicator -->
            <div 
              class="active-indicator" 
              [class.active]="selectedValue() === option.value">
            </div>
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .segmented-control {
      display: inline-flex;
      background: #f8fafc;
      border-radius: 8px;
      padding: 4px;
      box-shadow: var(--elevation-1);
      border: 1px solid #e2e8f0;
      
      &.disabled {
        opacity: 0.6;
        pointer-events: none;
      }
    }

    .segmented-control-container {
      display: flex;
      position: relative;
      background: transparent;
    }

    .segmented-button {
      position: relative;
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: 6px;
      border: none;
      background: transparent;
      color: #64748b;
      font-weight: 500;
      font-size: 14px;
      transition: all 0.2s ease;
      min-width: 120px;
      justify-content: center;
      overflow: hidden;
      
      &:hover:not(:disabled) {
        background: rgba(59, 130, 246, 0.1);
        color: var(--primary-color);
      }
      
      &:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
      }
      
      &.active {
        background: white;
        color: var(--primary-color);
        box-shadow: var(--elevation-1);
        font-weight: 600;
        
        .button-icon {
          color: var(--primary-color);
        }
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .button-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      transition: color 0.2s ease;
    }

    .button-label {
      font-size: 14px;
      transition: color 0.2s ease;
    }

    .active-indicator {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 2px;
      background: var(--primary-color);
      border-radius: 1px;
      transition: width 0.3s ease;
      
      &.active {
        width: 80%;
      }
    }

    /* Animation for active state */
    .segmented-button.active {
      animation: activePulse 0.3s ease;
    }

    @keyframes activePulse {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.02);
      }
      100% {
        transform: scale(1);
      }
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .segmented-control {
        width: 100%;
        overflow-x: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
        
        &::-webkit-scrollbar {
          display: none;
        }
      }
      
      .segmented-control-container {
        min-width: max-content;
      }
      
      .segmented-button {
        min-width: 100px;
        padding: var(--spacing-sm) var(--spacing-sm);
        
        .button-label {
          font-size: 13px;
        }
        
        .button-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .segmented-control {
        background: #1e293b;
        border-color: #334155;
      }
      
      .segmented-button {
        color: #94a3b8;
        
        &:hover:not(:disabled) {
          background: rgba(59, 130, 246, 0.2);
          color: var(--primary-light);
        }
        
        &.active {
          background: #334155;
          color: var(--primary-light);
        }
      }
    }
  `]
})
export class SegmentedControlComponent {
  @Input() options: SegmentedControlOption[] = [];
  @Input() value: string = '';
  @Input() disabled: boolean = false;
  @Output() valueChange = new EventEmitter<string>();

  protected readonly selectedValue = signal(this.value);

  protected getButtonClass(optionValue: string): string {
    return this.selectedValue() === optionValue ? 'active' : '';
  }

  protected selectOption(value: string) {
    if (!this.disabled) {
      this.selectedValue.set(value);
      this.valueChange.emit(value);
    }
  }
}
