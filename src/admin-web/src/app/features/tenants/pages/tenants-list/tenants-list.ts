import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { TenantsService, CreateTenantRequest, UpdateTenantProfileRequest } from '../../../../api/services/TenantsService';
import { Tenant } from '../../../../api/models/Tenant';
import { TenantDialogComponent, TenantDialogData } from '../../components/tenant-dialog/tenant-dialog.component';
import { combineLatest, debounceTime, distinctUntilChanged, startWith } from 'rxjs';

@Component({
  selector: 'app-tenants-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDialogModule,
    MatChipsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    TranslateModule
  ],
  templateUrl: './tenants-list.html',
  styleUrl: './tenants-list.scss'
})
export class TenantsList implements OnInit {
  displayedColumns: string[] = ['name', 'billingEmail', 'state', 'created', 'actions'];
  dataSource = new MatTableDataSource<Tenant>([]);
  loading = false;
  error: string | null = null;
  
  // Search and filter controls
  searchControl = new FormControl('');
  stateControl = new FormControl('');
  
  // Original data for filtering
  private allTenants: Tenant[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadTenants();
    this.setupFilters();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private setupFilters() {
    combineLatest([
      this.searchControl.valueChanges.pipe(startWith(''), debounceTime(300), distinctUntilChanged()),
      this.stateControl.valueChanges.pipe(startWith(''))
    ]).subscribe(([searchTerm, selectedState]) => {
      this.applyFilters(searchTerm || '', selectedState || '');
    });
  }

  private applyFilters(searchTerm: string, selectedState: string) {
    let filteredTenants = [...this.allTenants];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredTenants = filteredTenants.filter(tenant =>
        tenant.name?.toLowerCase().includes(searchLower) ||
        tenant.billingEmail?.toLowerCase().includes(searchLower)
      );
    }

    // Apply state filter
    if (selectedState) {
      filteredTenants = filteredTenants.filter(tenant => tenant.state === selectedState);
    }

    this.dataSource.data = filteredTenants;
  }

  async loadTenants() {
    this.loading = true;
    this.error = null;
    
    try {
      const result = await TenantsService.listTenants();
      // Mock additional data for demonstration since API only returns basic fields
      const enrichedTenants = result.map(tenant => ({
        ...tenant,
        billingEmail: tenant.billingEmail || `billing@${tenant.domain}`,
        state: tenant.isActive ? 'Active' : 'Suspended' as 'Active' | 'Suspended' | 'Inactive',
        created: tenant.created || new Date().toISOString(),
        locale: tenant.locale || 'en-US',
        currency: tenant.currency || 'USD'
      }));
      
      this.allTenants = enrichedTenants;
      this.dataSource.data = enrichedTenants;
      
      // Reapply current filters
      const searchTerm = this.searchControl.value || '';
      const selectedState = this.stateControl.value || '';
      this.applyFilters(searchTerm, selectedState);
      
      console.log('Tenants loaded successfully:', enrichedTenants);
    } catch (error) {
      this.error = 'Failed to load tenants';
      this.showSnackBar('Failed to load tenants', 'error');
      console.error('Error loading tenants:', error);
    } finally {
      this.loading = false;
    }
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(TenantDialogComponent, {
      width: '500px',
      data: { mode: 'create' } as TenantDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createTenant(result);
      }
    });
  }

  openEditDialog(tenant: Tenant) {
    const dialogRef = this.dialog.open(TenantDialogComponent, {
      width: '500px',
      data: { tenant, mode: 'edit' } as TenantDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && tenant.id) {
        this.updateTenant(tenant.id, result);
      }
    });
  }

  private async createTenant(tenantData: CreateTenantRequest) {
    this.loading = true;
    try {
      const newTenant = await TenantsService.createTenant(tenantData);
      this.showSnackBar('Tenant created successfully', 'success');
      await this.loadTenants(); // Refresh the table
    } catch (error) {
      this.showSnackBar('Failed to create tenant', 'error');
      console.error('Error creating tenant:', error);
    } finally {
      this.loading = false;
    }
  }

  private async updateTenant(id: string, tenantData: UpdateTenantProfileRequest) {
    this.loading = true;
    try {
      await TenantsService.updateTenantProfile(id, tenantData);
      this.showSnackBar('Tenant updated successfully', 'success');
      await this.loadTenants(); // Refresh the table
    } catch (error) {
      this.showSnackBar('Failed to update tenant', 'error');
      console.error('Error updating tenant:', error);
    } finally {
      this.loading = false;
    }
  }

  async suspendTenant(tenant: Tenant) {
    if (!tenant.id) return;
    
    this.loading = true;
    try {
      await TenantsService.suspendTenant(tenant.id);
      this.showSnackBar('Tenant suspended successfully', 'success');
      await this.loadTenants(); // Refresh the table
    } catch (error) {
      this.showSnackBar('Failed to suspend tenant', 'error');
      console.error('Error suspending tenant:', error);
    } finally {
      this.loading = false;
    }
  }

  async reactivateTenant(tenant: Tenant) {
    if (!tenant.id) return;
    
    this.loading = true;
    try {
      await TenantsService.reactivateTenant(tenant.id);
      this.showSnackBar('Tenant reactivated successfully', 'success');
      await this.loadTenants(); // Refresh the table
    } catch (error) {
      this.showSnackBar('Failed to reactivate tenant', 'error');
      console.error('Error reactivating tenant:', error);
    } finally {
      this.loading = false;
    }
  }

  private showSnackBar(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'success' ? 'success-snackbar' : 'error-snackbar'
    });
  }

  getStateChipColor(state: string): string {
    switch (state) {
      case 'Active': return 'primary';
      case 'Suspended': return 'warn';
      case 'Inactive': return 'accent';
      default: return '';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
