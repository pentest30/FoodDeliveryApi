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

import { MenuItemsService, MenuItemDto, CreateMenuItemDto, UpdateMenuItemDto, MenuItemVariantDto, CreateMenuItemVariantDto } from '../../data/menu-items.service';

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

          <!-- Section Divider -->
          <mat-divider class="section-divider"></mat-divider>

          <!-- Group D: Variants (only in edit mode) -->
          <div class="form-section" *ngIf="data.mode === 'edit'">
            <div class="section-header">
              <mat-icon class="section-icon">tune</mat-icon>
              <h3 class="section-title">Menu Item Variants</h3>
              <button mat-button color="primary" (click)="addVariant()" class="add-variant-btn">
                <mat-icon>add</mat-icon>
                Add Variant
              </button>
            </div>
            
            <div class="section-content">
              <!-- Variants List -->
              <div class="variants-list" *ngIf="variants().length > 0">
                <div class="variant-item" *ngFor="let variant of variants()">
                  <div class="variant-info">
                    <div class="variant-name">{{ variant.name }}</div>
                    <div class="variant-details">
                      <span class="variant-price">{{ formatPrice(variant.price) }}</span>
                      <span class="variant-size" *ngIf="variant.size">{{ variant.size }}</span>
                      <span class="variant-sku" *ngIf="variant.sku">SKU: {{ variant.sku }}</span>
                    </div>
                  </div>
                  <div class="variant-actions">
                    <button mat-icon-button (click)="editVariant(variant)" matTooltip="Edit">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button (click)="deleteVariant(variant)" matTooltip="Delete" class="delete-btn">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div class="empty-variants" *ngIf="variants().length === 0">
                <mat-icon class="empty-icon">tune</mat-icon>
                <p>No variants added yet</p>
                <p class="empty-description">Add size options, pricing tiers, or different configurations</p>
              </div>

              <!-- Variant Form -->
              <div class="variant-form" *ngIf="showVariantForm()">
                <div class="variant-form-header">
                  <h4>{{ editingVariant ? 'Edit Variant' : 'Add New Variant' }}</h4>
                  <button mat-icon-button (click)="cancelVariantForm()">
                    <mat-icon>close</mat-icon>
                  </button>
                </div>
                
                <form [formGroup]="variantForm" class="variant-form-content">
                  <div class="variant-form-row">
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Variant Name</mat-label>
                      <input matInput formControlName="name" placeholder="e.g., Small, Large, Extra Spicy">
                      <mat-icon matSuffix>label</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Price</mat-label>
                      <input matInput type="number" formControlName="price" placeholder="0.00" step="0.01" min="0">
                      <span matPrefix>$&nbsp;</span>
                      <mat-icon matSuffix>attach_money</mat-icon>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Description</mat-label>
                    <textarea matInput formControlName="description" placeholder="Optional description for this variant"></textarea>
                    <mat-icon matSuffix>description</mat-icon>
                  </mat-form-field>

                  <div class="variant-form-row">
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

                  <div class="variant-form-row">
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Weight (optional)</mat-label>
                      <input matInput type="number" formControlName="weight" placeholder="0.0" step="0.1" min="0">
                      <mat-icon matSuffix>scale</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>SKU</mat-label>
                      <input matInput formControlName="sku" placeholder="Product SKU">
                      <mat-icon matSuffix>qr_code</mat-icon>
                    </mat-form-field>
                  </div>

                  <div class="variant-form-row">
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Stock Quantity</mat-label>
                      <input matInput type="number" formControlName="stockQuantity" placeholder="0" min="0">
                      <mat-icon matSuffix>inventory</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Available Until</mat-label>
                      <input matInput type="date" formControlName="availableUntil">
                      <mat-icon matSuffix>event</mat-icon>
                    </mat-form-field>
                  </div>

                  <div class="variant-form-actions">
                    <button mat-button type="button" (click)="cancelVariantForm()">Cancel</button>
                    <button mat-raised-button color="primary" (click)="saveVariant()" [disabled]="!variantForm.valid">
                      {{ editingVariant ? 'Update Variant' : 'Add Variant' }}
                    </button>
                  </div>
                </form>
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

    /* Variant Management Styles */
    .add-variant-btn {
      margin-left: auto;
    }

    .variants-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 16px;
    }

    .variant-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #f8fafc;
    }

    .variant-info {
      flex: 1;
    }

    .variant-name {
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 4px;
    }

    .variant-details {
      display: flex;
      gap: 12px;
      font-size: 14px;
      color: #64748b;
    }

    .variant-price {
      font-weight: 600;
      color: #059669;
    }

    .variant-size {
      background: #e0f2fe;
      color: #0369a1;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
    }

    .variant-sku {
      font-family: monospace;
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
    }

    .variant-actions {
      display: flex;
      gap: 4px;
    }

    .delete-btn {
      color: #dc2626;
    }

    .empty-variants {
      text-align: center;
      padding: 32px;
      color: #64748b;
    }

    .empty-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: #cbd5e1;
    }

    .empty-description {
      font-size: 14px;
      margin-top: 8px;
    }

    .variant-form {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #f8fafc;
      margin-top: 16px;
    }

    .variant-form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e2e8f0;
      background: white;
      border-radius: 8px 8px 0 0;
    }

    .variant-form-header h4 {
      margin: 0;
      color: #1e293b;
    }

    .variant-form-content {
      padding: 16px;
    }

    .variant-form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .variant-form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
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

  // Variant management
  variants = signal<MenuItemVariantDto[]>([]);
  showVariantForm = signal(false);
  variantForm!: FormGroup;
  editingVariant: MenuItemVariantDto | null = null;

  ngOnInit() {
    this.initializeForm();
    this.initializeVariantForm();
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

  private initializeVariantForm() {
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
      availableUntil: ['']
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

  // Variant Management Methods
  protected addVariant() {
    this.showVariantForm.set(true);
    this.editingVariant = null;
    this.variantForm.reset();
    this.variantForm.patchValue({
      currency: 'DZD',
      sortOrder: this.variants().length
    });
  }

  protected editVariant(variant: MenuItemVariantDto) {
    this.editingVariant = variant;
    this.showVariantForm.set(true);
    this.variantForm.patchValue({
      name: variant.name,
      description: variant.description,
      price: variant.price,
      currency: variant.currency,
      sortOrder: variant.sortOrder,
      size: variant.size,
      unit: variant.unit,
      weight: variant.weight,
      dimensions: variant.dimensions,
      sku: variant.sku,
      stockQuantity: variant.stockQuantity,
      availableUntil: variant.availableUntil ? new Date(variant.availableUntil).toISOString().split('T')[0] : ''
    });
  }

  protected saveVariant() {
    if (this.variantForm.valid && this.data.menuItem) {
      const formValue = this.variantForm.value;
      const variantData: CreateMenuItemVariantDto = {
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
        availableUntil: formValue.availableUntil ? new Date(formValue.availableUntil).toISOString() : undefined
      };

      if (this.editingVariant) {
        // Update existing variant
        this.menuItemsService.updateMenuItemVariant(
          this.data.menuItem.id,
          this.editingVariant.id,
          { ...variantData, active: true },
          this.data.restaurantId
        ).subscribe({
          next: () => {
            this.snackBar.open('Variant updated successfully', 'Close', { duration: 3000 });
            this.cancelVariantForm();
            this.loadVariants();
          },
          error: (error) => {
            console.error('Error updating variant:', error);
            this.snackBar.open('Error updating variant', 'Close', { duration: 3000 });
          }
        });
      } else {
        // Create new variant
        this.menuItemsService.addMenuItemVariant(
          this.data.menuItem.id,
          variantData,
          this.data.restaurantId
        ).subscribe({
          next: () => {
            this.snackBar.open('Variant added successfully', 'Close', { duration: 3000 });
            this.cancelVariantForm();
            this.loadVariants();
          },
          error: (error) => {
            console.error('Error adding variant:', error);
            this.snackBar.open('Error adding variant', 'Close', { duration: 3000 });
          }
        });
      }
    }
  }

  protected cancelVariantForm() {
    this.showVariantForm.set(false);
    this.editingVariant = null;
    this.variantForm.reset();
  }

  protected deleteVariant(variant: MenuItemVariantDto) {
    if (confirm(`Are you sure you want to delete the variant "${variant.name}"?`)) {
      if (this.data.menuItem) {
        this.menuItemsService.deleteMenuItemVariant(
          this.data.menuItem.id,
          variant.id,
          this.data.restaurantId
        ).subscribe({
          next: () => {
            this.snackBar.open('Variant deleted successfully', 'Close', { duration: 3000 });
            this.loadVariants();
          },
          error: (error) => {
            console.error('Error deleting variant:', error);
            this.snackBar.open('Error deleting variant', 'Close', { duration: 3000 });
          }
        });
      }
    }
  }

  protected loadVariants() {
    // TODO: Implement loading variants from backend
    // This would require a new endpoint to get variants for a menu item
    console.log('Loading variants for menu item');
  }

  protected formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'DZD'
    }).format(price);
  }
}
