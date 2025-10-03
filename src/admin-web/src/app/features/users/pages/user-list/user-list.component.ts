import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { UserService } from '../../services/user.service';
import { User, UserListRequest } from '../../models/user.model';
import { UserDialogComponent } from '../../components/user-dialog/user-dialog.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatDividerModule,
    ReactiveFormsModule
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  // Signals for reactive state
  users = signal<User[]>([]);
  totalCount = signal(0);
  isLoading = signal(false);
  searchControl = new FormControl('');

  // Table configuration
  displayedColumns: string[] = [
    'select',
    'email',
    'name',
    'roles',
    'isActive',
    'emailConfirmed',
    'lastLoginAt',
    'createdAt',
    'actions'
  ];

  // Pagination
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25, 50];

  // Filters
  statusFilter = new FormControl('all');
  sortBy = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  ngOnInit(): void {
    this.loadUsers();
    this.setupSearch();
  }

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadUsers();
      });
  }

  loadUsers(): void {
    this.isLoading.set(true);
    
    const request: UserListRequest = {
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize,
      searchTerm: this.searchControl.value || undefined,
      isActive: this.getStatusFilterValue(),
      sortBy: this.sortBy,
      sortDirection: this.sortDirection
    };

    this.userService.getUsers(request).subscribe({
      next: (response) => {
        this.users.set(response.users);
        this.totalCount.set(response.totalCount);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.snackBar.open('Error loading users', 'Close', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  private getStatusFilterValue(): boolean | undefined {
    const value = this.statusFilter.value;
    if (value === 'active') return true;
    if (value === 'inactive') return false;
    return undefined;
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  onStatusFilterChange(): void {
    this.pageIndex = 0;
    this.loadUsers();
  }

  onSortChange(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.loadUsers();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  openEditDialog(user: User): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '600px',
      data: { mode: 'edit', user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  openDeleteDialog(user: User): void {
    if (confirm(`Are you sure you want to delete user "${user.email}"?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.snackBar.open('Error deleting user', 'Close', { duration: 3000 });
        }
      });
    }
  }

  toggleUserStatus(user: User): void {
    this.userService.toggleUserStatus(user.id, !user.isActive).subscribe({
      next: (updatedUser) => {
        this.snackBar.open(
          `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`, 
          'Close', 
          { duration: 3000 }
        );
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error toggling user status:', error);
        this.snackBar.open('Error updating user status', 'Close', { duration: 3000 });
      }
    });
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.statusFilter.setValue('all');
    this.sortBy = 'createdAt';
    this.sortDirection = 'desc';
    this.pageIndex = 0;
    this.loadUsers();
  }

  getRoleChips(roles: string[]): string {
    return roles.join(', ');
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  }
}
