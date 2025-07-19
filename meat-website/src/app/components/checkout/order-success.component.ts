import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrdersService } from '../../services/orders.service';

@Component({
  selector: 'app-order-success',
  template: `
    <div class="container my-5">
      <h2>Thank you for your order!</h2>
      <div *ngIf="order; else notFound">
        <p>Your order <b>#{{order.id}}</b> has been placed successfully.</p>
        <h3>Order Summary</h3>
        <ul>
          <li *ngFor="let item of order.items">
            {{item.name}} x{{item.quantity}} - ₹{{item.price * item.quantity}}
          </li>
        </ul>
        <div><b>Total:</b> ₹{{order.total}}</div>
        <div><b>Delivery Address:</b> {{order.deliveryDetails.fullName}}, {{order.deliveryDetails.addressLine1}}, {{order.deliveryDetails.city}}, {{order.deliveryDetails.state}}, {{order.deliveryDetails.pincode}}</div>
        <div><b>Payment Method:</b> {{order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}}</div>
        <button class="btn btn-primary" (click)="goToOrders()">Go to My Orders</button>
      </div>
      <ng-template #notFound>
        <p>Order not found.</p>
      </ng-template>
    </div>
  `
})
export class OrderSuccessComponent {
  order: any;
  constructor(private route: ActivatedRoute, private ordersService: OrdersService, private router: Router) {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.ordersService.getOrderById(orderId).subscribe({
        next: (response) => {
          this.order = response.order;
        },
        error: () => {
          this.order = null;
        }
      });
    }
  }
  goToOrders() {
    this.router.navigate(['/orders']);
  }
} 