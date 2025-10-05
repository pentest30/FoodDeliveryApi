import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-variants-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="variants-container">
      <mat-card class="placeholder-card">
        <div class="placeholder-content">
          <mat-icon class="placeholder-icon">tune</mat-icon>
          <h3>Variants Management</h3>
          <p>This section will contain menu item variants management functionality.</p>
          <button mat-raised-button color="primary">
            <mat-icon>add</mat-icon>
            Add Variant
          </button>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .variants-container {
      padding: 0;
    }

    .placeholder-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
    }

    .placeholder-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      color: #64748b;
    }

    .placeholder-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #cbd5e1;
      margin-bottom: 16px;
    }

    h3 {
      color: #374151;
      margin-bottom: 8px;
    }

    p {
      margin-bottom: 24px;
      max-width: 400px;
    }
  `]
})
export class VariantsListComponent {}


