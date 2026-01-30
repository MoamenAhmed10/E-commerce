import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product, Category, SubCategory, Pagination } from '../../../core/models';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ProductCardComponent,
    LoadingComponent,
    PaginationComponent,
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private cartService = inject(CartService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  subcategories = signal<SubCategory[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = signal(true);
  isFilterOpen = signal(false);

  selectedCategory = signal<string>('');
  selectedSubcategory = signal<string>('');
  searchQuery = signal<string>('');
  isNewArrivals = signal(false);
  isOnSale = signal(false);
  minPrice: number | null = null;
  maxPrice: number | null = null;
  minRating: number | null = null;
  inStockOnly = false;
  sortBy = 'newest';
  currentPage = 1;

  totalProducts = computed(() => this.pagination()?.total || 0);

  pageTitle = computed(() => {
    if (this.isNewArrivals()) {
      return 'New Arrivals';
    }
    if (this.isOnSale()) {
      return 'Best Sellers';
    }
    if (this.searchQuery()) {
      return `Search: "${this.searchQuery()}"`;
    }
    if (this.selectedSubcategory()) {
      return (
        this.subcategories().find((s) => s.slug === this.selectedSubcategory())?.name || 'Products'
      );
    }
    if (this.selectedCategory()) {
      return this.categories().find((c) => c.slug === this.selectedCategory())?.name || 'Products';
    }
    return 'All Products';
  });

  hasActiveFilters = computed(() => {
    return (
      this.selectedCategory() ||
      this.selectedSubcategory() ||
      this.searchQuery() ||
      this.minPrice ||
      this.maxPrice ||
      this.minRating
    );
  });

  constructor() {
    // Load subcategories when category changes
    effect(() => {
      const category = this.selectedCategory();
      if (category) {
        const cat = this.categories().find((c) => c.slug === category);
        if (cat) {
          this.categoryService.getSubcategories(cat._id).subscribe({
            next: (response) => {
              if (response.success) {
                this.subcategories.set(response.data);
              }
            },
          });
        }
      } else {
        // Load all subcategories when no category selected
        this.categoryService.getSubcategories().subscribe({
          next: (response) => {
            if (response.success) {
              this.subcategories.set(response.data);
            }
          },
        });
      }
    });
  }

  ngOnInit(): void {
    // Load categories
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        if (response.success) {
          this.categories.set(response.data);
        }
      },
    });

    // Watch for query param changes
    this.route.queryParams.subscribe((params) => {
      this.selectedCategory.set(params['category'] || '');
      this.selectedSubcategory.set(params['subcategory'] || '');
      this.searchQuery.set(params['search'] || '');
      this.minPrice = params['minPrice'] ? +params['minPrice'] : null;
      this.maxPrice = params['maxPrice'] ? +params['maxPrice'] : null;
      this.minRating = params['minRating'] ? +params['minRating'] : null;
      this.sortBy = params['sort'] || 'newest';
      this.currentPage = params['page'] ? +params['page'] : 1;
      this.isNewArrivals.set(params['new'] === 'true');
      this.isOnSale.set(params['sale'] === 'true');
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.isLoading.set(true);

    const params: any = {
      page: this.currentPage,
      limit: 12,
      sort: this.sortBy,
    };

    if (this.selectedCategory()) params.category = this.selectedCategory();
    if (this.selectedSubcategory()) params.subCategory = this.selectedSubcategory();
    if (this.searchQuery()) params.search = this.searchQuery();
    if (this.minPrice) params.minPrice = this.minPrice;
    if (this.maxPrice) params.maxPrice = this.maxPrice;
    if (this.minRating) params.minRating = this.minRating;
    if (this.inStockOnly) params.inStock = true;
    if (this.isNewArrivals()) params.newArrivals = true;
    if (this.isOnSale()) params.onSale = true;

    this.productService.getProducts(params).subscribe({
      next: (response) => {
        this.products.set(response.data);
        this.pagination.set(response.pagination);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastService.error('Failed to load products');
      },
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.updateUrl();
  }

  onCategoryChange(category: string): void {
    this.selectedCategory.set(category);
    this.selectedSubcategory.set(''); // Reset subcategory when category changes
    this.applyFilters();
  }

  onSubcategoryChange(subcategory: string): void {
    this.selectedSubcategory.set(subcategory);
    this.applyFilters();
  }

  clearPriceFilter(): void {
    this.minPrice = null;
    this.maxPrice = null;
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedCategory.set('');
    this.selectedSubcategory.set('');
    this.minPrice = null;
    this.maxPrice = null;
    this.minRating = null;
    this.inStockOnly = false;
    this.sortBy = 'newest';
    this.applyFilters();
    this.toggleFilters();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updateUrl();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleFilters(): void {
    this.isFilterOpen.update((v) => !v);
  }

  onAddToCart(product: Product): void {
    // Navigate to product detail for variant selection
    this.router.navigate(['/products', product.slug]);
    this.toastService.info('Please select size and color');
  }

  onRatingChange(rating: number): void {
    this.minRating = rating;
    this.applyFilters();
  }

  private updateUrl(): void {
    const queryParams: any = {
      page: this.currentPage > 1 ? this.currentPage : null,
      category: this.selectedCategory() || null,
      subcategory: this.selectedSubcategory() || null,
      minPrice: this.minPrice || null,
      maxPrice: this.maxPrice || null,
      minRating: this.minRating || null,
      sort: this.sortBy !== 'newest' ? this.sortBy : null,
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }
}
