import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { OrdersService, DeliveryDetails } from '../../services/orders.service';
import { AuthService } from '../../services/auth.service';
import { DeliveryAddressComponent } from './delivery-address.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, DeliveryAddressComponent],
  template: `
    <div class="container my-5">
      <div class="row checkout-flex">
        <div class="col-lg-8 order-lg-1 main-checkout-col">
          <!-- Stepper -->
          <div class="progress-steps mb-4">
            <div class="step" [class.active]="currentStep === 1">
              <span class="step-number">1</span>
              <span class="step-label">Delivery Address</span>
            </div>
            <div class="step-divider"></div>
            <div class="step" [class.active]="currentStep === 2">
              <span class="step-number">2</span>
              <span class="step-label">Payment Method</span>
            </div>
            <div class="step-divider"></div>
            <div class="step" [class.active]="currentStep === 3">
              <span class="step-number">3</span>
              <span class="step-label">Review Order</span>
            </div>
          </div>
          <!-- Order Summary (centered below stepper on mobile) -->
          <div class="order-summary-mobile-wrapper d-block d-lg-none">
            <div class="card order-summary-card mb-4 mx-auto">
              <div class="card-body">
                <h3>Order Summary</h3>
                <div *ngFor="let item of orderItems" class="d-flex align-items-center mb-3">
                  <img [src]="item.image" [alt]="item.name" style="width:90px;height:90px;object-fit:cover;border-radius:6px;margin-right:18px;">
                  <div class="flex-grow-1">
                    <div style="font-size:1.2rem;font-weight:600;">{{item.name}}</div>
                    <div style="color:#555;">Weight: {{item.weight}}</div>
                    <div class="d-flex align-items-center mt-2">
                      <button class="btn btn-sm btn-outline-secondary" (click)="updateQuantity(item, -1)" [disabled]="item.quantity <= getMin(item)">-</button>
                      <input type="number" class="form-control mx-2 quantity-input" style="width:50px;display:inline-block;" [value]="item.quantity < getMin(item) ? getMin(item) : item.quantity" [min]="getMin(item)" [step]="1" (change)="onQuantityChange(item, $event)">
                      <button class="btn btn-sm btn-outline-secondary" (click)="updateQuantity(item, 1)">+</button>
                      <button class="btn btn-sm btn-danger ms-3" (click)="removeItem(item)">Remove</button>
                    </div>
                  </div>
                </div>
                <hr>
                <div class="d-flex justify-content-between">
                  <strong>Total</strong>
                  <strong>₹{{getTotal()}}</strong>
                </div>
              </div>
            </div>
          </div>
          <!-- Main content for each step follows here -->
          <!-- Step 1: Address -->
          <div *ngIf="currentStep === 1">
            <h2>Delivery Address</h2>
            <app-delivery-address (addressSelected)="onAddressSelected($event)"></app-delivery-address>
            <button type="button" class="btn btn-primary mt-3" [disabled]="!selectedAddress" (click)="nextStep()">Continue</button>
          </div>

          <!-- Step 2: Payment -->
          <div *ngIf="currentStep === 2">
            <h2>Payment Method</h2>
            <div class="form-check">
              <input class="form-check-input" type="radio" name="paymentMethod" id="cod" value="cod" [(ngModel)]="paymentMethod" required>
              <label class="form-check-label" for="cod">Cash on Delivery</label>
            </div>
            <button type="button" class="btn btn-secondary mt-3 me-2" (click)="prevStep()">Back</button>
            <button type="button" class="btn btn-primary mt-3" [disabled]="!paymentMethod" (click)="nextStep()">Continue</button>
          </div>

          <!-- Step 3: Review -->
          <div *ngIf="currentStep === 3">
            <h2>Review Your Order</h2>
            <div *ngFor="let item of orderItems" class="d-flex justify-content-between align-items-center mb-2">
              <div>
                <span>{{item.name}} ({{item.weight}})</span>
              </div>
              <span>₹{{item.price * item.quantity}}</span>
            </div>
            <div class="mt-3">
              <strong>Delivery Address:</strong>
              <div>{{selectedAddress.fullName}}, {{selectedAddress.addressLine1}}, {{selectedAddress.city}}, {{selectedAddress.state}}, {{selectedAddress.pincode}}</div>
              <div>Phone: {{selectedAddress.phoneNumber}}</div>
            </div>
            <div class="mt-3">
              <strong>Payment Method:</strong> {{paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod}}
            </div>
            <div class="mt-3">
              <strong>Total: ₹{{getTotal()}}</strong>
            </div>
            <div *ngIf="errorMessage" class="alert alert-danger">{{errorMessage}}</div>
            <button type="button" class="btn btn-secondary mt-3 me-2" (click)="prevStep()">Back</button>
            <button type="button" class="btn btn-success mt-3" [disabled]="isProcessing" (click)="placeOrder()">{{isProcessing ? 'Placing Order...' : 'Place Order'}}</button>
          </div>
        </div>
        <!-- Order Summary (right on desktop only) -->
        <div class="col-lg-4 order-lg-2 order-summary-col d-none d-lg-block">
          <div class="card order-summary-card mb-4">
            <div class="card-body">
              <h3>Order Summary</h3>
              <div *ngFor="let item of orderItems" class="d-flex align-items-center mb-3">
                <img [src]="item.image" [alt]="item.name" style="width:90px;height:90px;object-fit:cover;border-radius:6px;margin-right:18px;">
                <div class="flex-grow-1">
                  <div style="font-size:1.2rem;font-weight:600;">{{item.name}}</div>
                  <div style="color:#555;">Weight: {{item.weight}}</div>
                  <div class="d-flex align-items-center mt-2">
                    <button class="btn btn-sm btn-outline-secondary" (click)="updateQuantity(item, -1)" [disabled]="item.quantity <= getMin(item)">-</button>
                    <input type="number" class="form-control mx-2 quantity-input" style="width:50px;display:inline-block;" [value]="item.quantity < getMin(item) ? getMin(item) : item.quantity" [min]="getMin(item)" [step]="1" (change)="onQuantityChange(item, $event)">
                    <button class="btn btn-sm btn-outline-secondary" (click)="updateQuantity(item, 1)">+</button>
                    <button class="btn btn-sm btn-danger ms-3" (click)="removeItem(item)">Remove</button>
                  </div>
                </div>
              </div>
              <hr>
              <div class="d-flex justify-content-between">
                <strong>Total</strong>
                <strong>₹{{getTotal()}}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .order-summary-card { min-width: 320px; max-width: 420px; width: 100%; }
    .checkout-flex { display: flex; flex-wrap: wrap; }
    .order-summary-col { order: 2; }
    .main-checkout-col { order: 1; }
    .progress-steps { display: flex; align-items: center; margin-bottom: 40px; }
    .step { display: flex; align-items: center; gap: 10px; color: #888; }
    .step.active { color: #E31837; font-weight: bold; }
    .step-number { width: 24px; height: 24px; border-radius: 50%; background: #ccc; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; }
    .step.active .step-number { background: #E31837; }
    .step-divider { width: 60px; height: 2px; background: #ccc; margin: 0 15px; }

    /* Quantity Controls */
    .d-inline-flex.align-items-center {
      gap: 0.5rem;
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
    }
    .btn-outline-secondary, .btn-danger {
      min-width: 36px;
      min-height: 36px;
      font-size: 1.1rem;
      padding: 0 0.7rem;
      border-radius: 6px;
      transition: background 0.2s, color 0.2s, border 0.2s;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
    }
    .btn-outline-secondary {
      border: 1.5px solid #E31837;
      color: #E31837;
      background: #fff;
    }
    .btn-outline-secondary:hover {
      background: #E31837;
      color: #fff;
      border-color: #E31837;
    }
    .btn-danger {
      background: #fff;
      color: #E31837;
      border: 1.5px solid #E31837;
    }
    .btn-danger:hover {
      background: #E31837;
      color: #fff;
    }
    input[type="number"].form-control-sm {
      font-size: 1rem;
      height: 36px;
      padding: 0 0.5rem;
      border-radius: 6px;
      border: 1.5px solid #ddd;
      margin: 0 2px;
      width: 70px;
      text-align: center;
      background: #fafbfc;
      box-shadow: 0 1px 2px rgba(0,0,0,0.02);
    }
    /* Add Item Button */
    .add-item-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4em;
      color: #E31837;
      border: 1.5px solid #E31837;
      background: #fff;
      border-radius: 6px;
      padding: 0.4em 1.1em;
      font-size: 1.05rem;
      font-weight: 500;
      margin: 1.2em 0 0.5em 0;
      cursor: pointer;
      transition: background 0.2s, color 0.2s, border 0.2s;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
      text-decoration: none;
    }
    .add-item-btn:hover {
      background: #E31837;
      color: #fff;
      border-color: #E31837;
      text-decoration: none;
    }
    .add-item-btn i {
      font-size: 1.2em;
      margin-right: 0.2em;
    }
    /* Hide number input spinners for all browsers */
    input[type='number']::-webkit-outer-spin-button,
    input[type='number']::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    input[type='number'] {
      -moz-appearance: textfield;
    }
    /* Responsive */
    @media (max-width: 768px) {
      .checkout-flex { flex-direction: column; }
      .order-summary-col { order: 2; display: none !important; }
      .main-checkout-col { order: 1; }
      .container.my-5 {
        padding: 64px 0.5rem 0.5rem 0.5rem !important;
      }
      .progress-steps {
        flex-direction: column;
        gap: 0.5rem;
      }
      .card { position: static; margin-top: 1rem; }
      .d-inline-flex.align-items-center {
        flex-direction: row;
        gap: 0.15rem;
      }
      input[type="number"].form-control-sm {
        width: 48px;
        font-size: 0.95rem;
        height: 32px;
      }
      .btn-outline-secondary, .btn-danger {
        min-width: 28px;
        min-height: 28px;
        font-size: 0.95rem;
        padding: 0 0.3rem;
        border-radius: 5px;
      }
      .add-item-btn {
        width: 100%;
        justify-content: center;
        font-size: 1rem;
        padding: 0.5em 0;
        margin: 1em 0 0.5em 0;
      }
      .order-summary-mobile-wrapper { display: block; }
      .order-summary-card { margin-left: auto; margin-right: auto; }
    }
  `]
})
export class CheckoutComponent implements OnInit, OnDestroy {
  currentStep = 1;
  selectedAddress: any = null;
  paymentMethod: string = '';
  isProcessing: boolean = false;
  errorMessage: string = '';
  buyNowItems: CartItem[] | null = null;
  orderItems: CartItem[] = [];
  isBuyNow: boolean = false;
  private orderPlaced = false;
  private clearBuyNowIfNotOrdered = () => {
    if (!this.orderPlaced) {
      localStorage.removeItem('buyNowItem');
    }
  };

