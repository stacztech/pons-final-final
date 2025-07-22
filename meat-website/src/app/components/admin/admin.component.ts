import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminCustomersComponent } from './admin-customers.component';
import { AdminOrdersComponent } from './admin-orders.component';
import { AuthService } from '../../services/auth.service';

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
  isAdmin: boolean = false;

  @ViewChild(AdminOrdersComponent) ordersComp?: AdminOrdersComponent;
  @ViewChild(AdminCustomersComponent) customersComp?: AdminCustomersComponent;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Check admin authentication with backend validation
    this.checkAdminStatus();
  }

  private checkAdminStatus() {
    this.authService.checkAdminAuthWithBackend().subscribe(result => {
      if (result.isAdmin) {
        this.isAdmin = true;
        console.log('Admin access granted for user:', result.user?.email);
        // Only set up auto-refresh if user is confirmed admin
        this.setupAutoRefresh();
      } else {
        console.log('Access denied: User is not admin');
        this.isAdmin = false;
        // Clear any existing refresh interval
        if (this.refreshInterval) {
          clearInterval(this.refreshInterval);
          this.refreshInterval = null;
        }
        this.router.navigate(['/login']);
      }
    });
  }

  private setupAutoRefresh() {
    // Set up auto-refresh every 5 seconds
    this.refreshInterval = setInterval(() => {
      console.log('Admin page auto-refreshed');
      
      // First check if user still exists in database
      this.authService.forceCheckUserExists().subscribe(userExists => {
        if (!userExists) {
          console.log('User no longer exists in database - redirecting to login');
          this.isAdmin = false;
          if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
          }
          this.router.navigate(['/login']);
          return;
        }
        
        // User exists, now check if still admin
        this.authService.checkAdminAuthWithBackend().subscribe(result => {
          if (!result.isAdmin) {
            console.log('User is no longer admin - redirecting');
            this.isAdmin = false;
            if (this.refreshInterval) {
              clearInterval(this.refreshInterval);
              this.refreshInterval = null;
            }
            this.router.navigate(['/login']);
            return;
          }
          
          // User is still admin, proceed with refresh
          // Refresh orders if the component is present
          this.ordersComp?.loadOrders();
          // Refresh customers if the component is present
          if (this.customersComp) {
            this.customersComp.authService.getAllUsers().subscribe({
              next: (response) => {
                this.customersComp!.customers = response.users;
              },
              error: (error) => {
                console.log('Error fetching users:', error);
                this.customersComp!.customers = [];
              }
            });
          }
        });
      });
    }, 5000);
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  // Method to manually refresh admin status (can be called from other components)
  refreshAdminStatus() {
    this.checkAdminStatus();
  }
} 