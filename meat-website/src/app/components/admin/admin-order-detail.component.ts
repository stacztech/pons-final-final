import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrdersService, Order } from '../../services/orders.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="order" class="order-detail-card">
      <div class="order-header">
        <h2>Order #{{order.id}}</h2>
        <span [ngClass]="{'status-pending': order.status === 'pending', 'status-delivered': order.status === 'delivered'}" class="status-badge">{{order.status | titlecase}}</span>
        <div class="order-date">{{order.orderDate | date:'medium'}}</div>
      </div>
      <h4>Items</h4>
      <div *ngFor="let item of order.items" class="order-item">
        <img [src]="item.image" [alt]="item.name" class="item-img" />
        <div class="item-info">
          <div class="item-name">{{item.name}}</div>
          <div class="item-weight">{{item.weight}}</div>
        </div>
        <div class="item-price">₹{{item.price}} × {{item.quantity}}</div>
        <div class="item-total">₹{{item.price * item.quantity}}</div>
      </div>
      <h4>Delivery Details</h4>
      <div class="delivery-details">
        <div><b>{{order.deliveryDetails.fullName}}</b></div>
        <div>{{order.deliveryDetails.phoneNumber}}</div>
        <div>{{order.deliveryDetails.addressLine1}}</div>
        <div>{{order.deliveryDetails.city}}, {{order.deliveryDetails.state}}</div>
        <div>PIN: {{order.deliveryDetails.pincode}}</div>
      </div>
      <h4>Order Summary</h4>
      <div class="order-summary">
        <div>Total Amount: <b>₹{{order.total}}</b></div>
        <div>Payment Method: <b>{{order.paymentMethod | titlecase}}</b></div>
        <div>Order Date: <b>{{order.orderDate | date:'mediumDate'}}</b></div>
        <div>Expected Delivery: <b>{{order.expectedDeliveryDate | date:'mediumDate'}}</b></div>
      </div>
      <div class="order-actions">
        <button *ngIf="order.status !== 'delivered'" class="btn btn-success" (click)="markAsDelivered()" [disabled]="isUpdating">
          {{ isUpdating ? 'Updating...' : 'Mark as Delivered' }}
        </button>
        <button class="btn btn-secondary" (click)="goBack()">Back to Orders</button>
      </div>
    </div>
    <div *ngIf="!order" class="order-not-found">Order not found.</div>
  `,
  styles: [`
    .order-detail-card { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.07); padding: 32px; }
    .order-header { display: flex; align-items: center; gap: 18px; margin-bottom: 18px; flex-wrap: wrap; }
    .status-badge { padding: 6px 18px; border-radius: 8px; font-weight: 600; font-size: 1rem; }
    .status-pending { background: #ffe066; color: #7a5c00; }
    .status-delivered { background: #b6fcb6; color: #1a7a1a; }
    .order-date { margin-left: auto; color: #888; font-size: 0.98rem; }
    .order-item { display: flex; align-items: center; gap: 18px; border-bottom: 1px solid #eee; padding: 12px 0; flex-wrap: wrap; }
    .item-img { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; }
    .item-info { flex: 1; min-width: 120px; }
    .item-name { font-weight: 600; font-size: 1.1rem; }
    .item-weight { color: #888; font-size: 0.98rem; }
    .item-price, .item-total { min-width: 90px; text-align: right; }
    .delivery-details { background: #fafbfc; border-radius: 8px; padding: 16px; margin-bottom: 18px; }
    .order-summary { margin-bottom: 18px; }
    .order-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 16px; }
    .btn { padding: 10px 24px; border-radius: 8px; font-size: 1rem; font-weight: 600; }
    .btn-success { background: #1a7a1a; color: #fff; border: none; }
    .btn-success:disabled { background: #b6fcb6; color: #1a7a1a; }
    .btn-secondary { background: #eee; color: #333; border: none; }
    .order-not-found { text-align: center; color: #d02653; font-size: 1.2rem; margin-top: 60px; }
    @media (max-width: 700px) {
      .order-detail-card { padding: 10px; border-radius: 8px; }
      .order-header { flex-direction: column; align-items: flex-start; gap: 8px; }
      .order-item { flex-direction: column; align-items: flex-start; gap: 8px; }
      .item-img { width: 48px; height: 48px; }
      .order-actions { flex-direction: column; gap: 8px; }
      .btn { width: 100%; }
    }
  `]
})
export class AdminOrderDetailComponent implements OnInit {
  order: Order | undefined;
  isUpdating = false;

  constructor(private route: ActivatedRoute, private ordersService: OrdersService, private router: Router) {}

  ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.ordersService.getOrderById(orderId).subscribe(response => {
        this.order = response.order;
      });
    }
  }

  markAsDelivered() {
    if (!this.order) return;
    this.isUpdating = true;
    this.ordersService.updateOrderStatus(this.order.id, 'delivered').subscribe({
      next: () => {
        this.order!.status = 'delivered';
        this.isUpdating = false;
      },
      error: () => {
        // Optionally show error to user
        this.isUpdating = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin/orders']);
  }
} 