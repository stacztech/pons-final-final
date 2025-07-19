import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../services/cart.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface ChickenProduct {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  price1kg: number;
  price500g: number;
  quantity1kg: number;
  quantity500g: number;
  isAddedToCart?: boolean;
}

@Component({
  selector: 'app-chicken',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container my-5">
      <h1 class="section-title">Chicken</h1>
      
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
                    (click)="addToCart(product, true)">
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
      margin-top: 10px !important;
      padding-top: 0 !important;
    }

    .section-title {
      color: #1a1a1a;
      font-size: 30px;
      font-weight: 600;
      margin: 0 0 8px;
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
export class ChickenComponent implements OnInit {
  selectedCategory = 'All';
  cartItems: CartItem[] = [];

  categories = [
    'All',
    'Boneless',
    'Special Cuts',
    'Grill/Tandoori',
    'Offal'
  ];

  products: ChickenProduct[] = [
    {
      id: 'CC001',
      name: 'Chicken Curry Cut with Skin',
      description: 'Traditional curry cut pieces with skin, perfect for curries and biryanis',
      image: 'assets/images/cws.jpeg',
      category: 'Curry Cut',
      price1kg: 170,
      price500g: 85,
      quantity1kg: 0,
      quantity500g: 0
    },
    {
      id: 'CC002',
      name: 'Chicken Curry Cut without Skin',
      description: 'Skinless curry cut pieces, ideal for healthier preparations',
      image: 'assets/images/cwos.png',
      category: 'Curry Cut',
      price1kg: 220,
      price500g: 110,
      quantity1kg: 0,
      quantity500g: 0
    },
    {
      id: 'BL001',
      name: 'Chicken Boneless Curry Cut',
      description: 'Boneless pieces perfect for quick cooking and curries',
      image: 'assets/images/cbbl.webp',
      category: 'Boneless',
      price1kg: 350,
      price500g: 175,
      quantity1kg: 0,
      quantity500g: 0
    },
    {
      id: 'BL002',
      name: 'Chicken Breast Boneless',
      description: 'Premium chicken breast cuts, ideal for grilling and high-protein meals',
      image: 'assets/images/cbl.jpg',
      category: 'Boneless',
      price1kg: 350,
      price500g: 175,
      quantity1kg: 0,
      quantity500g: 0
    },
    {
      id: 'SP001',
      name: 'Chicken Wings with Skin',
      description: 'Juicy wings perfect for frying or grilling',
      image: 'assets/images/cw.jpg',
      category: 'Special Cuts',
      price1kg: 200,
      price500g: 100,
      quantity1kg: 0,
      quantity500g: 0
    },
    {
      id: 'SP002',
      name: 'Chicken Lollipop without Skin',
      description: 'Ready-to-cook lollipops, great for starters',
      image: 'assets/images/cl.png',
      category: 'Special Cuts',
      price1kg: 250,
      price500g: 125,
      quantity1kg: 0,
      quantity500g: 0
    },
    {
      id: 'SP003',
      name: 'Chicken Drumstick with Skin',
      description: 'Juicy drumsticks, perfect for grilling and frying',
      image: 'assets/images/cd.jpg',
      category: 'Special Cuts',
      price1kg: 250,
      price500g: 125,
      quantity1kg: 0,
      quantity500g: 0
    },
    {
      id: 'GR001',
      name: 'Chicken Grill/Tandoori Pack with Skin',
      description: 'Whole bird with skin, perfect for grilling or tandoori',
      image: 'assets/images/t1.jpg',
      category: 'Grill/Tandoori',
      price1kg: 220,
      price500g: 110,
      quantity1kg: 0,
      quantity500g: 0
    },
    {
      id: 'GR002',
      name: 'Chicken Grill/Tandoori Pack without Skin',
      description: 'Skinless whole bird for healthier grilling options',
      image: 'assets/images/t2.jfif',
      category: 'Grill/Tandoori',
      price1kg: 250,
      price500g: 125,
      quantity1kg: 0,
      quantity500g: 0
    },
    {
      id: 'OF001',
      name: 'Chicken Liver',
      description: 'Fresh chicken liver, rich in nutrients',
      image: 'assets/images/cli.jpg',
      category: 'Offal',
      price1kg: 200,
      price500g: 100,
      quantity1kg: 0,
      quantity500g: 0
    },
    {
      id: 'OF002',
      name: 'Chicken Gizzard',
      description: 'Clean chicken gizzard, ready to cook',
      image: 'assets/images/cg.jpg',
      category: 'Offal',
      price1kg: 200,
      price500g: 100,
      quantity1kg: 0,
      quantity500g: 0
    },
    {
      id: 'SP004',
      name: 'Chicken Kothu Curry',
      description: 'Special cut pieces for kothu preparations',
      image: 'assets/images/ck.webp',
      category: 'Special Cuts',
      price1kg: 350,
      price500g: 175,
      quantity1kg: 0,
      quantity500g: 0
    },
    {
      id: 'SP005',
      name: 'Chicken Bone',
      description: 'Chicken bones for making stock and soups',
      image: 'assets/images/cb.webp',
      category: 'Special Cuts',
      price1kg: 70,
      price500g: 35,
      quantity1kg: 0,
      quantity500g: 0
    }
  ];

  get filteredProducts() {
    if (this.selectedCategory === 'All') {
      return this.products;
    }
    return this.products.filter(product => product.category === this.selectedCategory);
  }

  constructor(private cartService: CartService, private router: Router, private authService: AuthService) {
    console.log('ChickenComponent loaded');
  }

  ngOnInit() {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
    });
  }

  hasSelectedWeight(product: ChickenProduct): boolean {
    return (product.quantity1kg || 0) > 0 || (product.quantity500g || 0) > 0;
  }

  isProductInCart(product: ChickenProduct): boolean {
    const inCart1kg = this.cartItems.some(item => item.id === `${product.id}-1kg` && item.quantity > 0);
    const inCart500g = this.cartItems.some(item => item.id === `${product.id}-500g` && item.quantity > 0);
    return inCart1kg || inCart500g;
  }

  addToCart(product: ChickenProduct, navigateToCheckout: boolean = false) {
    console.log('addToCart called', product, navigateToCheckout);
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
    if (navigateToCheckout) {
      // Only set Buy Now item, do NOT add to cart
      this.cartService.setBuyNowItem(itemsToAdd[0]);
      product.quantity1kg = 0;
      product.quantity500g = 0;
      this.router.navigate(['/checkout']);
      return;
    }
    if (this.authService.isLoggedIn()) {
      for (const item of itemsToAdd) {
        this.cartService.addToCart(item);
      }
      product.quantity1kg = 0;
      product.quantity500g = 0;
      product.isAddedToCart = true;
      setTimeout(() => { product.isAddedToCart = false; }, 1500);
    } else {
      this.cartService.savePendingCartItem(itemsToAdd[0]);
      this.router.navigate(['/login']);
    }
  }

  increaseQuantity(product: ChickenProduct, weightType: '1kg' | '500g') {
    if (weightType === '1kg') {
      product.quantity1kg = (product.quantity1kg || 0) + 1;
    } else {
      product.quantity500g = (product.quantity500g || 0) + 1;
    }
  }

  decreaseQuantity(product: ChickenProduct, weightType: '1kg' | '500g') {
    if (weightType === '1kg' && product.quantity1kg > 0) {
      product.quantity1kg--;
    } else if (weightType === '500g' && product.quantity500g > 0) {
      product.quantity500g--;
    }
  }
}