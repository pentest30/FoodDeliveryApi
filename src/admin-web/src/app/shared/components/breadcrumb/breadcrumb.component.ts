import { Component, signal, inject } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { filter, map } from 'rxjs/operators';

export interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    TranslateModule
  ],
  template: `
    <nav class="breadcrumb" *ngIf="breadcrumbs().length > 0">
      <ol class="breadcrumb-list">
        @for (item of breadcrumbs(); track item.path; let last = $last) {
          <li class="breadcrumb-item" [class.last]="last">
            @if (!last) {
              <a [routerLink]="item.path" class="breadcrumb-link">
                @if (item.icon) {
                  <mat-icon class="breadcrumb-icon">{{ item.icon }}</mat-icon>
                }
                <span class="breadcrumb-text">{{ item.label | translate }}</span>
              </a>
              <mat-icon class="breadcrumb-separator">chevron_right</mat-icon>
            } @else {
              <span class="breadcrumb-current">
                @if (item.icon) {
                  <mat-icon class="breadcrumb-icon">{{ item.icon }}</mat-icon>
                }
                <span class="breadcrumb-text">{{ item.label | translate }}</span>
              </span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styles: [`
    .breadcrumb {
      padding: 16px 0;
      border-bottom: 1px solid #e2e8f0;
      background: white;
      margin-bottom: 24px;
    }

    .breadcrumb-list {
      display: flex;
      align-items: center;
      list-style: none;
      margin: 0;
      padding: 0 24px;
      gap: 8px;
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
      gap: 8px;
      
      &.last {
        .breadcrumb-current {
          color: #1e293b;
          font-weight: 600;
        }
      }
    }

    .breadcrumb-link {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #64748b;
      text-decoration: none;
      padding: 4px 8px;
      border-radius: 6px;
      transition: all 0.2s ease;
      font-size: 14px;
      
      &:hover {
        background: #f1f5f9;
        color: #334155;
      }
    }

    .breadcrumb-current {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #1e293b;
      font-weight: 600;
      font-size: 14px;
    }

    .breadcrumb-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .breadcrumb-text {
      font-size: 14px;
    }

    .breadcrumb-separator {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #94a3b8;
    }

    @media (max-width: 768px) {
      .breadcrumb {
        padding: 12px 0;
        margin-bottom: 16px;
      }
      
      .breadcrumb-list {
        padding: 0 16px;
        flex-wrap: wrap;
      }
      
      .breadcrumb-text {
        font-size: 13px;
      }
    }
  `]
})
export class BreadcrumbComponent {
  private readonly router = inject(Router);
  
  protected readonly breadcrumbs = signal<BreadcrumbItem[]>([]);

  constructor() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.router.url)
      )
      .subscribe(url => {
        this.breadcrumbs.set(this.generateBreadcrumbs(url));
      });
  }

  private generateBreadcrumbs(url: string): BreadcrumbItem[] {
    const segments = url.split('/').filter(segment => segment);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always start with home
    breadcrumbs.push({
      label: 'nav.home',
      path: '/dashboard',
      icon: 'home'
    });

    // Build breadcrumbs based on URL segments
    let currentPath = '';
    
    for (const segment of segments) {
      currentPath += '/' + segment;
      
      // Map segments to breadcrumb items
      const breadcrumbItem = this.getBreadcrumbItem(segment, currentPath);
      if (breadcrumbItem) {
        breadcrumbs.push(breadcrumbItem);
      }
    }

    return breadcrumbs;
  }

  private getBreadcrumbItem(segment: string, path: string): BreadcrumbItem | null {
    const breadcrumbMap: Record<string, BreadcrumbItem> = {
      'restaurants': {
        label: 'nav.restaurants',
        path: '/restaurants',
        icon: 'restaurant'
      },
      'users': {
        label: 'nav.users',
        path: '/users',
        icon: 'group'
      },
      'dashboard': {
        label: 'nav.dashboard',
        path: '/dashboard',
        icon: 'dashboard'
      },
      'customers': {
        label: 'nav.customers',
        path: '/customers',
        icon: 'people'
      },
      'account': {
        label: 'nav.account',
        path: '/account',
        icon: 'account_circle'
      },
      'sections': {
        label: 'nav.sections',
        path: path,
        icon: 'category'
      },
      'menu-items': {
        label: 'nav.menu_items',
        path: path,
        icon: 'restaurant_menu'
      }
    };

    return breadcrumbMap[segment] || null;
  }
}
