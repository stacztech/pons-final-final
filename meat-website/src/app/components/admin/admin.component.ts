import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminCustomersComponent } from './admin-customers.component';
import { AdminOrdersComponent } from './admin-orders.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, AdminCustomersComponent, AdminOrdersComponent],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {
  activeTab: 'customers' | 'orders' = 'customers';
  private refreshInterval: any;

  @ViewChild(AdminOrdersComponent) ordersComp?: AdminOrdersComponent;
  @ViewChild(AdminCustomersComponent) customersComp?: AdminCustomersComponent;

  ngOnInit() {
    // Set up auto-refresh every 5 seconds
    this.refreshInterval = setInterval(() => {
      console.log('Admin page auto-refreshed');
      // Refresh orders if the component is present
      this.ordersComp?.loadOrders();
      // Refresh customers if the component is present
      if (this.customersComp) {
        this.customersComp.authService.getAllUsers().subscribe({
          next: (response) => {
            this.customersComp!.customers = response.users;
          },
          error: () => {
            this.customersComp!.customers = [];
          }
        });
      }
    }, 5000);
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
} 