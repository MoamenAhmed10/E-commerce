import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { User, Pagination } from '../../../core/models';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, PaginationComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class AdminUsersComponent implements OnInit {
  private adminService = inject(AdminService);
  private toastService = inject(ToastService);

  users = signal<User[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = signal(true);

  searchQuery = '';
  roleFilter = '';
  currentPage = 1;

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.loadUsers();
  }

  filteredUsers = () => {
    let result = this.users();

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.email?.toLowerCase().includes(query) ||
          u.mobile?.includes(query),
      );
    }

    if (this.roleFilter) {
      result = result.filter((u) => u.role === this.roleFilter);
    }

    return result;
  };

  loadUsers(): void {
    this.isLoading.set(true);

    this.adminService.getUsers(this.currentPage, 20).subscribe({
      next: (response) => {
        if (response.success) {
          this.users.set(response.data);
          this.pagination.set(response.pagination);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  onSearch(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      // Client-side filtering for search
    }, 300);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  toggleStatus(user: User): void {
    this.adminService.toggleUserStatus(user._id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
          this.loadUsers();
        }
      },
      error: (error: { message?: string }) => {
        this.toastService.error(error.message || 'Failed to update user');
      },
    });
  }

  deleteUser(user: User): void {
    if (user.role === 'admin') {
      this.toastService.error('Cannot delete admin users');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${user.name}?`)) {
      return;
    }

    this.adminService.deleteUser(user._id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('User deleted successfully');
          this.loadUsers();
        }
      },
      error: (error: { message?: string }) => {
        this.toastService.error(error.message || 'Failed to delete user');
      },
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
