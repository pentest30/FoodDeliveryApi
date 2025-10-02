import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Tenant } from '../../../../api/models/Tenant';

export interface TenantDialogData {
  tenant?: Tenant;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-tenant-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Create Tenant' : 'Edit Tenant' }}</h2>
    
    <mat-dialog-content>
      <form [formGroup]="tenantForm" class="tenant-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="Enter tenant name">
          <mat-error *ngIf="tenantForm.get('name')?.hasError('required')">
            Name is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Billing Email</mat-label>
          <input matInput type="email" formControlName="billingEmail" placeholder="Enter billing email">
          <mat-error *ngIf="tenantForm.get('billingEmail')?.hasError('required')">
            Billing email is required
          </mat-error>
          <mat-error *ngIf="tenantForm.get('billingEmail')?.hasError('email')">
            Please enter a valid email address
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Locale</mat-label>
          <mat-select formControlName="locale">
            <mat-option value="en-US">English (US)</mat-option>
            <mat-option value="en-GB">English (UK)</mat-option>
            <mat-option value="fr-FR">French</mat-option>
            <mat-option value="de-DE">German</mat-option>
            <mat-option value="es-ES">Spanish</mat-option>
          </mat-select>
          <mat-error *ngIf="tenantForm.get('locale')?.hasError('required')">
            Locale is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Currency</mat-label>
          <mat-select formControlName="currency">
            <mat-option value="USD">USD - US Dollar</mat-option>
            <mat-option value="EUR">EUR - Euro</mat-option>
            <mat-option value="GBP">GBP - British Pound</mat-option>
            <mat-option value="CAD">CAD - Canadian Dollar</mat-option>
            <mat-option value="AUD">AUD - Australian Dollar</mat-option>
          </mat-select>
          <mat-error *ngIf="tenantForm.get('currency')?.hasError('required')">
            Currency is required
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" 
              [disabled]="tenantForm.invalid" 
              (click)="onSave()">
        {{ data.mode === 'create' ? 'Create' : 'Update' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .tenant-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 400px;
      padding: 16px 0;
    }

    .full-width {
      width: 100%;
    }

    mat-dialog-content {
      max-height: 60vh;
      overflow-y: auto;
    }

    mat-dialog-actions {
      padding: 16px 0;
      gap: 8px;
    }
  `]
})
export class TenantDialogComponent implements OnInit {
  tenantForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TenantDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TenantDialogData
  ) {
    this.tenantForm = this.fb.group({
      name: ['', [Validators.required]],
      billingEmail: ['', [Validators.required, Validators.email]],
      locale: ['en-US', [Validators.required]],
      currency: ['USD', [Validators.required]]
    });
  }

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.tenant) {
      this.tenantForm.patchValue({
        name: this.data.tenant.name || '',
        billingEmail: this.data.tenant.billingEmail || '',
        locale: this.data.tenant.locale || 'en-US',
        currency: this.data.tenant.currency || 'USD'
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.tenantForm.valid) {
      this.dialogRef.close(this.tenantForm.value);
    }
  }
}