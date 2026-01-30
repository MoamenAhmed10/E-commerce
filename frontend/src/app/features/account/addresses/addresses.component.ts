import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { Address } from '../../../core/models';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    LoadingComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './addresses.component.html',
  styleUrl: './addresses.component.css',
})
export class AddressesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private toastService = inject(ToastService);

  addresses = signal<Address[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);
  showForm = false;
  showDeleteModal = false;
  editingAddress: Address | null = null;
  addressToDelete: Address | null = null;

  addressForm: FormGroup;

  constructor() {
    this.addressForm = this.fb.group({
      label: ['Home'],
      city: ['', Validators.required],
      area: ['', Validators.required],
      street: ['', Validators.required],
      building: ['', Validators.required],
      notes: [''],
      isDefault: [false],
    });
  }

  ngOnInit(): void {
    this.loadAddresses();
  }

  private loadAddresses(): void {
    this.userService.getAddresses().subscribe({
      next: (response) => {
        if (response.success) {
          this.addresses.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastService.error('Failed to load addresses');
      },
    });
  }

  openAddForm(): void {
    this.editingAddress = null;
    this.addressForm.reset({
      label: 'Home',
      city: '',
      area: '',
      street: '',
      building: '',
      notes: '',
      isDefault: false,
    });
    this.showForm = true;
  }

  editAddress(address: Address): void {
    this.editingAddress = address;
    this.addressForm.patchValue({
      label: address.label,
      city: address.city,
      area: address.area,
      street: address.street,
      building: address.building,
      notes: address.notes || '',
      isDefault: address.isDefault,
    });
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingAddress = null;
  }

  saveAddress(): void {
    if (this.addressForm.invalid) return;

    this.isSaving.set(true);
    const data = this.addressForm.value;

    const request = this.editingAddress
      ? this.userService.updateAddress(this.editingAddress._id, data)
      : this.userService.createAddress(data);

    request.subscribe({
      next: (response) => {
        this.isSaving.set(false);
        if (response.success) {
          this.toastService.success(
            this.editingAddress ? 'Address updated successfully' : 'Address added successfully',
          );
          this.closeForm();
          this.loadAddresses();
        }
      },
      error: (error: { message?: string }) => {
        this.isSaving.set(false);
        this.toastService.error(error.message || 'Failed to save address');
      },
    });
  }

  setDefault(addressId: string): void {
    this.userService.setDefaultAddress(addressId).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Default address updated');
          this.loadAddresses();
        }
      },
      error: (error: { message?: string }) => {
        this.toastService.error(error.message || 'Failed to update default address');
      },
    });
  }

  confirmDelete(address: Address): void {
    this.addressToDelete = address;
    this.showDeleteModal = true;
  }

  deleteAddress(): void {
    if (!this.addressToDelete) return;

    this.userService.deleteAddress(this.addressToDelete._id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Address deleted successfully');
          this.loadAddresses();
        }
        this.showDeleteModal = false;
        this.addressToDelete = null;
      },
      error: (error: { message?: string }) => {
        this.toastService.error(error.message || 'Failed to delete address');
        this.showDeleteModal = false;
      },
    });
  }
}
