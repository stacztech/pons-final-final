import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DeliveryAddressComponent } from '../checkout/delivery-address.component';
import { CartService } from '../../services/cart.service';
import { OrdersService, Order as RealOrder } from '../../services/orders.service';
import { AuthService, User as AuthUser, Address as AuthAddress } from '../../services/auth.service';
import { ReviewService, Review } from '../../services/review.service';
import { Observable, Subject, BehaviorSubject, of } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { map, filter, switchMap, takeUntil, debounceTime, distinctUntilChanged, catchError, tap } from 'rxjs/operators';

// Extend the AuthService User interface with our additional properties
interface ProfileUser extends AuthUser {
  joinDate?: string;
  dob?: string;
}

// Use the Address type from AuthService
type Address = AuthAddress;

interface UserSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, DeliveryAddressComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  activeSection = 'orders';
  user: ProfileUser = {
    id: '',
    name: '',
    email: '',
    addresses: [],
    joinDate: new Date().toISOString()
  };
  orders: RealOrder[] = [];
  addresses: Address[] = [];
  settings: UserSettings = {
    emailNotifications: true,
    smsNotifications: false
  };

  // Form groups with definite assignment
  passwordForm!: FormGroup;
  profileForm!: FormGroup;

  // UI state
  showPasswordForm = false;
  passwordError = '';
  passwordSuccess = '';
  isLoading = false;
  errorMessage = '';
  resetLinkMessage = '';
  resetLinkError = '';

  constructor(
    private router: Router,
    private cartService: CartService,
    private ordersService: OrdersService,
    private authService: AuthService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {
    this.initializeForms();
  }

  private initializeForms(): void {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });

    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern('^[0-9]{10}$')]],
      address: [''],
      dob: [''],
      joinDate: ['']
    });
  }

  private passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmNewPassword')?.value
      ? null : { mismatch: true };
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadOrders();
    this.loadAddresses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserData(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      // Cast the current user to our extended type and add our additional properties
      const profileUser: ProfileUser = {
        ...currentUser,
        joinDate: (currentUser as any).joinDate || new Date().toISOString(),
        dob: (currentUser as any).dob || ''
      };
      this.user = profileUser;
      
      this.profileForm.patchValue({
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        dob: profileUser.dob,
        joinDate: profileUser.joinDate
      });
    }
  }

  loadOrders(): void {
    this.isLoading = true;
    try {
      this.ordersService.getOrders().subscribe(response => {
        this.orders = this.processOrders(response.orders);
        this.isLoading = false;
      });
    } catch (error) {
      this.errorMessage = 'Failed to load orders. Please try again later.';
      this.isLoading = false;
      console.error('Error loading orders:', error);
    }
  }

  private processOrders(orders: RealOrder[]): RealOrder[] {
    const now = new Date();
    return orders.map(order => {
      const processedOrder = {
        ...order,
        expectedDeliveryDate: order.expectedDeliveryDate || new Date().toISOString()
      };

      if (processedOrder.expectedDeliveryDate && 
          new Date(processedOrder.expectedDeliveryDate) < now && 
          processedOrder.status !== 'delivered') {
        this.ordersService.updateOrderStatus(processedOrder.id, 'delivered').subscribe({
          next: () => {
            this.loadOrders();
          },
          error: (err: any) => {
            console.error('Error updating order status:', err);
          }
        });
        processedOrder.status = 'delivered';
      }

      return processedOrder;
    });
  }

  loadAddresses(): void {
    // Implement address loading logic here
    // This would typically call an address service
  }

  savePersonalInfo(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const formData = this.profileForm.value;
    this.authService.updateProfile(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: (res) => {
          this.user = { ...this.user, ...formData };
          this.errorMessage = '';
      },
      error: (err) => {
          this.errorMessage = err.message || 'Failed to update profile. Please try again.';
          console.error('Error updating profile:', err);
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword } = this.passwordForm.value;
    this.passwordError = '';
    this.passwordSuccess = '';

    // Remove or comment out:
    // this.authService.changePassword(currentPassword, newPassword)
    //   .subscribe({
    //     next: () => { ... },
    //     error: (err: any) => { ... }
    //   });
  }

  // Helper methods for form validation
  get passwordFormControls() {
    return this.passwordForm.controls;
  }

  get profileFormControls() {
    return this.profileForm.controls;
  }

  sendPasswordResetLink() {
    this.resetLinkMessage = '';
    this.resetLinkError = '';
    if (!this.user.email) {
      this.resetLinkError = 'No email found for your account.';
      return;
    }
    this.authService.sendPasswordResetEmail(this.user.email)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.resetLinkMessage = 'Password reset link has been sent to your email address.';
        },
        error: (err) => {
          this.resetLinkError = err.message || 'Failed to send reset link. Please try again.';
        }
      });
  }
} 