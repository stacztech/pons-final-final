import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container my-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card shadow">
            <div class="card-body p-5">
              <h2 class="text-center mb-4">Reset Password</h2>
              
              <div *ngIf="resetSuccess" class="alert alert-success">
                Your password has been successfully reset.
                <a routerLink="/login" class="d-block mt-2">Click here to login</a>
              </div>
              
              <form (ngSubmit)="onSubmit()" #resetForm="ngForm" *ngIf="!resetSuccess">
                <div class="mb-3">
                  <label for="password" class="form-label">New Password</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="password"
                    name="password"
                    [(ngModel)]="password"
                    required
                    minlength="6"
                    #passwordInput="ngModel">
                  <div class="text-danger" *ngIf="passwordInput.invalid && passwordInput.touched">
                    Password must be at least 6 characters long
                  </div>
                </div>

                <div class="mb-4">
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
                  <div class="text-danger" *ngIf="!passwordsMatch() && confirmPasswordInput.touched">
                    Passwords do not match
                  </div>
                </div>

                <button 
                  type="submit" 
                  class="btn btn-brown w-100 mb-3"
                  [disabled]="resetForm.invalid || !passwordsMatch() || isLoading">
                  {{ isLoading ? 'Resetting Password...' : 'Reset Password' }}
                </button>
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

    .alert a {
      color: inherit;
      text-decoration: underline;
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  password: string = '';
  confirmPassword: string = '';
  isLoading: boolean = false;
  resetSuccess: boolean = false;
  resetToken: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Get the reset token from the route parameter
    this.route.params.subscribe(params => {
      this.resetToken = params['token'];
      console.log(this.resetToken);
      if (!this.resetToken) {
        this.router.navigate(['/forgot-password']);
      }
    });
  }

  passwordsMatch(): boolean {
    return this.password === this.confirmPassword;
  }

  onSubmit() {
    if (this.password && this.passwordsMatch()) {
      this.isLoading = true;
      this.authService.resetPassword(this.resetToken, this.password)
        .subscribe({
          next: () => {
            this.resetSuccess = true;
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Password reset failed:', error);
            this.isLoading = false;
          }
        });
    }
  }
} 