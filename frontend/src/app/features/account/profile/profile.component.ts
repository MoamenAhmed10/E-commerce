import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private toastService = inject(ToastService);

  user = this.authService.user;
  isSaving = signal(false);
  isChangingPassword = signal(false);

  profileForm: FormGroup;
  passwordForm: FormGroup;

  initials = () => {
    const name = this.user()?.name || '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  constructor() {
    const user = this.authService.user();
    this.profileForm = this.fb.group({
      name: [user?.name || '', [Validators.required, Validators.minLength(2)]],
      email: [user?.email || '', [Validators.email]],
      mobile: [user?.mobile || ''],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  updateProfile(): void {
    if (this.profileForm.invalid) return;

    this.isSaving.set(true);
    this.userService.updateProfile(this.profileForm.value).subscribe({
      next: (response) => {
        this.isSaving.set(false);
        if (response.success) {
          this.toastService.success('Profile updated successfully');
        }
      },
      error: (error: { message?: string }) => {
        this.isSaving.set(false);
        this.toastService.error(error.message || 'Failed to update profile');
      },
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.toastService.error('Passwords do not match');
      return;
    }

    this.isChangingPassword.set(true);
    this.userService.changePassword(currentPassword, newPassword).subscribe({
      next: (response) => {
        this.isChangingPassword.set(false);
        if (response.success) {
          this.toastService.success('Password changed successfully');
          this.passwordForm.reset();
        }
      },
      error: (error: { message?: string }) => {
        this.isChangingPassword.set(false);
        this.toastService.error(error.message || 'Failed to change password');
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
