import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category, SubCategory, ApiResponse } from '../models';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly categoryUrl = `${environment.apiUrl}/categories`;
  private readonly subcategoryUrl = `${environment.apiUrl}/subcategories`;
  private readonly adminCategoryUrl = `${environment.apiUrl}/admin/categories`;
  private readonly adminSubcategoryUrl = `${environment.apiUrl}/admin/subcategories`;

  constructor(private http: HttpClient) {}

  // Categories
  getCategories(includeInactive: boolean = false): Observable<ApiResponse<Category[]>> {
    const url = includeInactive ? `${this.categoryUrl}?includeInactive=true` : this.categoryUrl;
    return this.http.get<ApiResponse<Category[]>>(url);
  }

  getCategoryBySlug(slug: string): Observable<ApiResponse<Category>> {
    return this.http.get<ApiResponse<Category>>(`${this.categoryUrl}/${slug}`);
  }

  createCategory(data: Partial<Category>): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(this.adminCategoryUrl, data);
  }

  updateCategory(id: string, data: Partial<Category>): Observable<ApiResponse<Category>> {
    return this.http.put<ApiResponse<Category>>(`${this.adminCategoryUrl}/${id}`, data);
  }

  toggleCategory(id: string): Observable<ApiResponse<Category>> {
    return this.http.patch<ApiResponse<Category>>(
      `${this.adminCategoryUrl}/${id}/toggle-status`,
      {},
    );
  }

  deleteCategory(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.adminCategoryUrl}/${id}`);
  }

  // Subcategories
  getSubcategories(categoryId?: string): Observable<ApiResponse<SubCategory[]>> {
    const url = categoryId
      ? `${this.subcategoryUrl}?categoryId=${categoryId}`
      : this.subcategoryUrl;
    return this.http.get<ApiResponse<SubCategory[]>>(url);
  }

  getSubcategoryById(id: string): Observable<ApiResponse<SubCategory>> {
    return this.http.get<ApiResponse<SubCategory>>(`${this.subcategoryUrl}/${id}`);
  }

  createSubcategory(data: Partial<SubCategory>): Observable<ApiResponse<SubCategory>> {
    return this.http.post<ApiResponse<SubCategory>>(this.adminSubcategoryUrl, data);
  }

  updateSubcategory(id: string, data: Partial<SubCategory>): Observable<ApiResponse<SubCategory>> {
    return this.http.put<ApiResponse<SubCategory>>(`${this.adminSubcategoryUrl}/${id}`, data);
  }

  toggleSubcategory(id: string): Observable<ApiResponse<SubCategory>> {
    return this.http.patch<ApiResponse<SubCategory>>(
      `${this.adminSubcategoryUrl}/${id}/toggle-status`,
      {},
    );
  }

  deleteSubcategory(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.adminSubcategoryUrl}/${id}`);
  }
}
