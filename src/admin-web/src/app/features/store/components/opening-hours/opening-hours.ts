import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { OpeningHoursService, SetOpeningHoursRequest } from '../../../../api/services/OpeningHoursService';
import { OpeningHours as OpeningHoursModel, DailyHours, DayOfWeek } from '../../../../api/models/OpeningHours';

@Component({
  selector: 'app-opening-hours',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSelectModule
  ],
  templateUrl: './opening-hours.html',
  styleUrl: './opening-hours.scss'
})
export class OpeningHoursComponent implements OnInit {
  openingHoursForm: FormGroup;
  loading = false;
  saving = false;
  error: string | null = null;

  readonly daysOfWeek: DayOfWeek[] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  readonly timeOptions: string[] = this.generateTimeOptions();

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.openingHoursForm = this.createForm();
  }

  ngOnInit() {
    this.loadOpeningHours();
  }

  private createForm(): FormGroup {
    const hoursArray = this.fb.array(
      this.daysOfWeek.map(day => this.createDayFormGroup(day))
    );

    return this.fb.group({
      hours: hoursArray
    });
  }

  private createDayFormGroup(dayOfWeek: DayOfWeek): FormGroup {
    const group = this.fb.group({
      dayOfWeek: [dayOfWeek],
      openAt: ['09:00'],
      closeAt: ['17:00'],
      isClosed: [false]
    });

    // Add custom validator for time validation
    group.setValidators(this.timeRangeValidator);

    // Watch for closed toggle changes
    group.get('isClosed')?.valueChanges.subscribe(isClosed => {
      const openAtControl = group.get('openAt');
      const closeAtControl = group.get('closeAt');

      if (isClosed) {
        openAtControl?.clearValidators();
        closeAtControl?.clearValidators();
        openAtControl?.setValue('');
        closeAtControl?.setValue('');
      } else {
        openAtControl?.setValidators([Validators.required]);
        closeAtControl?.setValidators([Validators.required]);
        if (!openAtControl?.value) openAtControl?.setValue('09:00');
        if (!closeAtControl?.value) closeAtControl?.setValue('17:00');
      }
      
      openAtControl?.updateValueAndValidity();
      closeAtControl?.updateValueAndValidity();
      group.updateValueAndValidity();
    });

    return group;
  }

  private timeRangeValidator(control: AbstractControl): ValidationErrors | null {
    const group = control as FormGroup;
    const isClosed = group.get('isClosed')?.value;
    const openAt = group.get('openAt')?.value;
    const closeAt = group.get('closeAt')?.value;

    if (isClosed || !openAt || !closeAt) {
      return null;
    }

    // Convert time strings to minutes for comparison
    const openMinutes = this.timeToMinutes(openAt);
    const closeMinutes = this.timeToMinutes(closeAt);

    if (closeMinutes <= openMinutes) {
      return { invalidTimeRange: true };
    }

    return null;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private generateTimeOptions(): string[] {
    const options: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeString);
      }
    }
    return options;
  }

  get hoursFormArray(): FormArray {
    return this.openingHoursForm.get('hours') as FormArray;
  }

  getDayFormGroup(index: number): FormGroup {
    return this.hoursFormArray.at(index) as FormGroup;
  }

  async loadOpeningHours() {
    this.loading = true;
    this.error = null;

    try {
      const openingHours = await OpeningHoursService.getOpeningHours();
      if (openingHours?.hours) {
        this.populateForm(openingHours.hours);
      }
    } catch (error) {
      this.error = 'Failed to load opening hours';
      this.showSnackBar('Failed to load opening hours', 'error');
      console.error('Error loading opening hours:', error);
    } finally {
      this.loading = false;
    }
  }

  private populateForm(hours: DailyHours[]) {
    hours.forEach(dayHours => {
      const dayIndex = this.daysOfWeek.indexOf(dayHours.dayOfWeek);
      if (dayIndex >= 0) {
        const dayGroup = this.getDayFormGroup(dayIndex);
        dayGroup.patchValue({
          openAt: dayHours.openAt || '09:00',
          closeAt: dayHours.closeAt || '17:00',
          isClosed: dayHours.isClosed
        });
      }
    });
  }

  async onSubmit() {
    if (this.openingHoursForm.invalid) {
      this.markFormGroupTouched();
      this.showSnackBar('Please fix the validation errors', 'error');
      return;
    }

    this.saving = true;

    try {
      const formValue = this.openingHoursForm.value;
      const request: SetOpeningHoursRequest = {
        hours: formValue.hours.map((dayData: any) => ({
          dayOfWeek: dayData.dayOfWeek,
          openAt: dayData.isClosed ? undefined : dayData.openAt,
          closeAt: dayData.isClosed ? undefined : dayData.closeAt,
          isClosed: dayData.isClosed
        }))
      };

      await OpeningHoursService.setOpeningHours(request);
      this.showSnackBar('Opening hours saved successfully!', 'success');
    } catch (error) {
      this.showSnackBar('Failed to save opening hours', 'error');
      console.error('Error saving opening hours:', error);
    } finally {
      this.saving = false;
    }
  }

  onReset() {
    this.openingHoursForm.reset();
    this.loadOpeningHours();
  }

  getDayError(index: number): string | null {
    const dayGroup = this.getDayFormGroup(index);
    
    if (dayGroup.hasError('invalidTimeRange')) {
      return 'Close time must be after open time';
    }

    const openAtControl = dayGroup.get('openAt');
    const closeAtControl = dayGroup.get('closeAt');

    if (openAtControl?.hasError('required')) {
      return 'Open time is required';
    }

    if (closeAtControl?.hasError('required')) {
      return 'Close time is required';
    }

    return null;
  }

  private markFormGroupTouched() {
    this.hoursFormArray.controls.forEach(control => {
      control.markAsTouched();
      Object.keys((control as FormGroup).controls).forEach(key => {
        (control as FormGroup).get(key)?.markAsTouched();
      });
    });
  }

  private showSnackBar(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Close', {
      duration: type === 'success' ? 3000 : 5000,
      panelClass: type === 'success' ? 'success-snackbar' : 'error-snackbar'
    });
  }
}
