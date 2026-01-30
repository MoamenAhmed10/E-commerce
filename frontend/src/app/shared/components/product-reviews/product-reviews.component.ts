import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../../core/services/review.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Review, Order } from '../../../core/models';

@Component({
  selector: 'app-product-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-reviews.component.html',
  styleUrl: './product-reviews.component.css',
})
export class ProductReviewsComponent implements OnInit {
  @Input({ required: true }) productId!: string;
  @Input() deliveredOrders: Order[] = [];

  private reviewService = inject(ReviewService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  reviews = signal<Review[]>([]);
  stats = signal<{ averageRating: number; totalReviews: number }>({
    averageRating: 0,
    totalReviews: 0,
  });
  isLoading = signal(true);
  isSubmitting = signal(false);
  showReviewForm = signal(false);
  currentPage = signal(1);
  totalPages = signal(1);

  // Form fields
  selectedOrderId = '';
  rating = 5;
  title = '';
  comment = '';

  isLoggedIn = this.authService.isLoggedIn;

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.isLoading.set(true);
    this.reviewService.getProductReviews(this.productId, this.currentPage()).subscribe({
      next: (response) => {
        if (response.success) {
          this.reviews.set(response.data);
          this.stats.set(response.stats || { averageRating: 0, totalReviews: 0 });
          if (response.pagination) {
            this.totalPages.set(response.pagination.totalPages);
          }
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  toggleReviewForm(): void {
    if (!this.isLoggedIn()) {
      this.toastService.warning('Please login to write a review');
      return;
    }
    if (this.deliveredOrders.length === 0) {
      this.toastService.warning('You can only review products you have purchased and received');
      return;
    }
    this.showReviewForm.update((v) => !v);
  }

  submitReview(): void {
    if (!this.selectedOrderId) {
      this.toastService.error('Please select an order');
      return;
    }
    if (this.rating < 1 || this.rating > 5) {
      this.toastService.error('Please select a rating');
      return;
    }

    this.isSubmitting.set(true);

    this.reviewService
      .createReview({
        productId: this.productId,
        orderId: this.selectedOrderId,
        rating: this.rating,
        title: this.title || undefined,
        comment: this.comment || undefined,
      })
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.success('Review submitted successfully!');
            this.showReviewForm.set(false);
            this.resetForm();
            this.loadReviews();
          }
          this.isSubmitting.set(false);
        },
        error: (error) => {
          this.toastService.error(error.error?.message || 'Failed to submit review');
          this.isSubmitting.set(false);
        },
      });
  }

  setRating(value: number): void {
    this.rating = value;
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadReviews();
  }

  private resetForm(): void {
    this.selectedOrderId = '';
    this.rating = 5;
    this.title = '';
    this.comment = '';
  }

  getStarArray(): number[] {
    return [1, 2, 3, 4, 5];
  }

  getFilledStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.floor(rating)).fill(0);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getUserName(review: Review): string {
    if (typeof review.userId === 'object' && review.userId) {
      return `${review.userId.firstName} ${review.userId.lastName}`;
    }
    return review.userName || 'Anonymous';
  }
}
