import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ApiResponse,
  CartItem,
} from '../models';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const GUEST_CART_KEY = 'guest_cart';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // Signals for reactive state
  private userSignal = signal<User | null>(this.getStoredUser());
  private tokenSignal = signal<string | null>(this.getStoredToken());

  // Computed properties
  readonly user = this.userSignal.asReadonly();
  readonly isLoggedIn = computed(() => !!this.tokenSignal());
  readonly isAdmin = computed(() => this.userSignal()?.role === 'admin');

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  /**
   * Register a new user
   * Clears guest cart after successful registration
   */
  register(data: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, data).pipe(
      tap((response) => {
        if (response.success) {
          this.setAuth(response.data);
          // Clear guest cart after registration
          this.clearGuestCart();
        }
      }),
    );
  }

  /**
   * Login user
   * Merges guest cart with user cart on backend
   * Updates cart signal from response
   */
  login(data: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, data).pipe(
      tap((response) => {
        if (response.success) {
          this.setAuth(response.data);
          // Clear guest cart from localStorage - backend handles merge
          this.clearGuestCart();
        }
      }),
    );
  }

  /**
   * Logout user
   * Preserves session ID but clears auth data
   * Note: Guest cart persists for session continuity
   */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.userSignal.set(null);
    this.tokenSignal.set(null);
    // Note: We don't clear guest_cart or session_id on logout
    // This allows users to continue shopping as guests
    this.router.navigate(['/']);
  }

  /**
   * Get current user profile
   */
  getProfile(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/me`).pipe(
      tap((response) => {
        if (response.success) {
          this.userSignal.set(response.data);
          localStorage.setItem(USER_KEY, JSON.stringify(response.data));
        }
      }),
    );
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return this.tokenSignal();
  }

  /**
   * Check if token exists and is valid
   */
  checkAuth(): Observable<boolean> {
    const token = this.getStoredToken();
    if (!token) {
      return of(false);
    }

    return this.getProfile().pipe(
      map(() => true),
      catchError(() => {
        this.logout();
        return of(false);
      }),
    );
  }

  /**
   * Get guest cart for merging after login
   * @deprecated - Now handled by session interceptor and backend
   */
  getGuestCart(): CartItem[] {
    const cartStr = localStorage.getItem(GUEST_CART_KEY);
    if (cartStr) {
      try {
        return JSON.parse(cartStr);
      } catch {
        return [];
      }
    }
    return [];
  }

  /**
   * Clear guest cart after login/registration
   */
  clearGuestCart(): void {
    localStorage.removeItem(GUEST_CART_KEY);
  }

  private setAuth(auth: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, auth.token);
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
    this.tokenSignal.set(auth.token);
    this.userSignal.set(auth.user);
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private getStoredUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }
}