  constructor(
    private cartService: CartService,
    private ordersService: OrdersService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  // --- Persistent Checkout State ---
  private saveCheckoutState() {
    const state = {
      currentStep: this.currentStep,
      selectedAddress: this.selectedAddress,
      paymentMethod: this.paymentMethod,
      orderItems: this.orderItems,
    };
    localStorage.setItem('checkoutState', JSON.stringify(state));
  }

  private restoreCheckoutState() {
    const saved = localStorage.getItem('checkoutState');
    if (saved) {
      const state = JSON.parse(saved);
      this.currentStep = state.currentStep || 1;
      this.selectedAddress = state.selectedAddress || null;
      this.paymentMethod = state.paymentMethod || '';
      this.orderItems = state.orderItems || [];
      return true;
    }
    return false;
  }

  private clearCheckoutState() {
    localStorage.removeItem('checkoutState');
  }

  ngOnInit() {
    console.log('CheckoutComponent ngOnInit');
    this.authService.checkAuthentication();
    const buyNowItemStr = localStorage.getItem('buyNowItem');
    if (buyNowItemStr) {
      const parsedItems = JSON.parse(buyNowItemStr);
      // Handle both single item and array of items
      this.orderItems = Array.isArray(parsedItems) ? parsedItems : [parsedItems];
      this.isBuyNow = true;
      console.log('Buy Now items loaded:', this.orderItems);
    } else {
      this.cartService.fetchCart();
      this.cartService.cartItems$.subscribe(items => {
        this.orderItems = items;
        if (this.orderItems.length === 0) {
          this.router.navigate(['/cart']);
        }
        this.saveCheckoutState();
      });
      this.isBuyNow = false;
    }
    window.addEventListener('beforeunload', this.clearBuyNowIfNotOrdered);
  }

  ngOnDestroy() {
    this.clearBuyNowIfNotOrdered();
    window.removeEventListener('beforeunload', this.clearBuyNowIfNotOrdered);
  }

  onAddressSelected(address: any) {
    console.log('Address selected:', address);
    this.selectedAddress = address;
    this.saveCheckoutState();
    // Force change detection to update UI immediately
    this.cdr.detectChanges();
  }

  getOrderItems(): CartItem[] {
    return this.orderItems;
  }

  getTotal(): number {
    return this.orderItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  nextStep() {
    if (!this.authService.isLoggedIn()) {
      this.errorMessage = 'You must be logged in to continue.';
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }
    if (this.currentStep === 1 && this.selectedAddress) {
      this.currentStep = 2;
    } else if (this.currentStep === 2 && this.paymentMethod) {
      this.currentStep = 3;
    }
    this.saveCheckoutState();
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.saveCheckoutState();
    }
  }

  async placeOrder() {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }
    if (!this.selectedAddress || !this.paymentMethod || !this.getOrderItems().length) {
      this.errorMessage = 'Please complete all steps before placing your order.';
      return;
    }
    this.isProcessing = true;
    this.errorMessage = '';
    try {
      const orderData = {
        items: this.getOrderItems(),
        total: this.getTotal(),
        deliveryDetails: this.selectedAddress,
        paymentMethod: this.paymentMethod
      };
      this.ordersService.placeOrder(orderData).subscribe(response => {
        this.orderPlaced = true;
        if (this.isBuyNow) {
          localStorage.removeItem('buyNowItem');
        } else {
          this.cartService.clearCart().subscribe(() => {
            this.cartService.fetchCart();
          });
        }
        this.clearCheckoutState(); // Clear state on order success
        alert('Order placed successfully!');
        this.router.navigate(['/order-success', response.order.id]);
      });
    } catch (e: any) {
      this.errorMessage = e?.message || 'Failed to place order. Please try again.';
    } finally {
      this.isProcessing = false;
    }
  }

