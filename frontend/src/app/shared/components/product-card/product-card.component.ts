import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product, Category } from '../../../core/models';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Input() showAddToCart = true;
  @Output() addToCart = new EventEmitter<Product>();

  isAddingToCart = false;

  get mainImage(): string {
    return this.product.images?.[0] || '/assets/images/placeholder.jpg';
  }

  getCategoryName(): string {
    const category = this.product.categoryId;
    if (typeof category === 'string') {
      return '';
    }
    return (category as Category)?.name || '';
  }

  onAddToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isAddingToCart = true;
    this.addToCart.emit(this.product);

    // Reset after animation
    setTimeout(() => {
      this.isAddingToCart = false;
    }, 1000);
  }
}
