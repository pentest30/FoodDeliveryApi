import { Component, Inject, OnInit, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { finalize, forkJoin } from 'rxjs';

import { RestaurantsService, RestaurantDto, StoreImageDto } from '../data/stores.service';

interface ExtendedStoreImageDto extends StoreImageDto {
  processing?: boolean;
  filename?: string;
}

export interface StoreImagesDialogData {
  store: RestaurantDto;
}

interface ImageUpload {
  file: File;
  preview: string;
  uploading: boolean;
  progress: number;
}

@Component({
  selector: 'app-store-images-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatMenuModule,
    MatCardModule,
    MatDividerModule,
    TranslateModule
  ],
  template: `
    <div class="images-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>photo_library</mat-icon>
          {{ 'stores.images' | translate }} - {{ store.name }}
        </h2>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <!-- Upload Area -->
        <div class="upload-section">
          <div class="upload-area" 
               [class.drag-over]="isDragOver"
               (dragover)="onDragOver($event)"
               (dragleave)="onDragLeave($event)"
               (drop)="onDrop($event)"
               (click)="fileInput.click()">
            <mat-icon class="upload-icon">cloud_upload</mat-icon>
            <h3>{{ 'stores.upload' | translate }}</h3>
            <p>Drag and drop images here or click to browse</p>
            <p class="upload-hint">Supports: JPG, PNG, WebP (Max 5MB each)</p>
            
            <input #fileInput
                   type="file"
                   accept="image/*"
                   multiple
                   (change)="onFileSelected($event)"
                   style="display: none;">
          </div>

          <!-- Upload Progress -->
          <div class="upload-progress" *ngIf="pendingUploads().length > 0">
            <h4>Uploading Images...</h4>
            <div class="upload-items">
              <div class="upload-item" *ngFor="let upload of pendingUploads()">
                <div class="upload-preview">
                  <img [src]="upload.preview" [alt]="upload.file.name">
                </div>
                <div class="upload-info">
                  <span class="file-name">{{ upload.file.name }}</span>
                  <mat-progress-bar mode="determinate" [value]="upload.progress"></mat-progress-bar>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Current Images -->
        <div class="images-section" *ngIf="images().length > 0">
          <h3>Current Images ({{ images().length }})</h3>
          <div class="images-grid">
            <mat-card class="image-card" 
                      *ngFor="let image of images()" 
                      [class.cover-image]="image.id === store.coverImageId">
              <div class="image-container">
                <img [src]="image.thumbnailUrl || image.url" 
                     [alt]="image.filename"
                     (error)="onImageError($event)">
                
                <!-- Cover Badge -->
                <div class="cover-badge" *ngIf="image.id === store.coverImageId">
                  <mat-icon>star</mat-icon>
                  <span>Cover</span>
                </div>

                <!-- Loading Overlay -->
                <div class="loading-overlay" *ngIf="image.processing">
                  <mat-spinner diameter="40"></mat-spinner>
                </div>
              </div>

              <mat-card-actions>
                <button mat-icon-button 
                        [matMenuTriggerFor]="imageMenu"
                        matTooltip="Actions">
                  <mat-icon>more_vert</mat-icon>
                </button>
                
                <mat-menu #imageMenu="matMenu">
                  <button mat-menu-item 
                          (click)="setCoverImage(image)"
                          [disabled]="image.id === store.coverImageId">
                    <mat-icon>star</mat-icon>
                    {{ 'stores.cover' | translate }}
                  </button>
                  <button mat-menu-item (click)="viewFullSize(image)">
                    <mat-icon>zoom_in</mat-icon>
                    View Full Size
                  </button>
                  <mat-divider></mat-divider>
                  <button mat-menu-item 
                          (click)="deleteImage(image)"
                          class="delete-action">
                    <mat-icon>delete</mat-icon>
                    {{ 'stores.remove' | translate }}
                  </button>
                </mat-menu>
              </mat-card-actions>
            </mat-card>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="images().length === 0 && !loading()">
          <mat-icon class="empty-icon">photo</mat-icon>
          <h3>No images yet</h3>
          <p>Upload some images to showcase this store</p>
        </div>

        <!-- Loading State -->
        <div class="loading-state" *ngIf="loading()">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Loading images...</p>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>
          Close
        </button>
        <button mat-raised-button 
                color="primary" 
                (click)="fileInput.click()"
                [disabled]="uploading()">
          <mat-icon>add_photo_alternate</mat-icon>
          Add More Images
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .images-dialog {
      width: 100%;
      max-width: 800px;
      max-height: 90vh;
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

    /* Upload Section */
    .upload-section {
      margin-bottom: 32px;
    }

    .upload-area {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 32px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #fafafa;
    }

    .upload-area:hover,
    .upload-area.drag-over {
      border-color: #3f51b5;
      background: #f3f4ff;
    }

    .upload-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #666;
      margin-bottom: 16px;
    }

    .upload-area h3 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .upload-area p {
      margin: 4px 0;
      color: #666;
    }

    .upload-hint {
      font-size: 0.875rem;
      color: #999 !important;
    }

    /* Upload Progress */
    .upload-progress {
      margin-top: 24px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .upload-progress h4 {
      margin: 0 0 16px 0;
      color: #333;
    }

    .upload-items {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .upload-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .upload-preview {
      width: 60px;
      height: 60px;
      border-radius: 4px;
      overflow: hidden;
      background: #eee;
      flex-shrink: 0;
    }

    .upload-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .upload-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .file-name {
      font-size: 0.875rem;
      color: #333;
      font-weight: 500;
    }

    /* Images Section */
    .images-section h3 {
      margin: 0 0 16px 0;
      color: #333;
      font-weight: 500;
    }

    .images-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }

    .image-card {
      position: relative;
      overflow: hidden;
    }

    .image-card.cover-image {
      border: 2px solid #ffc107;
      box-shadow: 0 4px 8px rgba(255, 193, 7, 0.3);
    }

    .image-container {
      position: relative;
      height: 150px;
      overflow: hidden;
      background: #f5f5f5;
    }

    .image-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .image-card:hover .image-container img {
      transform: scale(1.05);
    }

    .cover-badge {
      position: absolute;
      top: 8px;
      left: 8px;
      background: #ffc107;
      color: #333;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .cover-badge mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    mat-card-actions {
      padding: 8px;
      display: flex;
      justify-content: flex-end;
    }

    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 16px;
      text-align: center;
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: rgba(0, 0, 0, 0.38);
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      color: rgba(0, 0, 0, 0.6);
    }

    .empty-state p {
      margin: 0;
      color: rgba(0, 0, 0, 0.6);
    }

    /* Loading State */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 16px;
      text-align: center;
    }

    .loading-state p {
      margin-top: 16px;
      color: rgba(0, 0, 0, 0.6);
    }

    /* Actions */
    .delete-action {
      color: #f44336;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      gap: 12px;
    }

    /* Responsive Design */
    @media (max-width: 600px) {
      .images-dialog {
        max-width: 100vw;
        margin: 0;
      }

      .images-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 12px;
      }

      .upload-area {
        padding: 24px 16px;
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
  `]
})
export class StoreImagesDialogComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private restaurantsService = inject(RestaurantsService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<StoreImagesDialogComponent>);

  // Signals
  images = signal<ExtendedStoreImageDto[]>([]);
  pendingUploads = signal<ImageUpload[]>([]);
  loading = signal(false);
  uploading = signal(false);
  isDragOver = false;

  store: RestaurantDto;

  constructor(@Inject(MAT_DIALOG_DATA) public data: StoreImagesDialogData) {
    this.store = data.store;
  }

  ngOnInit() {
    this.loadImages();
  }

  private loadImages() {
    this.loading.set(true);
    this.restaurantsService.getRestaurantImages(this.store.id).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (images) => {
        this.images.set(images);
      },
      error: (error) => {
        console.error('Error loading images:', error);
        this.snackBar.open('Error loading images', 'Close', { duration: 3000 });
      }
    });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = Array.from(event.dataTransfer?.files || []);
    this.handleFiles(files);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
    // Reset input
    (event.target as HTMLInputElement).value = '';
  }

  private handleFiles(files: File[]) {
    const validFiles = files.filter(file => this.validateFile(file));
    
    if (validFiles.length === 0) {
      return;
    }

    // Create upload objects
    const uploads: ImageUpload[] = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      progress: 0
    }));

    this.pendingUploads.set(uploads);
    this.uploadFiles(uploads);
  }

  private validateFile(file: File): boolean {
    // Check file type
    if (!file.type.startsWith('image/')) {
      this.snackBar.open(`${file.name} is not a valid image file`, 'Close', { duration: 3000 });
      return false;
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.snackBar.open(`${file.name} is too large (max 5MB)`, 'Close', { duration: 3000 });
      return false;
    }

    return true;
  }

  private uploadFiles(uploads: ImageUpload[]) {
    this.uploading.set(true);

    const uploadObservables = uploads.map(upload => {
      upload.uploading = true;
      return this.restaurantsService.uploadRestaurantImage(this.store.id, upload.file);
    });

    forkJoin(uploadObservables).pipe(
      finalize(() => {
        this.uploading.set(false);
        this.pendingUploads.set([]);
        // Clean up preview URLs
        uploads.forEach(upload => URL.revokeObjectURL(upload.preview));
      })
    ).subscribe({
      next: (results) => {
        this.snackBar.open(`${results.length} image(s) uploaded successfully`, 'Close', { duration: 3000 });
        this.loadImages(); // Refresh the images list
      },
      error: (error) => {
        console.error('Error uploading images:', error);
        this.snackBar.open('Error uploading images', 'Close', { duration: 5000 });
      }
    });
  }

  setCoverImage(image: StoreImageDto) {
    if (image.id === this.store.coverImageId) {
      return;
    }

    // Mark image as processing
    const updatedImages = this.images().map(img => 
      img.id === image.id ? { ...img, processing: true } : img
    );
    this.images.set(updatedImages);

    this.restaurantsService.setCoverImage(this.store.id, image.id).pipe(
      finalize(() => {
        // Remove processing state
        const finalImages = this.images().map(img => 
          img.id === image.id ? { ...img, processing: false } : img
        );
        this.images.set(finalImages);
      })
    ).subscribe({
      next: () => {
        this.store.coverImageId = image.id;
        this.store.coverImageUrl = image.url;
        this.snackBar.open('Cover image updated', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error setting cover image:', error);
        this.snackBar.open('Error setting cover image', 'Close', { duration: 3000 });
      }
    });
  }

  deleteImage(image: StoreImageDto) {
    if (confirm('Are you sure you want to delete this image?')) {
      // Mark image as processing
      const updatedImages = this.images().map(img => 
        img.id === image.id ? { ...img, processing: true } : img
      );
      this.images.set(updatedImages);

      this.restaurantsService.deleteRestaurantImage(this.store.id, image.id).subscribe({
        next: () => {
          // Remove image from list
          const filteredImages = this.images().filter(img => img.id !== image.id);
          this.images.set(filteredImages);
          this.snackBar.open('Image deleted', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting image:', error);
          this.snackBar.open('Error deleting image', 'Close', { duration: 3000 });
          // Remove processing state on error
          const finalImages = this.images().map(img => 
            img.id === image.id ? { ...img, processing: false } : img
          );
          this.images.set(finalImages);
        }
      });
    }
  }

  viewFullSize(image: StoreImageDto) {
    window.open(image.url, '_blank');
  }

  onImageError(event: any) {
    event.target.src = 'https://via.placeholder.com/200x150/e0e0e0/757575?text=Error';
  }
}