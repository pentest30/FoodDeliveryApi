import { Component, Inject, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SectionsService, RestaurantSectionDto, CreateSectionDto, UpdateSectionDto } from '../../data/sections.service';
import { RestaurantsService, RestaurantDto } from '../../../stores/data/stores.service';

export interface SectionDialogData {
  section?: RestaurantSectionDto;
  restaurantId?: string;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-section-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  template: `
    <div class="section-dialog">
      <!-- Dialog Header -->
      <div class="dialog-header">
        <div class="header-content">
          <div class="header-icon">
            <mat-icon class="dialog-icon">{{ isEditMode ? 'edit' : 'add' }}</mat-icon>
          </div>
          <div class="header-text">
            <h2 class="dialog-title">
              {{ isEditMode ? 'Edit Section' : 'Create New Section' }}
            </h2>
            <p class="dialog-subtitle">
              {{ isEditMode ? 'Update section information' : 'Add a new section to organize menu items' }}
            </p>
          </div>
        </div>
        <button mat-icon-button (click)="onCancel()" class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Dialog Content -->
      <div class="dialog-content">
        <form [formGroup]="sectionForm" (ngSubmit)="onSubmit()" class="section-form">
          <!-- Restaurant Selection -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Restaurant</mat-label>
            <mat-select formControlName="restaurantId" required>
              <mat-option *ngFor="let restaurant of restaurants()" [value]="restaurant.id">
                {{ restaurant.name }}
              </mat-option>
            </mat-select>
            <mat-icon matSuffix>restaurant</mat-icon>
            <mat-error *ngIf="sectionForm.get('restaurantId')?.hasError('required')">
              Please select a restaurant
            </mat-error>
          </mat-form-field>

          <!-- Section Name -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Section Name</mat-label>
            <input matInput formControlName="name" placeholder="e.g., Appetizers, Main Courses">
            <mat-icon matSuffix>category</mat-icon>
            <mat-error *ngIf="sectionForm.get('name')?.hasError('required')">
              Section name is required
            </mat-error>
            <mat-error *ngIf="sectionForm.get('name')?.hasError('minlength')">
              Section name must be at least 2 characters
            </mat-error>
          </mat-form-field>

          <!-- Section Description -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" 
                     placeholder="Brief description of this section"
                     rows="3"></textarea>
            <mat-icon matSuffix>description</mat-icon>
          </mat-form-field>

          <!-- Sort Order -->
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Sort Order</mat-label>
            <input matInput type="number" formControlName="sortOrder" placeholder="1">
            <mat-icon matSuffix>sort</mat-icon>
            <mat-error *ngIf="sectionForm.get('sortOrder')?.hasError('required')">
              Sort order is required
            </mat-error>
            <mat-error *ngIf="sectionForm.get('sortOrder')?.hasError('min')">
              Sort order must be at least 0
            </mat-error>
          </mat-form-field>

          <!-- Active Status -->
          <div class="checkbox-container">
            <mat-checkbox formControlName="active" class="active-checkbox">
              <span class="checkbox-label">Active Section</span>
              <span class="checkbox-description">This section will be visible to customers</span>
            </mat-checkbox>
          </div>
        </form>
      </div>

      <!-- Dialog Actions -->
      <div class="dialog-actions">
        <button mat-button (click)="onCancel()" class="cancel-button">
          Cancel
        </button>
        <button mat-raised-button 
                color="primary" 
                (click)="onSubmit()" 
                [disabled]="sectionForm.invalid || loading()"
                class="submit-button">
          @if (loading()) {
            <mat-spinner diameter="20"></mat-spinner>
          } @else {
            <mat-icon>{{ isEditMode ? 'save' : 'add' }}</mat-icon>
          }
          {{ isEditMode ? 'Update Section' : 'Create Section' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .section-dialog {
      min-width: 500px;
      max-width: 600px;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 24px 24px 0 24px;
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 24px;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .dialog-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: white;
    }

    .dialog-title {
      font-size: 20px;
      font-weight: 600;
      margin: 0;
      color: #1e293b;
    }

    .dialog-subtitle {
      font-size: 14px;
      margin: 4px 0 0 0;
      color: #64748b;
    }

    .close-button {
      color: #64748b;
      transition: all 0.2s ease;

      &:hover {
        color: #dc2626;
        background-color: #fef2f2;
      }
    }

    .dialog-content {
      padding: 0 24px;
    }

    .section-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      width: 48%;
    }

    .checkbox-container {
      margin: 8px 0;
    }

    .active-checkbox {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .checkbox-label {
      font-weight: 500;
      color: #374151;
    }

    .checkbox-description {
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 24px;
      border-top: 1px solid #e2e8f0;
      margin-top: 24px;
    }

    .cancel-button {
      color: #64748b;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 16px;
      font-weight: 500;
      transition: all 0.2s ease;

      &:hover {
        background-color: #f8fafc;
        border-color: #cbd5e1;
      }
    }

    .submit-button {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 8px 24px;
      font-weight: 600;
      min-width: 140px;
      transition: all 0.3s ease;

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    /* Form field styling */
    ::ng-deep .mat-mdc-form-field {
      .mat-mdc-text-field-wrapper {
        border-radius: 8px;
      }

      .mat-mdc-form-field-focus-overlay {
        background-color: rgba(59, 130, 246, 0.1);
      }
    }

    /* Responsive design */
    @media (max-width: 600px) {
      .section-dialog {
        min-width: 100%;
        max-width: 100%;
      }

      .dialog-header {
        padding: 16px 16px 0 16px;
      }

      .dialog-content {
        padding: 0 16px;
      }

      .dialog-actions {
        padding: 16px;
        flex-direction: column;
      }

      .submit-button {
        width: 100%;
      }

      .half-width {
        width: 100%;
      }
    }
  `]
})
export class SectionDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private sectionsService = inject(SectionsService);
  private restaurantsService = inject(RestaurantsService);
  private snackBar = inject(MatSnackBar);

  protected readonly loading = signal(false);
  protected readonly restaurants = signal<RestaurantDto[]>([]);

  sectionForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<SectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SectionDialogData
  ) {
    this.sectionForm = this.fb.group({
      restaurantId: ['', Validators.required],
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      sortOrder: [0, [Validators.required, Validators.min(0)]],
      active: [true]
    });
  }

  ngOnInit() {
    this.loadRestaurants();
    
    if (this.data.section) {
      this.populateForm();
    } else if (this.data.restaurantId) {
      this.sectionForm.patchValue({ restaurantId: this.data.restaurantId });
    }
  }

  protected get isEditMode(): boolean {
    return this.data.mode === 'edit';
  }

  private loadRestaurants() {
    this.restaurantsService.listRestaurants({ page: 1, pageSize: 100 }).subscribe({
      next: (response: any) => {
        this.restaurants.set(response.data || response.items || []);
      },
      error: (error: any) => {
        console.error('Error loading restaurants:', error);
        this.snackBar.open('Error loading restaurants', 'Close', { duration: 3000 });
      }
    });
  }

  private populateForm() {
    if (this.data.section) {
      this.sectionForm.patchValue({
        restaurantId: this.data.section.restaurantId,
        name: this.data.section.name,
        description: this.data.section.description,
        sortOrder: this.data.section.sortOrder,
        active: this.data.section.active
      });
    }
  }

  protected onSubmit() {
    if (this.sectionForm.valid) {
      this.loading.set(true);

      const formValue = this.sectionForm.value;

      if (this.isEditMode && this.data.section) {
        const updateData: UpdateSectionDto = {
          name: formValue.name,
          description: formValue.description,
          sortOrder: formValue.sortOrder,
          active: formValue.active
        };

        this.sectionsService.updateSection(this.data.section.id, updateData).subscribe({
          next: (section) => {
            this.loading.set(false);
            this.snackBar.open('Section updated successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(section);
          },
          error: (error) => {
            this.loading.set(false);
            console.error('Error updating section:', error);
            this.snackBar.open('Error updating section', 'Close', { duration: 3000 });
          }
        });
      } else {
        const createData: CreateSectionDto = {
          restaurantId: formValue.restaurantId,
          name: formValue.name,
          description: formValue.description,
          sortOrder: formValue.sortOrder,
          active: formValue.active
        };

        this.sectionsService.createSection(createData).subscribe({
          next: (section) => {
            this.loading.set(false);
            this.snackBar.open('Section created successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(section);
          },
          error: (error) => {
            this.loading.set(false);
            console.error('Error creating section:', error);
            this.snackBar.open('Error creating section', 'Close', { duration: 3000 });
          }
        });
      }
    }
  }

  protected onCancel() {
    this.dialogRef.close();
  }
}
