import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestimonialService } from '../../../core/services/testimonial.service';
import { ToastService } from '../../../core/services/toast.service';
import { Testimonial, Pagination } from '../../../core/models';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-admin-testimonials',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingComponent,
    PaginationComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.css',
})
export class AdminTestimonialsComponent implements OnInit {
  private testimonialService = inject(TestimonialService);
  private toastService = inject(ToastService);

  testimonials = signal<Testimonial[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = signal(true);

  statusFilter = '';
  searchQuery = '';
  currentPage = 1;

  showDeleteModal = false;
  testimonialToDelete: Testimonial | null = null;

  ngOnInit(): void {
    this.loadTestimonials();
  }

  loadTestimonials(): void {
    this.isLoading.set(true);

    let isApproved: boolean | undefined;
    if (this.statusFilter === 'pending') {
      isApproved = false;
    } else if (this.statusFilter === 'approved') {
      isApproved = true;
    }

    this.testimonialService
      .getAllTestimonials(this.currentPage, 20, isApproved, this.searchQuery || undefined)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.testimonials.set(response.data);
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
    this.currentPage = 1;
    this.loadTestimonials();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadTestimonials();
  }

  toggleApproval(testimonial: Testimonial): void {
    this.testimonialService.toggleApproval(testimonial._id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success(
            response.data.isApproved ? 'Testimonial approved' : 'Testimonial unapproved',
          );
          this.loadTestimonials();
        }
      },
      error: (error: { message?: string }) => {
        this.toastService.error(error.message || 'Failed to update testimonial');
      },
    });
  }

  confirmDelete(testimonial: Testimonial): void {
    this.testimonialToDelete = testimonial;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.testimonialToDelete = null;
    this.showDeleteModal = false;
  }

  deleteTestimonial(): void {
    if (!this.testimonialToDelete) return;

    this.testimonialService.adminDeleteTestimonial(this.testimonialToDelete._id).subscribe({
      next: () => {
        this.toastService.success('Testimonial deleted');
        this.showDeleteModal = false;
        this.testimonialToDelete = null;
        this.loadTestimonials();
      },
      error: (error: { message?: string }) => {
        this.toastService.error(error.message || 'Failed to delete testimonial');
      },
    });
  }

  getStars(rating: number): number[] {
    return Array(5)
      .fill(0)
      .map((_, i) => (i < rating ? 1 : 0));
  }

  getUserName(testimonial: Testimonial): string {
    if (typeof testimonial.userId === 'object' && testimonial.userId) {
      return `${testimonial.userId.firstName} ${testimonial.userId.lastName}`;
    }
    return testimonial.userName;
  }

  getUserEmail(testimonial: Testimonial): string {
    if (typeof testimonial.userId === 'object' && testimonial.userId?.email) {
      return testimonial.userId.email;
    }
    return '';
  }
}
