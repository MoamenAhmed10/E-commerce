import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
        title: 'Admin Dashboard',
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./products/products.component').then((m) => m.AdminProductsComponent),
        title: 'Manage Products',
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import('./product-form/product-form.component').then((m) => m.ProductFormComponent),
        title: 'Add Product',
      },
      {
        path: 'products/:id/edit',
        loadComponent: () =>
          import('./product-form/product-form.component').then((m) => m.ProductFormComponent),
        title: 'Edit Product',
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./categories/categories.component').then((m) => m.AdminCategoriesComponent),
        title: 'Manage Categories',
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./orders/orders.component').then((m) => m.AdminOrdersComponent),
        title: 'Manage Orders',
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./order-detail/order-detail.component').then((m) => m.AdminOrderDetailComponent),
        title: 'Order Details',
      },
      {
        path: 'users',
        loadComponent: () => import('./users/users.component').then((m) => m.AdminUsersComponent),
        title: 'Manage Users',
      },
      {
        path: 'reviews',
        loadComponent: () =>
          import('./reviews/reviews.component').then((m) => m.AdminReviewsComponent),
        title: 'Manage Reviews',
      },
      {
        path: 'returns',
        loadComponent: () =>
          import('./returns/returns.component').then((m) => m.AdminReturnsComponent),
        title: 'Manage Returns',
      },
      {
        path: 'testimonials',
        loadComponent: () =>
          import('./testimonials/testimonials.component').then((m) => m.AdminTestimonialsComponent),
        title: 'Manage Testimonials',
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./reports/reports.component').then((m) => m.AdminReportsComponent),
        title: 'Sales Reports',
      },
    ],
  },
];
