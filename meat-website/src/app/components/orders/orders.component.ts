import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { OrdersService, Order } from '../../services/orders.service';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container my-5">
      <h1>{{ isAdmin ? 'All Orders' : 'My Orders' }}</h1>

      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div *ngIf="!isLoading && orders.length === 0" class="text-center py-5">
        <h3>No orders yet</h3>
        <p>Start shopping to place your first order!</p>
        <a routerLink="/" class="btn btn-primary">Browse Products</a>
      </div>

      <div *ngIf="!isLoading && orders.length > 0" class="orders-list">
        <div *ngFor="let order of orders" class="order-card">
          <div class="order-header">
            <div class="order-id">Order #{{ order.id }}</div>
            <div class="order-date">Expected Delivery: {{ order.expectedDeliveryDate | date:'mediumDate' }}</div>
            <div class="order-status" [ngClass]="order.status.toLowerCase()">
              {{ order.status }}
            </div>
          </div>
          <div class="order-items">
            <div *ngFor="let item of order.items" class="order-item">
              <span>{{ item.name }}</span>
              <span>{{ item.quantity }}x</span>
              <span>₹{{ item.price }}</span>
            </div>
          </div>
          <div class="order-footer">
            <div class="order-total">Total: ₹{{ order.total }}</div>
            <div class="order-actions">
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 18px;
      max-width: 800px;
      margin: 0 auto;
    }
    .order-card {
      background: #fafbfc;
      border: 1px solid #f0f0f0;
      border-radius: 8px;
      padding: 18px 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    }
    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      flex-wrap: wrap;
      gap: 8px;
    }
    .order-id {
      font-weight: 600;
      color: #2c3e50;
    }
    .order-date {
      font-size: 0.95rem;
      color: #888;
    }
    .order-status {
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 500;
      text-transform: capitalize;
      background: #f0f0f0;
      color: #2c3e50;
    }
    .order-status.delivered {
      background: #e8f5e9;
      color: #00A642;
    }
    .order-status.pending {
      background: #fff3cd;
      color: #f8b500;
    }
    .order-items {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 10px;
    }
    .order-item {
      display: flex;
      justify-content: space-between;
      font-size: 1rem;
      color: #444;
    }
    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
    }
    .order-total {
      font-weight: 600;
      color: #E31837;
    }
    .order-actions {
      display: flex;
      gap: 10px;
    }
    .btn-reorder, .btn-review {
      background: #E31837;
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 6px 14px;
      font-size: 0.98rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-review {
      background: #f8b500;
      color: #fff;
    }
    .btn-reorder:hover, .btn-review:hover {
      opacity: 0.9;
    }
  `]
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  errorMessage: string | null = null;
  isLoading = true;
  isCancelling = false;
  isAdmin = false;

  constructor(
    private ordersService: OrdersService,
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.ordersService.getOrders().subscribe(
      (response: any) => {
        // Support both { orders: [...] } and [...] directly
        const ordersArray = Array.isArray(response)
          ? response
          : Array.isArray(response.orders)
            ? response.orders
            : [];
        this.orders = ordersArray.map((order: any) => ({
          ...order,
          id: order.id || order._id,
          items: order.items || [],
          expectedDeliveryDate: order.expectedDeliveryDate || order.deliveryDate || '',
          status: order.status || 'pending',
          total: order.total || order.amount || 0
        }));
        console.log('Fetched orders:', this.orders);
        this.isLoading = false;
      },
      err => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load orders.';
        console.error('Error fetching orders:', err);
      }
    );
  }

  private loadOrders() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.isLoading = false;
      return;
    }
    if (this.isAdmin) {
      this.ordersService.getOrders().subscribe(response => {
        this.orders = response.orders;
        this.isLoading = false;
      });
    } else {
      this.ordersService.getOrders().subscribe(response => {
        this.orders = response.orders;
        this.isLoading = false;
      });
    }
  }

  async cancelOrder(orderId: string) {
    this.isCancelling = true;
    this.ordersService.cancelOrder(orderId).subscribe({
      next: (response) => {
        this.loadOrders();
        this.isCancelling = false;
      },
      error: (error) => {
        console.error('Error cancelling order:', error);
        alert('Failed to cancel order. Please try again.');
        this.isCancelling = false;
      }
    });
  }

  getStatusBadgeClass(status: Order['status']): string {
    const classes = {
      'pending': 'bg-warning text-dark',
      'processing': 'bg-info text-dark',
      'shipped': 'bg-primary',
      'delivered': 'bg-success',
      'cancelled': 'bg-danger'
    };
    return 'badge ' + (classes[status] || 'bg-secondary');
  }

  markAsDelivered(orderId: string) {
    if (!this.isAdmin) return;
    this.ordersService.updateOrderStatus(orderId, 'delivered').subscribe({
      next: () => this.loadOrders(),
      error: (error) => {
        alert('Failed to update order status.');
        console.error(error);
      }
    });
  }
} 