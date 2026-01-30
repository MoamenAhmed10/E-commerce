import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TestimonialService } from '../../../core/services/testimonial.service';
import { ToastService } from '../../../core/services/toast.service';
import { Testimonial } from '../../../core/models';

@Component({
  selector: 'app-testimonial-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './testimonial-form.component.html',
  styleUrl: './testimonial-form.component.css',
})
export class TestimonialFormComponent implements OnInit {
  private testimonialService = inject(TestimonialService);
  private toastService = inject(ToastService);

  existingTestimonial = signal<Testimonial | null>(null);
  isLoading = signal(true);
  isSubmitting = signal(false);
  isEditing = signal(false);

  rating = 5;
  title = '';
  content = '';

  ngOnInit(): void {
    this.loadMyTestimonial();
  }

  private loadMyTestimonial(): void {
    this.testimonialService.getMyTestimonial().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.existingTestimonial.set(response.data);
          this.rating = response.data.rating;
          this.title = response.data.title;
          this.content = response.data.content;
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  setRating(value: number): void {
    this.rating = value;
  }

  startEditing(): void {
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    const testimonial = this.existingTestimonial();
    if (testimonial) {
      this.rating = testimonial.rating;
      this.title = testimonial.title;
      this.content = testimonial.content;
    }
    this.isEditing.set(false);
  }

  submitTestimonial(): void {
    if (!this.title.trim() || !this.content.trim()) {
      this.toastService.error('Please fill in all fields');
      return;
    }

    if (this.title.length < 3) {
      this.toastService.error('Title must be at least 3 characters');
      return;
    }

    if (this.content.length < 10) {
      this.toastService.error('Content must be at least 10 characters');
      return;
    }

    this.isSubmitting.set(true);

    const data = {
      rating: this.rating,
      title: this.title.trim(),
      content: this.content.trim(),
    };

    const testimonial = this.existingTestimonial();

    if (testimonial) {
      this.testimonialService.updateTestimonial(testimonial._id, data).subscribe({
        next: (response) => {
          if (response.success) {
            this.existingTestimonial.set(response.data);
            this.toastService.success('Testimonial updated! It will appear after admin approval.');
            this.isEditing.set(false);
          }
          this.isSubmitting.set(false);
        },
        error: (error: { message?: string }) => {
          this.toastService.error(error.message || 'Failed to update testimonial');
          this.isSubmitting.set(false);
        },
      });
    } else {
      this.testimonialService.createTestimonial(data).subscribe({
        next: (response) => {
          if (response.success) {
            this.existingTestimonial.set(response.data);
            this.toastService.success(
              'Thank you! Your testimonial will appear after admin approval.',
            );
          }
          this.isSubmitting.set(false);
        },
        error: (error: { message?: string }) => {
          this.toastService.error(error.message || 'Failed to submit testimonial');
          this.isSubmitting.set(false);
        },
      });
    }
  }

  deleteTestimonial(): void {
    const testimonial = this.existingTestimonial();
    if (!testimonial) return;

    if (!confirm('Are you sure you want to delete your testimonial?')) {
      return;
    }

    this.isSubmitting.set(true);
    this.testimonialService.deleteTestimonial(testimonial._id).subscribe({
      next: () => {
        this.existingTestimonial.set(null);
        this.rating = 5;
        this.title = '';
        this.content = '';
        this.toastService.success('Testimonial deleted');
        this.isSubmitting.set(false);
        this.isEditing.set(false);
      },
      error: (error: { message?: string }) => {
        this.toastService.error(error.message || 'Failed to delete testimonial');
        this.isSubmitting.set(false);
      },
    });
  }
}
