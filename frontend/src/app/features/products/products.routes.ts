import { Routes } from '@angular/router';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./product-list/product-list.component').then((m) => m.ProductListComponent),
    title: 'Shop - StyleHub',
  },
  {
    path: ':slug',
    loadComponent: () =>
      import('./product-detail/product-detail.component').then((m) => m.ProductDetailComponent),
    title: 'Product Details - StyleHub',
  },
];
