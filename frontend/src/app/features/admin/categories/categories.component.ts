import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { Category, SubCategory } from '../../../core/models';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LoadingComponent],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css',
})
export class AdminCategoriesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  private toastService = inject(ToastService);

  categories = signal<Category[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);

  showCategoryForm = false;
  showSubcategoryForm = false;
  editingCategory: Category | null = null;
  editingSubcategory: SubCategory | null = null;
  parentCategory: Category | null = null;

  categoryForm: FormGroup;
  subcategoryForm: FormGroup;

  constructor() {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      image: [''],
    });

    this.subcategoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      image: [''],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.categoryService.getCategories(true).subscribe({
      next: (response) => {
        if (response.success) {
          this.categories.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastService.error('Failed to load categories');
      },
    });
  }

  // Category methods
  openCategoryForm(): void {
    this.editingCategory = null;
    this.categoryForm.reset();
    this.showCategoryForm = true;
  }

  editCategory(category: Category): void {
    this.editingCategory = category;
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description || '',
      image: category.image || '',
    });
    this.showCategoryForm = true;
  }

  closeCategoryForm(): void {
    this.showCategoryForm = false;
    this.editingCategory = null;
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) return;

    this.isSaving.set(true);
    const data = this.categoryForm.value;

    const request = this.editingCategory
      ? this.categoryService.updateCategory(this.editingCategory._id, data)
      : this.categoryService.createCategory(data);

    request.subscribe({
      next: (response) => {
        this.isSaving.set(false);
        if (response.success) {
          this.toastService.success(this.editingCategory ? 'Category updated' : 'Category created');
          this.closeCategoryForm();
          this.loadCategories();
        }
      },
      error: (error: { message?: string }) => {
        this.isSaving.set(false);
        this.toastService.error(error.message || 'Failed to save category');
      },
    });
  }

  toggleCategory(category: Category): void {
    this.categoryService.toggleCategory(category._id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success(`Category ${category.isActive ? 'deactivated' : 'activated'}`);
          this.loadCategories();
        }
      },
      error: (error: { message?: string }) => {
        this.toastService.error(error.message || 'Failed to update category');
      },
    });
  }

  // Subcategory methods
  openSubcategoryForm(category: Category): void {
    this.parentCategory = category;
    this.editingSubcategory = null;
    this.subcategoryForm.reset();
    this.showSubcategoryForm = true;
  }

  editSubcategory(subcategory: SubCategory, category: Category): void {
    this.parentCategory = category;
    this.editingSubcategory = subcategory;
    this.subcategoryForm.patchValue({
      name: subcategory.name,
      description: subcategory.description || '',
      image: subcategory.image || '',
    });
    this.showSubcategoryForm = true;
  }

  closeSubcategoryForm(): void {
    this.showSubcategoryForm = false;
    this.editingSubcategory = null;
    this.parentCategory = null;
  }

  saveSubcategory(): void {
    if (this.subcategoryForm.invalid || !this.parentCategory) return;

    this.isSaving.set(true);
    const data = {
      ...this.subcategoryForm.value,
      categoryId: this.parentCategory._id,
    };

    const request = this.editingSubcategory
      ? this.categoryService.updateSubcategory(this.editingSubcategory._id, data)
      : this.categoryService.createSubcategory(data);

    request.subscribe({
      next: (response) => {
        this.isSaving.set(false);
        if (response.success) {
          this.toastService.success(
            this.editingSubcategory ? 'Subcategory updated' : 'Subcategory created',
          );
          this.closeSubcategoryForm();
          this.loadCategories();
        }
      },
      error: (error: { message?: string }) => {
        this.isSaving.set(false);
        this.toastService.error(error.message || 'Failed to save subcategory');
      },
    });
  }

  toggleSubcategory(subcategory: SubCategory): void {
    this.categoryService.toggleSubcategory(subcategory._id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success(
            `Subcategory ${subcategory.isActive ? 'deactivated' : 'activated'}`,
          );
          this.loadCategories();
        }
      },
      error: (error: { message?: string }) => {
        this.toastService.error(error.message || 'Failed to update subcategory');
      },
    });
  }
}
