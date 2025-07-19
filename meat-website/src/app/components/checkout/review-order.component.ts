import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrdersService } from '../../services/orders.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-review-order',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="review-order-container">
      <div class="review-order-card">
        <h2>Review Your Order</h2>
        <div *ngIf="cartItems && address && paymentMethod">
          <h3>Items:</h3>
          <ul>
            <li *ngFor="let item of cartItems">
              {{item.name}} ({{item.weight}}) x{{item.quantity}} - ₹{{item.price * item.quantity}}
            </li>
          </ul>
          <h3>Delivery Address:</h3>
          <div>{{address.fullName}}</div>
          <div>{{address.addressLine1}}, {{address.city}}, {{address.state}}, {{address.pincode}}</div>
          <div>Phone: {{address.phoneNumber}}</div>
          <h3>Payment Method:</h3>
          <div>{{paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod}}</div>
          <h3>Total: ₹{{total}}</h3>
          <button class="btn-confirm" (click)="confirmOrder()" [disabled]="isPlacingOrder">
            {{isPlacingOrder ? 'Placing Order...' : 'Confirm Order'}}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .review-order-container {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 60vh;
      background: #f8f8f8;
      padding: 40px 0;
    }
    .review-order-card {
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(44, 62, 80, 0.08);
      padding: 36px 32px 32px 32px;
      max-width: 480px;
      width: 100%;
      margin: 0 auto;
    }
    .review-order-card h2 {
      color: #E31837;
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 18px;
      text-align: center;
    }
    .review-order-card h3 {
      color: #2c3e50;
      font-size: 1.15rem;
      font-weight: 600;
      margin-top: 18px;
      margin-bottom: 8px;
    }
    .review-order-card ul {
      padding-left: 18px;
      margin-bottom: 0;
    }
    .review-order-card li {
      font-size: 1.08rem;
      color: #333;
      margin-bottom: 6px;
    }
    .review-order-card div {
      font-size: 1.05rem;
      color: #444;
      margin-bottom: 2px;
    }
    .btn-confirm {
      background: #E31837;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 12px 32px;
      font-size: 1.1rem;
      font-weight: 600;
      margin-top: 24px;
      cursor: pointer;
      transition: background 0.2s, box-shadow 0.2s;
      box-shadow: 0 2px 8px rgba(227, 24, 55, 0.08);
      display: block;
      width: 100%;
    }
    .btn-confirm:disabled {
      background: #ccc;
      color: #fff;
      cursor: not-allowed;
    }
    .btn-confirm:not(:disabled):hover {
      background: #c41530;
      box-shadow: 0 4px 16px rgba(227, 24, 55, 0.14);
    }
    @media (max-width: 600px) {
      .review-order-card {
        padding: 18px 6px 18px 6px;
        border-radius: 10px;
      }
      .review-order-card h2 {
        font-size: 1.3rem;
      }
    }
  `]
})
export class ReviewOrderComponent {
  address: any;
  paymentMethod: string = '';
  cartItems: any[] = [];
  total: number = 0;
  isPlacingOrder = false;

  constructor(private router: Router, private ordersService: OrdersService, private cartService: CartService) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state as any;
    if (state) {
      this.address = state.address;
      this.paymentMethod = state.paymentMethod;
      this.cartItems = state.cartItems;
      this.total = state.total;
    } else {
      const orderItems = this.cartService.getCartItems();
      if (orderItems && orderItems.length > 0) {
        this.cartItems = orderItems;
        this.total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      } else {
        // Fallback: read from localStorage
        const saved = localStorage.getItem('reviewOrder');
        if (saved) {
          const data = JSON.parse(saved);
          this.address = data.address;
          this.paymentMethod = data.paymentMethod;
          this.cartItems = data.cartItems;
          this.total = data.total;
          }
        }
      }
    // If no cart items, redirect to cart
    if (!this.cartItems || this.cartItems.length === 0) {
      this.router.navigate(['/cart']);
    }
  }

  async confirmOrder() {
    if (!this.address || !this.paymentMethod || !this.cartItems.length) return;
    this.isPlacingOrder = true;
    try {
      const orderData = {
        items: this.cartItems,
        total: this.total,
        deliveryDetails: this.address,
        paymentMethod: this.paymentMethod
      };
      this.ordersService.placeOrder(orderData).subscribe(response => {
        this.cartService.clearCart(); // Clear cart after order
        this.router.navigate(['/order-success', response.order.id]);
      });
    } catch (e) {
      alert('Failed to place order.');
    } finally {
      this.isPlacingOrder = false;
    }
  }
} 