import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container my-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card shadow">
            <div class="card-body p-5">
              <h2 class="text-center mb-4">Login</h2>
              
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

                <div class="text-end mb-3">
                  <a routerLink="/forgot-password" class="text-brown text-decoration-none">Forgot Password?</a>
                </div>

                <button 
                  type="submit" 
                  class="btn btn-brown w-100 mb-3"
                  [disabled]="loginForm.invalid || isLoading">
                  {{ isLoading ? 'Logging in...' : 'Login' }}
                </button>

                <div class="text-center">
                  <p class="mb-0">Don't have an account? 
                    <a routerLink="/register" class="text-brown">Create Account</a>
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
      border-color: #E31837;
      box-shadow: 0 0 0 0.2rem rgba(227, 24, 55, 0.25);
    }

    .login-bg {
      min-height: 100vh;
      background: linear-gradient(135deg, #fff5f6 0%, #fbeaec 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .login-card {
      background: #fff;
      border-radius: 18px;
      box-shadow: 0 6px 32px rgba(227, 24, 55, 0.10);
      padding: 40px 32px;
      max-width: 400px;
      width: 100%;
      margin: 0 auto;
      transition: box-shadow 0.3s;
    }
    .login-card:hover {
      box-shadow: 0 12px 40px rgba(227, 24, 55, 0.16);
    }
    h2 {
      color: #E31837;
      font-weight: 700;
      margin-bottom: 28px;
      text-align: center;
      font-size: 2rem;
    }
    .form-label {
      color: #444;
      font-weight: 500;
      margin-bottom: 6px;
    }
    .form-control {
      border-radius: 8px;
      padding: 12px;
      font-size: 1rem;
      border: 1px solid #ddd;
      transition: border-color 0.3s, box-shadow 0.3s;
    }
    .form-control:focus {
      border-color: #E31837;
      box-shadow: 0 0 0 2px rgba(227, 24, 55, 0.10);
    }
    .btn-brown {
      background: #E31837;
      color: #fff;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1.1rem;
      padding: 14px 0;
      margin-top: 10px;
      transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
      box-shadow: 0 2px 8px rgba(227, 24, 55, 0.08);
    }
    .btn-brown:hover:not(:disabled) {
      background: #c41530;
      box-shadow: 0 4px 16px rgba(227, 24, 55, 0.14);
      transform: translateY(-2px) scale(1.03);
    }
    .btn-brown:disabled {
      background: #ccc;
      color: #fff;
      cursor: not-allowed;
      box-shadow: none;
    }
    .alert-danger {
      border-radius: 8px;
      font-size: 0.98rem;
      margin-bottom: 18px;
    }
    .text-brown.text-decoration-none:hover {
      text-decoration: underline;
    }
    .text-center {
      text-align: center;
    }
    .mb-4 { margin-bottom: 1.5rem; }
    .mb-3 { margin-bottom: 1rem; }
    .mb-0 { margin-bottom: 0; }
    .my-5 { margin-top: 2.5rem; margin-bottom: 2.5rem; }
    .w-100 { width: 100%; }
    @media (max-width: 600px) {
      .login-card {
        padding: 22px 8px;
        border-radius: 12px;
      }
      h2 {
        font-size: 1.4rem;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  error: string = '';
  returnUrl: string = '/';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onSubmit() {
    const form = document.querySelector('form');
    if (form) {
      // Mark all fields as touched
      Array.from(form.elements).forEach((el: any) => {
        if (el.name) {
          el.classList.add('ng-touched');
        }
      });
    }
    if (!this.email || !this.password) {
      this.error = 'Please fill in all required fields.';
      return;
    }
    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters long.';
      return;
    }
    this.isLoading = true;
    this.error = '';
    this.authService.login(this.email, this.password)
      .subscribe({
        next: () => {
          this.router.navigateByUrl(this.returnUrl);
        },
        error: (error) => {
          console.error('Login failed:', error);
          this.error = 'Invalid email or password';
          this.isLoading = false;
        }
      });
  }
} 