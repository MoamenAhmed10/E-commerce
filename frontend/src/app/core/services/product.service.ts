import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, FeaturedProducts, ApiResponse, PaginatedResponse } from '../models';

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  subCategory?: string;
  search?: string;
  bestSeller?: boolean;
  newArrival?: boolean;
  gender?: 'men' | 'women' | 'unisex';
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly apiUrl = `${environment.apiUrl}/products`;
  private readonly adminApiUrl = `${environment.apiUrl}/admin/products`;

  constructor(private http: HttpClient) {}

  /**
   * Get products with filters
   */
  getProducts(filters: ProductFilters = {}): Observable<PaginatedResponse<Product[]>> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<PaginatedResponse<Product[]>>(this.apiUrl, { params });
  }

  /**
   * Get products for admin (includes inactive)
   */
  getAdminProducts(filters: ProductFilters = {}): Observable<PaginatedResponse<Product[]>> {
    let params = new HttpParams().set('includeInactive', 'true');

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<PaginatedResponse<Product[]>>(this.adminApiUrl, { params });
  }

  /**
   * Get featured products for home page
   */
  getFeaturedProducts(): Observable<ApiResponse<FeaturedProducts>> {
    return this.http.get<ApiResponse<FeaturedProducts>>(`${this.apiUrl}/featured`);
  }

  /**
   * Get product by slug
   */
  getProductBySlug(slug: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/slug/${slug}`);
  }

  /**
   * Search products
   */
  searchProducts(query: string, limit: number = 10): Observable<ApiResponse<Product[]>> {
    const params = new HttpParams().set('q', query).set('limit', limit.toString());
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Create product (Admin)
   */
  createProduct(product: Partial<Product>): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(this.adminApiUrl, product);
  }

  /**
   * Update product (Admin)
   */
  updateProduct(id: string, product: Partial<Product>): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.adminApiUrl}/${id}`, product);
  }

  /**
   * Toggle product status (Admin)
   */
  toggleProductStatus(id: string): Observable<ApiResponse<Product>> {
    return this.http.patch<ApiResponse<Product>>(`${this.adminApiUrl}/${id}/toggle-status`, {});
  }

  /**
   * Delete product (Admin)
   */
  deleteProduct(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.adminApiUrl}/${id}`);
  }
}
