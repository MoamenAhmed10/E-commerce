import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReturnService } from '../../../core/services/return.service';
import { ReturnRequest, Order } from '../../../core/models';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-returns',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent],
  templateUrl: './returns.component.html',
  styleUrl: './returns.component.css',
})
export class UserReturnsComponent implements OnInit {
  private returnService = inject(ReturnService);

  returns = signal<ReturnRequest[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadReturns();
  }

  loadReturns(): void {
    this.returnService.getMyReturns().subscribe({
      next: (response) => {
        if (response.success) {
          this.returns.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  getOrderNumber(returnReq: ReturnRequest): string {
    if (typeof returnReq.orderId === 'string') {
      return returnReq.orderId;
    }
    return (returnReq.orderId as Order).orderNumber || returnReq.orderId.toString();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      requested: 'Pending Review',
      approved: 'Approved',
      rejected: 'Rejected',
    };
    return labels[status] || status;
  }
}
