import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

export interface ImageUploadConfig {
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  showPreview?: boolean;
  showProgress?: boolean;
  allowMultiple?: boolean;
}

export interface UploadedImage {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploading?: boolean;
}

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatCardModule,
    MatChipsModule
  ],
  template: `
    <div class="image-upload-container" 
         [class.drag-over]="isDragOver()"
         [class.has-images]="images().length > 0"
         (dragover)="onDragOver($event)"
         (dragleave)="onDragLeave($event)"
         (drop)="onDrop($event)">
      
      <!-- Upload Area -->
      <div class="upload-area" 
           [class.drag-over]="isDragOver()"
           [class.has-images]="images().length > 0">
        
        <!-- No Images State -->
        <div *ngIf="images().length === 0" class="upload-placeholder">
          <mat-icon class="upload-icon">cloud_upload</mat-icon>
          <h3 class="upload-title">Upload Images</h3>
          <p class="upload-description">
            Drag and drop images here or 
            <button mat-button color="primary" (click)="triggerFileInput()">
              browse files
            </button>
          </p>
          <div class="upload-constraints" *ngIf="config">
            <p class="constraint-text">
              Max {{ config.maxFiles || 5 }} files, 
              {{ config.maxFileSize || 10 }}MB each
            </p>
            <p class="constraint-text" *ngIf="config.acceptedTypes">
              Accepted: {{ config.acceptedTypes.join(', ') }}
            </p>
          </div>
        </div>

        <!-- Has Images State -->
        <div *ngIf="images().length > 0" class="images-preview">
          <div class="preview-header">
            <h4 class="preview-title">
              {{ images().length }} image{{ images().length > 1 ? 's' : '' }} uploaded
            </h4>
            <button mat-icon-button 
                    color="primary" 
                    (click)="triggerFileInput()"
                    matTooltip="Add more images">
              <mat-icon>add_photo_alternate</mat-icon>
            </button>
          </div>
          
          <div class="images-grid">
            <div *ngFor="let image of images(); trackBy: trackByImageId" 
                 class="image-item"
                 [class.uploading]="image.uploading">
              
              <!-- Image Preview -->
              <div class="image-preview">
                <img [src]="image.url" 
                     [alt]="image.name"
                     (error)="onImageError($event)">
                
                <!-- Upload Progress -->
                <div *ngIf="image.uploading" class="upload-progress">
                  <mat-spinner diameter="24"></mat-spinner>
                  <span class="progress-text">Uploading...</span>
                </div>
                
                <!-- Image Actions -->
                <div class="image-actions" *ngIf="!image.uploading">
                  <button mat-icon-button 
                          color="warn" 
                          (click)="removeImage(image.id)"
                          matTooltip="Remove image">
                    <mat-icon>delete</mat-icon>
                  </button>
                  <button mat-icon-button 
                          color="primary" 
                          (click)="viewImage(image)"
                          matTooltip="View full size">
                    <mat-icon>zoom_in</mat-icon>
                  </button>
                </div>
              </div>
              
              <!-- Image Info -->
              <div class="image-info">
                <span class="image-name" [title]="image.name">{{ image.name }}</span>
                <span class="image-size">{{ formatFileSize(image.size) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Hidden File Input -->
      <input #fileInput 
             type="file" 
             [multiple]="config.allowMultiple !== false"
             [accept]="getAcceptedTypes()"
             (change)="onFileSelected($event)"
             style="display: none;">
    </div>
  `,
  styles: [`
    .image-upload-container {
      border: 2px dashed #e2e8f0;
      border-radius: 12px;
      background: #f8fafc;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .image-upload-container.drag-over {
      border-color: #3b82f6;
      background: #eff6ff;
      transform: scale(1.02);
    }

    .image-upload-container.has-images {
      border-color: #10b981;
      background: #f0fdf4;
    }

    .upload-area {
      padding: 24px;
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .upload-area.has-images {
      min-height: auto;
      padding: 16px;
    }

    .upload-placeholder {
      text-align: center;
      color: #64748b;
    }

    .upload-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #94a3b8;
      margin-bottom: 16px;
    }

    .upload-title {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
    }

    .upload-description {
      margin: 0 0 16px 0;
      color: #64748b;
      font-size: 14px;
    }

    .upload-constraints {
      margin-top: 16px;
      padding: 12px;
      background: #f1f5f9;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .constraint-text {
      margin: 0 0 4px 0;
      font-size: 12px;
      color: #64748b;
    }

    .constraint-text:last-child {
      margin-bottom: 0;
    }

    .images-preview {
      width: 100%;
    }

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e2e8f0;
    }

    .preview-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }

    .images-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 12px;
    }

    .image-item {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      background: white;
      border: 1px solid #e2e8f0;
      transition: all 0.3s ease;
    }

    .image-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .image-item.uploading {
      opacity: 0.7;
    }

    .image-preview {
      position: relative;
      width: 100%;
      height: 100px;
      overflow: hidden;
    }

    .image-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .upload-progress {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .progress-text {
      font-size: 12px;
      color: #64748b;
      font-weight: 500;
    }

    .image-actions {
      position: absolute;
      top: 8px;
      right: 8px;
      display: flex;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .image-item:hover .image-actions {
      opacity: 1;
    }

    .image-actions button {
      width: 32px;
      height: 32px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(4px);
    }

    .image-info {
      padding: 8px;
      background: white;
    }

    .image-name {
      display: block;
      font-size: 12px;
      font-weight: 500;
      color: #1e293b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 2px;
    }

    .image-size {
      font-size: 11px;
      color: #64748b;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .images-grid {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 8px;
      }
      
      .image-preview {
        height: 80px;
      }
      
      .upload-area {
        padding: 16px;
      }
    }
  `]
})
export class ImageUploadComponent {
  @Input() images = signal<UploadedImage[]>([]);
  @Input() config: ImageUploadConfig = {
    maxFiles: 5,
    maxFileSize: 10,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    showPreview: true,
    showProgress: true,
    allowMultiple: true
  };
  @Input() disabled = false;

