import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Product, Pagination } from '../../../core/models';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingComponent, PaginationComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class AdminProductsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private toastService = inject(ToastService);

  products = signal<Product[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = signal(true);

  searchQuery = '';
  stockFilter = '';
  activeFilter = '';
  currentPage = 1;

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    // Check for query params
    this.route.queryParams.subscribe((params) => {
      if (params['stock']) {
        this.stockFilter = params['stock'];
      }
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.isLoading.set(true);

    const params: Record<string, string> = {
      page: this.currentPage.toString(),
      limit: '10',
    };

    if (this.searchQuery) params['search'] = this.searchQuery;
    if (this.stockFilter) params['stockStatus'] = this.stockFilter;
    if (this.activeFilter) params['isActive'] = this.activeFilter;

    this.productService.getAdminProducts(params).subscribe({
      next: (response) => {
        if (response.success) {
          this.products.set(response.data);
          this.pagination.set(response.pagination);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  onSearch(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadProducts();
    }, 300);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  toggleActive(product: Product): void {
    this.productService.updateProduct(product._id, { isActive: !product.isActive }).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success(`Product ${product.isActive ? 'deactivated' : 'activated'}`);
          this.loadProducts();
        }
      },
      error: (error: { message?: string }) => {
        this.toastService.error(error.message || 'Failed to update product');
      },
    });
  }
}
