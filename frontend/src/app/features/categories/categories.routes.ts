import { Routes } from '@angular/router';

export const CATEGORIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./category-browse/category-browse.component').then((m) => m.CategoryBrowseComponent),
    title: 'Browse Categories - StyleHub',
  },
  {
    path: ':categorySlug',
    loadComponent: () =>
      import('./category-browse/category-browse.component').then((m) => m.CategoryBrowseComponent),
    title: 'Category - StyleHub',
  },
  {
    path: ':categorySlug/:subcategorySlug',
    loadComponent: () =>
      import('./category-browse/category-browse.component').then((m) => m.CategoryBrowseComponent),
    title: 'Category - StyleHub',
  },
];
