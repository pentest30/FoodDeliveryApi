import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-components',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    TranslateModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <mat-icon class="page-icon">widgets</mat-icon>
        <h1>{{ 'nav.components' | translate }}</h1>
      </div>
      
      <mat-card>
        <mat-card-content>
          <p>This is the Material Components page. Angular Material component examples and documentation will be displayed here.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .page-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #3f51b5;
    }

    h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.87);
    }

    mat-card {
      margin-bottom: 24px;
    }

    p {
      margin: 0;
      color: rgba(0, 0, 0, 0.6);
    }
  `]
})
export class ComponentsPage {}