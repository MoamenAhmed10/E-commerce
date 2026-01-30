import { Routes } from '@angular/router';

export const ACCOUNT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./profile/profile.component').then((m) => m.ProfileComponent),
    title: 'My Account - StyleHub',
  },
  {
    path: 'addresses',
    loadComponent: () =>
      import('./addresses/addresses.component').then((m) => m.AddressesComponent),
    title: 'My Addresses - StyleHub',
  },
  {
    path: 'orders',
    loadComponent: () => import('./orders/orders.component').then((m) => m.OrdersComponent),
    title: 'My Orders - StyleHub',
  },
  {
    path: 'orders/:id',
    loadComponent: () =>
      import('./order-detail/order-detail.component').then((m) => m.OrderDetailComponent),
    title: 'Order Details - StyleHub',
  },
  {
    path: 'returns',
    loadComponent: () => import('./returns/returns.component').then((m) => m.UserReturnsComponent),
    title: 'My Returns - StyleHub',
  },
  {
    path: 'testimonials',
    loadComponent: () =>
      import('./testimonials/testimonial-form.component').then((m) => m.TestimonialFormComponent),
    title: 'My Testimonial - StyleHub',
  },
];
