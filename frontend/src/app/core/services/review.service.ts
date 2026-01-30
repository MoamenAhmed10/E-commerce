import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Review,
  ApiResponse,
  PaginatedResponse,
  ProductReviewsResponse,
  CreateReviewRequest,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private readonly apiUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  /**
   * Get reviews for a product (public)
   */
  getProductReviews(
    productId: string,
    page: number = 1,
    limit: number = 10,
  ): Observable<ApiResponse<Review[]> & { pagination: any; stats: any }> {
    const params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    return this.http.get<ApiResponse<Review[]> & { pagination: any; stats: any }>(
      `${this.apiUrl}/product/${productId}`,
      { params },
    );
  }

  /**
   * Get user's reviews
   */
  getMyReviews(): Observable<ApiResponse<Review[]>> {
    return this.http.get<ApiResponse<Review[]>>(`${this.apiUrl}/my-reviews`);
  }

  /**
   * Create a review for a product
   */
  createReview(data: CreateReviewRequest): Observable<ApiResponse<Review>> {
    return this.http.post<ApiResponse<Review>>(this.apiUrl, data);
  }

  /**
   * Update a review
   */
  updateReview(
    reviewId: string,
    data: Partial<CreateReviewRequest>,
  ): Observable<ApiResponse<Review>> {
    return this.http.put<ApiResponse<Review>>(`${this.apiUrl}/${reviewId}`, data);
  }

  /**
   * Delete a review
   */
  deleteReview(reviewId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${reviewId}`);
  }
}
