import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CartComponent } from './components/cart/cart.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from './guards/auth.guard';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { Router } from '@angular/router';
import { OrdersService } from './services/orders.service';
import { OrderSuccessComponent } from './components/checkout/order-success.component';
import { OrdersComponent } from './components/orders/orders.component';
import { AdminGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./components/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./components/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'reset-password/:token',
    loadComponent: () => import('./components/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'orders',
    loadComponent: () => import('./components/orders/orders.component').then(m => m.OrdersComponent),
    //canActivate: [AuthGuard]
  },
  {
    path: 'cart',
    loadComponent: () => import('./components/cart/cart.component').then(m => m.CartComponent)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./components/checkout/checkout.component').then(m => m.CheckoutComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'chicken',
    loadComponent: () => import('./components/chicken/chicken.component').then(m => m.ChickenComponent)
  },
  {
    path: 'country-chicken',
    loadComponent: () => import('./components/country-chicken/country-chicken.component').then(m => m.CountryChickenComponent)
  },
  {
    path: 'japanese-quail',
    loadComponent: () => import('./components/japanese-quail/japanese-quail.component').then(m => m.JapaneseQuailComponent)
  },
  {
    path: 'turkey',
    loadComponent: () => import('./components/turkey/turkey.component').then(m => m.TurkeyComponent)
  },
  {
    path: 'goat',
    loadComponent: () => import('./components/goat/goat.component').then(m => m.GoatComponent)
  },
  {
    path: 'review-order',
    loadComponent: () => import('./components/checkout/review-order.component').then(m => m.ReviewOrderComponent)
  },
  {
    path: 'order-success/:id',
    component: OrderSuccessComponent
  },
  { path: 'orders', component: OrdersComponent },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [AdminGuard]
  },
  {
    path: 'admin-login',
    loadComponent: () => import('./components/login/admin-login.component').then(m => m.AdminLoginComponent)
  },
  {
    path: 'admin/orders/:id',
    loadComponent: () => import('./components/admin/admin-order-detail.component').then(m => m.AdminOrderDetailComponent),
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/orders',
    loadComponent: () => import('./components/admin/admin-orders.component').then(m => m.AdminOrdersComponent),
    canActivate: [AdminGuard]
  },
  { path: '**', redirectTo: '' }
];