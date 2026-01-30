import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { Category, SubCategory, Product, Pagination } from '../../../core/models';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-category-browse',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ProductCardComponent,
    LoadingComponent,
    PaginationComponent,
  ],
  templateUrl: './category-browse.component.html',
  styleUrl: './category-browse.component.css',
})
export class CategoryBrowseComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private productService = inject(ProductService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  categories = signal<Category[]>([]);
  subcategories = signal<SubCategory[]>([]);
  products = signal<Product[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = signal(true);
  isLoadingProducts = signal(false);

  selectedCategorySlug = signal<string>('');
  selectedSubcategorySlug = signal<string>('');
  currentPage = signal(1);
  sortBy = signal('newest');

  selectedCategory = computed(() => {
    return this.categories().find((c) => c.slug === this.selectedCategorySlug());
  });

  selectedSubcategory = computed(() => {
    return this.subcategories().find((s) => s.slug === this.selectedSubcategorySlug());
  });

  pageTitle = computed(() => {
    if (this.selectedSubcategory()) {
      return this.selectedSubcategory()!.name;
    }
    if (this.selectedCategory()) {
      return this.selectedCategory()!.name;
    }
    return 'Browse Categories';
  });

  breadcrumbs = computed(() => {
    const crumbs = [
      { label: 'Home', link: '/' },
      { label: 'Categories', link: '/categories' },
    ];
    if (this.selectedCategory()) {
      crumbs.push({
        label: this.selectedCategory()!.name,
        link: `/categories/${this.selectedCategorySlug()}`,
      });
    }
    if (this.selectedSubcategory()) {
      crumbs.push({
        label: this.selectedSubcategory()!.name,
        link: `/categories/${this.selectedCategorySlug()}/${this.selectedSubcategorySlug()}`,
      });
    }
    return crumbs;
  });

  ngOnInit(): void {
    this.loadCategories();

    // Watch for route param changes
    this.route.paramMap.subscribe((params) => {
      const categorySlug = params.get('categorySlug') || '';
      const subcategorySlug = params.get('subcategorySlug') || '';

      this.selectedCategorySlug.set(categorySlug);
      this.selectedSubcategorySlug.set(subcategorySlug);
      this.currentPage.set(1);

      if (categorySlug) {
        this.loadSubcategories(categorySlug);
        this.loadProducts();
      } else {
        this.products.set([]);
        this.subcategories.set([]);
      }
    });

    // Watch for query param changes
    this.route.queryParams.subscribe((params) => {
      if (params['page']) {
        this.currentPage.set(+params['page']);
      }
      if (params['sort']) {
        this.sortBy.set(params['sort']);
      }
      if (this.selectedCategorySlug()) {
        this.loadProducts();
      }
    });
  }

  private loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        if (response.success) {
          this.categories.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastService.error('Failed to load categories');
      },
    });
  }

  private loadSubcategories(categorySlug: string): void {
    const category = this.categories().find((c) => c.slug === categorySlug);
    if (category) {
      this.categoryService.getSubcategories(category._id).subscribe({
        next: (response) => {
          if (response.success) {
            this.subcategories.set(response.data);
          }
        },
      });
    }
  }

  private loadProducts(): void {
    this.isLoadingProducts.set(true);

    const params: any = {
      page: this.currentPage(),
      limit: 12,
      sort: this.sortBy(),
    };

    if (this.selectedCategorySlug()) {
      params.category = this.selectedCategorySlug();
    }
    if (this.selectedSubcategorySlug()) {
      params.subCategory = this.selectedSubcategorySlug();
    }

    this.productService.getProducts(params).subscribe({
      next: (response) => {
        this.products.set(response.data);
        this.pagination.set(response.pagination);
        this.isLoadingProducts.set(false);
      },
      error: () => {
        this.isLoadingProducts.set(false);
        this.toastService.error('Failed to load products');
      },
    });
  }

  selectCategory(categorySlug: string): void {
    this.router.navigate(['/categories', categorySlug]);
  }

  selectSubcategory(subcategorySlug: string): void {
    this.router.navigate(['/categories', this.selectedCategorySlug(), subcategorySlug]);
  }

  clearSubcategory(): void {
    this.router.navigate(['/categories', this.selectedCategorySlug()]);
  }

  onSortChange(): void {
    this.updateQueryParams();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.updateQueryParams();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private updateQueryParams(): void {
    const queryParams: any = {};
    if (this.currentPage() > 1) {
      queryParams.page = this.currentPage();
    }
    if (this.sortBy() !== 'newest') {
      queryParams.sort = this.sortBy();
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }
}
