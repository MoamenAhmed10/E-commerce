import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cart, CartItem, CheckoutData, ApiResponse, Product } from '../models';
import { AuthService } from './auth.service';

const GUEST_CART_KEY = 'guest_cart';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly apiUrl = `${environment.apiUrl}/cart`;

  // Signals for reactive state
  private cartSignal = signal<Cart | null>(null);
  private guestCartSignal = signal<CartItem[]>(this.loadGuestCart());
  private loadingSignal = signal(false);

  // Computed properties
  readonly cart = this.cartSignal.asReadonly();
  readonly guestCart = this.guestCartSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  readonly itemCount = computed(() => {
    if (this.authService.isLoggedIn()) {
      return this.cartSignal()?.itemCount ?? 0;
    }
    return this.guestCartSignal().reduce((sum, item) => sum + item.quantity, 0);
  });

  readonly subtotal = computed(() => {
    if (this.authService.isLoggedIn()) {
      return this.cartSignal()?.subtotal ?? 0;
    }
    return this.guestCartSignal().reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0);
  });

  readonly hasItems = computed(() => this.itemCount() > 0);
  readonly hasChangedPrices = computed(() => this.cartSignal()?.hasChangedPrices ?? false);

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  /**
   * Load cart (authenticated user)
   */
  loadCart(): Observable<ApiResponse<Cart>> {
    console.log('[CART SERVICE] loadCart() called');
    this.loadingSignal.set(true);
    return this.http.get<ApiResponse<Cart>>(this.apiUrl).pipe(
      tap((response) => {
        if (response.success) {
          console.log(
            '[CART SERVICE] loadCart() response - items:',
            response.data.items?.length || 0,
          );
          this.cartSignal.set(response.data);
        }
        this.loadingSignal.set(false);
      }),
    );
  }

  /**
   * Set cart from external source (e.g., login response)
   * This updates the cart signal without making an API call
   */
  setCart(cart: Cart | null): void {
    console.log('[CART SERVICE] setCart() called - items:', cart?.items?.length || 0);
    this.cartSignal.set(cart);
  }

  /**
   * Add item to cart
   * For guests, we store in BOTH localStorage (for immediate UI) AND the backend (for merge on login)
   */
  addItem(product: Product, quantity: number = 1): Observable<ApiResponse<Cart>> {
    // ALWAYS call backend API (for both logged-in users and guests)
    // This ensures guest cart is stored in database and can be merged on login
    return this.http
      .post<ApiResponse<Cart>>(`${this.apiUrl}/items`, {
        productId: product._id,
        quantity,
      })
      .pipe(
        tap((response) => {
          if (response.success) {
            if (this.authService.isLoggedIn()) {
              // For logged-in users, update cart signal
              this.cartSignal.set(response.data);
            } else {
              // For guests, also update local guest cart for immediate UI
              this.addToGuestCart(product, quantity);
            }
          }
        }),
      );
  }

  /**
   * Update item quantity
   * For guests, we update BOTH localStorage AND the backend
   */
  updateQuantity(itemId: string, quantity: number): Observable<ApiResponse<Cart>> {
    // ALWAYS call backend API
    return this.http.put<ApiResponse<Cart>>(`${this.apiUrl}/items/${itemId}`, { quantity }).pipe(
      tap((response) => {
        if (response.success) {
          if (this.authService.isLoggedIn()) {
            this.cartSignal.set(response.data);
          } else {
            // Also update local guest cart
            this.updateGuestCartQuantity(itemId, quantity);
          }
        }
      }),
    );
  }

  /**
   * Remove item from cart
   * For guests, we remove from BOTH localStorage AND the backend
   */
  removeItem(itemId: string): Observable<ApiResponse<Cart>> {
    // ALWAYS call backend API
    return this.http.delete<ApiResponse<Cart>>(`${this.apiUrl}/items/${itemId}`).pipe(
      tap((response) => {
        if (response.success) {
          if (this.authService.isLoggedIn()) {
            this.cartSignal.set(response.data);
          } else {
            // Also update local guest cart
            this.removeFromGuestCart(itemId);
          }
        }
      }),
    );
  }

  /**
   * Confirm price change for an item
   */
  confirmPriceChange(itemId: string): Observable<ApiResponse<Cart>> {
    return this.http
      .put<ApiResponse<Cart>>(`${this.apiUrl}/items/${itemId}/confirm-price`, {})
      .pipe(
        tap((response) => {
          if (response.success) {
            this.cartSignal.set(response.data);
          }
        }),
      );
  }

  /**
   * Clear cart
   * For guests, we clear BOTH localStorage AND the backend
   */
  clearCart(): Observable<ApiResponse<any>> {
    // ALWAYS call backend API to clear the cart
    return this.http.delete<ApiResponse<any>>(this.apiUrl).pipe(
      tap(() => {
        if (this.authService.isLoggedIn()) {
          this.cartSignal.set(null);
        } else {
          // Also clear local guest cart
          this.guestCartSignal.set([]);
          localStorage.removeItem(GUEST_CART_KEY);
        }
      }),
    );
  }

  /**
   * Get checkout items
   */
  getCheckoutData(): Observable<ApiResponse<CheckoutData>> {
    return this.http.get<ApiResponse<CheckoutData>>(`${this.apiUrl}/checkout`);
  }

  /**
   * Merge guest cart after login
   * @deprecated - Merging is now handled automatically on backend during login
   */
  mergeGuestCart(): Observable<ApiResponse<Cart>> {
    const guestItems = this.guestCartSignal();
    if (guestItems.length === 0) {
      return this.loadCart();
    }

    return this.http.post<ApiResponse<Cart>>(`${this.apiUrl}/merge`, { items: guestItems }).pipe(
      tap((response) => {
        if (response.success) {
          this.cartSignal.set(response.data);
          this.guestCartSignal.set([]);
          localStorage.removeItem(GUEST_CART_KEY);
        }
      }),
    );
  }

  /**
   * Clear guest cart (called after login/register)
   */
  clearGuestCart(): void {
    this.guestCartSignal.set([]);
    localStorage.removeItem(GUEST_CART_KEY);
  }

  // Guest cart methods
  private addToGuestCart(product: Product, quantity: number): void {
    const items = [...this.guestCartSignal()];
    const existingIndex = items.findIndex((item) => item.productId === product._id);

    if (existingIndex > -1) {
      items[existingIndex].quantity += quantity;
    } else {
      items.push({
        _id: `guest_${Date.now()}`,
        productId: product._id,
        productName: product.name,
        productImage: product.images[0],
        priceAtAdd: product.price,
        quantity,
        priceChanged: false,
      });
    }

    this.guestCartSignal.set(items);
    this.saveGuestCart(items);
  }

  private updateGuestCartQuantity(productId: string, quantity: number): void {
    const items = this.guestCartSignal().map((item) =>
      item.productId === productId ? { ...item, quantity } : item,
    );
    this.guestCartSignal.set(items);
    this.saveGuestCart(items);
  }

  private removeFromGuestCart(productId: string): void {
    const items = this.guestCartSignal().filter((item) => item.productId !== productId);
    this.guestCartSignal.set(items);
    this.saveGuestCart(items);
  }

  private loadGuestCart(): CartItem[] {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  }

  private saveGuestCart(items: CartItem[]): void {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  }
}
