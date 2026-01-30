import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product, Category, SubCategory, Cart, ApiResponse, Order } from '../../../core/models';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { ProductReviewsComponent } from '../../../shared/components/product-reviews/product-reviews.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LoadingComponent,
    ProductCardComponent,
    ProductReviewsComponent,
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  product = signal<Product | null>(null);
  relatedProducts = signal<Product[]>([]);
  deliveredOrders = signal<Order[]>([]);
  isLoading = signal(true);
  isAddingToCart = signal(false);
  selectedImageIndex = signal(0);
  quantity = signal(1);

  selectedImage = () => {
    const prod = this.product();
    if (!prod?.images?.length) return '/assets/images/placeholder.jpg';
    return prod.images[this.selectedImageIndex()];
  };

  maxQuantity = () => {
    const prod = this.product();
    if (!prod?.displayStock) return 10;
    return Math.min(prod.displayStock, 10);
  };

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        this.loadProduct(slug);
      }
    });
  }

  private loadProduct(slug: string): void {
    this.isLoading.set(true);
    this.selectedImageIndex.set(0);
    this.quantity.set(1);

    this.productService.getProductBySlug(slug).subscribe({
      next: (response) => {
        if (response.success) {
          this.product.set(response.data);
          this.loadRelatedProducts();
          this.loadDeliveredOrders();
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  private loadRelatedProducts(): void {
    const prod = this.product();
    if (!prod) return;

    // Get related products from same category - use ID not slug
    const categoryId =
      typeof prod.categoryId === 'object' ? (prod.categoryId as Category)._id : prod.categoryId;

    if (!categoryId) return;

    this.productService
      .getProducts({
        category: categoryId,
        limit: 4,
      })
      .subscribe({
        next: (response) => {
          this.relatedProducts.set(response.data.filter((p) => p._id !== prod._id).slice(0, 4));
        },
      });
  }

  private loadDeliveredOrders(): void {
    const prod = this.product();
    if (!prod || !this.authService.isLoggedIn()) return;

    // Fetch delivered orders that contain this product
    this.orderService.getMyOrders(1, 100, 'received').subscribe({
      next: (response) => {
        if (response.success) {
          // Filter orders that contain this product
          const ordersWithProduct = response.data.filter((order) =>
            order.items.some((item) => item.productId === prod._id),
          );
          this.deliveredOrders.set(ordersWithProduct);
        }
      },
    });
  }

  selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  increaseQuantity(): void {
    if (this.quantity() < this.maxQuantity()) {
      this.quantity.update((q) => q + 1);
    }
  }

  decreaseQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update((q) => q - 1);
    }
  }

  addToCart(): void {
    const prod = this.product();
    if (!prod || !prod.inStock) return;

    this.isAddingToCart.set(true);

    this.cartService.addItem(prod, this.quantity()).subscribe({
      next: (response: ApiResponse<Cart>) => {
        this.isAddingToCart.set(false);
        if (response.success) {
          this.toastService.success('Added to cart!');
        }
      },
      error: (error: { message?: string }) => {
        this.isAddingToCart.set(false);
        this.toastService.error(error.message || 'Failed to add to cart');
      },
    });
  }

  getCategoryName(): string {
    const cat = this.product()?.categoryId;
    if (typeof cat === 'object' && cat) {
      return (cat as Category).name;
    }
    return '';
  }
}
