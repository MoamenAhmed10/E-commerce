import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Testimonial, TestimonialRequest, ApiResponse, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root',
})
export class TestimonialService {
  private readonly apiUrl = `${environment.apiUrl}/testimonials`;

  constructor(private http: HttpClient) {}

  /**
   * Get approved testimonials for homepage (public)
   */
  getApprovedTestimonials(
    page: number = 1,
    limit: number = 10,
  ): Observable<PaginatedResponse<Testimonial[]>> {
    const params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    return this.http.get<PaginatedResponse<Testimonial[]>>(`${this.apiUrl}/approved`, { params });
  }

  /**
   * Get user's testimonial
   */
  getMyTestimonial(): Observable<ApiResponse<Testimonial | null>> {
    return this.http.get<ApiResponse<Testimonial | null>>(`${this.apiUrl}/my-testimonial`);
  }

  /**
   * Create a new testimonial
   */
  createTestimonial(data: TestimonialRequest): Observable<ApiResponse<Testimonial>> {
    return this.http.post<ApiResponse<Testimonial>>(this.apiUrl, data);
  }

  /**
   * Update user's testimonial
   */
  updateTestimonial(
    id: string,
    data: Partial<TestimonialRequest>,
  ): Observable<ApiResponse<Testimonial>> {
    return this.http.put<ApiResponse<Testimonial>>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Delete user's testimonial
   */
  deleteTestimonial(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  // Admin methods

  /**
   * Get all testimonials (admin)
   */
  getAllTestimonials(
    page: number = 1,
    limit: number = 20,
    isApproved?: boolean,
    search?: string,
  ): Observable<PaginatedResponse<Testimonial[]>> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());

    if (isApproved !== undefined) {
      params = params.set('isApproved', isApproved.toString());
    }
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedResponse<Testimonial[]>>(this.apiUrl, { params });
  }

  /**
   * Toggle testimonial approval (admin)
   */
  toggleApproval(id: string): Observable<ApiResponse<Testimonial>> {
    return this.http.patch<ApiResponse<Testimonial>>(`${this.apiUrl}/${id}/toggle-approval`, {});
  }

  /**
   * Delete testimonial (admin)
   */
  adminDeleteTestimonial(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}/admin`);
  }
}
