import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { StoreService, UpsertStoreRequest } from '../../../../api/services/StoreService';
import { Store } from '../../../../api/models/Store';
import { OpeningHoursComponent } from '../../../store/components/opening-hours/opening-hours';

@Component({
  selector: 'app-store-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    OpeningHoursComponent
  ],
  templateUrl: './store-form.html',
  styleUrl: './store-form.scss'
})
export class StoreForm implements OnInit {
  storeForm: FormGroup;
  loading = false;
  saving = false;
  hasExistingStore = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.storeForm = this.createForm();
  }

  ngOnInit() {
    this.loadStore();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      addressLine: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      lat: ['', [Validators.required, Validators.min(-90), Validators.max(90)]],
      lng: ['', [Validators.required, Validators.min(-180), Validators.max(180)]],
      serviceRadiusKm: ['', [Validators.required, Validators.min(0.1), Validators.max(100)]]
    });
  }

  async loadStore() {
    this.loading = true;
    this.error = null;

    try {
      const store = await StoreService.getStore();
      if (store) {
        this.hasExistingStore = true;
        this.storeForm.patchValue({
          addressLine: store.addressLine || '',
          city: store.city || '',
          lat: store.lat || '',
          lng: store.lng || '',
          serviceRadiusKm: store.serviceRadiusKm || ''
        });
      } else {
        this.hasExistingStore = false;
      }
    } catch (error) {
      this.error = 'Failed to load store settings';
      this.showSnackBar('Failed to load store settings', 'error');
      console.error('Error loading store:', error);
    } finally {
      this.loading = false;
    }
  }

  async onSubmit() {
    if (this.storeForm.valid) {
      this.saving = true;
      this.error = null;

      try {
        const formValue = this.storeForm.value;
        const request: UpsertStoreRequest = {
          addressLine: formValue.addressLine,
          city: formValue.city,
          lat: Number(formValue.lat),
          lng: Number(formValue.lng),
          serviceRadiusKm: Number(formValue.serviceRadiusKm)
        };

        await StoreService.upsertStore(request);
        
        const action = this.hasExistingStore ? 'updated' : 'created';
        this.showSnackBar(`Store ${action} successfully`, 'success');
        
        // Reload the store to get updated data
        await this.loadStore();
        
      } catch (error) {
        this.error = 'Failed to save store settings';
        this.showSnackBar('Failed to save store settings', 'error');
        console.error('Error saving store:', error);
      } finally {
        this.saving = false;
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.storeForm.controls).forEach(key => {
      const control = this.storeForm.get(key);
      control?.markAsTouched();
    });
  }

  private showSnackBar(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Close', {
      duration: type === 'success' ? 3000 : 5000,
      panelClass: type === 'success' ? 'success-snackbar' : 'error-snackbar'
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.storeForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (control.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
      if (control.errors['min']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${control.errors['min'].min}`;
      }
      if (control.errors['max']) {
        return `${this.getFieldLabel(fieldName)} must be at most ${control.errors['max'].max}`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      addressLine: 'Address',
      city: 'City',
      lat: 'Latitude',
      lng: 'Longitude',
      serviceRadiusKm: 'Service Radius'
    };
    return labels[fieldName] || fieldName;
  }
}
