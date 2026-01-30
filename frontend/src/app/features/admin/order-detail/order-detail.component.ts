import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { Order, OrderStatus } from '../../../core/models';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent, ConfirmModalComponent],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css',
})
export class AdminOrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private adminService = inject(AdminService);
  private toastService = inject(ToastService);

  order = signal<Order | null>(null);
  isLoading = signal(true);
  showCancelModal = false;

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrder(orderId);
    } else {
      this.router.navigate(['/admin/orders']);
    }
  }

  private loadOrder(id: string): void {
    this.adminService.getOrderById(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.order.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  updateStatus(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as OrderStatus;
    const order = this.order();

    if (!order) return;

    this.adminService.changeOrderStatus(order._id, newStatus).subscribe({
      next: (response) => {
        if (response.success) {
          this.order.set(response.data);
          this.toastService.success('Order status updated');
        }
      },
      error: (error: { message?: string }) => {
        this.toastService.error(error.message || 'Failed to update status');
        select.value = order.status;
      },
    });
  }

  cancelOrder(): void {
    const order = this.order();
    if (!order) return;

    this.adminService.cancelOrder(order._id).subscribe({
      next: (response) => {
        if (response.success) {
          this.order.set(response.data);
          this.toastService.success('Order cancelled');
        }
        this.showCancelModal = false;
      },
      error: (error: { message?: string }) => {
        this.toastService.error(error.message || 'Failed to cancel order');
        this.showCancelModal = false;
      },
    });
  }
}
