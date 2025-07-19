import { Component, OnInit } from '@angular/core';
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
                <ng-container *ngIf="currentStep === 1 && getOrderItems().length === 1">
                  <div class="d-flex align-items-center mb-3">
                    <img [src]="getOrderItems()[0].image" [alt]="getOrderItems()[0].name" style="width:90px;height:90px;object-fit:cover;border-radius:6px;margin-right:18px;">
                    <div class="flex-grow-1">
                      <div style="font-size:1.2rem;font-weight:600;">{{getOrderItems()[0].name}}</div>
                      <div style="color:#555;">Weight: {{getOrderItems()[0].weight}}</div>
                      <div class="d-flex align-items-center mt-2">
                        <button class="btn btn-sm btn-outline-secondary" (click)="updateQuantity(getOrderItems()[0], -1)" [disabled]="getOrderItems()[0].quantity <= getMin(getOrderItems()[0])">-</button>
                        <input type="number" class="form-control mx-2 quantity-input" style="width:50px;display:inline-block;" [value]="getOrderItems()[0].quantity < getMin(getOrderItems()[0]) ? getMin(getOrderItems()[0]) : getOrderItems()[0].quantity" [min]="getMin(getOrderItems()[0])" [step]="1" (change)="onQuantityChange(getOrderItems()[0], $event)">
                        <button class="btn btn-sm btn-outline-secondary" (click)="updateQuantity(getOrderItems()[0], 1)">+</button>
                        <button class="btn btn-sm btn-danger ms-3" (click)="removeItem(getOrderItems()[0])">Remove</button>
                      </div>
                    </div>
                  </div>
                </ng-container>
                <ng-container *ngIf="!(currentStep === 1 && getOrderItems().length === 1)">
                  <div *ngFor="let item of getOrderItems()" class="d-flex justify-content-between mb-2">
                    <span>{{item.name}} ({{item.weight}}) x {{item.quantity}}</span>
                    <span>₹{{item.price * item.quantity}}</span>
                  </div>
                </ng-container>
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
            <div *ngFor="let item of getOrderItems()" class="d-flex justify-content-between align-items-center mb-2">
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
              <ng-container *ngIf="currentStep === 1 && getOrderItems().length === 1">
                <div class="d-flex align-items-center mb-3">
                  <img [src]="getOrderItems()[0].image" [alt]="getOrderItems()[0].name" style="width:90px;height:90px;object-fit:cover;border-radius:6px;margin-right:18px;">
                  <div class="flex-grow-1">
                    <div style="font-size:1.2rem;font-weight:600;">{{getOrderItems()[0].name}}</div>
                    <div style="color:#555;">Weight: {{getOrderItems()[0].weight}}</div>
                    <div class="d-flex align-items-center mt-2">
                      <button class="btn btn-sm btn-outline-secondary" (click)="updateQuantity(getOrderItems()[0], -1)" [disabled]="getOrderItems()[0].quantity <= getMin(getOrderItems()[0])">-</button>
                      <input type="number" class="form-control mx-2 quantity-input" style="width:50px;display:inline-block;" [value]="getOrderItems()[0].quantity < getMin(getOrderItems()[0]) ? getMin(getOrderItems()[0]) : getOrderItems()[0].quantity" [min]="getMin(getOrderItems()[0])" [step]="1" (change)="onQuantityChange(getOrderItems()[0], $event)">
                      <button class="btn btn-sm btn-outline-secondary" (click)="updateQuantity(getOrderItems()[0], 1)">+</button>
                      <button class="btn btn-sm btn-danger ms-3" (click)="removeItem(getOrderItems()[0])">Remove</button>
                    </div>
                  </div>
                </div>
              </ng-container>
              <ng-container *ngIf="!(currentStep === 1 && getOrderItems().length === 1)">
                <div *ngFor="let item of getOrderItems()" class="d-flex justify-content-between mb-2">
                  <span>{{item.name}} ({{item.weight}}) x {{item.quantity}}</span>
                  <span>₹{{item.price * item.quantity}}</span>
                </div>
              </ng-container>
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
        padding: 0.5rem;
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
export class CheckoutComponent implements OnInit {
  currentStep = 1;
  selectedAddress: any = null;
  paymentMethod: string = '';
  isProcessing: boolean = false;
  errorMessage: string = '';
  buyNowItem: CartItem | null = null;

  constructor(
    private cartService: CartService,
    private ordersService: OrdersService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check authentication on load
    this.authService.checkAuthentication();
    this.buyNowItem = this.cartService.getBuyNowItem();
    if (this.getOrderItems().length === 0) {
      this.router.navigate(['/cart']);
    }
  }

  onAddressSelected(address: any) {
    this.selectedAddress = address;
  }

  getOrderItems(): CartItem[] {
    if (this.buyNowItem) return [this.buyNowItem];
    return this.cartService.getCartItems();
  }

  getTotal(): number {
    return this.cartService.getTotal();
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
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
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
        if (this.buyNowItem) this.cartService.clearBuyNowItem();
        this.cartService.clearCart();
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
    const min = this.getMin(item);
    let newQuantity = Math.max(min, Math.round(item.quantity + change));
    if (newQuantity < min) newQuantity = min;
    if (this.buyNowItem && this.buyNowItem.id === item.id) {
      if (newQuantity >= min) {
        this.buyNowItem = { ...this.buyNowItem, quantity: newQuantity };
        this.cartService.setBuyNowItem(this.buyNowItem);
      } else {
        this.removeItem(item);
      }
    } else {
      if (newQuantity >= min) {
        this.cartService.updateQuantity(item.id, newQuantity);
      } else {
        this.removeItem(item);
      }
    }
  }

  onQuantityChange(item: CartItem, event: Event) {
    const input = event.target as HTMLInputElement;
    const min = this.getMin(item);
    const quantity = parseInt(input.value, 10);
    if (!isNaN(quantity) && quantity >= min) {
      this.updateQuantity(item, quantity - item.quantity);
    } else if (!isNaN(quantity) && quantity < min) {
      this.updateQuantity(item, min - item.quantity);
      input.value = min.toString();
    } else {
      input.value = item.quantity.toString();
    }
  }

  removeItem(item: CartItem) {
    if (this.buyNowItem && this.buyNowItem.id === item.id) {
      this.cartService.clearBuyNowItem();
      this.buyNowItem = null;
      // Optionally, navigate away or show empty state
      this.router.navigate(['/cart']);
    } else {
      this.cartService.removeFromCart(item.id);
    }
  }

  addItem() {
    this.router.navigate(['/']); // Go back to shop/home
  }
} 