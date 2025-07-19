import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container my-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card shadow">
            <div class="card-body p-5">
              <h2 class="text-center mb-4">Create Account</h2>
              
              <!-- Error Message -->
              <div *ngIf="error" class="alert alert-danger alert-dismissible fade show" role="alert">
                {{ error }}
                <button type="button" class="btn-close" (click)="error = ''"></button>
              </div>

              <!-- Success Message -->
              <div *ngIf="success" class="alert alert-success alert-dismissible fade show" role="alert">
                {{ success }}
                <button type="button" class="btn-close" (click)="success = ''"></button>
              </div>
              
              <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
                <div class="mb-3">
                  <label for="name" class="form-label">Full Name</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="name" 
                    name="name"
                    [(ngModel)]="user.name"
                    required
                    minlength="3"
                    #nameInput="ngModel"
                    [class.is-invalid]="nameInput.invalid && nameInput.touched">
                  <div class="invalid-feedback" *ngIf="nameInput.invalid && nameInput.touched">
                    <span *ngIf="nameInput.errors?.['required']">Name is required</span>
                    <span *ngIf="nameInput.errors?.['minlength']">Name must be at least 3 characters long</span>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="email" class="form-label">Email address</label>
                  <div class="input-group">
                    <input 
                      type="email" 
                      class="form-control" 
                      id="email" 
                      name="email"
                      [(ngModel)]="user.email"
                      required
                      email
                      #emailInput="ngModel"
                      [class.is-invalid]="emailInput.invalid && emailInput.touched"
                      [disabled]="isEmailVerified">
                    <button 
                      type="button" 
                      class="btn btn-outline-brown" 
                      (click)="sendEmailOTP()"
                      [disabled]="emailInput.invalid || isEmailVerified || isOtpLoading">
                      <span *ngIf="!isOtpLoading">{{ isOtpSent ? 'Resend OTP' : 'Send OTP' }}</span>
                      <span *ngIf="isOtpLoading" class="spinner-border spinner-border-sm" role="status"></span>
                    </button>
                  </div>
                  <div class="invalid-feedback" *ngIf="emailInput.invalid && emailInput.touched">
                    Please enter a valid email address
                  </div>
                </div>

                <div class="mb-3" *ngIf="isOtpSent && !isEmailVerified">
                  <label for="otp" class="form-label">Enter OTP</label>
                  <div class="input-group">
                    <input 
                      type="text" 
                      class="form-control" 
                      id="otp" 
                      [(ngModel)]="otp"
                      name="otp"
                      required
                      pattern="[0-9]{6}"
                      #otpInput="ngModel"
                      [class.is-invalid]="otpInput.invalid && otpInput.touched">
                    <button 
                      type="button" 
                      class="btn btn-outline-brown" 
                      (click)="verifyEmailOTP()"
                      [disabled]="otpInput.invalid || isOtpVerifying">
                      <span *ngIf="!isOtpVerifying">Verify OTP</span>
                      <span *ngIf="isOtpVerifying" class="spinner-border spinner-border-sm" role="status"></span>
                    </button>
                  </div>
                  <div class="invalid-feedback" *ngIf="otpInput.invalid && otpInput.touched">
                    Please enter the 6-digit OTP
                  </div>
                  <div class="form-text text-success" *ngIf="isEmailVerified">
                    Email verified successfully!
                  </div>
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">Create Password</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="password"
                    name="password"
                    [(ngModel)]="user.password"
                    required
                    minlength="6"
                    #passwordInput="ngModel"
                    [class.is-invalid]="passwordInput.invalid && passwordInput.touched">
                  <div class="invalid-feedback" *ngIf="passwordInput.invalid && passwordInput.touched">
                    Password must be at least 6 characters long
                  </div>
                </div>

                <div class="mb-3">
                  <label for="confirmPassword" class="form-label">Confirm Password</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="confirmPassword"
                    name="confirmPassword"
                    [(ngModel)]="confirmPassword"
                    required
                    #confirmPasswordInput="ngModel"
                    [class.is-invalid]="!passwordsMatch() && confirmPasswordInput.touched">
                  <div class="invalid-feedback" *ngIf="!passwordsMatch() && confirmPasswordInput.touched">
                    Passwords do not match
                  </div>
                </div>

                <div class="mb-3">
                  <label for="phone" class="form-label">Phone Number</label>
                  <input type="tel" class="form-control" id="phone" name="phone" [(ngModel)]="user.phone" required pattern="[0-9]{10}" #phoneInput="ngModel" [class.is-invalid]="phoneInput.invalid && phoneInput.touched">
                  <div class="invalid-feedback" *ngIf="phoneInput.invalid && phoneInput.touched">Please enter a valid 10-digit phone number</div>
                </div>

                <button 
                  type="submit" 
                  class="btn btn-brown w-100 mb-3"
                  [disabled]="registerForm.invalid || !isEmailVerified || !passwordsMatch() || isLoading">
                  <span *ngIf="!isLoading">Create Account</span>
                  <span *ngIf="isLoading" class="spinner-border spinner-border-sm" role="status"></span>
                </button>

                <div class="text-center">
                  <p class="mb-0">Already have an account? 
                    <a routerLink="/login" class="text-brown">Login</a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .text-brown {
      color: #E31837;
    }

    .btn-brown {
      background-color: #E31837;
      color: white;
      transition: background-color 0.3s ease;
    
    }

    .btn-brown:hover:not(:disabled) {
      background-color: #c41530;
      color: white;
      cursor:pointer;
    }

    .btn-outline-brown {
      color: #E31837;
      border-color: #E31837;
    }

    .btn-outline-brown:hover:not(:disabled) {
      background-color: #E31837;
      color: white;
    }

    .btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .card {
      border-radius: 10px;
      border: none;
    }

    .form-control:focus {
      border-color: #E31837;
      box-shadow: 0 0 0 0.2rem rgba(227, 24, 55, 0.25);
    }

    .invalid-feedback {
      font-size: 0.875em;
    }

    .alert {
      margin-bottom: 1.5rem;
    }

    .spinner-border {
      width: 1rem;
      height: 1rem;
      border-width: 0.15em;
    }
  `]
})
export class RegisterComponent {
  user = {
    name: '',
    email: '',
    phone: '',
    password: '',
    address: ''
  };

  confirmPassword: string = '';
  otp: string = '';
  isOtpSent: boolean = false;
  isEmailVerified: boolean = false;
  isLoading: boolean = false;
  isOtpLoading: boolean = false;
  isOtpVerifying: boolean = false;
  error: string = '';
  success: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  passwordsMatch(): boolean {
    return this.user.password === this.confirmPassword;
  }

  sendEmailOTP() {
    if (!this.user.email) {
      this.error = 'Please enter a valid email address.';
      return;
    }
    this.isOtpLoading = true;
    this.error = '';
    this.success = '';
    this.authService.sendEmailOTP(this.user.email).subscribe({
      next: (response) => {
        this.isOtpSent = true;
        this.success = response?.message || 'OTP sent to your email.';
        this.isOtpLoading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to send OTP. Please try again.';
        this.isOtpLoading = false;
      }
    });
  }

  verifyEmailOTP() {
    if (!this.otp) return;

    this.isOtpVerifying = true;
    this.error = '';
    
    this.authService.verifyEmailOT(this.otp)
      .subscribe({
        next: () => {
          this.isEmailVerified = true;
          this.success = 'Email verified successfully!';
          this.isOtpVerifying = false;
        },
        error: (error) => {
          this.error = error.message || 'Invalid OTP. Please try again.';
          this.isOtpVerifying = false;
        }
      });
  }

  onSubmit() {
    const form = document.querySelector('form');
    if (form) {
      Array.from(form.elements).forEach((el: any) => {
        if (el.name) {
          el.classList.add('ng-touched');
        }
      });
    }
    if (!this.isEmailVerified) {
      this.error = 'Please verify your email first.';
      return;
    }
    if (!this.user.name || this.user.name.length < 3) {
      this.error = 'Name is required and must be at least 3 characters.';
      return;
    }
    if (!this.user.email) {
      this.error = 'Email is required.';
      return;
    }
    if (!this.user.password || this.user.password.length < 6) {
      this.error = 'Password must be at least 6 characters long.';
      return;
    }
    if (!this.passwordsMatch()) {
      this.error = 'Passwords do not match.';
      return;
    }
    if (!this.user.phone || !/^[0-9]{10}$/.test(this.user.phone)) {
      this.error = 'Please enter a valid 10-digit phone number.';
      return;
    }
    this.isLoading = true;
    this.error = '';
    // Only send required fields
    const userPayload = {
      name: this.user.name,
      email: this.user.email,
      password: this.user.password,
      phone: this.user.phone
    };
    this.authService.register(userPayload)
      .subscribe({
        next: () => {
          this.success = 'Account created successfully! Redirecting to login...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.error = error.message || 'Failed to create account. Please try again.';
          this.isLoading = false;
        }
      });
  }
} 