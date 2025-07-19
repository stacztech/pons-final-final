import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container my-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card shadow">
            <div class="card-body p-5">
              <h2 class="text-center mb-4">Forgot Password</h2>
              
              <div *ngIf="emailSent" class="alert alert-success">
                Password reset link has been sent to your email address.
                Please check your inbox and spam folder.
              </div>
              
              <form (ngSubmit)="onSubmit()" #forgotForm="ngForm" *ngIf="!emailSent">
                <div class="mb-4">
                  <label for="email" class="form-label">Email address</label>
                  <input 
                    type="email" 
                    class="form-control" 
                    id="email" 
                    name="email"
                    [(ngModel)]="email"
                    required
                    email
                    #emailInput="ngModel"
                    placeholder="Enter your registered email">
                  <div class="text-danger" *ngIf="emailInput.invalid && emailInput.touched">
                    Please enter a valid email address
                  </div>
                </div>

                <button 
                  type="submit" 
                  class="btn btn-brown w-100 mb-3"
                  [disabled]="forgotForm.invalid || isLoading">
                  {{ isLoading ? 'Sending Reset Link...' : 'Send Reset Link' }}
                </button>

                <div class="text-center">
                  <p class="mb-0">Remember your password? 
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
      color: #8B4513;
    }

    .btn-brown {
      background-color: #8B4513;
      color: white;
      transition: background-color 0.3s ease;
    }

    .btn-brown:hover:not(:disabled) {
      background-color: #693610;
      color: white;
    }

    .btn-brown:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .card {
      border-radius: 10px;
      border: none;
    }

    .form-control:focus {
      border-color: #8B4513;
      box-shadow: 0 0 0 0.2rem rgba(139, 69, 19, 0.25);
    }

    .alert {
      border-radius: 8px;
    }
  `]
})
export class ForgotPasswordComponent {
  email: string = '';
  isLoading: boolean = false;
  emailSent: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (this.email) {
      this.isLoading = true;
      this.authService.sendPasswordResetEmail(this.email)
        .subscribe({
          next: () => {
            this.emailSent = true;
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Failed to send reset email:', error);
            this.isLoading = false;
          }
        });
    }
  }
} 