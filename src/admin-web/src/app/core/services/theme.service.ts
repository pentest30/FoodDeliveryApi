import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ThemeMode = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  private readonly themeSubject = new BehaviorSubject<ThemeMode>('light');
  
  protected readonly theme = signal<ThemeMode>('light');
  protected readonly isDark = computed(() => {
    const currentTheme = this.theme();
    if (currentTheme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return currentTheme === 'dark';
  });

  constructor() {
    this.initializeTheme();
    this.watchSystemTheme();
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as ThemeMode;
    const initialTheme = savedTheme || 'light';
    this.setTheme(initialTheme);
  }

  private watchSystemTheme(): void {
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (this.theme() === 'auto') {
          this.applyTheme();
        }
      });
    }
  }

  getTheme(): Observable<ThemeMode> {
    return this.themeSubject.asObservable();
  }

  getCurrentTheme(): ThemeMode {
    return this.theme();
  }

  isDarkMode(): boolean {
    return this.isDark();
  }

  setTheme(theme: ThemeMode): void {
    this.theme.set(theme);
    this.themeSubject.next(theme);
    localStorage.setItem(this.THEME_KEY, theme);
    this.applyTheme();
  }

  toggleTheme(): void {
    const currentTheme = this.theme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  setLightMode(): void {
    this.setTheme('light');
  }

  setDarkMode(): void {
    this.setTheme('dark');
  }

  setAutoMode(): void {
    this.setTheme('auto');
  }

  private applyTheme(): void {
    const isDark = this.isDark();
    const htmlElement = document.documentElement;
    
    if (isDark) {
      htmlElement.classList.add('dark-theme');
      htmlElement.classList.remove('light-theme');
    } else {
      htmlElement.classList.add('light-theme');
      htmlElement.classList.remove('dark-theme');
    }
    
    // Update CSS custom properties for theme
    this.updateThemeVariables(isDark);
  }

  private updateThemeVariables(isDark: boolean): void {
    const root = document.documentElement;
    
    if (isDark) {
      // Dark theme variables
      root.style.setProperty('--bg-primary', '#0f172a');
      root.style.setProperty('--bg-secondary', '#1e293b');
      root.style.setProperty('--bg-tertiary', '#334155');
      root.style.setProperty('--text-primary', '#f8fafc');
      root.style.setProperty('--text-secondary', '#cbd5e1');
      root.style.setProperty('--text-tertiary', '#94a3b8');
      root.style.setProperty('--border-color', '#334155');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.3)');
    } else {
      // Light theme variables
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f8fafc');
      root.style.setProperty('--bg-tertiary', '#f1f5f9');
      root.style.setProperty('--text-primary', '#1e293b');
      root.style.setProperty('--text-secondary', '#64748b');
      root.style.setProperty('--text-tertiary', '#94a3b8');
      root.style.setProperty('--border-color', '#e2e8f0');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.1)');
    }
  }
}
