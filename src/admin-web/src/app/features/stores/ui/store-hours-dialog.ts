import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule } from '@ngx-translate/core';

export interface StoreHoursDialogData {
  store: {
    id: string;
    name: string;
  };
}

@Component({
  selector: 'app-store-hours-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    TranslateModule
  ],
  template: `
    <div class="store-hours-dialog">
      <div mat-dialog-title class="dialog-header">
        <mat-icon>schedule</mat-icon>
        <span>{{ 'stores.hours' | translate }} - {{ data.store.name }}</span>
      </div>

      <div mat-dialog-content class="dialog-content">
        <mat-card class="placeholder-card">
          <mat-card-content>
            <div class="placeholder-content">
              <mat-icon class="placeholder-icon">schedule</mat-icon>
              <h3>{{ 'stores.hours' | translate }}</h3>
              <p>Opening hours management functionality will be implemented in a future release.</p>
              <p>This will include:</p>
              <ul>
                <li>Daily opening and closing times</li>
                <li>Special holiday hours</li>
                <li>Timezone support</li>
                <li>Break periods</li>
              </ul>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="close()">
          {{ 'stores.cancel' | translate }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .store-hours-dialog {
      width: 100%;
      max-width: 500px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .dialog-content {
      padding: 0 24px;
    }

    .placeholder-card {
      margin-bottom: 16px;
    }

    .placeholder-content {
      text-align: center;
      padding: 24px;
    }

    .placeholder-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #666;
      margin-bottom: 16px;
    }

    .placeholder-content h3 {
      margin: 0 0 16px 0;
      color: #333;
    }

    .placeholder-content p {
      margin: 8px 0;
      color: #666;
      line-height: 1.5;
    }

    .placeholder-content ul {
      text-align: left;
      margin: 16px 0;
      padding-left: 20px;
    }

    .placeholder-content li {
      margin: 4px 0;
      color: #666;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 16px 24px;
      margin: 0;
    }
  `]
})
export class StoreHoursDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<StoreHoursDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StoreHoursDialogData
  ) {}

  close() {
    this.dialogRef.close();
  }
}