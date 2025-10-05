import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';

import { UserService } from '../../services/user.service';
import { User, CreateUserRequest, UpdateUserRequest, ChangePasswordRequest } from '../../models/user.model';

export interface UserDialogData {
  mode: 'create' | 'edit';
  user?: User;
}

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTabsModule
  ],
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.scss']
})
export class UserDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<UserDialogComponent>);
  private data = inject(MAT_DIALOG_DATA);

  // Signals
  isLoading = signal(false);
  availableRoles = signal<string[]>([]);

  // Forms
  userForm: FormGroup;
  passwordForm: FormGroup;

  // Dialog data
  mode: 'create' | 'edit';
  user: User | undefined;

  constructor() {
    this.mode = this.data.mode;
    this.user = this.data.user;

    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      isActive: [true],
      roles: [[], [Validators.required]]
    });

    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadRoles();
    
    if (this.mode === 'edit' && this.user) {
      this.populateForm();
    }
  }

  private loadRoles(): void {
    this.userService.getRoles().subscribe({
      next: (roles) => {
        this.availableRoles.set(roles);
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.snackBar.open('Error loading roles', 'Close', { duration: 3000 });
      }
    });
  }

  private populateForm(): void {
    if (this.user) {
      this.userForm.patchValue({
        email: this.user.email,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        isActive: this.user.isActive,
        roles: this.user.roles
      });
    }
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.isLoading.set(true);
      
      if (this.mode === 'create') {
        this.createUser();
      } else {
        this.updateUser();
      }
    } else {
      this.markFormGroupTouched(this.userForm);
    }
  }

  private createUser(): void {
    const formValue = this.userForm.value;
    const passwordValue = this.passwordForm.value;
    
    const request: CreateUserRequest = {
      email: formValue.email,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      password: passwordValue.password,
      confirmPassword: passwordValue.confirmPassword,
      isActive: formValue.isActive,
      roles: formValue.roles
    };

    this.userService.createUser(request).subscribe({
      next: (user) => {
        this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(user);
      },
      error: (error) => {
        console.error('Error creating user:', error);
        this.snackBar.open('Error creating user', 'Close', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  private updateUser(): void {
    if (!this.user) return;

    const formValue = this.userForm.value;
    
    const request: UpdateUserRequest = {
      id: this.user.id,
      email: formValue.email,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      isActive: formValue.isActive,
      roles: formValue.roles
    };

    this.userService.updateUser(request).subscribe({
      next: (user) => {
        this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(user);
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.snackBar.open('Error updating user', 'Close', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.userForm.get(fieldName);
    if (field?.hasError('required')) return `${fieldName} is required`;
    if (field?.hasError('email')) return 'Please enter a valid email address';
    if (field?.hasError('minlength')) return `${fieldName} must be at least ${field.errors?.['minlength'].requiredLength} characters`;
    return null;
  }

  getPasswordFieldError(fieldName: string): string | null {
    const field = this.passwordForm.get(fieldName);
    if (field?.hasError('required')) return `${fieldName} is required`;
    if (field?.hasError('minlength')) return `${fieldName} must be at least ${field.errors?.['minlength'].requiredLength} characters`;
    if (field?.hasError('passwordMismatch')) return 'Passwords do not match';
    return null;
  }

  get isCreateMode(): boolean {
    return this.mode === 'create';
  }

  get isEditMode(): boolean {
    return this.mode === 'edit';
  }
}


