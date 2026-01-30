import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product, Category, SubCategory, ApiResponse } from '../../../core/models';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { environment } from '../../../../environments/environment';

interface UploadResponse {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
}

interface MultiUploadResponse {
  images: UploadResponse[];
  count: number;
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, LoadingComponent],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css',
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private toastService = inject(ToastService);

  categories = signal<Category[]>([]);
  subcategories = signal<SubCategory[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);
  isUploading = signal(false);
  isEditMode = false;
  productId: string | null = null;

  productForm: FormGroup;

  imagePreview = signal<string[]>([]);

  constructor() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: ['', [Validators.required, Validators.min(0)]],
      originalPrice: [null],
      isOnSale: [false],
      stock: [null],
      categoryId: ['', Validators.required],
      subCategoryId: ['', Validators.required],
      gender: ['men', Validators.required],
      isActive: [true],
      isBestSeller: [false],
      isNewArrival: [false],
      imagesText: [''],
    });

    // Watch for image text changes
    this.productForm.get('imagesText')?.valueChanges.subscribe((text: string) => {
      if (text) {
        const urls = text
          .split('\n')
          .map((url) => url.trim())
          .filter((url) => url);
        this.imagePreview.set(urls);
      } else {
        this.imagePreview.set([]);
      }
    });
  }

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.productId;

    this.loadCategories();
  }

  private loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        if (response.success) {
          this.categories.set(response.data);
        }
        if (this.isEditMode && this.productId) {
          this.loadProduct(this.productId);
        } else {
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.toastService.error('Failed to load categories');
      },
    });
  }

  private loadProduct(id: string): void {
    // For admin, we need to get product by ID, use the same endpoint
    this.http.get<ApiResponse<Product>>(`${environment.apiUrl}/products/${id}`).subscribe({
      next: (response: ApiResponse<Product>) => {
        if (response.success) {
          const product = response.data;

          // Get category ID
          const categoryId =
            typeof product.categoryId === 'string' ? product.categoryId : product.categoryId._id;

          // Load subcategories for the category
          this.loadSubcategories(categoryId, () => {
            this.productForm.patchValue({
              name: product.name,
              description: product.description,
              price: product.price,
              originalPrice: product.originalPrice,
              isOnSale: product.isOnSale,
              stock: product.stock,
              categoryId: categoryId,
              subCategoryId:
                typeof product.subCategoryId === 'string'
                  ? product.subCategoryId
                  : product.subCategoryId._id,
              gender: product.gender,
              isActive: product.isActive,
              isBestSeller: product.isBestSeller,
              isNewArrival: product.isNewArrival,
              imagesText: product.images.join('\n'),
            });
          });
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastService.error('Failed to load product');
        this.router.navigate(['/admin/products']);
      },
    });
  }

  onCategoryChange(): void {
    const categoryId = this.productForm.get('categoryId')?.value;
    if (categoryId) {
      this.loadSubcategories(categoryId);
      this.productForm.patchValue({ subCategoryId: '' });
    } else {
      this.subcategories.set([]);
    }
  }

  private loadSubcategories(categoryId: string, callback?: () => void): void {
    this.categoryService.getSubcategories(categoryId).subscribe({
      next: (response: ApiResponse<SubCategory[]>) => {
        if (response.success) {
          this.subcategories.set(response.data);
        }
        if (callback) callback();
      },
    });
  }

  saveProduct(): void {
    if (this.productForm.invalid) return;

    this.isSaving.set(true);

    const formValue = this.productForm.value;
    // Combine uploaded images with manually entered URLs
    const images = this.imagePreview();

    const productData: Record<string, unknown> = {
      name: formValue.name,
      description: formValue.description,
      price: parseFloat(formValue.price),
      stock: formValue.stock ? parseInt(formValue.stock) : null,
      categoryId: formValue.categoryId,
      subCategoryId: formValue.subCategoryId,
      gender: formValue.gender,
      isActive: formValue.isActive,
      isBestSeller: formValue.isBestSeller,
      isNewArrival: formValue.isNewArrival,
      isOnSale: formValue.isOnSale || false,
      images,
    };

    // Only include originalPrice if it has a value
    if (formValue.originalPrice) {
      productData['originalPrice'] = parseFloat(formValue.originalPrice);
    } else {
      productData['originalPrice'] = null;
    }

    const request =
      this.isEditMode && this.productId
        ? this.productService.updateProduct(this.productId, productData)
        : this.productService.createProduct(productData);

    request.subscribe({
      next: (response) => {
        this.isSaving.set(false);
        if (response.success) {
          this.toastService.success(
            this.isEditMode ? 'Product updated successfully' : 'Product created successfully',
          );
          this.router.navigate(['/admin/products']);
        }
      },
      error: (error: { message?: string }) => {
        this.isSaving.set(false);
        this.toastService.error(error.message || 'Failed to save product');
      },
    });
  }

  /**
   * Handle file selection for image upload
   */
  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);

    // Validate files
    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        this.toastService.error(`File ${file.name} is too large. Max size is 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    this.uploadFiles(validFiles);
    input.value = ''; // Reset input
  }

  /**
   * Upload files to server
   */
  private uploadFiles(files: File[]): void {
    this.isUploading.set(true);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    this.http
      .post<ApiResponse<MultiUploadResponse>>(`${environment.apiUrl}/upload/images`, formData)
      .subscribe({
        next: (response) => {
          this.isUploading.set(false);
          if (response.success && response.data) {
            const newUrls = response.data.images.map((img) => img.url);
            const currentUrls = this.imagePreview();
            this.imagePreview.set([...currentUrls, ...newUrls]);
            this.updateImagesText();
            this.toastService.success(`${response.data.count} image(s) uploaded successfully`);
          }
        },
        error: (error) => {
          this.isUploading.set(false);
          this.toastService.error(error.message || 'Failed to upload images');
        },
      });
  }

  /**
   * Remove image from preview
   */
  removeImage(index: number): void {
    const urls = this.imagePreview();
    urls.splice(index, 1);
    this.imagePreview.set([...urls]);
    this.updateImagesText();
  }

  /**
   * Update the imagesText form field based on current preview
   */
  private updateImagesText(): void {
    const urls = this.imagePreview();
    this.productForm.patchValue(
      {
        imagesText: urls.join('\n'),
      },
      { emitEvent: false },
    );
  }
}
