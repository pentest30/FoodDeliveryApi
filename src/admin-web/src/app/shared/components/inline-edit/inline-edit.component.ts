import { Component, Input, Output, EventEmitter, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

export type InlineEditType = 'text' | 'number' | 'select' | 'chip';

export interface InlineEditOption {
  value: any;
  label: string;
}

@Component({
  selector: 'app-inline-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  template: `
    <div class="inline-edit-container">
      @if (!isEditing()) {
        <!-- Display Mode -->
        <div class="display-mode" (click)="startEdit()" [class.clickable]="!disabled">
          <span class="display-value" [class.disabled]="disabled">
            {{ displayValue() }}
          </span>
          @if (!disabled) {
            <mat-icon class="edit-icon" matTooltip="Click to edit">edit</mat-icon>
          }
        </div>
      } @else {
        <!-- Edit Mode -->
        <div class="edit-mode">
          @if (type === 'text' || type === 'number') {
            <mat-form-field appearance="outline" class="inline-form-field">
              <input 
                matInput 
                [formControl]="editControl"
                [type]="type === 'number' ? 'number' : 'text'"
                [placeholder]="placeholder"
                (keydown.enter)="save()"
                (keydown.escape)="cancel()"
                #inputRef>
            </mat-form-field>
          } @else if (type === 'select') {
            <mat-form-field appearance="outline" class="inline-form-field">
              <mat-select [formControl]="editControl" [placeholder]="placeholder">
                @for (option of options; track option.value) {
                  <mat-option [value]="option.value">{{ option.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          } @else if (type === 'chip') {
            <div class="chip-container">
              @for (option of options; track option.value) {
                <mat-chip 
                  [class.selected]="editControl.value === option.value"
                  (click)="editControl.setValue(option.value)"
                  class="selectable-chip">
                  {{ option.label }}
                </mat-chip>
              }
            </div>
          }
          
          <div class="edit-actions">
            <button 
              mat-icon-button 
              color="primary" 
              (click)="save()"
              [disabled]="editControl.invalid"
              matTooltip="Save">
              <mat-icon>check</mat-icon>
            </button>
            <button 
              mat-icon-button 
              (click)="cancel()"
              matTooltip="Cancel">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .inline-edit-container {
      position: relative;
    }

    .display-mode {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s ease;
      
      &.clickable {
        cursor: pointer;
        
        &:hover {
          background: #f1f5f9;
        }
      }
    }

    .display-value {
      font-size: 14px;
      color: #1e293b;
      
      &.disabled {
        color: #94a3b8;
      }
    }

    .edit-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #64748b;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .display-mode:hover .edit-icon {
      opacity: 1;
    }

    .edit-mode {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .inline-form-field {
      min-width: 120px;
      
      ::ng-deep .mat-mdc-form-field-wrapper {
        padding-bottom: 0;
      }
      
      ::ng-deep .mat-mdc-form-field-subscript-wrapper {
        display: none;
      }
    }

    .chip-container {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    .selectable-chip {
      cursor: pointer;
      transition: all 0.2s ease;
      
      &.selected {
        background: #3b82f6;
        color: white;
      }
      
      &:hover:not(.selected) {
        background: #f1f5f9;
      }
    }

    .edit-actions {
      display: flex;
      gap: 4px;
    }
  `]
})
export class InlineEditComponent implements OnInit {
  @Input() value: any = '';
  @Input() type: InlineEditType = 'text';
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() options: InlineEditOption[] = [];
  @Input() validators: any[] = [];
  
  @Output() valueChange = new EventEmitter<any>();
  @Output() saveChange = new EventEmitter<any>();
  @Output() cancelChange = new EventEmitter<void>();

  protected readonly isEditing = signal(false);
  protected readonly editControl = new FormControl('');

  protected readonly displayValue = computed(() => {
    if (this.type === 'select' || this.type === 'chip') {
      const option = this.options.find(opt => opt.value === this.value);
      return option ? option.label : this.value;
    }
    return this.value || '';
  });

  ngOnInit() {
    this.editControl.setValue(this.value);
    this.editControl.setValidators(this.validators);
  }

  protected startEdit() {
    if (!this.disabled) {
      this.isEditing.set(true);
      this.editControl.setValue(this.value);
    }
  }

  protected save() {
    if (this.editControl.valid) {
      const newValue = this.editControl.value;
      this.valueChange.emit(newValue);
      this.saveChange.emit(newValue);
      this.isEditing.set(false);
    }
  }

  protected cancel() {
    this.editControl.setValue(this.value);
    this.cancelChange.emit();
    this.isEditing.set(false);
  }
}
