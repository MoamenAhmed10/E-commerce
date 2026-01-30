import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { SalesReport } from '../../../core/models';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css',
})
export class AdminReportsComponent implements OnInit {
  private adminService = inject(AdminService);
  private toastService = inject(ToastService);

  report = signal<SalesReport | null>(null);
  isLoading = signal(true);

  dateFrom = '';
  dateTo = '';
  maxRevenue = 0;

  ngOnInit(): void {
    // Default to last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.dateTo = today.toISOString().split('T')[0];
    this.dateFrom = thirtyDaysAgo.toISOString().split('T')[0];

    this.loadReport();
  }

  loadReport(): void {
    this.isLoading.set(true);

    this.adminService.getSalesReport(this.dateFrom, this.dateTo).subscribe({
      next: (response) => {
        if (response.success) {
          this.report.set(response.data);
          this.maxRevenue = Math.max(...response.data.dailySales.map((d) => d.revenue), 1);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  getAverageOrderValue(): number {
    const rep = this.report();
    if (!rep || rep.summary.totalOrders === 0) return 0;
    return rep.summary.totalRevenue / rep.summary.totalOrders;
  }

  getBarHeight(revenue: number): number {
    if (this.maxRevenue === 0) return 0;
    return (revenue / this.maxRevenue) * 100;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  exportReport(type: 'pdf' | 'excel'): void {
    this.adminService.exportSalesReport(this.dateFrom, this.dateTo, type).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-report.${type === 'pdf' ? 'pdf' : 'xlsx'}`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toastService.success('Report downloaded');
      },
      error: (error: { message?: string }) => {
        this.toastService.error(error.message || 'Failed to export report');
      },
    });
  }
}
