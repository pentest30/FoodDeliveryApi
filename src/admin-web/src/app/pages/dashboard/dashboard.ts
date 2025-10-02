import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    TranslateModule
  ],
  template: `
    <div class="dashboard-container">
      <mat-card class="welcome-card">
        <mat-card-content>
          <div class="welcome-content">
            <mat-icon class="grid-icon">grid_view</mat-icon>
            <h1>{{ 'welcome' | translate }}</h1>
            <p class="caption">{{ 'dashboard.caption' | translate }}</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 200px);
      padding: 24px;
    }

    .welcome-card {
      max-width: 600px;
      width: 100%;
      text-align: center;
      padding: 48px 24px;
    }

    .welcome-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .grid-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: rgba(0, 0, 0, 0.54);
    }

    h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.87);
    }

    .caption {
      margin: 0;
      font-size: 1rem;
      color: rgba(0, 0, 0, 0.6);
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }

      .welcome-card {
        padding: 32px 16px;
      }

      .grid-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }

      h1 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class DashboardPage {}