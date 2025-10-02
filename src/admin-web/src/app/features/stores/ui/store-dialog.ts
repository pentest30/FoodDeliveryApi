import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs/operators';

import { RestaurantsService, RestaurantDto } from '../data/stores.service';

export interface StoreDialogData {
  store?: RestaurantDto;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-store-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    TranslateModule
  ],
  template: `
    <div class="store-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>{{ isEditMode ? 'edit' : 'add' }}</mat-icon>
          {{ isEditMode ? ('restaurants.edit' | translate) : ('restaurants.create' | translate) }}
        </h2>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <form [formGroup]="storeForm" class="store-form">
          <!-- Restaurant Name -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'restaurants.name' | translate }} *</mat-label>
            <input matInput formControlName="name" placeholder="Enter restaurant name">
            <mat-error *ngIf="storeForm.get('name')?.hasError('required')">
              {{ 'restaurants.required' | translate }}
            </mat-error>
            <mat-error *ngIf="storeForm.get('name')?.hasError('minlength')">
              Name must be at least 2 characters
            </mat-error>
          </mat-form-field>

          <!-- Address -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'restaurants.address' | translate }}</mat-label>
            <input matInput formControlName="addressLine1" placeholder="Enter street address">
          </mat-form-field>

          <!-- City -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'restaurants.city' | translate }}</mat-label>
            <input matInput formControlName="city" placeholder="Enter city">
          </mat-form-field>

          <!-- Location Section -->
          <div class="section-header">
            <mat-icon>location_on</mat-icon>
            <span>Location Details</span>
          </div>

          <!-- Coordinates Row -->
          <div class="coordinates-row">
            <mat-form-field appearance="outline" class="coordinate-field">
              <mat-label>Latitude</mat-label>
              <input matInput 
                     type="number" 
                     formControlName="lat" 
                     placeholder="40.7128"
                     step="0.000001">
              <mat-hint>e.g., 40.7128</mat-hint>
              <mat-error *ngIf="storeForm.get('lat')?.hasError('min')">
                Latitude must be between -90 and 90
              </mat-error>
              <mat-error *ngIf="storeForm.get('lat')?.hasError('max')">
                Latitude must be between -90 and 90
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="coordinate-field">
              <mat-label>Longitude</mat-label>
              <input matInput 
                     type="number" 
                     formControlName="lng" 
                     placeholder="-74.0060"
                     step="0.000001">
              <mat-hint>e.g., -74.0060</mat-hint>
              <mat-error *ngIf="storeForm.get('lng')?.hasError('min')">
                Longitude must be between -180 and 180
              </mat-error>
              <mat-error *ngIf="storeForm.get('lng')?.hasError('max')">
                Longitude must be between -180 and 180
              </mat-error>
            </mat-form-field>
          </div>

          <!-- Service Settings Section -->
          <div class="section-header">
            <mat-icon>settings</mat-icon>
            <span>Service Settings</span>
          </div>

          <!-- Service Radius -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Service Radius (km)</mat-label>
            <input matInput 
                   type="number" 
                   formControlName="serviceRadiusKm" 
                   placeholder="5"
                   min="0"
                   max="100">
            <mat-hint>Maximum delivery radius in kilometers</mat-hint>
            <mat-error *ngIf="storeForm.get('serviceRadiusKm')?.hasError('min')">
              Service radius must be 0 or greater
            </mat-error>
            <mat-error *ngIf="storeForm.get('serviceRadiusKm')?.hasError('max')">
              Service radius cannot exceed 100 km
            </mat-error>
          </mat-form-field>

          <!-- ETA Minutes -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Estimated Delivery Time (minutes)</mat-label>
            <input matInput 
                   type="number" 
                   formControlName="etaMinutes" 
                   placeholder="30"
                   min="1"
                   max="300">
            <mat-hint>Average delivery time in minutes</mat-hint>
            <mat-error *ngIf="storeForm.get('etaMinutes')?.hasError('required')">
              ETA is required
            </mat-error>
            <mat-error *ngIf="storeForm.get('etaMinutes')?.hasError('min')">
              ETA must be at least 1 minute
            </mat-error>
            <mat-error *ngIf="storeForm.get('etaMinutes')?.hasError('max')">
              ETA cannot exceed 300 minutes
            </mat-error>
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close [disabled]="loading">
          Cancel
        </button>
        <button mat-raised-button 
                color="primary" 
                (click)="save()" 
                [disabled]="storeForm.invalid || loading">
          <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
          <mat-icon *ngIf="!loading">{{ isEditMode ? 'save' : 'add' }}</mat-icon>
          {{ isEditMode ? 'Save Changes' : ('restaurants.create' | translate) }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .store-dialog {
      width: 100%;
      max-width: 600px;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .dialog-header h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      font-size: 1.5rem;
      font-weight: 500;
    }

    .dialog-header mat-icon {
      color: #3f51b5;
    }

    mat-dialog-content {
      padding: 0 24px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .store-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 16px 0;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 20px 0 8px 0;
      padding: 12px 16px;
      background: #f5f5f5;
      border-radius: 8px;
      font-weight: 500;
      color: #555;
      font-size: 0.95rem;
    }

    .section-header mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .full-width {
      width: 100%;
    }

    .coordinates-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .coordinate-field {
      width: 100%;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      gap: 12px;
    }

    mat-dialog-actions button {
      min-width: 100px;
    }

    mat-spinner {
      margin-right: 8px;
    }

    /* Responsive Design */
    @media (max-width: 600px) {
      .store-dialog {
        max-width: 100vw;
        margin: 0;
      }

      .coordinates-row {
        grid-template-columns: 1fr;
      }

      mat-dialog-content {
        padding: 0 16px;
      }

      mat-dialog-actions {
        padding: 16px;
        flex-direction: column-reverse;
      }

      mat-dialog-actions button {
        width: 100%;
      }
    }

    /* Form Validation Styles */
    .mat-mdc-form-field.mat-form-field-invalid .mat-mdc-text-field-wrapper {
      border-color: #f44336;
    }

    .mat-mdc-form-field-error {
      font-size: 0.75rem;
      margin-top: 4px;
    }

    /* Loading State */
    button[disabled] {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Success/Error States */
    .success-message {
      color: #4caf50;
      font-size: 0.875rem;
      margin-top: 8px;
    }

    .error-message {
      color: #f44336;
      font-size: 0.875rem;
      margin-top: 8px;
    }
  `]
})
export class StoreDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private restaurantsService = inject(RestaurantsService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<StoreDialogComponent>);

  storeForm!: FormGroup;
  loading = false;
  isEditMode = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: StoreDialogData) {
    this.isEditMode = data.mode === 'edit';
  }

  ngOnInit() {
    this.initializeForm();
    
    if (this.isEditMode && this.data.store) {
      this.populateForm(this.data.store);
    }
  }

  private initializeForm() {
    this.storeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      addressLine1: [''],
      city: [''],
      lat: [null, [Validators.min(-90), Validators.max(90)]],
      lng: [null, [Validators.min(-180), Validators.max(180)]],
      serviceRadiusKm: [null, [Validators.min(0), Validators.max(100)]],
      etaMinutes: [30, [Validators.required, Validators.min(1), Validators.max(300)]]
    });
  }

  private populateForm(store: RestaurantDto) {
    this.storeForm.patchValue({
      name: store.name,
      addressLine1: store.addressLine || '',
      city: store.city || '',
      lat: store.lat,
      lng: store.lng,
      serviceRadiusKm: store.serviceRadiusKm,
      etaMinutes: store.etaMinutes || 30
    });
  }

  save() {
    if (this.storeForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    const formValue = this.storeForm.value;

    // Clean up null/empty values
    const storeData = {
      name: formValue.name,
      addressLine1: formValue.addressLine1 || undefined,
      city: formValue.city || undefined,
      lat: formValue.lat || undefined,
      lng: formValue.lng || undefined,
      serviceRadiusKm: formValue.serviceRadiusKm || undefined,
      etaMinutes: formValue.etaMinutes
    };

    const operation = this.isEditMode && this.data.store
      ? this.restaurantsService.updateRestaurant(this.data.store.id, storeData)
      : this.restaurantsService.createRestaurant(storeData);

    operation.pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (result) => {
        const message = this.isEditMode ? 'Store updated successfully' : 'Store created successfully';
        this.snackBar.open(message, 'Close', { duration: 3000 });
        this.dialogRef.close(result);
      },
      error: (error) => {
        console.error('Error saving store:', error);
        const message = this.isEditMode ? 'Error updating store' : 'Error creating store';
        this.snackBar.open(message, 'Close', { duration: 5000 });
      }
    });
  }

  private markFormGroupTouched() {
    Object.keys(this.storeForm.controls).forEach(key => {
      const control = this.storeForm.get(key);
      control?.markAsTouched();
    });
  }
}