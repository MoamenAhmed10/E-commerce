import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id?: number;
  type: ToastType;
  message: string;
  duration?: number;
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
})
export class ToastComponent {
  @Input() toasts: ToastMessage[] = [];
  @Output() remove = new EventEmitter<ToastMessage>();

  removeToast(toast: ToastMessage): void {
    this.remove.emit(toast);
  }
}
