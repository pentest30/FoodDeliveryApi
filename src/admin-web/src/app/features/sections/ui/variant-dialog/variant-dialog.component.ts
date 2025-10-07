import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { MenuItemsService, MenuItemVariantDto, CreateMenuItemVariantDto, UpdateMenuItemVariantDto } from '../../data/menu-items.service';

export interface VariantDialogData {
  menuItem: any;
  variant?: MenuItemVariantDto;
  mode: 'create' | 'edit';
  sectionId: string;
  restaurantId: string;
}

@Component({
  selector: 'app-variant-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatDialogModule
  ],
  template: `
    <div class="variant-dialog">
      <!-- Dialog Header -->
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon class="header-icon">tune</mat-icon>
          {{ data.mode === 'create' ? 'Add New Variant' : 'Edit Variant' }}
        </h2>
        <button mat-icon-button (click)="onCancel()" class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Dialog Content -->
      <div mat-dialog-content class="dialog-content">
        <form [formGroup]="variantForm" class="variant-form">
          
          <!-- Basic Information -->
          <div class="form-section">
            <h3 class="section-title">
              <mat-icon class="section-icon">info</mat-icon>
              Basic Information
            </h3>
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Variant Name</mat-label>
                <input matInput formControlName="name" placeholder="e.g., Small, Large, Extra Spicy">
                <mat-icon matSuffix>label</mat-icon>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" placeholder="Optional description for this variant"></textarea>
              <mat-icon matSuffix>description</mat-icon>
            </mat-form-field>
          </div>

          <mat-divider></mat-divider>

          <!-- Pricing -->
          <div class="form-section">
            <h3 class="section-title">
              <mat-icon class="section-icon">attach_money</mat-icon>
              Pricing
            </h3>
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Price</mat-label>
                <input matInput type="number" formControlName="price" placeholder="0.00" step="0.01" min="0">
                <span matPrefix>$&nbsp;</span>
                <mat-icon matSuffix>attach_money</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Currency</mat-label>
                <mat-select formControlName="currency">
                  <mat-option value="DZD">DZD</mat-option>
                  <mat-option value="USD">USD</mat-option>
                  <mat-option value="EUR">EUR</mat-option>
                </mat-select>
                <mat-icon matSuffix>monetization_on</mat-icon>
              </mat-form-field>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- Physical Properties -->
          <div class="form-section">
            <h3 class="section-title">
              <mat-icon class="section-icon">straighten</mat-icon>
              Physical Properties
            </h3>
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Size</mat-label>
                <input matInput formControlName="size" placeholder="e.g., 12oz, Large, XL">
                <mat-icon matSuffix>straighten</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Unit</mat-label>
                <input matInput formControlName="unit" placeholder="e.g., piece, cup, slice">
                <mat-icon matSuffix>category</mat-icon>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Weight (optional)</mat-label>
                <input matInput type="number" formControlName="weight" placeholder="0.0" step="0.1" min="0">
                <mat-icon matSuffix>scale</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Dimensions</mat-label>
                <input matInput formControlName="dimensions" placeholder="e.g., 10x15x5 cm">
                <mat-icon matSuffix>aspect_ratio</mat-icon>
              </mat-form-field>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- Inventory & Availability -->
          <div class="form-section">
            <h3 class="section-title">
              <mat-icon class="section-icon">inventory</mat-icon>
              Inventory & Availability
            </h3>
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>SKU</mat-label>
                <input matInput formControlName="sku" placeholder="Product SKU">
                <mat-icon matSuffix>qr_code</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Stock Quantity</mat-label>
                <input matInput type="number" formControlName="stockQuantity" placeholder="0" min="0">
                <mat-icon matSuffix>inventory</mat-icon>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Available Until</mat-label>
                <input matInput type="date" formControlName="availableUntil">
                <mat-icon matSuffix>event</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Sort Order</mat-label>
                <input matInput type="number" formControlName="sortOrder" placeholder="0" min="0">
                <mat-icon matSuffix>sort</mat-icon>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-checkbox formControlName="active" class="active-checkbox">
                Active (available for ordering)
              </mat-checkbox>
            </div>
          </div>
        </form>
      </div>

      <!-- Dialog Actions -->
      <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()" [disabled]="loading()">
          Cancel
        </button>
        <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!variantForm.valid || loading()">
          <mat-icon *ngIf="loading()">hourglass_empty</mat-icon>
          <mat-icon *ngIf="!loading()">save</mat-icon>
          {{ loading() ? 'Saving...' : (data.mode === 'create' ? 'Add Variant' : 'Update Variant') }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .variant-dialog {
      display: flex;
      flex-direction: column;
      min-width: 600px;
      max-width: 800px;
      max-height: 90vh;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #e2e8f0;
      background: #f8fafc;
    }

    .dialog-header h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #1e293b;
    }

    .header-icon {
      color: #3b82f6;
    }

    .close-button {
      color: #64748b;
    }

    .dialog-content {
      padding: 24px;
      max-height: calc(90vh - 140px);
      overflow-y: auto;
    }

    .variant-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }

    .section-icon {
      color: #3b82f6;
      font-size: 18px;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .half-width {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    .active-checkbox {
      margin-top: 8px;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid #e2e8f0;
      background: #f8fafc;
    }

    /* Custom scrollbar */
    .dialog-content::-webkit-scrollbar {
      width: 6px;
    }

    .dialog-content::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 3px;
    }

    .dialog-content::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }

    .dialog-content::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .variant-dialog {
        min-width: 100%;
        max-width: 100%;
        max-height: 100vh;
      }

      .dialog-content {
        padding: 16px;
      }

      .form-row {
        flex-direction: column;
      }

      .half-width {
        width: 100%;
      }
    }
  `]
})
export class VariantDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly menuItemsService = inject(MenuItemsService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialogRef = inject(MatDialogRef<VariantDialogComponent>);
  readonly data = inject<VariantDialogData>(MAT_DIALOG_DATA);

  variantForm!: FormGroup;
  loading = signal(false);

  ngOnInit() {
    this.initializeForm();
    this.loadExistingData();
  }

  private initializeForm() {
    this.variantForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      currency: ['DZD', [Validators.required]],
      sortOrder: [0, [Validators.min(0)]],
      size: [''],
      unit: [''],
      weight: [null, [Validators.min(0)]],
      dimensions: [''],
      sku: [''],
      stockQuantity: [null, [Validators.min(0)]],
      availableUntil: [''],
      active: [true]
    });
  }

  private loadExistingData() {
    if (this.data.mode === 'edit' && this.data.variant) {
      this.variantForm.patchValue({
        name: this.data.variant.name,
        description: this.data.variant.description,
        price: this.data.variant.price,
        currency: this.data.variant.currency,
        sortOrder: this.data.variant.sortOrder,
        size: this.data.variant.size,
        unit: this.data.variant.unit,
        weight: this.data.variant.weight,
        dimensions: this.data.variant.dimensions,
        sku: this.data.variant.sku,
        stockQuantity: this.data.variant.stockQuantity,
        availableUntil: this.data.variant.availableUntil ? new Date(this.data.variant.availableUntil).toISOString().split('T')[0] : '',
        active: this.data.variant.active
      });
    } else {
      // For new variants, set default sort order
      this.variantForm.patchValue({
        sortOrder: 0
      });
    }
  }

  protected onSave() {
    if (this.variantForm.valid) {
      this.loading.set(true);
      const formValue = this.variantForm.value;
      
      const variantData: CreateMenuItemVariantDto | UpdateMenuItemVariantDto = {
        name: formValue.name,
        description: formValue.description || '',
        price: formValue.price,
        currency: formValue.currency,
        sortOrder: formValue.sortOrder,
        size: formValue.size || '',
        unit: formValue.unit || '',
        weight: formValue.weight,
        dimensions: formValue.dimensions || '',
        sku: formValue.sku || '',
        stockQuantity: formValue.stockQuantity,
        availableUntil: formValue.availableUntil ? new Date(formValue.availableUntil).toISOString() : undefined,
        ...(this.data.mode === 'edit' ? { active: formValue.active } : {})
      };

      if (this.data.mode === 'create') {
        this.menuItemsService.addMenuItemVariant(
          this.data.menuItem.id,
          variantData,
          this.data.restaurantId
        ).subscribe({
          next: () => {
            this.loading.set(false);
            this.snackBar.open('Variant added successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.loading.set(false);
            console.error('Error adding variant:', error);
            this.snackBar.open('Error adding variant', 'Close', { duration: 3000 });
          }
        });
      } else {
        const updateData: UpdateMenuItemVariantDto = {
          ...variantData,
          active: true
        };
        
        this.menuItemsService.updateMenuItemVariant(
          this.data.menuItem.id,
          this.data.variant!.id,
          updateData,
          this.data.restaurantId
        ).subscribe({
          next: () => {
            this.loading.set(false);
            this.snackBar.open('Variant updated successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.loading.set(false);
            console.error('Error updating variant:', error);
            this.snackBar.open('Error updating variant', 'Close', { duration: 3000 });
          }
        });
      }
    }
  }

  protected onCancel() {
    this.dialogRef.close(false);
  }
}
