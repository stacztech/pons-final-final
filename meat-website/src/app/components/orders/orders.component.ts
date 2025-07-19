import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { OrdersService, Order } from '../../services/orders.service';
import { AuthService } from '../../services/auth.service';

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
        <div *ngFor="let order of orders" class="card mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <div>
              <h5 class="mb-0">Order #{{ order.id }}</h5>
              <small class="text-muted">{{ order.orderDate | date:'medium' }}</small>
            </div>
            <span [class]="'badge ' + getStatusBadgeClass(order.status)">
              {{ order.status | titlecase }}
            </span>
          </div>

          <div class="card-body">
            <!-- Order Items -->
            <div class="mb-4">
              <h6>Items</h6>
              <div class="table-responsive">
                <table class="table table-borderless">
                  <tbody>
                    <tr *ngFor="let item of order.items">
                      <td style="width: 80px">
                        <img [src]="item.image" [alt]="item.name" class="img-fluid rounded">
                      </td>
                      <td>
                        <h6 class="mb-0">{{ item.name }}</h6>
                        <small>{{ item.weight }}</small>
                      </td>
                      <td class="text-end">
                        <div>₹{{ item.price }} × {{ item.quantity }}</div>
                        <strong>₹{{ item.price * item.quantity }}</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Delivery Details -->
            <div class="mb-4">
              <h6>Delivery Details</h6>
              <div class="card bg-light">
                <div class="card-body">
                  <p class="mb-1"><strong>{{ order.deliveryDetails.fullName }}</strong></p>
                  <p class="mb-1">{{ order.deliveryDetails.phoneNumber }}</p>
                  <p class="mb-1">{{ order.deliveryDetails.addressLine1 }}</p>
                  <p *ngIf="order.deliveryDetails.addressLine2" class="mb-1">
                    {{ order.deliveryDetails.addressLine2 }}
                  </p>
                  <p class="mb-1">
                    {{ order.deliveryDetails.city }}, {{ order.deliveryDetails.state }}
                  </p>
                  <p class="mb-0">PIN: {{ order.deliveryDetails.pincode }}</p>
                </div>
              </div>
            </div>

            <!-- Order Summary -->
            <div class="mb-4">
              <h6>Order Summary</h6>
              <div class="d-flex justify-content-between">
                <span>Total Amount</span>
                <strong>₹{{ order.total }}</strong>
              </div>
              <div class="d-flex justify-content-between">
                <span>Payment Method</span>
                <span>{{ order.paymentMethod | titlecase }}</span>
              </div>
              <div class="d-flex justify-content-between">
                <span>Order Date</span>
                <span>{{ order.orderDate | date:'mediumDate' }}</span>
              </div>
              <div *ngIf="order.expectedDeliveryDate" class="d-flex justify-content-between">
                <span>Expected Delivery</span>
                <span>{{ order.expectedDeliveryDate | date:'mediumDate' }}</span>
              </div>
            </div>

            <!-- Admin Actions -->
            <div *ngIf="isAdmin && order.status !== 'delivered'">
              <button class="btn btn-success" (click)="markAsDelivered(order.id)">Mark as Delivered</button>
            </div>

            <!-- User Actions -->
            <div *ngIf="!isAdmin && ['pending', 'processing'].includes(order.status)">
              <button 
                class="btn btn-danger"
                (click)="cancelOrder(order.id)"
                [disabled]="isCancelling"
              >
                {{ isCancelling ? 'Cancelling...' : 'Cancel Order' }}
              </button>
            </div>

            <!-- Show review button if delivered -->
            <div *ngIf="order.status === 'delivered'" class="mt-2">
              <button class="btn btn-primary" (click)="goToReview(order.id)">Write a Review</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .orders-list {
      max-width: 800px;
      margin: 0 auto;
    }
  `]
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  isLoading = true;
  isCancelling = false;
  isAdmin = false;

  constructor(
    private ordersService: OrdersService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.isAdmin = this.authService.isAdmin();
    this.loadOrders();
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

  goToReview(orderId: string) {
    this.router.navigate(['/profile'], { queryParams: { reviewOrderId: orderId } });
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