  @Output() imagesChange = new EventEmitter<UploadedImage[]>();
  @Output() uploadStart = new EventEmitter<File[]>();
  @Output() uploadComplete = new EventEmitter<UploadedImage[]>();
  @Output() uploadError = new EventEmitter<Error>();
  @Output() imageRemove = new EventEmitter<string>();

  private readonly snackBar = inject(MatSnackBar);

  isDragOver = signal(false);

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.disabled) {
      this.isDragOver.set(true);
    }
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    if (this.disabled) return;

    const files = Array.from(event.dataTransfer?.files || []);
    this.handleFiles(files);
  }

  triggerFileInput() {
    if (this.disabled) return;
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target.files || []);
    this.handleFiles(files);
    
    // Reset input
    target.value = '';
  }

  private handleFiles(files: File[]) {
    if (files.length === 0) return;

    // Validate files
    const validFiles = this.validateFiles(files);
    if (validFiles.length === 0) return;

    // Check max files limit
    const currentCount = this.images().length;
    const maxFiles = this.config.maxFiles || 5;
    
    if (currentCount + validFiles.length > maxFiles) {
      this.snackBar.open(
        `Maximum ${maxFiles} files allowed. You can upload ${maxFiles - currentCount} more files.`,
        'Close',
        { duration: 5000 }
      );
      return;
    }

    this.uploadStart.emit(validFiles);
    this.processFiles(validFiles);
  }

  private validateFiles(files: File[]): File[] {
    const validFiles: File[] = [];
    const maxSize = (this.config.maxFileSize || 10) * 1024 * 1024; // Convert MB to bytes
    const acceptedTypes = this.config.acceptedTypes || ['image/jpeg', 'image/png', 'image/webp'];

    for (const file of files) {
      // Check file size
      if (file.size > maxSize) {
        this.snackBar.open(
          `File "${file.name}" is too large. Maximum size is ${this.config.maxFileSize || 10}MB.`,
          'Close',
          { duration: 5000 }
        );
        continue;
      }

      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        this.snackBar.open(
          `File "${file.name}" has an unsupported format. Accepted types: ${acceptedTypes.join(', ')}.`,
          'Close',
          { duration: 5000 }
        );
        continue;
      }

      validFiles.push(file);
    }

    return validFiles;
  }

  private processFiles(files: File[]) {
    for (const file of files) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const imageData: UploadedImage = {
          id: this.generateId(),
          url: e.target?.result as string,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          uploading: true
        };

        // Add to images array
        const currentImages = this.images();
        this.images.set([...currentImages, imageData]);
        this.imagesChange.emit(this.images());

        // Simulate upload completion
        setTimeout(() => {
          const updatedImages = this.images().map(img => 
            img.id === imageData.id ? { ...img, uploading: false } : img
          );
          this.images.set(updatedImages);
          this.imagesChange.emit(updatedImages);
          this.uploadComplete.emit(updatedImages);
        }, 2000);
      };

      reader.readAsDataURL(file);
    }
  }

  removeImage(imageId: string) {
    const updatedImages = this.images().filter(img => img.id !== imageId);
    this.images.set(updatedImages);
    this.imagesChange.emit(updatedImages);
    this.imageRemove.emit(imageId);
  }

  viewImage(image: UploadedImage) {
    // Open image in new tab
    window.open(image.url, '_blank');
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/150x150/e0e0e0/757575?text=Error';
  }

  trackByImageId(index: number, image: UploadedImage): string {
    return image.id;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getAcceptedTypes(): string {
    return (this.config.acceptedTypes || ['image/jpeg', 'image/png', 'image/webp']).join(',');
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
