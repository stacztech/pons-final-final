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
  reviews: Review[] = [];
  addresses: Address[] = [];
  settings: UserSettings = {
    emailNotifications: true,
    smsNotifications: false
  };

  // Form groups with definite assignment
  passwordForm!: FormGroup;
  profileForm!: FormGroup;
  reviewForm!: FormGroup;

  // UI state
  showPasswordForm = false;
  passwordError = '';
  passwordSuccess = '';
  showReviewForm = false;
  editingReview = false;
  currentReviewId: string | null = null;
  currentOrderForReview: RealOrder | null = null;
  isLoading = false;
  errorMessage = '';
  resetLinkMessage = '';
  resetLinkError = '';

  constructor(
    private router: Router,
    private cartService: CartService,
    private ordersService: OrdersService,
    private authService: AuthService,
    private reviewService: ReviewService,
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

    this.reviewForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  private passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmNewPassword')?.value
      ? null : { mismatch: true };
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadOrders();
    this.loadReviews();
    this.loadAddresses();
    // Check for reviewOrderId in query params
    this.route.queryParams.subscribe(params => {
      const reviewOrderId = params['reviewOrderId'];
      if (reviewOrderId && this.orders.length > 0) {
        const order = this.orders.find(o => o.id === reviewOrderId);
        if (order && order.status === 'delivered') {
          this.writeReview(order);
        }
      }
    });
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

  loadReviews(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.reviewService.getReviewsByUserId(currentUser.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (reviews) => this.reviews = reviews,
          error: (error) => {
            this.errorMessage = 'Failed to load reviews. Please try again later.';
            console.error('Error loading reviews:', error);
          }
      });
    }
  }

  loadAddresses(): void {
    // Implement address loading logic here
    // This would typically call an address service
  }

  reorder(order: RealOrder): void {
    try {
      console.log('Reordering order:', order);
      this.router.navigate(['/checkout'], {
        state: {
          cartItems: order.items,
          paymentMethod: order.paymentMethod,
          total: order.total
        }
      }).then(success => {
        if (!success) {
          this.notificationService.show('Failed to redirect to checkout. Please try again.', 'error');
        }
      });
    } catch (err) {
      this.notificationService.show('Failed to redirect to checkout. Please try again.', 'error');
      console.error('Reorder navigation error:', err);
    }
  }

  writeReview(order: RealOrder): void {
    // Check if order is delivered
    if (order.status !== 'delivered') {
      this.errorMessage = 'You can only review delivered orders.';
      return;
    }

    // Check if review already exists
    const existingReview = this.reviews.find(review => review.orderId === order.id);
    if (existingReview) {
      this.editReview(existingReview);
      return;
    }

    this.currentOrderForReview = order;
    this.editingReview = false;
    this.currentReviewId = null;
    this.reviewForm.reset({
      rating: 0,
      comment: ''
    });
    this.showReviewForm = true;
  }

  editReview(review: Review): void {
    this.editingReview = true;
    this.currentReviewId = review.id;
    this.currentOrderForReview = this.orders.find(order => order.id === review.orderId) || null;
    
    if (this.currentOrderForReview) {
      this.reviewForm.patchValue({
        rating: review.rating,
        comment: review.comment
      });
    this.showReviewForm = true;
    } else {
      this.errorMessage = 'Order not found.';
    }
  }

  deleteReview(review: Review): void {
    if (confirm('Are you sure you want to delete this review?')) {
      this.reviewService.deleteReview(review.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (success) => {
        if (success) {
          this.loadReviews();
          this.notificationService.show('Review deleted successfully!', 'success');
        } else {
              this.errorMessage = 'Failed to delete review. Please try again.';
              this.notificationService.show('Failed to delete review.', 'error');
            }
          },
          error: (error) => {
            this.errorMessage = 'Failed to delete review. Please try again later.';
            this.notificationService.show('Failed to delete review.', 'error');
            console.error('Error deleting review:', error);
        }
      });
    }
  }

  submitReviewForm(): void {
    if (this.reviewForm.invalid || !this.currentOrderForReview) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    const reviewData = {
      ...this.reviewForm.value,
      orderId: this.currentOrderForReview.id,
      userId: this.user.id,
      date: new Date().toISOString()
    };

    if (this.editingReview && this.currentReviewId) {
      this.reviewService.updateReview(this.currentReviewId, reviewData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (success) => {
        if (success) {
          this.loadReviews();
          this.cancelReviewForm();
          this.errorMessage = '';
          this.notificationService.show('Review updated successfully!', 'success');
        } else {
              this.errorMessage = 'Failed to update review. Please try again.';
              this.notificationService.show('Failed to update review.', 'error');
            }
          },
          error: (error) => {
            this.errorMessage = 'Failed to update review. Please try again later.';
            this.notificationService.show('Failed to update review.', 'error');
            console.error('Error updating review:', error);
        }
      });
    } else {
      this.reviewService.submitReview(reviewData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
        this.loadReviews();
        this.cancelReviewForm();
            this.errorMessage = '';
            this.notificationService.show('Review submitted successfully!', 'success');
          },
          error: (error) => {
            this.errorMessage = 'Failed to submit review. Please try again later.';
            this.notificationService.show('Failed to submit review.', 'error');
            console.error('Error submitting review:', error);
          }
      });
    }
  }

  cancelReviewForm(): void {
    this.showReviewForm = false;
    this.editingReview = false;
    this.currentReviewId = null;
    this.currentOrderForReview = null;
    this.reviewForm.reset({
      rating: 0,
      comment: ''
    });
    this.errorMessage = '';
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

  get reviewFormControls() {
    return this.reviewForm.controls;
  }

  // Helper method to check if an order has a review
  hasReview(orderId: string): boolean {
    return this.reviews.some(review => review.orderId === orderId);
  }

  // Helper method to get review text
  getReviewButtonText(orderId: string): string {
    return this.hasReview(orderId) ? 'Edit Review' : 'Write Review';
  }

  // Helper method to get review for an order
  getReviewForOrder(orderId: string): Review | undefined {
    return this.reviews.find(review => review.orderId === orderId);
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