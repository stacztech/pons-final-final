import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../services/cart.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface JapaneseQuailProduct {
  id: string;
  name: string;
  description: string;
  image: string;
  price1kg: number;
  price500g: number;
  quantity1kg: number;
  quantity500g: number;
  isAddedToCart?: boolean;
}

@Component({
  selector: 'app-japanese-quail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container my-5">
      <h1 class="section-title">Japanese Quail</h1>
      
      <div class="product-grid">
        <div class="product-item" *ngFor="let product of products">
          <div class="product-card">
            <div class="img-wrapper">
              <img [src]="product.image" [alt]="product.name">
            </div>
            <div class="card-body">
              <h3>{{ product.name }}</h3>
              <p>{{ product.description }}</p>
              <div class="product-options">
                <!-- Weight Selection -->
                <div class="weight-selector">
                  <div class="weight-option">
                    <label>1 kg (₹{{product.price1kg}}):</label>
                    <div class="quantity-controls">
                      <button (click)="decreaseQuantity(product, '1kg')" [disabled]="product.quantity1kg <= 0">−</button>
                      <span class="quantity">{{ product.quantity1kg || 0 }}</span>
                      <button (click)="increaseQuantity(product, '1kg')">+</button>
                    </div>
                  </div>
                  
                  <div class="weight-option">
                    <label>500 g (₹{{product.price500g}}):</label>
                    <div class="quantity-controls">
                      <button (click)="decreaseQuantity(product, '500g')" [disabled]="product.quantity500g <= 0">−</button>
                      <span class="quantity">{{ product.quantity500g || 0 }}</span>
                      <button (click)="increaseQuantity(product, '500g')">+</button>
                    </div>
                  </div>
                </div>

                <!-- Delivery Info -->
                <div class="delivery-info">
                  <i class="bi bi-lightning-fill"></i>
                  Today in 120 mins
                </div>

                <div class="button-group">
                  <!-- Buy Now Button -->
                  <button 
                    class="btn-buy-now" 
                    [disabled]="!hasSelectedWeight(product)"
                    (click)="buyNow(product)">
                    Buy Now
                  </button>
                  <!-- Add to Cart Button -->
                  <button 
                    class="btn-add-cart" 
                    [disabled]="!hasSelectedWeight(product)"
                    [attr.data-added]="isProductInCart(product)"
                    (click)="addToCart(product)">
                    {{ isProductInCart(product) ? 'Added to Cart' : 'Add to Cart' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container.my-5, .section-title {
      margin-top: 0px !important;
      padding-top: 0 !important;
    }

    .section-title {
      color: #1a1a1a;
      font-size: 30px;
      font-weight: 600;
      margin: 0 0 10px;
      text-align: left;
      padding: 0 12px;
    }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
      padding: 0 12px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .product-item {
      display: flex;
      height: 100%;
      margin: 0;
    }

    .product-card {
      display: flex;
      flex-direction: column;
      width: 100%;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #f0f0f0;
      transition: all 0.3s ease;
      padding: 6px;
      margin: 0;
    }

    .product-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .img-wrapper {
      position: relative;
      width: 100%;
      padding-top: 100%;
      border-radius: 6px;
      overflow: hidden;
      background: #f8f8f8;
    }

    .img-wrapper img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .card-body {
      padding: 8px 0;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }

    .card-body h3 {
      font-size: 14px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 6px;
      line-height: 1.3;
    }

    .card-body p {
      font-size: 12px;
      color: #666;
      margin: 0 0 8px;
      line-height: 1.4;
    }

    .product-options {
      margin-top: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .weight-selector {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .weight-option {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    
    .weight-option label {
      font-size: 12px;
      color: #666;
      flex: 1;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f8f8f8;
      border-radius: 4px;
      padding: 2px 6px;
      width: fit-content;
    }

    .quantity-controls button {
      width: 24px;
      height: 24px;
      border: none;
      background: #E31837;
      color: white;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }

    .quantity-controls button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .quantity {
      font-size: 12px;
      font-weight: 500;
      color: #1a1a1a;
      min-width: 20px;
      text-align: center;
    }

    .delivery-info {
      font-size: 11px;
      color: #00a642;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .delivery-info i {
      font-size: 12px;
    }

    .button-group {
      display: flex;
      gap: 8px;
      width: 100%;
    }

    .btn-buy-now {
      background: #E31837;
      color: white;
      border: none;
      padding: 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 400;
      cursor: pointer;
      transition: all 0.3s ease;
      width: 48%;
    }

    .btn-add-cart {
      background: #2c3e50;
      color: white;
      border: none;
      padding: 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 400;
      cursor: pointer;
      transition: all 0.3s ease;
      width: 48%;
    }

    .btn-buy-now:disabled,
    .btn-add-cart:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .btn-buy-now:not(:disabled):hover {
      background: #c41530;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(227, 24, 55, 0.2);
    }

    .btn-add-cart:not(:disabled):hover {
      background: #34495e;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(44, 62, 80, 0.2);
    }

    .btn-add-cart:not(:disabled) {
      background: var(--button-bg, #2c3e50);
    }

    .btn-add-cart:not(:disabled)[data-added="true"] {
      --button-bg: #27ae60;
    }

    @media (max-width: 768px) {
      .container.my-5 {
        padding-top: 64px !important;
      }
      .product-grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 12px;
        padding: 0 8px;
      }

      .card-body h3 {
        font-size: 13px;
      }

      .card-body p {
        font-size: 11px;
      }

      .weight-option label {
        font-size: 11px;
      }

      .quantity-controls {
        padding: 2px 4px;
      }

      .quantity-controls button {
        width: 20px;
        height: 20px;
        font-size: 12px;
      }

      .quantity {
        font-size: 11px;
      }

      .btn-buy-now,
      .btn-add-cart {
        padding: 6px;
        font-size: 11px;
      }
    }
  `]
})
export class JapaneseQuailComponent implements OnInit {
  products: JapaneseQuailProduct[] = [
    {
      id: 'JQ001',
      name: 'Japanese Quail',
      description: 'Fresh Japanese Quail, perfect for grilling, roasting, or curries.',
      image: 'assets/images/j1.jfif',
      price1kg: 110,
      price500g: 55,
      quantity1kg: 0,
      quantity500g: 0
    }
  ];

  cartItems: CartItem[] = [];

  constructor(private cartService: CartService, private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
    });
  }

  hasSelectedWeight(product: JapaneseQuailProduct): boolean {
    return (product.quantity1kg || 0) > 0 || (product.quantity500g || 0) > 0;
  }

  isProductInCart(product: JapaneseQuailProduct): boolean {
    const inCart1kg = this.cartItems.some(item => item.id === `${product.id}-1kg` && item.quantity > 0);
    const inCart500g = this.cartItems.some(item => item.id === `${product.id}-500g` && item.quantity > 0);
    return inCart1kg || inCart500g;
  }

  addToCart(product: JapaneseQuailProduct) {
    const itemsToAdd: CartItem[] = [];
    if (product.quantity1kg > 0) {
      itemsToAdd.push({
        id: `${product.id}-1kg`,
        name: product.name,
        image: product.image,
        weight: '1 kg',
        price: product.price1kg,
        quantity: product.quantity1kg
      });
    }
    if (product.quantity500g > 0) {
      itemsToAdd.push({
        id: `${product.id}-500g`,
        name: product.name,
        image: product.image,
        weight: '1/2 kg',
        price: product.price500g,
        quantity: product.quantity500g
      });
    }
    if (itemsToAdd.length === 0) return;
    if (this.authService.isLoggedIn()) {
      this.cartService.addMultipleToCart(itemsToAdd).subscribe({
        next: () => {
          this.cartService.fetchCart();
          product.quantity1kg = 0;
          product.quantity500g = 0;
          product.isAddedToCart = true;
          setTimeout(() => { product.isAddedToCart = false; }, 1500);
        },
        error: () => {
          // Optionally handle error
        }
      });
    } else {
      this.cartService.savePendingCartItem(itemsToAdd[0]);
      this.router.navigate(['/login']);
    }
  }

  buyNow(product: JapaneseQuailProduct) {
    // Collect all selected weights
    const itemsToBuy: CartItem[] = [];
    if (product.quantity1kg > 0) {
      itemsToBuy.push({
        id: `${product.id}-1kg`,
        name: product.name,
        image: product.image,
        weight: '1 kg',
        price: product.price1kg,
        quantity: product.quantity1kg
      });
    }
    if (product.quantity500g > 0) {
      itemsToBuy.push({
        id: `${product.id}-500g`,
        name: product.name,
        image: product.image,
        weight: '1/2 kg',
        price: product.price500g,
        quantity: product.quantity500g
      });
    }
    if (itemsToBuy.length > 0) {
      localStorage.setItem('buyNowItem', JSON.stringify(itemsToBuy));
      product.quantity1kg = 0;
      product.quantity500g = 0;
      this.router.navigate(['/checkout']);
    }
  }

  increaseQuantity(product: JapaneseQuailProduct, weightType: '1kg' | '500g') {
    if (weightType === '1kg') {
      product.quantity1kg = (product.quantity1kg || 0) + 1;
    } else {
      product.quantity500g = (product.quantity500g || 0) + 1;
    }
  }

  decreaseQuantity(product: JapaneseQuailProduct, weightType: '1kg' | '500g') {
    if (weightType === '1kg' && product.quantity1kg > 0) {
      product.quantity1kg--;
    } else if (weightType === '500g' && product.quantity500g > 0) {
      product.quantity500g--;
    }
  }
}