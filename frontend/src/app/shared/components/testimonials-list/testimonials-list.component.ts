import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TestimonialService } from '../../../core/services/testimonial.service';
import { AuthService } from '../../../core/services/auth.service';
import { Testimonial } from '../../../core/models';

@Component({
  selector: 'app-testimonials-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './testimonials-list.component.html',
  styleUrl: './testimonials-list.component.css',
})
export class TestimonialsListComponent implements OnInit {
  private testimonialService = inject(TestimonialService);
  private authService = inject(AuthService);

  testimonials = signal<Testimonial[]>([]);
  isLoading = signal(true);

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  ngOnInit(): void {
    this.loadTestimonials();
  }

  private loadTestimonials(): void {
    this.testimonialService.getApprovedTestimonials(1, 6).subscribe({
      next: (response) => {
        if (response.success) {
          this.testimonials.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  getStars(rating: number): number[] {
    return Array(5)
      .fill(0)
      .map((_, i) => (i < rating ? 1 : 0));
  }
}
