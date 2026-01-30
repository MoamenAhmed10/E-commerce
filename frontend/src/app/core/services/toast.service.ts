import { Injectable, signal } from '@angular/core';
import { ToastMessage, ToastType } from '../../shared/components/toast/toast.component';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastsSignal = signal<ToastMessage[]>([]);
  private counter = 0;

  readonly toasts = this.toastsSignal.asReadonly();

  show(message: string, type: ToastType = 'info', duration: number = 5000): void {
    const toast: ToastMessage = {
      id: ++this.counter,
      type,
      message,
      duration,
    };

    this.toastsSignal.update((toasts) => [...toasts, toast]);

    if (duration > 0) {
      setTimeout(() => this.remove(toast), duration);
    }
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  remove(toast: ToastMessage): void {
    this.toastsSignal.update((toasts) => toasts.filter((t) => t.id !== toast.id));
  }

  clear(): void {
    this.toastsSignal.set([]);
  }
}