  getMin(item: CartItem): number {
    return 1;
  }

  updateQuantity(item: CartItem, change: number) {
    console.log('[updateQuantity] item:', item, 'change:', change);
    const min = this.getMin(item);
    let newQuantity = Math.max(min, Math.round(item.quantity + change));
    console.log('[updateQuantity] newQuantity:', newQuantity);
    if (newQuantity < min) newQuantity = min;

    const itemInOrder = this.orderItems.find(i => i.id === item.id && i.weight === item.weight);

    if (itemInOrder) {
      itemInOrder.quantity = newQuantity;

      if (this.isBuyNow) {
        localStorage.setItem('buyNowItem', JSON.stringify(this.orderItems));
      } else {
        this.cartService.updateQuantity(item.id, newQuantity, item.weight);
        console.log('[updateQuantity] cartService.updateQuantity called:', item.id, newQuantity);
        setTimeout(() => this.cartService.fetchCart(), 300);
      }
    } else {
      this.removeItem(item);
    }
    this.saveCheckoutState();
  }

  onQuantityChange(item: CartItem, event: Event) {
    const input = event.target as HTMLInputElement;
    const min = this.getMin(item);
    let quantity = parseInt(input.value, 10);
    
    if (isNaN(quantity) || quantity < min) {
      quantity = min;
      input.value = min.toString();
    }
    
    const itemInOrder = this.orderItems.find(i => i.id === item.id && i.weight === item.weight);
    
    if (itemInOrder) {
      itemInOrder.quantity = quantity;
      
      if (this.isBuyNow) {
        localStorage.setItem('buyNowItem', JSON.stringify(this.orderItems));
      } else {
        this.cartService.updateQuantity(item.id, quantity, item.weight);
        setTimeout(() => this.cartService.fetchCart(), 300);
      }
    }
    this.saveCheckoutState();
  }

  removeItem(item: CartItem) {
    if (this.isBuyNow) {
      // For Buy Now items, remove from local orderItems array
      this.orderItems = this.orderItems.filter(i => !(i.id === item.id && i.weight === item.weight));
      
      // Update localStorage with remaining items
      if (this.orderItems.length === 0) {
        localStorage.removeItem('buyNowItem');
        this.router.navigate(['/cart']); // Redirect to cart if no items left
      } else {
        localStorage.setItem('buyNowItem', JSON.stringify(this.orderItems));
      }
      
      console.log('Buy Now item removed:', item);
      console.log('Remaining items:', this.orderItems);
    } else {
      // For cart items, remove from backend cart
      this.cartService.removeFromCart(item.id, item.weight);
      // Force refresh cart after removal
      setTimeout(() => {
        this.cartService.fetchCart();
      }, 300);
    }
    this.saveCheckoutState();
  }

  addItem() {
    this.router.navigate(['/']); // Go back to shop/home
  }
} 