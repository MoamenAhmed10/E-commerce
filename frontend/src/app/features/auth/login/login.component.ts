import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  loginForm: FormGroup;
  isLoading = signal(false);
  showPassword = signal(false);

  constructor() {
    this.loginForm = this.fb.group({
      emailOrMobile: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('[LOGIN] Login response received:', response);

        this.isLoading.set(false);
        if (response.success) {
          // Update cart from login response (contains merged cart)
          if (response.data.cart) {
            console.log(
              '[LOGIN] Setting cart from response - items:',
              response.data.cart.items?.length || 0,
            );
            this.cartService.setCart(response.data.cart);
          } else {
            console.warn('[LOGIN] No cart in login response!');
          }

          // Clear guest cart
          this.cartService.clearGuestCart();
          console.log('[LOGIN] Guest cart cleared');

          this.toastService.success('Welcome back!');
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigateByUrl(returnUrl);
        }
      },
      error: (error) => {
        console.error('[LOGIN] Login error:', error);
        this.isLoading.set(false);
        this.toastService.error(error.message || 'Login failed. Please try again.');
      },
    });
  }
}
