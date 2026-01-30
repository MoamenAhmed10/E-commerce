import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Address, CartItem } from '../../core/models';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, LoadingComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  addresses = signal<Address[]>([]);
  isLoading = signal(true);
  isPlacingOrder = signal(false);
  showNewAddress = false;
  selectedAddressId: string | null = null;

  addressForm: FormGroup;

  subtotal = this.cartService.subtotal;

  cartItems = () => {
    const cart = this.cartService.cart();
    return cart?.items || [];
  };

  shippingCost = () => (this.subtotal() >= 50 ? 0 : 5.99);
  total = () => this.subtotal() + this.shippingCost();

  canPlaceOrder = () => {
    return this.selectedAddressId || this.addressForm.valid;
  };

  constructor() {
    this.addressForm = this.fb.group({
      label: ['Home'],
      city: ['', Validators.required],
      area: ['', Validators.required],
      street: ['', Validators.required],
      building: ['', Validators.required],
      notes: [''],
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    // Load cart
    this.cartService.loadCart().subscribe();

    // Load addresses
    this.userService.getAddresses().subscribe({
      next: (response) => {
        if (response.success) {
          this.addresses.set(response.data);
          // Select default address
          const defaultAddr = response.data.find((a) => a.isDefault);
          if (defaultAddr) {
            this.selectedAddressId = defaultAddr._id;
          } else if (response.data.length > 0) {
            this.selectedAddressId = response.data[0]._id;
          }
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  placeOrder(): void {
    // If there are existing addresses, one must be selected
    if (this.addresses().length > 0 && this.selectedAddressId) {
      this.isPlacingOrder.set(true);
      this.submitOrder(this.selectedAddressId);
      return;
    }

    // If showing new address form and it's valid, create new address first
    if ((this.addresses().length === 0 || this.showNewAddress) && this.addressForm.valid) {
      this.isPlacingOrder.set(true);
      this.userService.createAddress(this.addressForm.value).subscribe({
        next: (response) => {
          if (response.success) {
            // Add the new address to the list and select it
            const newAddress = response.data;
            this.addresses.update((addrs) => [...addrs, newAddress]);
            this.selectedAddressId = newAddress._id;
            this.showNewAddress = false;
            this.addressForm.reset({ label: 'Home', notes: '' });
            // Now submit the order
            this.submitOrder(newAddress._id);
          }
        },
        error: (error: { message?: string }) => {
          this.isPlacingOrder.set(false);
          this.toastService.error(error.message || 'Failed to save address');
        },
      });
      return;
    }

    // No valid address scenario
    this.toastService.error('Please select or add a delivery address');
  }

  private submitOrder(addressId: string): void {
    this.orderService.placeOrder(addressId).subscribe({
      next: (response) => {
        this.isPlacingOrder.set(false);
        if (response.success) {
          this.toastService.success('🎉 Order placed successfully! Thank you for your purchase.');
          // Navigate to home page after successful order
          this.router.navigate(['/']);
        }
      },
      error: (error: { message?: string }) => {
        this.isPlacingOrder.set(false);
        this.toastService.error(error.message || 'Failed to place order');
      },
    });
  }
}
