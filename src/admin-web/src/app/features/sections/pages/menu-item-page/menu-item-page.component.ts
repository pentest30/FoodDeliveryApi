import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { MenuItemsService, CreateMenuItemDto, UpdateMenuItemDto, MenuItemVariantDto } from '../../data/menu-items.service';
import { VariantDialogComponent, VariantDialogData } from '../../ui/variant-dialog/variant-dialog.component';

@Component({
  selector: 'app-menu-item-page',
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
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatCardModule,
    MatToolbarModule,
    MatDialogModule
  ],
  template: `
    <div class="menu-item-page">
      <!-- Header Toolbar -->
      <mat-toolbar class="page-toolbar">
        <button mat-icon-button (click)="goBack()" class="back-button">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span class="page-title">
          {{ isEditMode() ? 'Edit Menu Item' : 'Create Menu Item' }}
        </span>
        <div class="toolbar-spacer"></div>
        <button mat-button (click)="goBack()" [disabled]="loading()">
          Cancel
        </button>
        <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="!menuItemForm.valid || loading()">
          <mat-icon *ngIf="loading()">hourglass_empty</mat-icon>
          <mat-icon *ngIf="!loading()">save</mat-icon>
          {{ loading() ? 'Saving...' : 'Save' }}
        </button>
      </mat-toolbar>

      <!-- Main Content -->
      <div class="page-content">
        <div class="form-container">
          <form [formGroup]="menuItemForm" class="menu-item-form">
            
            <!-- Group A: Basic Information -->
            <mat-card class="form-section">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon class="section-icon">info</mat-icon>
                  Basic Information
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <!-- Debug Info (remove in production) -->
                <div *ngIf="true" style="background: #f0f0f0; padding: 10px; margin-bottom: 16px; border-radius: 4px; font-size: 12px;">
                  <strong>Debug Info:</strong><br>
                  Restaurant ID: {{ restaurantId() }}<br>
                  Sections Count: {{ sections().length }}<br>
                  Form Valid: {{ menuItemForm?.valid }}<br>
                  Section ID: {{ menuItemForm?.get('sectionId')?.value }}<br>
                  Name: {{ menuItemForm?.get('name')?.value }}<br>
                  <strong>Form Errors:</strong><br>
                  Restaurant ID Valid: {{ menuItemForm?.get('restaurantId')?.valid }}<br>
                  Section ID Valid: {{ menuItemForm?.get('sectionId')?.valid }}<br>
                  Name Valid: {{ menuItemForm?.get('name')?.valid }}<br>
                  <strong>Field Errors:</strong><br>
                  Restaurant ID Errors: {{ menuItemForm?.get('restaurantId')?.errors | json }}<br>
                  Section ID Errors: {{ menuItemForm?.get('sectionId')?.errors | json }}<br>
                  Name Errors: {{ menuItemForm?.get('name')?.errors | json }}
                </div>
                
                <div class="form-row">
                  <!-- Section Selection -->
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Section</mat-label>
                    <mat-select formControlName="sectionId" required>
                      <mat-option *ngFor="let section of sections()" [value]="section.id">
                        <div class="section-option">
                          <mat-icon>folder</mat-icon>
                          <span>{{ section.name }}</span>
                        </div>
                      </mat-option>
                      <mat-option *ngIf="sections().length === 0" disabled>
                        No sections available
                      </mat-option>
                    </mat-select>
                    <mat-icon matSuffix>folder</mat-icon>
                    <mat-hint *ngIf="sections().length === 0" class="error-hint">
                      No sections available. Please create a section first.
                    </mat-hint>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <!-- Name -->
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Menu Item Name</mat-label>
                    <input matInput formControlName="name" placeholder="e.g., Margherita Pizza">
                    <mat-icon matSuffix>restaurant</mat-icon>
                  </mat-form-field>

                  <!-- Hidden Restaurant ID -->
                  <input type="hidden" formControlName="restaurantId">
                </div>

                <!-- Description -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" placeholder="Describe this menu item..."></textarea>
                  <mat-icon matSuffix>description</mat-icon>
                </mat-form-field>
              </mat-card-content>
            </mat-card>

            <!-- Group B: Pricing & Availability -->
            <mat-card class="form-section">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon class="section-icon">attach_money</mat-icon>
                  Pricing & Availability
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="pricing-row">
                  <!-- Base Price -->
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
                    <mat-icon class="availability-icon">check_circle</mat-icon>
                    <span class="availability-label">Availability</span>
                  </div>
                  <mat-checkbox formControlName="available" class="availability-checkbox">
                    Available for ordering
                  </mat-checkbox>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Group C: Additional Information -->
            <mat-card class="form-section">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon class="section-icon">warning</mat-icon>
                  Additional Information
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
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
              </mat-card-content>
            </mat-card>

            <!-- Group D: Variants (only in edit mode) -->
            <mat-card class="form-section" *ngIf="isEditMode()">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon class="section-icon">tune</mat-icon>
                  Menu Item Variants
                </mat-card-title>
                <div class="section-actions">
                  <button mat-raised-button color="primary" (click)="addVariant()" class="add-variant-btn">
                    <mat-icon>add</mat-icon>
                    Add Variant
                  </button>
                </div>
              </mat-card-header>
              <mat-card-content>
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

              </mat-card-content>
            </mat-card>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .menu-item-page {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: #f8fafc;
    }

    .page-toolbar {
      background: white;
      border-bottom: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      z-index: 1000;
    }

    .back-button {
      margin-right: 16px;
    }

    .page-title {
      font-size: 20px;
      font-weight: 600;
      color: #1e293b;
    }

    .toolbar-spacer {
      flex: 1;
    }

    .page-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }

    .form-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .menu-item-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-section {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
    }

    .form-section mat-card-header {
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      border-radius: 12px 12px 0 0;
    }

    .form-section mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
    }

    .section-icon {
      color: #3b82f6;
    }

    .section-actions {
      margin-left: auto;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .pricing-row {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }

    .half-width {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    .section-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .availability-section {
      margin-top: 16px;
    }

    .availability-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .availability-icon {
      color: #059669;
    }

    .availability-label {
      font-weight: 600;
      color: #1e293b;
    }

    .availability-checkbox {
      margin-left: 32px;
    }

    .allergens-section {
      margin-top: 16px;
    }

    .allergens-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .allergens-icon {
      color: #dc2626;
    }

    .allergens-label {
      font-weight: 600;
      color: #1e293b;
    }

    .allergens-input {
      display: flex;
      gap: 12px;
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
      padding: 16px;
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
      margin-bottom: 8px;
      font-size: 16px;
    }

    .variant-details {
      display: flex;
      gap: 16px;
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
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
    }

    .variant-sku {
      font-family: monospace;
      background: #f1f5f9;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }

    .variant-actions {
      display: flex;
      gap: 8px;
    }

    .delete-btn {
      color: #dc2626;
    }

    .empty-variants {
      text-align: center;
      padding: 48px;
      color: #64748b;
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      color: #cbd5e1;
    }

    .empty-description {
      font-size: 14px;
      margin-top: 8px;
    }

    .error-hint {
      color: #dc2626;
      font-size: 0.75rem;
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
      padding: 24px;
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
      .page-content {
        padding: 16px;
      }

      .form-row,
      .pricing-row,
      .variant-form-row {
        flex-direction: column;
      }

      .half-width {
        width: 100%;
      }

      .variant-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .variant-actions {
        align-self: flex-end;
      }
    }
  `]
})
export class MenuItemPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly menuItemsService = inject(MenuItemsService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);

  menuItemForm!: FormGroup;
  loading = signal(false);
  allergens = signal<string[]>([]);
  sections = signal<{id: string, name: string}[]>([]);

  // Variant management
  variants = signal<MenuItemVariantDto[]>([]);

  // Route parameters
  restaurantId = signal<string>('');
  menuItemId = signal<string>('');
  isEditMode = signal(false);

  ngOnInit() {
    console.log('Menu item page initialized');
    this.loadRouteParams();
  }

  private loadRouteParams() {
    this.route.params.subscribe(params => {
      console.log('Route params loaded:', params);
      this.restaurantId.set(params['restaurantId']);
      this.menuItemId.set(params['menuItemId']);
      this.isEditMode.set(!!params['menuItemId']);
      
      // Initialize form after route params are loaded
      this.initializeForm();
      this.loadSections();
      
      // Load variants if in edit mode
      if (this.isEditMode()) {
        this.loadVariants();
      }
      
      // Add form value changes subscription for debugging
      setTimeout(() => {
        if (this.menuItemForm) {
          this.menuItemForm.valueChanges.subscribe(value => {
            console.log('Form value changed:', value);
            console.log('Form valid:', this.menuItemForm.valid);
            console.log('Form errors:', this.menuItemForm.errors);
          });
        }
      }, 100);
      
      if (this.isEditMode()) {
        this.loadExistingData();
      }
    });
  }

  private initializeForm() {
    console.log('Initializing form with restaurantId:', this.restaurantId());
    this.menuItemForm = this.fb.group({
      restaurantId: [this.restaurantId(), [Validators.required]],
      sectionId: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(1)]],
      description: [''],
      basePrice: [null],
      quantity: [1, [Validators.min(1)]],
      available: [true]
    });
    console.log('Form initialized:', this.menuItemForm);
    console.log('Form initial values:', this.menuItemForm.value);
  }


  private loadExistingData() {
    if (this.isEditMode() && this.menuItemId()) {
      this.menuItemsService.getMenuItem(this.menuItemId()).subscribe({
        next: (item) => {
          this.menuItemForm.patchValue({
            restaurantId: this.restaurantId(),
            sectionId: item.restaurantSectionId,
            name: item.name,
            description: item.description || '',
            basePrice: item.basePrice,
            quantity: item.quantity,
            available: item.available
          });
          
          // Load allergens
          this.allergens.set(item.allergens || []);
          
          // Load variants
          this.variants.set(item.variants || []);
        },
        error: (error) => {
          console.error('Error loading menu item:', error);
          this.snackBar.open('Error loading menu item', 'Close', { duration: 3000 });
        }
      });
    }
  }

  private loadSections() {
    if (this.restaurantId()) {
      console.log('Loading sections for restaurant:', this.restaurantId());
      this.menuItemsService.getSectionsForRestaurant(this.restaurantId()).subscribe({
        next: (sections) => {
          console.log('Sections loaded:', sections);
          this.sections.set(sections);
          if (sections.length === 0) {
            console.warn('No sections found for restaurant:', this.restaurantId());
          }
        },
        error: (error) => {
          console.error('Error loading sections:', error);
          this.sections.set([]);
        }
      });
    } else {
      console.log('No restaurant ID available for loading sections');
      this.sections.set([]);
    }
  }

  protected onSubmit() {
    console.log('Form valid:', this.menuItemForm.valid);
    console.log('Form errors:', this.menuItemForm.errors);
    console.log('Form value:', this.menuItemForm.value);
    console.log('Form controls:', this.menuItemForm.controls);
    
    if (this.menuItemForm.valid) {
      this.loading.set(true);
      const formValue = this.menuItemForm.value;
      
      const menuItemData = {
        name: formValue.name,
        description: formValue.description || '',
        basePrice: formValue.basePrice,
        quantity: formValue.quantity,
        available: formValue.available,
        allergens: this.allergens()
      };

      if (this.isEditMode()) {
        this.menuItemsService.updateMenuItem(formValue.sectionId, this.menuItemId(), menuItemData as UpdateMenuItemDto).subscribe({
          next: () => {
            this.loading.set(false);
            this.snackBar.open('Menu item updated successfully', 'Close', { duration: 3000 });
            this.goBack();
          },
          error: (error) => {
            this.loading.set(false);
            console.error('Error updating menu item:', error);
            this.snackBar.open('Error updating menu item', 'Close', { duration: 3000 });
          }
        });
      } else {
        this.menuItemsService.createMenuItem(formValue.sectionId, menuItemData as CreateMenuItemDto).subscribe({
          next: () => {
            this.loading.set(false);
            this.snackBar.open('Menu item created successfully', 'Close', { duration: 3000 });
            this.goBack();
          },
          error: (error) => {
            this.loading.set(false);
            console.error('Error creating menu item:', error);
            this.snackBar.open('Error creating menu item', 'Close', { duration: 3000 });
          }
        });
      }
    }
  }

  protected goBack() {
    this.location.back();
  }

  // Allergen management
  protected addAllergen(input: HTMLInputElement) {
    const value = input.value.trim();
    if (value && !this.allergens().includes(value)) {
      this.allergens.update(allergens => [...allergens, value]);
      input.value = '';
    }
  }

  protected removeAllergen(index: number) {
    this.allergens.update(allergens => allergens.filter((_, i) => i !== index));
  }

  // Variant Management Methods
  protected addVariant() {
    const dialogData: VariantDialogData = {
      menuItem: { id: this.menuItemId() },
      mode: 'create',
      sectionId: this.menuItemForm.value.sectionId,
      restaurantId: this.restaurantId()
    };

    const dialogRef = this.dialog.open(VariantDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadVariants();
      }
    });
  }

  protected editVariant(variant: MenuItemVariantDto) {
    const dialogData: VariantDialogData = {
      menuItem: { id: this.menuItemId() },
      variant: variant,
      mode: 'edit',
      sectionId: this.menuItemForm.value.sectionId,
      restaurantId: this.restaurantId()
    };

    const dialogRef = this.dialog.open(VariantDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadVariants();
      }
    });
  }


  protected deleteVariant(variant: MenuItemVariantDto) {
    if (confirm(`Are you sure you want to delete the variant "${variant.name}"?`)) {
      if (this.menuItemId()) {
        this.menuItemsService.deleteMenuItemVariant(
          this.menuItemId(),
          variant.id,
          this.restaurantId()
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
    if (this.menuItemId()) {
      this.menuItemsService.getMenuItemVariants(
        this.menuItemId()!, 
        this.restaurantId()
      ).subscribe({
        next: (variants) => {
          console.log('Loaded variants:', variants);
          this.variants.set(variants);
        },
        error: (error) => {
          console.error('Error loading variants:', error);
          this.snackBar.open('Error loading variants', 'Close', { duration: 3000 });
        }
      });
    }
  }

  protected formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'DZD'
    }).format(price);
  }
}
