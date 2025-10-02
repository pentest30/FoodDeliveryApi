import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  
  // Main navigation pages
  { 
    path: 'dashboard', 
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardPage)
  },
  { 
    path: 'customers', 
    loadComponent: () => import('./pages/customers/customers').then(m => m.CustomersPage)
  },
  { 
    path: 'users', 
    loadComponent: () => import('./pages/users/users').then(m => m.UsersPage)
  },
  { 
    path: 'account', 
    loadComponent: () => import('./pages/account/account').then(m => m.AccountPage)
  },
  { 
    path: 'about', 
    loadComponent: () => import('./pages/about/about').then(m => m.AboutPage)
  },
  
  // Resources pages
  { 
    path: 'icons', 
    loadComponent: () => import('./pages/icons/icons').then(m => m.IconsPage)
  },
  { 
    path: 'typography', 
    loadComponent: () => import('./pages/typography/typography').then(m => m.TypographyPage)
  },
  { 
    path: 'components', 
    loadComponent: () => import('./pages/components/components').then(m => m.ComponentsPage)
  },
  
  // Module pages (secondary navigation)
  { 
    path: 'tenants', 
    loadComponent: () => import('./features/tenants/pages/tenants-list/tenants-list').then(m => m.TenantsList)
  },
  { 
    path: 'subscriptions', 
    loadComponent: () => import('./features/subscriptions/pages/subscriptions-view/subscriptions-view').then(m => m.SubscriptionsView)
  },
  
  { path: '**', redirectTo: 'dashboard' }
];
