import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { Review, Pagination } from '../../../core/models';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingComponent,
    PaginationComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.css'
})
export class AdminReviewsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private adminService = inject(AdminService);
  private toastService = inject(ToastService);

  reviews = signal<Review[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = signal(true);

  statusFilter = '';
  currentPage = 1;

  showDeleteModal = false;
  reviewToDelete: Review | null = null;

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['status'] === 'pending') {
        this.statusFilter = 'pending';
      }
      this.loadReviews();
    });
  }

  loadReviews(): void {
    this.isLoading.set(true);

    let isApproved: boolean | undefined;
    if (this.statusFilter === 'pending') {
      isApproved = false;
    } else if (this.statusFilter === 'approved') {
      isApproved = true;
    }

    this.adminService.getReviews(this.currentPage, 20, isApproved).subscribe({
      next: (response) => {
        if (response.success) {
          this.reviews.set(response.data);
          this.pagination.set(response.pagination);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadReviews();
  }

  approveReview(review: Review): void {
    this.adminService.approveReview(review._id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Review approved');
          this.loadReviews();
        }
      },
      error: (error: { message?: string }) => {
        this.toastService.error(error.message || 'Failed to approve review');
      },
    });
  }

  rejectReview(review: Review): void {
    this.adminService.rejectReview(review._id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Review rejected');
          this.loadReviews();
        }
      },
      error: (error: { message?: string }) => {
        this.toastService.error(error.message || 'Failed to reject review');
      },
    });
  }

  confirmDelete(review: Review): void {
    this.reviewToDelete = review;
    this.showDeleteModal = true;
  }

  deleteReview(): void {
    if (!this.reviewToDelete) return;

    this.adminService.deleteReview(this.reviewToDelete._id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Review deleted');
          this.loadReviews();
        }
        this.showDeleteModal = false;
        this.reviewToDelete = null;
      },
      error: (error: { message?: string }) => {
        this.toastService.error(error.message || 'Failed to delete review');
        this.showDeleteModal = false;
      },
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
