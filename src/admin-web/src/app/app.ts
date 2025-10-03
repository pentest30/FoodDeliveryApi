import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { AuthService, UserInfo } from './core/services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive, 
    TranslateModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatBadgeModule,
    MatTabsModule,
    MatTooltipModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private breakpointObserver = inject(BreakpointObserver);
  private translateService = inject(TranslateService);
  private router = inject(Router);
  private authService = inject(AuthService);

  protected readonly title = signal('admin-web');
  protected readonly isHandset = signal(false);
  protected readonly currentLang = signal('en');
  protected readonly notificationCount = signal(3);
  protected readonly currentUser = signal<UserInfo | null>(null);
  protected readonly isAuthenticated = signal(false);

  protected readonly moduleRoutes: any[] = [];

  protected readonly sidenavItems = [
    {
      section: 'home',
      items: [
        { path: '/dashboard', icon: 'dashboard', label: 'nav.dashboard' },
        { path: '/customers', icon: 'people', label: 'nav.customers' },
        { path: '/sections', icon: 'category', label: 'nav.sections' },
        { path: '/users', icon: 'group', label: 'nav.users' },
        { path: '/account', icon: 'account_circle', label: 'nav.account' }
      ]
    },
    {
      section: 'resources',
      items: [
        { path: '/icons', icon: 'apps', label: 'nav.icons' },
        { path: '/typography', icon: 'text_fields', label: 'nav.typography' },
        { path: '/components', icon: 'widgets', label: 'nav.components' }
      ]
    }
  ];

  ngOnInit() {
    this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => {
        this.isHandset.set(result.matches);
      });

    // Set initial language
    this.translateService.setDefaultLang('en');
    this.translateService.use('en');

    // Subscribe to authentication state
    this.authService.authState$.subscribe(authState => {
      this.isAuthenticated.set(authState.isAuthenticated);
      this.currentUser.set(authState.user);
      
      // Redirect to login if not authenticated
      if (!authState.isAuthenticated && !this.router.url.includes('/login')) {
        this.router.navigate(['/login']);
      }
    });
  }

  protected switchLanguage(lang: string) {
    this.currentLang.set(lang);
    this.translateService.use(lang);
    
    // Set RTL for Arabic
    const htmlElement = document.documentElement;
    if (lang === 'ar') {
      htmlElement.setAttribute('dir', 'rtl');
    } else {
      htmlElement.setAttribute('dir', 'ltr');
    }
  }

  protected logout() {
    this.authService.logout();
  }

  protected isLoginPage(): boolean {
    return this.router.url.includes('/login');
  }

  protected shouldShowSecondaryNav(): boolean {
    return this.moduleRoutes.length > 0;
  }

  protected navigateToModule(path: string) {
    this.router.navigate([path]);
  }
}
