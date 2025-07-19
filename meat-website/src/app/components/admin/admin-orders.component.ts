import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersService, Order } from '../../services/orders.service';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css']
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  searchTerm: string = '';
  filterStatus: string = '';
  filterUser: string = '';
  filterDate: string = '';
  users: string[] = [];
  userNames: string[] = [];
  userIdToName: { [userId: string]: string } = {};
  // Pagination
  page = 1;
  pageSize = 8;
  totalPages = 1;
  isUpdating: string | null = null;

  constructor(
    private ordersService: OrdersService,
    private notificationService: NotificationService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUsersAndOrders();
  }

  loadUsersAndOrders() {
    this.authService.getAllUsers().subscribe({
      next: (response) => {
        const users: User[] = response.users;
        this.userIdToName = {};
        users.forEach(u => {
          // Support both _id and id fields from backend
          const userId = (u as any)._id || u.id;
          this.userIdToName[userId] = u.name;
        });
        this.loadOrders();
      },
      error: () => {
        this.userIdToName = {};
        this.loadOrders();
      }
    });
  }

  loadOrders() {
    this.ordersService.getOrders().subscribe(response => {
      this.orders = response.orders;
      this.users = Array.from(new Set(this.orders.map(o => o.userId)));
      // Build userNames array for dropdown (only users who have orders)
      this.userNames = this.users.map(uid => this.userIdToName[uid]).filter(name => !!name);
      this.applyFilters();
    });
  }

  applyFilters() {
    let filtered = this.orders;
    if (this.searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (this.userIdToName[order.userId] || '').toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    if (this.filterStatus) {
      filtered = filtered.filter(order => order.status === this.filterStatus);
    }
    if (this.filterUser) {
      filtered = filtered.filter(order => this.userIdToName[order.userId] === this.filterUser);
    }
    if (this.filterDate) {
      filtered = filtered.filter(order => order.orderDate.startsWith(this.filterDate));
    }
    this.filteredOrders = filtered;
    this.totalPages = Math.ceil(this.filteredOrders.length / this.pageSize) || 1;
    if (this.page > this.totalPages) this.page = this.totalPages;
  }

  get pagedOrders() {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredOrders.slice(start, start + this.pageSize);
  }

  setPage(p: number) {
    if (p >= 1 && p <= this.totalPages) {
      this.page = p;
    }
  }

  markAsDelivered(orderId: string) {
    this.isUpdating = orderId;
    this.ordersService.updateOrderStatus(orderId, 'delivered').subscribe({
      next: () => {
        this.notificationService.show('Order marked as delivered!', 'success');
        this.loadOrders();
        this.isUpdating = null;
      },
      error: () => {
        this.notificationService.show('Failed to update order status.', 'error');
        this.isUpdating = null;
      }
    });
  }

  viewOrderDetail(orderId: string) {
    this.router.navigate(['/admin/orders', orderId]);
  }
} 