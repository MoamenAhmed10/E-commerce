import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReturnRequest, ReturnStatus, ApiResponse, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ReturnService {
  private readonly apiUrl = `${environment.apiUrl}/returns`;

  constructor(private http: HttpClient) {}

  /**
   * Request a return
   */
  requestReturn(orderId: string, reason: string): Observable<ApiResponse<ReturnRequest>> {
    return this.http.post<ApiResponse<ReturnRequest>>(this.apiUrl, { orderId, reason });
  }

  /**
   * Get user's returns
   */
  getMyReturns(): Observable<ApiResponse<ReturnRequest[]>> {
    return this.http.get<ApiResponse<ReturnRequest[]>>(`${this.apiUrl}/my-returns`);
  }

  /**
   * Get return by ID
   */
  getReturnById(id: string): Observable<ApiResponse<ReturnRequest>> {
    return this.http.get<ApiResponse<ReturnRequest>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get status color for UI
   */
  getStatusColor(status: ReturnStatus): string {
    const colors: Record<ReturnStatus, string> = {
      requested: 'yellow',
      approved: 'green',
      rejected: 'red',
    };
    return colors[status] || 'gray';
  }
}
