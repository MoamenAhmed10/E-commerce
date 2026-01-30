import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, OrderStatus, ApiResponse, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  /**
   * Place a new order
   */
  placeOrder(addressId: string, notes?: string): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(this.apiUrl, { addressId, notes });
  }

  /**
   * Get user's orders
   */
  getMyOrders(
    page: number = 1,
    limit: number = 10,
    status?: OrderStatus,
  ): Observable<PaginatedResponse<Order[]>> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PaginatedResponse<Order[]>>(`${this.apiUrl}/my-orders`, { params });
  }

  /**
   * Get order by ID
   */
  getOrderById(id: string): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Cancel order
   */
  cancelOrder(id: string): Observable<ApiResponse<Order>> {
    return this.http.patch<ApiResponse<Order>>(`${this.apiUrl}/${id}/cancel`, {});
  }

  /**
   * Get status color for UI
   */
  getStatusColor(status: OrderStatus): string {
    const colors: Record<OrderStatus, string> = {
      pending: 'gray',
      preparing: 'blue',
      ready: 'purple',
      shipped: 'orange',
      received: 'green',
      refused: 'red',
      cancelled: 'red',
    };
    return colors[status] || 'gray';
  }

  /**
   * Check if order can be cancelled
   * User can cancel only before order is received/refused/cancelled
   */
  canCancel(status: OrderStatus): boolean {
    return ['pending', 'preparing', 'ready', 'shipped'].includes(status);
  }
}
