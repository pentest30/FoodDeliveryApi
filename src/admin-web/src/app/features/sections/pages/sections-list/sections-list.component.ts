import { Component, OnInit, inject, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, startWith, switchMap, catchError, map } from 'rxjs/operators';
import { of, combineLatest, Observable } from 'rxjs';

import { SectionsService, RestaurantSectionDto, SectionListParams } from '../../data/sections.service';
import { SectionDialogComponent, SectionDialogData } from '../../ui/section-dialog/section-dialog.component';

@Component({
  selector: 'app-sections-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressBarModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    TranslateModule
  ],
  template: `
    <div class="sections-container">
      <!-- Header Section -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <div class="title-icon">
              <mat-icon class="page-icon">category</mat-icon>
            </div>
            <div class="title-text">
              <h1 class="page-title">Sections</h1>
              <p class="page-subtitle">Manage restaurant sections and menu organization</p>
            </div>
          </div>
          <button mat-raised-button color="primary" (click)="createSection()" class="add-section-btn">
            <mat-icon>add</mat-icon>
            New Section
          </button>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="filters-section">
        <div class="filters-container">
          <div class="search-filters">
            <!-- Search -->
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search sections...</mat-label>
              <input matInput [formControl]="searchControl" placeholder="Search sections...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <!-- Status Filter -->
            <mat-form-field appearance="outline" class="status-filter">
              <mat-label>Status</mat-label>
              <mat-select [formControl]="activeControl">
                <mat-option value="">All Status</mat-option>
                <mat-option value="true">Active</mat-option>
                <mat-option value="false">Inactive</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>
      </div>

      <!-- Sections Table -->
      <mat-card class="sections-table-card">
        <div class="table-container">
          @if (loading()) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Loading sections...</p>
            </div>
          } @else {
            <table mat-table [dataSource]="sections()" class="sections-table">
              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>NAME</th>
                <td mat-cell *matCellDef="let section">
                  <div class="section-name">
                    <strong>{{ section.name }}</strong>
                  </div>
                </td>
              </ng-container>

              <!-- Description Column -->
              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>DESCRIPTION</th>
                <td mat-cell *matCellDef="let section">
                  <span class="section-description">{{ section.description }}</span>
                </td>
              </ng-container>

              <!-- Items Column -->
              <ng-container matColumnDef="items">
                <th mat-header-cell *matHeaderCellDef>ITEMS</th>
                <td mat-cell *matCellDef="let section">
                  <span class="items-count">{{ getItemCount(section) }} items</span>
                </td>
              </ng-container>

              <!-- Sort Order Column -->
              <ng-container matColumnDef="sortOrder">
                <th mat-header-cell *matHeaderCellDef>SORT ORDER</th>
                <td mat-cell *matCellDef="let section">
                  <span class="sort-order">{{ section.sortOrder }}</span>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>STATUS</th>
                <td mat-cell *matCellDef="let section">
                  <mat-chip 
                    [class]="getStatusClass(section.active)"
                    class="status-chip">
                    {{ getStatusText(section.active) }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Created Column -->
              <ng-container matColumnDef="created">
                <th mat-header-cell *matHeaderCellDef>CREATED</th>
                <td mat-cell *matCellDef="let section">
                  <span class="created-date">{{ formatDate(section.createdAt) }}</span>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>ACTIONS</th>
                <td mat-cell *matCellDef="let section">
                  <div class="actions-container">
                    <button mat-icon-button 
                            class="edit-button" 
                            (click)="editSection(section)"
                            matTooltip="Edit section">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button 
                            class="delete-button" 
                            (click)="deleteSection(section)"
                            matTooltip="Delete section">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <!-- Pagination -->
            <mat-paginator 
              [length]="totalCount()" 
              [pageSize]="pageSize()" 
              [pageSizeOptions]="[10, 25, 50, 100]"
              (page)="onPageChange($event)"
              showFirstLastButtons>
            </mat-paginator>
          }
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .sections-container {
      padding: 0;
    }

    /* Header Section */
    .page-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 32px;
      border-radius: 16px;
      margin-bottom: 24px;
      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1200px;
      margin: 0 auto;
    }

    .title-section {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .title-icon {
      width: 64px;
      height: 64px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
    }

    .page-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: white;
    }

    .page-title {
      font-size: 32px;
      font-weight: 700;
      margin: 0;
      color: white;
    }

    .page-subtitle {
      font-size: 16px;
      margin: 4px 0 0 0;
      color: rgba(255, 255, 255, 0.8);
    }

    .add-section-btn {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 12px;
      padding: 12px 24px;
      font-weight: 600;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
      }
    }

    /* Filters Section */
    .filters-section {
      background: white;
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
    }

    .filters-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .search-filters {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      min-width: 300px;
    }

    .status-filter {
      min-width: 150px;
    }

    /* Table Section */
    .sections-table-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }

    .table-container {
      overflow-x: auto;
    }

    .sections-table {
      width: 100%;
      background: white;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #64748b;
    }

    .section-name {
      font-weight: 600;
      color: #1e293b;
    }

    .section-description {
      color: #64748b;
      font-size: 14px;
    }

    .items-count {
      color: #64748b;
      font-size: 14px;
    }

    .sort-order {
      color: #64748b;
      font-size: 14px;
    }

    .status-chip {
      font-size: 12px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 20px;
    }

    .status-active {
      background-color: #dcfce7;
      color: #166534;
    }

    .status-inactive {
      background-color: #fee2e2;
      color: #dc2626;
    }

    .created-date {
      color: #64748b;
      font-size: 14px;
    }

    .actions-container {
      display: flex;
      gap: 8px;
    }

    .edit-button {
      color: #64748b;
      transition: all 0.2s ease;

      &:hover {
        color: #3b82f6;
        background-color: #f1f5f9;
      }
    }

    .delete-button {
      color: #64748b;
      transition: all 0.2s ease;

      &:hover {
        color: #dc2626;
        background-color: #fef2f2;
      }
    }

    /* Table header styling */
    ::ng-deep .mat-mdc-header-cell {
      background-color: #f8fafc;
      color: #374151;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #e2e8f0;
    }

    ::ng-deep .mat-mdc-cell {
      padding: 16px 12px;
      border-bottom: 1px solid #f1f5f9;
    }

    ::ng-deep .mat-mdc-row:hover {
      background-color: #f8fafc;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .page-header {
        padding: 24px 16px;
      }

      .header-content {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .title-section {
        justify-content: center;
        text-align: center;
      }

      .search-filters {
        flex-direction: column;
        align-items: stretch;
      }

      .search-field {
        min-width: auto;
      }
    }
  `]
})
export class SectionsListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private sectionsService = inject(SectionsService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  // Form controls
  searchControl = new FormControl('');
  activeControl = new FormControl('');

  // Signals for state management
  sections = signal<RestaurantSectionDto[]>([]);
  loading = signal(false);
  totalCount = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);

  // Table configuration
  displayedColumns = ['name', 'description', 'items', 'sortOrder', 'status', 'created', 'actions'];

  ngOnInit() {
    this.setupSearch();
    this.loadSections();
  }

  private setupSearch() {
    // Combine search controls and trigger search
    combineLatest([
      this.searchControl.valueChanges.pipe(startWith('')),
      this.activeControl.valueChanges.pipe(startWith(''))
    ]).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(() => this.loadSections())
    ).subscribe();
  }

  private loadSections(): Observable<void> {
    this.loading.set(true);

    // For now, we'll show empty data since we don't have a backend endpoint
    // to get all sections across restaurants
    // The dialog will allow users to select a restaurant and create sections
    
    this.sections.set([]);
    this.totalCount.set(0);
    this.loading.set(false);
    
    return of();
  }

  protected onPageChange(event: any) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadSections().subscribe();
  }

  protected createSection() {
    const dialogData: SectionDialogData = {
      mode: 'create'
    };

    const dialogRef = this.dialog.open(SectionDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadSections().subscribe();
        this.snackBar.open('Section created successfully', 'Close', { duration: 3000 });
      }
    });
  }

  protected editSection(section: RestaurantSectionDto) {
    const dialogData: SectionDialogData = {
      section: section,
      mode: 'edit'
    };

    const dialogRef = this.dialog.open(SectionDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadSections().subscribe();
        this.snackBar.open('Section updated successfully', 'Close', { duration: 3000 });
      }
    });
  }

  protected deleteSection(section: RestaurantSectionDto) {
    if (confirm(`Are you sure you want to delete the section "${section.name}"? This action cannot be undone.`)) {
      this.loading.set(true);
      
      this.sectionsService.deleteSection(section.id).subscribe({
        next: () => {
          this.loading.set(false);
          this.loadSections().subscribe();
          this.snackBar.open('Section deleted successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          this.loading.set(false);
          console.error('Error deleting section:', error);
          this.snackBar.open('Error deleting section', 'Close', { duration: 3000 });
        }
      });
    }
  }

  protected getItemCount(section: RestaurantSectionDto): number {
    return section.menuItems?.length || 0;
  }

  protected getStatusText(active: boolean): string {
    return active ? 'Active' : 'Inactive';
  }

  protected getStatusClass(active: boolean): string {
    return active ? 'status-active' : 'status-inactive';
  }

  protected formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
