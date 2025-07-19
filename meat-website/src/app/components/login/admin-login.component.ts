import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container my-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card shadow">
            <div class="card-body p-5">
              <h2 class="text-center mb-4">Admin Login</h2>
              <div *ngIf="error" class="alert alert-danger">
                {{ error }}
              </div>
              <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
                <div class="mb-3">
                  <label for="email" class="form-label">Email address</label>
                  <input 
                    type="email" 
                    class="form-control" 
                    id="email" 
                    name="email"
                    [(ngModel)]="email"
                    required
                    email
                    #emailInput="ngModel">
                  <div class="text-danger" *ngIf="emailInput.invalid && emailInput.touched">
                    Please enter a valid email address
                  </div>
                </div>
                <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
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
                <button 
                  type="submit" 
                  class="btn btn-brown w-100 mb-3"
                  [disabled]="loginForm.invalid || isLoading">
                  {{ isLoading ? 'Logging in...' : 'Login as Admin' }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `.text-brown { color: #E31837; }
    .btn-brown { background-color: #E31837; color: white; transition: background-color 0.3s ease; }
    .btn-brown:hover:not(:disabled) { background-color: #c41530; color: white; }
    .btn-brown:disabled { opacity: 0.7; cursor: not-allowed; }
    .card { border-radius: 10px; border: none; }
    .form-control:focus { border-color: #E31837; box-shadow: 0 0 0 0.2rem rgba(227, 24, 55, 0.25); }
    h2 { color: #E31837; font-weight: 700; margin-bottom: 28px; text-align: center; font-size: 2rem; }
    .form-label { color: #444; font-weight: 500; margin-bottom: 6px; }
    .form-control { border-radius: 8px; padding: 12px; font-size: 1rem; border: 1px solid #ddd; transition: border-color 0.3s, box-shadow 0.3s; }
    .form-control:focus { border-color: #E31837; box-shadow: 0 0 0 2px rgba(227, 24, 55, 0.10); }
    .btn-brown { background: #E31837; color: #fff; border-radius: 8px; font-weight: 600; font-size: 1.1rem; padding: 14px 0; margin-top: 10px; transition: background 0.2s, box-shadow 0.2s, transform 0.2s; box-shadow: 0 2px 8px rgba(227, 24, 55, 0.08); }
    .btn-brown:hover:not(:disabled) { background: #c41530; box-shadow: 0 4px 16px rgba(227, 24, 55, 0.14); transform: translateY(-2px) scale(1.03); }
    .btn-brown:disabled { background: #ccc; color: #fff; cursor: not-allowed; box-shadow: none; }
    .alert-danger { border-radius: 8px; font-size: 0.98rem; margin-bottom: 18px; }
    .text-center { text-align: center; }
    .mb-4 { margin-bottom: 1.5rem; }
    .mb-3 { margin-bottom: 1rem; }
    .mb-0 { margin-bottom: 0; }
    .my-5 { margin-top: 2.5rem; margin-bottom: 2.5rem; }
    .w-100 { width: 100%; }
    @media (max-width: 600px) { h2 { font-size: 1.4rem; } }
    `
  ]
})
export class AdminLoginComponent {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  error: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.error = '';
    this.isLoading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        if (res.user.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.error = 'Access denied: Not an admin account.';
          this.authService.logout();
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message || 'Login failed';
        this.isLoading = false;
      }
    });
  }
} 