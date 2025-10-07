import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  
  // Login page (no auth required)
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  
  // Main navigation pages (protected)
  { 
    path: 'dashboard', 
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardPage),
    canActivate: [AuthGuard]
  },
  { 
    path: 'customers', 
    loadComponent: () => import('./pages/customers/customers').then(m => m.CustomersPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'users',
    loadComponent: () => import('./features/users/pages/user-list/user-list.component').then(m => m.UserListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'restaurants',
    loadComponent: () => import('./features/stores/pages/stores-list/stores-list').then(m => m.RestaurantsListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'restaurants/:id',
    loadComponent: () => import('./features/stores/pages/restaurant-details/restaurant-details.component').then(m => m.RestaurantDetailsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'restaurants/:restaurantId/menu-items/new',
    loadComponent: () => import('./features/sections/pages/menu-item-page/menu-item-page.component').then(m => m.MenuItemPageComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'restaurants/:restaurantId/menu-items/:menuItemId/edit',
    loadComponent: () => import('./features/sections/pages/menu-item-page/menu-item-page.component').then(m => m.MenuItemPageComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'orders',
    loadComponent: () => import('./features/orders/pages/orders-list/orders-list.component').then(m => m.OrdersListComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'account', 
    loadComponent: () => import('./pages/account/account').then(m => m.AccountPage),
    canActivate: [AuthGuard]
  },
  { 
    path: 'about', 
    loadComponent: () => import('./pages/about/about').then(m => m.AboutPage),
    canActivate: [AuthGuard]
  },
  
  // Resources pages
  { 
    path: 'icons', 
    loadComponent: () => import('./pages/icons/icons').then(m => m.IconsPage),
    canActivate: [AuthGuard]
  },
  { 
    path: 'typography', 
    loadComponent: () => import('./pages/typography/typography').then(m => m.TypographyPage),
    canActivate: [AuthGuard]
  },
  { 
    path: 'components', 
    loadComponent: () => import('./pages/components/components').then(m => m.ComponentsPage),
    canActivate: [AuthGuard]
  },
  
  // Module pages (secondary navigation)
  { 
    path: 'tenants', 
    loadComponent: () => import('./features/tenants/pages/tenants-list/tenants-list').then(m => m.TenantsList),
    canActivate: [AuthGuard]
  },
  { 
    path: 'subscriptions', 
    loadComponent: () => import('./features/subscriptions/pages/subscriptions-view/subscriptions-view').then(m => m.SubscriptionsView),
    canActivate: [AuthGuard]
  },
  
  { path: '**', redirectTo: 'dashboard' }
];
