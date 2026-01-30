import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Home
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
    title: 'StyleHub - Fashion for the Modern Youth',
  },

  // Auth routes
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  // Products routes
  {
    path: 'products',
    loadChildren: () =>
      import('./features/products/products.routes').then((m) => m.PRODUCTS_ROUTES),
  },

  // Categories routes
  {
    path: 'categories',
    loadChildren: () =>
      import('./features/categories/categories.routes').then((m) => m.CATEGORIES_ROUTES),
  },

  // Cart
  {
    path: 'cart',
    loadChildren: () => import('./features/cart/cart.routes').then((m) => m.CART_ROUTES),
  },

  // Checkout (requires auth)
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/checkout/checkout.component').then((m) => m.CheckoutComponent),
    title: 'Checkout - StyleHub',
  },

  // Account (requires auth)
  {
    path: 'account',
    canActivate: [authGuard],
    loadChildren: () => import('./features/account/account.routes').then((m) => m.ACCOUNT_ROUTES),
  },

  // Admin (requires admin)
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },

  // Categories - redirect to products page
  {
    path: 'categories',
    redirectTo: 'products',
    pathMatch: 'full',
  },

  // Static pages
  {
    path: 'about',
    loadComponent: () =>
      import('./features/static/about/about.component').then((m) => m.AboutComponent),
    title: 'About Us - StyleHub',
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./features/static/contact/contact.component').then((m) => m.ContactComponent),
    title: 'Contact Us - StyleHub',
  },
  {
    path: 'faq',
    loadComponent: () =>
      import('./features/static/coming-soon/coming-soon.component').then(
        (m) => m.ComingSoonComponent,
      ),
    title: 'FAQ - StyleHub',
    data: { title: 'Frequently Asked Questions' },
  },
  {
    path: 'shipping',
    loadComponent: () =>
      import('./features/static/coming-soon/coming-soon.component').then(
        (m) => m.ComingSoonComponent,
      ),
    title: 'Shipping Info - StyleHub',
    data: { title: 'Shipping Information' },
  },
  {
    path: 'returns',
    loadComponent: () =>
      import('./features/static/coming-soon/coming-soon.component').then(
        (m) => m.ComingSoonComponent,
      ),
    title: 'Returns & Exchanges - StyleHub',
    data: { title: 'Returns & Exchanges' },
  },
  {
    path: 'size-guide',
    loadComponent: () =>
      import('./features/static/coming-soon/coming-soon.component').then(
        (m) => m.ComingSoonComponent,
      ),
    title: 'Size Guide - StyleHub',
    data: { title: 'Size Guide' },
  },
  {
    path: 'careers',
    loadComponent: () =>
      import('./features/static/coming-soon/coming-soon.component').then(
        (m) => m.ComingSoonComponent,
      ),
    title: 'Careers - StyleHub',
    data: { title: 'Careers' },
  },
  {
    path: 'sustainability',
    loadComponent: () =>
      import('./features/static/coming-soon/coming-soon.component').then(
        (m) => m.ComingSoonComponent,
      ),
    title: 'Sustainability - StyleHub',
    data: { title: 'Sustainability' },
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('./features/static/coming-soon/coming-soon.component').then(
        (m) => m.ComingSoonComponent,
      ),
    title: 'Privacy Policy - StyleHub',
    data: { title: 'Privacy Policy' },
  },
  {
    path: 'terms',
    loadComponent: () =>
      import('./features/static/coming-soon/coming-soon.component').then(
        (m) => m.ComingSoonComponent,
      ),
    title: 'Terms of Service - StyleHub',
    data: { title: 'Terms of Service' },
  },

  // Catch-all redirect
  {
    path: '**',
    redirectTo: '',
  },
];
