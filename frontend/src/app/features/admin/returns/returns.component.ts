import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { ReturnRequest, Pagination, Order } from '../../../core/models';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-admin-returns',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, PaginationComponent],
  templateUrl: './returns.component.html',
  styleUrl: './returns.component.css'
})
export class AdminReturnsComponent implements OnInit {
  private adminService = inject(AdminService);
  private toastService = inject(ToastService);

  returns = signal<ReturnRequest[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = signal(true);

  statusFilter = '';
  currentPage = 1;

  ngOnInit(): void {
    this.loadReturns();
  }

  loadReturns(): void {
    this.isLoading.set(true);

    this.adminService.getReturns(this.currentPage, 20, this.statusFilter || undefined).subscribe({
      next: (response) => {
        if (response.success) {
          this.returns.set(response.data);
          this.pagination.set(response.pagination);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadReturns();
  }

  getOrderNumber(returnReq: ReturnRequest): string {
    if (typeof returnReq.orderId === 'string') {
      return returnReq.orderId;
    }
    return (returnReq.orderId as Order).orderNumber;
  }

  approveReturn(returnReq: ReturnRequest, notes: string): void {
    this.adminService.approveReturn(returnReq._id, notes || undefined).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Return approved');
          this.loadReturns();
        }
      },
      error: (error: { message?: string }) => {
        this.toastService.error(error.message || 'Failed to approve return');
      },
    });
  }

  rejectReturn(returnReq: ReturnRequest, notes: string): void {
    this.adminService.rejectReturn(returnReq._id, notes || undefined).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Return rejected');
          this.loadReturns();
        }
      },
      error: (error: { message?: string }) => {
        this.toastService.error(error.message || 'Failed to reject return');
      },
    });
  }
}
