import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { ReturnService } from '../../../core/services/return.service';
import { ToastService } from '../../../core/services/toast.service';
import { Order, OrderStatus } from '../../../core/models';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent, ConfirmModalComponent],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css',
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);
  private returnService = inject(ReturnService);
  private toastService = inject(ToastService);

  order = signal<Order | null>(null);
  isLoading = signal(true);
  showCancelModal = false;
  showReturnModal = false;

  readonly statusTimeline: OrderStatus[] = ['pending', 'preparing', 'ready', 'shipped', 'received'];

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrder(orderId);
    } else {
      this.router.navigate(['/account/orders']);
    }
  }

  private loadOrder(id: string): void {
    this.orderService.getOrderById(id).subscribe({
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

  isStatusReached(status: OrderStatus): boolean {
    const order = this.order();
    if (!order) return false;

    // For cancelled/refused orders, only show current status
    if (['cancelled', 'refused'].includes(order.status)) {
      return status === order.status;
    }

    const currentIndex = this.statusTimeline.indexOf(order.status);
    const statusIndex = this.statusTimeline.indexOf(status);
    return statusIndex <= currentIndex;
  }

  canCancel(): boolean {
    const order = this.order();
    return order ? this.orderService.canCancel(order.status) : false;
  }

  canRequestReturn(): boolean {
    const order = this.order();
    if (!order || order.status !== 'received') return false;

    // Check if order was delivered within the last 14 days
    const deliveredDate = order.deliveredAt
      ? new Date(order.deliveredAt)
      : new Date(order.updatedAt);
    const now = new Date();
    const daysSinceDelivery = Math.floor(
      (now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    return daysSinceDelivery <= 14;
  }

  getDaysLeftForReturn(): number {
    const order = this.order();
    if (!order) return 0;

    const deliveredDate = order.deliveredAt
      ? new Date(order.deliveredAt)
      : new Date(order.updatedAt);
    const now = new Date();
    const daysSinceDelivery = Math.floor(
      (now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    return Math.max(0, 14 - daysSinceDelivery);
  }

  cancelOrder(): void {
    const order = this.order();
    if (!order) return;

    this.orderService.cancelOrder(order._id).subscribe({
      next: (response) => {
        if (response.success) {
          this.order.set(response.data);
          this.toastService.success('Order cancelled successfully');
        }
        this.showCancelModal = false;
      },
      error: (error: { message?: string }) => {
        this.toastService.error(error.message || 'Failed to cancel order');
        this.showCancelModal = false;
      },
    });
  }

  submitReturnRequest(reason: string): void {
    const order = this.order();
    if (!order || !reason.trim()) {
      this.toastService.error('Please provide a reason for your return');
      return;
    }

    this.returnService.requestReturn(order._id, reason).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Return request submitted successfully');
          this.showReturnModal = false;
        }
      },
      error: (error: { message?: string }) => {
        this.toastService.error(error.message || 'Failed to submit return request');
      },
    });
  }
}
