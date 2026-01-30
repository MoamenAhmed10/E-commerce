import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User,
  Product,
  Order,
  OrderStatus,
  Review,
  ReturnRequest,
  DashboardStats,
  SalesReport,
  ApiResponse,
  PaginatedResponse,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // Dashboard
  getDashboardStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.apiUrl}/dashboard/stats`);
  }

  // Users
  getUsers(page: number = 1, limit: number = 20): Observable<PaginatedResponse<User[]>> {
    const params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    return this.http.get<PaginatedResponse<User[]>>(`${this.apiUrl}/users`, { params });
  }

  toggleUserStatus(id: string): Observable<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(`${this.apiUrl}/users/${id}/toggle-status`, {});
  }

  deleteUser(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/users/${id}`);
  }

  // Products
  getProducts(
    page: number = 1,
    limit: number = 20,
    includeDeleted: boolean = false,
  ): Observable<PaginatedResponse<Product[]>> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());

    if (includeDeleted) {
      params = params.set('includeDeleted', 'true');
    }

    return this.http.get<PaginatedResponse<Product[]>>(`${this.apiUrl}/products`, { params });
  }

  getLowStockProducts(threshold: number = 3): Observable<ApiResponse<Product[]>> {
    const params = new HttpParams().set('threshold', threshold.toString());
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/products/low-stock`, { params });
  }

  // Orders
  getOrders(
    page: number = 1,
    limit: number = 20,
    status?: OrderStatus,
  ): Observable<PaginatedResponse<Order[]>> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PaginatedResponse<Order[]>>(`${this.apiUrl}/orders`, { params });
  }

  getOrderStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/orders/stats`);
  }

  getOrderById(id: string): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.apiUrl}/orders/${id}`);
  }

  changeOrderStatus(id: string, status: OrderStatus): Observable<ApiResponse<Order>> {
    return this.http.patch<ApiResponse<Order>>(`${this.apiUrl}/orders/${id}/status`, { status });
  }

  cancelOrder(id: string): Observable<ApiResponse<Order>> {
    return this.http.patch<ApiResponse<Order>>(`${this.apiUrl}/orders/${id}/cancel`, {});
  }

  // Reviews
  getReviews(
    page: number = 1,
    limit: number = 20,
    isApproved?: boolean,
  ): Observable<PaginatedResponse<Review[]>> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());

    if (isApproved !== undefined) {
      params = params.set('isApproved', isApproved.toString());
    }

    return this.http.get<PaginatedResponse<Review[]>>(`${this.apiUrl}/reviews`, { params });
  }

  getReviewStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/reviews/stats`);
  }

  approveReview(id: string): Observable<ApiResponse<Review>> {
    return this.http.patch<ApiResponse<Review>>(`${this.apiUrl}/reviews/${id}/toggle-approval`, {});
  }

  rejectReview(id: string): Observable<ApiResponse<Review>> {
    return this.http.patch<ApiResponse<Review>>(`${this.apiUrl}/reviews/${id}/toggle-approval`, {});
  }

  deleteReview(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/reviews/${id}`);
  }

  // Returns
  getReturns(
    page: number = 1,
    limit: number = 20,
    status?: string,
  ): Observable<PaginatedResponse<ReturnRequest[]>> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PaginatedResponse<ReturnRequest[]>>(`${this.apiUrl}/returns`, { params });
  }

  getReturnStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/returns/stats`);
  }

  approveReturn(id: string, adminNotes?: string): Observable<ApiResponse<ReturnRequest>> {
    return this.http.patch<ApiResponse<ReturnRequest>>(`${this.apiUrl}/returns/${id}/status`, {
      status: 'approved',
      adminNotes,
    });
  }

  rejectReturn(id: string, adminNotes?: string): Observable<ApiResponse<ReturnRequest>> {
    return this.http.patch<ApiResponse<ReturnRequest>>(`${this.apiUrl}/returns/${id}/status`, {
      status: 'rejected',
      adminNotes,
    });
  }

  // Reports
  getSalesReport(from?: string, to?: string): Observable<ApiResponse<SalesReport>> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);

    return this.http.get<ApiResponse<SalesReport>>(`${this.apiUrl}/reports/sales`, { params });
  }

  exportSalesReport(from?: string, to?: string, type: 'pdf' | 'excel' = 'pdf'): Observable<Blob> {
    let params = new HttpParams().set('type', type);
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);

    return this.http.get(`${this.apiUrl}/reports/sales/export`, {
      params,
      responseType: 'blob',
    });
  }
}
