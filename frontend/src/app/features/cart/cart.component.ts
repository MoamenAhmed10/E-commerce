import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Cart, CartItem } from '../../core/models';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent, ConfirmModalComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit {
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  loading = this.cartService.loading;
  hasItems = this.cartService.hasItems;
  hasChangedPrices = this.cartService.hasChangedPrices;
  itemCount = this.cartService.itemCount;
  subtotal = this.cartService.subtotal;
  isLoggedIn = this.authService.isLoggedIn;

  updatingItem = signal<string | null>(null);
  showRemoveModal = false;
  showClearModal = false;
  itemToRemove: CartItem | null = null;

  cartItems = computed(() => {
    const cart = this.cartService.cart();
    if (cart?.items) return cart.items;

    // Guest cart
    return this.cartService.guestCart();
  });

  shippingCost = computed(() => {
    return this.subtotal() >= 50 ? 0 : 5.99;
  });

  total = computed(() => {
    return this.subtotal() + this.shippingCost();
  });

  ngOnInit(): void {
    // Load cart if logged in
    // Note: Cart might already be set from login response,
    // but we reload to ensure we have the latest state
    if (this.isLoggedIn()) {
      this.cartService.loadCart().subscribe();
    }
  }

  updateQuantity(item: CartItem, quantity: number): void {
    if (quantity < 1) return;

    this.updatingItem.set(item.productId);

    this.cartService.updateQuantity(item.productId, quantity).subscribe({
      next: (response) => {
        this.updatingItem.set(null);
        // Reload cart to ensure UI is updated
        if (this.isLoggedIn() && response.success) {
          this.cartService.loadCart().subscribe();
        }
      },
      error: (error: { message?: string }) => {
        this.updatingItem.set(null);
        this.toastService.error(error.message || 'Failed to update quantity');
      },
    });
  }

  confirmRemove(item: CartItem): void {
    this.itemToRemove = item;
    this.showRemoveModal = true;
  }

  removeItem(): void {
    if (!this.itemToRemove) return;

    this.showRemoveModal = false;
    this.updatingItem.set(this.itemToRemove.productId);

    this.cartService.removeItem(this.itemToRemove.productId).subscribe({
      next: (response) => {
        this.updatingItem.set(null);
        this.toastService.success('Item removed from cart');
        this.itemToRemove = null;
        // Reload cart to ensure UI is updated
        if (this.isLoggedIn() && response.success) {
          this.cartService.loadCart().subscribe();
        }
      },
      error: (error: { message?: string }) => {
        this.updatingItem.set(null);
        this.toastService.error(error.message || 'Failed to remove item');
      },
    });
  }

  clearCart(): void {
    this.showClearModal = false;

    this.cartService.clearCart().subscribe({
      next: () => {
        this.toastService.success('Cart cleared');
      },
      error: (error: { message?: string }) => {
        this.toastService.error(error.message || 'Failed to clear cart');
      },
    });
  }
}
