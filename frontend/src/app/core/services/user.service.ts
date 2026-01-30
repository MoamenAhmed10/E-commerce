import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, Address, AddressRequest, ApiResponse, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly userUrl = `${environment.apiUrl}/users`;
  private readonly addressUrl = `${environment.apiUrl}/addresses`;

  constructor(private http: HttpClient) {}

  // Profile
  getProfile(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.userUrl}/me`);
  }

  updateProfile(data: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.userUrl}/me`, data);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.userUrl}/me/password`, {
      currentPassword,
      newPassword,
    });
  }

  // Addresses
  getAddresses(): Observable<ApiResponse<Address[]>> {
    return this.http.get<ApiResponse<Address[]>>(this.addressUrl);
  }

  getAddressById(id: string): Observable<ApiResponse<Address>> {
    return this.http.get<ApiResponse<Address>>(`${this.addressUrl}/${id}`);
  }

  createAddress(data: AddressRequest): Observable<ApiResponse<Address>> {
    return this.http.post<ApiResponse<Address>>(this.addressUrl, data);
  }

  updateAddress(id: string, data: AddressRequest): Observable<ApiResponse<Address>> {
    return this.http.put<ApiResponse<Address>>(`${this.addressUrl}/${id}`, data);
  }

  setDefaultAddress(id: string): Observable<ApiResponse<Address>> {
    return this.http.put<ApiResponse<Address>>(`${this.addressUrl}/${id}/default`, {});
  }

  deleteAddress(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.addressUrl}/${id}`);
  }
}
