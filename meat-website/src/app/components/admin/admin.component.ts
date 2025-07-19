import { Component } from '@angular/core';
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
export class AdminComponent {
  activeTab: 'customers' | 'orders' = 'customers';
} 