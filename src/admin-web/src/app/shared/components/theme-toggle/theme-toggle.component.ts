import { Component, inject, signal, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService, ThemeMode } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
    TranslateModule
  ],
  template: `
    <div class="theme-toggle">
      <!-- Simple Toggle Button -->
      <button 
        mat-icon-button 
        (click)="toggleTheme()"
        [matTooltip]="getTooltipText()"
        class="theme-toggle-button">
        <mat-icon>{{ getThemeIcon() }}</mat-icon>
      </button>
      
      <!-- Advanced Theme Menu (Optional) -->
      @if (showAdvancedMenu) {
        <button 
          mat-icon-button 
          [matMenuTriggerFor]="themeMenu"
          matTooltip="Theme options"
          class="theme-menu-button">
          <mat-icon>more_vert</mat-icon>
        </button>
        
        <mat-menu #themeMenu="matMenu" class="theme-menu">
          <div class="theme-menu-header">
            <span class="menu-title">Theme</span>
          </div>
          <mat-divider></mat-divider>
          
          <button 
            mat-menu-item 
            (click)="setLightMode()"
            [class.active]="currentTheme() === 'light'">
            <mat-icon>light_mode</mat-icon>
            <span>Light</span>
            @if (currentTheme() === 'light') {
              <mat-icon class="check-icon">check</mat-icon>
            }
          </button>
          
          <button 
            mat-menu-item 
            (click)="setDarkMode()"
            [class.active]="currentTheme() === 'dark'">
            <mat-icon>dark_mode</mat-icon>
            <span>Dark</span>
            @if (currentTheme() === 'dark') {
              <mat-icon class="check-icon">check</mat-icon>
            }
          </button>
          
          <button 
            mat-menu-item 
            (click)="setAutoMode()"
            [class.active]="currentTheme() === 'auto'">
            <mat-icon>auto_mode</mat-icon>
            <span>Auto</span>
            @if (currentTheme() === 'auto') {
              <mat-icon class="check-icon">check</mat-icon>
            }
          </button>
        </mat-menu>
      }
    </div>
  `,
  styles: [`
    .theme-toggle {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .theme-toggle-button {
      color: #64748b;
      transition: all 0.2s ease;
      
      &:hover {
        background: #f1f5f9;
        color: #334155;
      }
      
      mat-icon {
        transition: transform 0.3s ease;
      }
      
      &:hover mat-icon {
        transform: rotate(180deg);
      }
    }

    .theme-menu-button {
      color: #64748b;
      transition: all 0.2s ease;
      
      &:hover {
        background: #f1f5f9;
        color: #334155;
      }
    }

    .theme-menu {
      min-width: 160px;
      border-radius: 8px;
      box-shadow: var(--elevation-3);
      border: 1px solid var(--border-color);
    }

    .theme-menu-header {
      padding: 12px 16px 8px;
      
      .menu-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);
      }
    }

    .theme-menu button {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 16px;
      width: 100%;
      text-align: left;
      border: none;
      background: transparent;
      color: var(--text-primary);
      font-size: 14px;
      transition: all 0.2s ease;
      
      &:hover {
        background: var(--bg-tertiary);
      }
      
      &.active {
        background: var(--primary-color);
        color: white;
        
        mat-icon:not(.check-icon) {
          color: white;
        }
      }
      
      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: #64748b;
      }
      
      .check-icon {
        margin-left: auto;
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: var(--primary-color);
      }
      
      &.active .check-icon {
        color: white;
      }
    }

    /* Dark theme styles */
    :host-context(.dark-theme) {
      .theme-toggle-button,
      .theme-menu-button {
        color: #94a3b8;
        
        &:hover {
          background: #334155;
          color: #f8fafc;
        }
      }
    }

    /* Animation for theme switch */
    .theme-toggle-button {
      position: relative;
      overflow: hidden;
      
      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        background: var(--primary-color);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        transition: all 0.3s ease;
        opacity: 0;
      }
      
      &:active::before {
        width: 100px;
        height: 100px;
        opacity: 0.1;
      }
    }
  `]
})
export class ThemeToggleComponent {
  private readonly themeService = inject(ThemeService);
  
  @Input() showAdvancedMenu: boolean = false;
  
  protected readonly currentTheme = signal<ThemeMode>('light');
  protected readonly isDark = computed(() => this.themeService.isDarkMode());

  constructor() {
    this.themeService.getTheme().subscribe(theme => {
      this.currentTheme.set(theme);
    });
  }

  protected toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  protected setLightMode(): void {
    this.themeService.setLightMode();
  }

  protected setDarkMode(): void {
    this.themeService.setDarkMode();
  }

  protected setAutoMode(): void {
    this.themeService.setAutoMode();
  }

  protected getThemeIcon(): string {
    const theme = this.currentTheme();
    if (theme === 'auto') {
      return 'auto_mode';
    }
    return this.isDark() ? 'light_mode' : 'dark_mode';
  }

  protected getTooltipText(): string {
    const theme = this.currentTheme();
    switch (theme) {
      case 'light': return 'Switch to dark mode';
      case 'dark': return 'Switch to light mode';
      case 'auto': return 'Auto theme (follows system)';
      default: return 'Toggle theme';
    }
  }
}
