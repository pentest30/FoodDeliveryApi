import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

import { MenuItemsService, MenuItemDto, CreateMenuItemDto, UpdateMenuItemDto } from '../../data/menu-items.service';

export interface MenuItemDialogData {
  menuItem?: MenuItemDto;
  mode: 'create' | 'edit';
  restaurantId?: string;
}

@Component({
  selector: 'app-menu-item-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">
          {{ data.mode === 'create' ? 'Create Menu Item' : 'Edit Menu Item' }}
        </h2>
        <button mat-icon-button (click)="close()" class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <form [formGroup]="menuItemForm" (ngSubmit)="onSubmit()" class="dialog-form">
        <!-- Hidden Restaurant ID Field -->
        <input type="hidden" formControlName="restaurantId">
        
        <div class="form-content">
          <!-- Group A: Basic Info -->
          <div class="form-section">
            <div class="section-header">
              <mat-icon class="section-icon">info</mat-icon>
              <h3 class="section-title">Basic Information</h3>
            </div>
            
            <div class="section-content">
              <!-- Section Selection -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Section *</mat-label>
                <mat-select formControlName="sectionId" placeholder="Select a section">
                  <mat-option *ngFor="let section of sections()" [value]="section.id">
                    <div class="section-option">
                      <mat-icon>category</mat-icon>
                      <span>{{ section.name }}</span>
                    </div>
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="menuItemForm.get('sectionId')?.hasError('required')">
                  Section is required
                </mat-error>
              </mat-form-field>

              <!-- Name -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Name *</mat-label>
                <input matInput formControlName="name" placeholder="Enter menu item name">
                <mat-icon matSuffix>restaurant_menu</mat-icon>
                <mat-error *ngIf="menuItemForm.get('name')?.hasError('required')">
                  Name is required
                </mat-error>
              </mat-form-field>

              <!-- Description -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" placeholder="Enter menu item description" rows="3"></textarea>
                <mat-icon matSuffix>description</mat-icon>
              </mat-form-field>
            </div>
          </div>

          <!-- Section Divider -->
          <mat-divider class="section-divider"></mat-divider>

          <!-- Group B: Pricing & Availability -->
          <div class="form-section">
            <div class="section-header">
              <mat-icon class="section-icon">attach_money</mat-icon>
              <h3 class="section-title">Pricing & Availability</h3>
            </div>
            
            <div class="section-content">
              <div class="pricing-row">
                <!-- Price -->
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Base Price</mat-label>
                  <input matInput type="number" formControlName="basePrice" placeholder="0.00" step="0.01" min="0">
                  <span matPrefix>$&nbsp;</span>
                  <mat-icon matSuffix>attach_money</mat-icon>
                </mat-form-field>

                <!-- Quantity -->
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Quantity</mat-label>
                  <input matInput type="number" formControlName="quantity" placeholder="1" min="1">
                  <mat-icon matSuffix>inventory</mat-icon>
                </mat-form-field>
              </div>

              <!-- Available Status -->
              <div class="availability-section">
                <div class="availability-header">
                  <mat-icon class="availability-icon">toggle_on</mat-icon>
                  <span class="availability-label">Availability Status</span>
                </div>
                <div class="checkbox-container">
                  <mat-checkbox formControlName="available">
                    Available for ordering
                  </mat-checkbox>
                </div>
              </div>
            </div>
          </div>

          <!-- Section Divider -->
          <mat-divider class="section-divider"></mat-divider>

          <!-- Group C: Additional Information -->
          <div class="form-section">
            <div class="section-header">
              <mat-icon class="section-icon">warning</mat-icon>
              <h3 class="section-title">Additional Information</h3>
            </div>
            
            <div class="section-content">
              <!-- Allergens -->
              <div class="allergens-section">
                <div class="allergens-header">
                  <mat-icon class="allergens-icon">warning</mat-icon>
                  <span class="allergens-label">Allergens</span>
                </div>
                <div class="allergens-input">
                  <mat-form-field appearance="outline" class="allergen-input">
                    <mat-label>Add allergen</mat-label>
                    <input matInput #allergenInput placeholder="Enter allergen" (keyup.enter)="addAllergen(allergenInput)">
                  </mat-form-field>
                  <button mat-stroked-button type="button" (click)="addAllergen(allergenInput)">
                    <mat-icon>add</mat-icon>
                    Add
                  </button>
                </div>
                <div class="allergens-list" *ngIf="allergens().length > 0">
                  <mat-chip *ngFor="let allergen of allergens(); let i = index" 
                            (removed)="removeAllergen(i)" 
                            [removable]="true">
                    {{ allergen }}
                  </mat-chip>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="dialog-actions">
          <button mat-button type="button" (click)="close()" [disabled]="loading()">
            Cancel
          </button>
          <button mat-raised-button color="primary" type="submit" [disabled]="menuItemForm.invalid || loading()">
            @if (loading()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              {{ data.mode === 'create' ? 'Create' : 'Update' }}
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 0;
      max-width: 600px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 24px 0 24px;
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 24px;
    }

    .dialog-title {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #1e293b;
    }

    .close-button {
      color: #64748b;
    }

    .dialog-form {
      padding: 0 24px 24px 24px;
      max-height: calc(90vh - 120px);
      overflow-y: auto;
    }

    /* Hidden field styling */
    input[type="hidden"] {
      display: none;
    }

    .form-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* Form Section Styling */
    .form-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 0 8px 0;
      border-bottom: 2px solid #f1f5f9;
      margin-bottom: 16px;
    }

    .section-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: var(--primary-color);
    }

    .section-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      letter-spacing: -0.025em;
    }

    .section-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section-divider {
      margin: 8px 0;
      border-color: #e2e8f0;
    }

    /* Pricing Row */
    .pricing-row {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    /* Availability Section */
    .availability-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .availability-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .availability-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--success-color);
    }

    .availability-label {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }

    /* Allergens Section */
    .allergens-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .allergens-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .allergens-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--warning-color);
    }

    .allergens-label {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      width: calc(50% - 8px);
    }

    .checkbox-container {
      margin: 16px 0;
    }

    .allergens-section {
      margin-top: 16px;
    }

    .section-label {
      display: block;
      font-weight: 600;
      color: #374151;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .allergens-input {
      display: flex;
      gap: 8px;
      align-items: flex-end;
      margin-bottom: 16px;
    }

    .allergen-input {
      flex: 1;
    }

    .allergens-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .dialog-container {
        max-height: 95vh;
        margin: 8px;
      }
      
      .dialog-form {
        padding: 0 16px 16px 16px;
        max-height: calc(95vh - 100px);
      }
      
      .half-width {
        width: 100%;
      }
      
      .pricing-row {
        flex-direction: column;
        gap: 12px;
      }
      
      .section-header {
        padding: 8px 0 6px 0;
        margin-bottom: 12px;
      }
      
      .section-title {
        font-size: 14px;
      }
      
      .section-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
      
      .availability-section {
        padding: 12px;
      }
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
      flex-shrink: 0;
    }

    .section-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section-option mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #64748b;
    }

    /* Custom scrollbar styling */
    .dialog-container::-webkit-scrollbar,
    .dialog-form::-webkit-scrollbar {
      width: 6px;
    }

    .dialog-container::-webkit-scrollbar-track,
    .dialog-form::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    .dialog-container::-webkit-scrollbar-thumb,
    .dialog-form::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }

    .dialog-container::-webkit-scrollbar-thumb:hover,
    .dialog-form::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .dialog-container {
        max-height: 95vh;
        margin: 8px;
      }
      
      .dialog-form {
        max-height: calc(95vh - 100px);
        padding: 0 16px 16px 16px;
      }
      
      .half-width {
        width: 100%;
      }
      
      .allergens-input {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `]
})
export class MenuItemDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly menuItemsService = inject(MenuItemsService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialogRef = inject(MatDialogRef<MenuItemDialogComponent>);
  protected readonly data = inject<MenuItemDialogData>(MAT_DIALOG_DATA);

  menuItemForm!: FormGroup;
  loading = signal(false);
  allergens = signal<string[]>([]);
  sections = signal<{id: string, name: string}[]>([]);

  ngOnInit() {
    this.initializeForm();
    this.loadExistingData();
    this.loadSections();
  }

  private initializeForm() {
    this.menuItemForm = this.fb.group({
      restaurantId: [this.data.restaurantId || '', [Validators.required]],
      sectionId: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(1)]],
      description: [''],
      basePrice: [null],
      quantity: [1, [Validators.min(1)]],
      available: [true]
    });
  }

  private loadExistingData() {
    if (this.data.mode === 'edit' && this.data.menuItem) {
      const item = this.data.menuItem;
      this.menuItemForm.patchValue({
        restaurantId: this.data.restaurantId || '',
        sectionId: item.restaurantSectionId,
        name: item.name,
        description: item.description || '',
        basePrice: item.basePrice,
        quantity: item.quantity,
        available: item.available
      });
      this.allergens.set(item.allergens || []);
    }
  }

  private loadSections() {
    if (this.data.restaurantId) {
      this.menuItemsService.getSectionsForRestaurant(this.data.restaurantId).subscribe({
        next: (sections) => {
          this.sections.set(sections);
        },
        error: (error) => {
          console.error('Error loading sections:', error);
          this.snackBar.open('Error loading sections', 'Close', { duration: 3000 });
        }
      });
    }
  }

  protected addAllergen(input: HTMLInputElement) {
    const value = input.value.trim();
    if (value && !this.allergens().includes(value)) {
      this.allergens.set([...this.allergens(), value]);
      input.value = '';
    }
  }

  protected removeAllergen(index: number) {
    const current = this.allergens();
    this.allergens.set(current.filter((_, i) => i !== index));
  }

  protected onSubmit() {
    if (this.menuItemForm.valid) {
      this.loading.set(true);
      
      const formValue = this.menuItemForm.value;
      const menuItemData: CreateMenuItemDto | UpdateMenuItemDto = {
        name: formValue.name,
        description: formValue.description,
        basePrice: formValue.basePrice,
        quantity: formValue.quantity,
        available: formValue.available,
        allergens: this.allergens(),
        sectionId: formValue.sectionId,
        restaurantId: formValue.restaurantId
      };

      if (this.data.mode === 'create') {
        this.menuItemsService.createMenuItem(formValue.sectionId, menuItemData as CreateMenuItemDto).subscribe({
          next: () => {
            this.loading.set(false);
            this.dialogRef.close(true);
            this.snackBar.open('Menu item created successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            this.loading.set(false);
            console.error('Error creating menu item:', error);
            this.snackBar.open('Error creating menu item', 'Close', { duration: 3000 });
          }
        });
      } else if (this.data.menuItem) {
        this.menuItemsService.updateMenuItem(formValue.sectionId, this.data.menuItem.id, menuItemData as UpdateMenuItemDto).subscribe({
          next: () => {
            this.loading.set(false);
            this.dialogRef.close(true);
            this.snackBar.open('Menu item updated successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            this.loading.set(false);
            console.error('Error updating menu item:', error);
            this.snackBar.open('Error updating menu item', 'Close', { duration: 3000 });
          }
        });
      }
    }
  }

  protected close() {
    this.dialogRef.close();
  }
}
