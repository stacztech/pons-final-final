import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { Observable, Subject, BehaviorSubject, of, Subscription } from 'rxjs';
import { map, filter, switchMap, takeUntil, debounceTime, distinctUntilChanged, catchError, tap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container my-5">
      <h2>Shopping Cart</h2>

      <div *ngIf="cartItems.length === 0" class="text-center py-5">
        <h3>Your cart is empty</h3>
        <p>Add some items to your cart to see them here!</p>
        <a routerLink="/" class="btn btn-primary">Continue Shopping</a>
      </div>

      <div *ngIf="cartItems.length > 0" class="cart-items">
        <div *ngFor="let item of cartItems" class="cart-item card mb-3">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <img [src]="item.image" [alt]="item.name" class="cart-item-image me-3">
              <div class="flex-grow-1">
                <h5 class="mb-1">{{item.name}}</h5>
                <p class="mb-1">Weight: {{item.weight}}</p>
                <div class="d-flex align-items-center">
                  <div class="quantity-control">
                    <button 
                      class="btn btn-sm btn-outline-secondary"
                      (click)="updateQuantity(item, -1)"
                      [disabled]="item.quantity <= 1">
                      -
                    </button>
                    <input 
                      type="number"
                      class="form-control mx-2 quantity-input"
                      [value]="item.quantity"
                      [min]="1"
                      [step]="1"
                      (change)="onQuantityChange(item.id, $event)"
                      placeholder="Qty" />
                    <button 
                      class="btn btn-sm btn-outline-secondary"
                      (click)="updateQuantity(item, 1)">
                      +
                    </button>
                  </div>
                  <button 
                    class="btn btn-sm btn-danger ms-3"
                    (click)="removeItem(item)">
                    Remove
                  </button>
                </div>
              </div>
              <div class="text-end ms-3">
                <div class="fw-bold">₹{{item.price * item.quantity}}</div>
                <small class="text-muted">₹{{item.price}} each</small>
              </div>
            </div>
          </div>
        </div>

        <div class="card mt-4">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <h4 class="mb-0">Total: ₹{{total}}</h4>
              <a routerLink="/checkout" class="btn btn-primary" (click)="proceedToCheckout()">Proceed to Checkout</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cart-item-image {
      width: 100px;
      height: 100px;
      object-fit: cover;
      border-radius: 4px;
    }
    .quantity-control {
      display: flex;
      align-items: center;
    }
    .quantity-input {
      width: 60px;
      text-align: center;
      /* Hide spinner buttons for number input */
      -moz-appearance: textfield; /* Firefox */
    }
    /* Hide spinner buttons for Chrome, Safari, Edge */
    .quantity-input::-webkit-outer-spin-button,
    .quantity-input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    /* Mobile Responsive Styles */
    @media (max-width: 768px) {
      .container {
        padding: 0.5rem; /* Reduce padding for smaller screens */
      }

      h2 {
        font-size: 1.6rem; /* Slightly smaller heading */
        margin-bottom: 1rem;
      }

      .cart-item.card {
        flex-direction: row; /* Keep content in a row initially */
        align-items: center; /* Center align items */
        padding: 0.5rem; /* Adjust padding */
      }

      .cart-item .card-body {
        padding: 0.5rem; /* Adjust padding inside card body */
        width: 100%;
        display: flex;
        flex-direction: column;
      }

      .cart-item .d-flex.align-items-center {
        flex-direction: row; /* Keep main content in a row */
        align-items: center;
        width: 100%;
        flex-wrap: wrap; /* Allow wrapping for elements */
      }

      .cart-item-image {
        width: 70px; /* Smaller image */
        height: 70px;
        margin-bottom: 0; /* Remove bottom margin */
        margin-right: 0.75rem !important; /* Keep a small right margin */
      }

      .cart-item .flex-grow-1 {
        width: auto; /* Allow content to take natural width */
        flex-grow: 1; /* Allow to grow */
        text-align: left;
      }

      .cart-item h5 {
        font-size: 0.9rem; /* Smaller font for name */
        margin-bottom: 0.1rem; /* Reduce spacing */
        line-height: 1.3; /* Adjust line height */
      }

      .cart-item p {
        font-size: 0.75rem; /* Smaller font for weight */
        margin-bottom: 0.5rem; /* Add some spacing */
      }

      .cart-item .d-flex.align-items-center > .d-flex.align-items-center {
        flex-direction: row; /* Keep quantity and remove button in a row */
        width: 100%;
        justify-content: flex-start; /* Align to start */
        margin-top: 0.5rem;
        gap: 0.5rem; /* Space between quantity controls and remove */
      }

      .quantity-control {
        flex-grow: 0; /* Don't force growth */
        justify-content: flex-start;
        min-width: 120px; /* Give it a minimum width */
      }

      .quantity-input {
        width: 40px; /* Smaller input width */
        font-size: 0.8rem; /* Smaller font */
        height: 30px; /* Smaller height */
        padding: 0.25rem; /* Adjust padding */
      }

      .quantity-control .btn-sm {
        padding: 0.15rem 0.4rem; /* Smaller padding */
        font-size: 0.8rem; /* Smaller font */
        height: 30px; /* Match input height */
        width: 30px; /* Match input height */
      }

      .cart-item .ms-3 {
        margin-left: auto !important; /* Push price to the right */
        text-align: right;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        white-space: nowrap;
      }

      .cart-item .fw-bold {
        font-size: 1rem; /* Slightly smaller price */
      }

      .cart-item small.text-muted {
        font-size: 0.7rem; /* Smaller price per item */
      }

      .card.mt-4 {
        margin-top: 1rem !important; /* Adjust spacing */
      }

      .card.mt-4 .card-body {
        flex-direction: column;
        align-items: stretch; /* Stretch items to fill width */
        gap: 0.75rem; /* Adjust gap */
        padding: 1rem; /* Adjust padding */
      }

      .card.mt-4 h4 {
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
      }

      .card.mt-4 .btn-primary {
        width: 100%;
        font-size: 0.9rem;
        padding: 0.6rem;
      }
    }
  `]
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  total: number = 0;
  private subscription: Subscription;

  constructor(private cartService: CartService, private router: Router, private authService: AuthService) {
    console.log('CartComponent loaded');
    this.subscription = this.cartService.cartItems$.subscribe(items => {
      console.log('CartComponent items:', items);
      this.cartItems = items;
      this.total = this.calculateTotal();
    });
  }

  ngOnInit() {
    // Removed redundant assignment to cartItems and total.
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  calculateTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getStep(item: CartItem): number {
    if (item.weight && (item.weight.includes('1/2') || item.weight.includes('0.5') || item.weight.includes('500'))){
      return 0.5;
    }
    return 1;
  }

  updateQuantity(item: CartItem, change: number) {
    const newQuantity = Math.max(1, Math.round(item.quantity + change));
    this.cartService.updateQuantity(item.id, newQuantity);
  }

  removeItem(item: CartItem) {
    this.cartService.removeFromCart(item.id);
  }

  clearCart() {
    this.cartService.clearCart();
  }

  proceedToCheckout() {
    if (!this.authService.isLoggedIn()) {
      // Redirect to login with returnUrl set to /cart
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/cart' } });
      return;
    }
    this.router.navigate(['/checkout']);
  }

  onQuantityChange(itemId: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const item = this.cartItems.find(i => i.id === itemId);
    if (!item) return;
    let quantity = parseInt(input.value, 10);
    if (!isNaN(quantity) && quantity >= 1) {
      this.cartService.updateQuantity(item.id, quantity);
    } else if (!isNaN(quantity) && quantity < 1) {
      this.cartService.updateQuantity(item.id, 1);
    } else {
      input.value = item.quantity.toString();
    }
  }
}
