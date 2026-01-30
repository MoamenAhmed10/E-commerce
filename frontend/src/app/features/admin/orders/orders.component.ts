import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { Order, OrderStatus, Pagination } from '../../../core/models';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingComponent, PaginationComponent],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
})
export class AdminOrdersComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private adminService = inject(AdminService);
  private toastService = inject(ToastService);

  orders = signal<Order[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = signal(true);

  searchQuery = '';
  statusFilter = '';
  currentPage = 1;

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['status']) {
        this.statusFilter = params['status'];
      }
      this.loadOrders();
    });
  }

  loadOrders(): void {
    this.isLoading.set(true);

    this.adminService
      .getOrders(this.currentPage, 10, this.statusFilter as OrderStatus | undefined)
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Filter by search query client-side if provided
            let orders = response.data;
            if (this.searchQuery) {
              orders = orders.filter((o) =>
                o.orderNumber.toLowerCase().includes(this.searchQuery.toLowerCase()),
              );
            }
            this.orders.set(orders);
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
      this.currentPage = 1;
      this.loadOrders();
    }, 300);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadOrders();
  }

  updateStatus(order: Order, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as OrderStatus;

    this.adminService.changeOrderStatus(order._id, newStatus).subscribe({
      next: (response: { success: boolean }) => {
        if (response.success) {
          this.toastService.success('Order status updated');
          this.loadOrders();
        }
      },
      error: (error: { message?: string }) => {
        this.toastService.error(error.message || 'Failed to update status');
        // Revert selection
        select.value = order.status;
      },
    });
  }
}
