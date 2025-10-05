import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

import { ImageUploadComponent, UploadedImage } from '../image-upload/image-upload.component';
import { MenuItemsService } from '../../../features/sections/data/menu-items.service';

export interface ImageUploadDialogData {
  menuItem: any;
  restaurantId: string;
}

@Component({
  selector: 'app-image-upload-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCardModule,
    MatDividerModule,
    ImageUploadComponent
  ],
  template: `
    <div class="image-upload-dialog">
      <div class="dialog-header">
        <h2 class="dialog-title">
          <mat-icon>add_photo_alternate</mat-icon>
          Upload Images for {{ data.menuItem.name }}
        </h2>
        <button mat-icon-button (click)="onCancel()" class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-divider></mat-divider>

      <div class="dialog-content">
        <div class="menu-item-info">
          <mat-card class="info-card">
            <div class="info-content">
              <div class="item-details">
                <h3>{{ data.menuItem.name }}</h3>
                <p class="item-description">{{ data.menuItem.description || 'No description' }}</p>
                <div class="item-meta">
                  <span class="price">{{ formatPrice(data.menuItem.basePrice) }}</span>
                  <span class="quantity">Qty: {{ data.menuItem.quantity }}</span>
                </div>
              </div>
              @if (data.menuItem.images && data.menuItem.images.length > 0) {
                <div class="current-images">
                  <h4>Current Images ({{ data.menuItem.images.length }})</h4>
                  <div class="images-grid">
                    @for (image of data.menuItem.images; track $index) {
                      <div class="current-image-item">
                        <img [src]="image" [alt]="data.menuItem.name">
                        <button mat-icon-button 
                                class="remove-image-btn" 
                                (click)="removeCurrentImage($index)"
                                matTooltip="Remove image">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </mat-card>
        </div>

        <div class="upload-section">
          <h3>Add New Images</h3>
          <app-image-upload
            [images]="uploadedImages"
            [config]="uploadConfig"
            [disabled]="uploading()"
            (imagesChange)="onImagesChange($event)"
            (uploadStart)="onUploadStart($event)"
            (uploadComplete)="onUploadComplete($event)"
            (uploadError)="onUploadError($event)"
            (imageRemove)="onImageRemove($event)">
          </app-image-upload>
        </div>
      </div>

      <mat-divider></mat-divider>

      <div class="dialog-actions">
        <button mat-button (click)="onCancel()" [disabled]="uploading()">
          Cancel
        </button>
        <button mat-raised-button 
                color="primary" 
                (click)="onSave()"
                [disabled]="uploading() || uploadedImages().length === 0">
          @if (uploading()) {
            <mat-spinner diameter="16"></mat-spinner>
            <span>Uploading...</span>
          } @else {
            <mat-icon>save</mat-icon>
            <span>Save Images</span>
          }
        </button>
      </div>
    </div>
  `,
  styles: [`
    .image-upload-dialog {
      display: flex;
      flex-direction: column;
      max-height: 90vh;
      overflow: hidden;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 24px 0 24px;
    }

    .dialog-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #1e293b;
    }

    .dialog-title mat-icon {
      color: #3b82f6;
    }

    .close-button {
      color: #64748b;
    }

    .dialog-content {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
      max-height: calc(90vh - 140px);
    }

    .menu-item-info {
      margin-bottom: 24px;
    }

    .info-card {
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .info-content {
      padding: 16px;
    }

    .item-details h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
    }

    .item-description {
      margin: 0 0 12px 0;
      color: #64748b;
      font-size: 14px;
    }

    .item-meta {
      display: flex;
      gap: 16px;
      font-size: 14px;
    }

    .price {
      font-weight: 600;
      color: #059669;
    }

    .quantity {
      color: #64748b;
    }

    .current-images {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
    }

    .current-images h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }

    .images-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 8px;
    }

    .current-image-item {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }

    .current-image-item img {
      width: 100%;
      height: 60px;
      object-fit: cover;
    }

    .remove-image-btn {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 24px;
      height: 24px;
      background: rgba(220, 38, 38, 0.9);
      color: white;
      font-size: 12px;
    }

    .upload-section h3 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }

    .dialog-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .dialog-content {
        padding: 16px;
      }
      
      .dialog-header {
        padding: 16px 16px 0 16px;
      }
      
      .dialog-actions {
        padding: 12px 16px;
        flex-direction: column;
      }
      
      .dialog-actions button {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class ImageUploadDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ImageUploadDialogComponent>);
  protected readonly data = inject<ImageUploadDialogData>(MAT_DIALOG_DATA);
  private readonly menuItemsService = inject(MenuItemsService);
  private readonly snackBar = inject(MatSnackBar);

  uploadedImages = signal<UploadedImage[]>([]);
  uploading = signal(false);

  uploadConfig = {
    maxFiles: 10,
    maxFileSize: 5, // 5MB
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    showPreview: true,
    showProgress: true,
    allowMultiple: true
  };

  onImagesChange(images: UploadedImage[]) {
    this.uploadedImages.set(images);
  }

  onUploadStart(files: File[]) {
    this.uploading.set(true);
  }

  onUploadComplete(images: UploadedImage[]) {
    this.uploading.set(false);
  }

  onUploadError(error: Error) {
    this.uploading.set(false);
    this.snackBar.open('Error uploading images: ' + error.message, 'Close', { duration: 5000 });
  }

  onImageRemove(imageId: string) {
    // Image removal is handled by the ImageUploadComponent
  }

  removeCurrentImage(index: number) {
    if (confirm('Are you sure you want to remove this image?')) {
      // Remove image from the current images array
      const currentImages = [...this.data.menuItem.images];
      currentImages.splice(index, 1);
      this.data.menuItem.images = currentImages;
      this.snackBar.open('Image removed successfully', 'Close', { duration: 3000 });
    }
  }

  onSave() {
    if (this.uploadedImages().length === 0) {
      this.snackBar.open('No images to upload', 'Close', { duration: 3000 });
      return;
    }

    this.uploading.set(true);
    
    // Simulate upload process
    setTimeout(() => {
      this.uploading.set(false);
      this.dialogRef.close(true);
      this.snackBar.open('Images uploaded successfully', 'Close', { duration: 3000 });
    }, 2000);
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  formatPrice(price: number | undefined): string {
    if (!price) {
      return 'No price set';
    }
    return `$${price.toFixed(2)}`;
  }
}
