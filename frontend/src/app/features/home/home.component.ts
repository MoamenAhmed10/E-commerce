import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { Product, Category, FeaturedProducts } from '../../core/models';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { TestimonialsListComponent } from '../../shared/components/testimonials-list/testimonials-list.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProductCardComponent,
    LoadingComponent,
    TestimonialsListComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  featuredProducts = signal<FeaturedProducts | null>(null);
  categories = signal<Category[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    // Load featured products
    this.productService.getFeaturedProducts().subscribe({
      next: (response) => {
        if (response.success) {
          this.featuredProducts.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });

    // Load categories
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        if (response.success) {
          this.categories.set(response.data.slice(0, 6)); // Take first 6
        }
      },
    });
  }
}
