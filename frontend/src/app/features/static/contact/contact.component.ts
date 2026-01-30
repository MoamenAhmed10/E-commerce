import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent {
  private toastService = inject(ToastService);

  isSubmitting = signal(false);

  formData = {
    name: '',
    email: '',
    subject: '',
    orderNumber: '',
    message: '',
  };

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      this.toastService.error('Please fill in all required fields');
      return;
    }

    this.isSubmitting.set(true);

    // Simulate form submission
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.toastService.success("Your message has been sent! We'll get back to you soon.");
      form.resetForm();
      this.formData = {
        name: '',
        email: '',
        subject: '',
        orderNumber: '',
        message: '',
      };
    }, 1500);
  }
}
