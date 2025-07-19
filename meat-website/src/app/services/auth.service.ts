import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, delay, map, catchError } from 'rxjs/operators';
import { CartService } from './cart.service';

export interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  fullName: string;
  phoneNumber: string;
  altPhone?: string;
  addressLine1: string;
  addressLine2?: string;
  locality?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  addresses: Address[];
  role?: 'user' | 'admin';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private apiUrl = 'http://localhost:9000/api/auth';
  private addressApiUrl = 'http://localhost:9000/api/addresses';

  constructor(private http: HttpClient, private cartService: CartService) {
    this.checkAuth();
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }, { withCredentials: true }).pipe(
      tap(response => {
        this.currentUserSubject.next(response.user);
        this.cartService.fetchCart(); // Refresh cart after login
        this.cartService.processPendingCartItem(); // Add pending cart item after login
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signup`, userData, { withCredentials: true }).pipe(
      tap(response => {
        this.currentUserSubject.next(response.user);
        this.cartService.fetchCart(); // Refresh cart after register
        this.cartService.processPendingCartItem(); // Add pending cart item after register
      })
    );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe(() => {
      this.currentUserSubject.next(null);
      this.cartService.clearCartItems(); // Clear cart after logout
    });
  }

  sendPasswordResetEmail(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, { email }, { withCredentials: true });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password/${token}`, { password: newPassword }, { withCredentials: true });
  }

  verifyEmailOT(code: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verify-email`, { code }, { withCredentials: true }).pipe(
      tap(response => {
        this.currentUserSubject.next(response.user);
      })
    );
  }

  /**
   * Sends an OTP to the given email address for verification.
   */
  sendEmailOTP(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/send-otp`, { email }, { withCredentials: true });
  }

  checkAuth(): void {
    this.http.get<any>(`${this.apiUrl}/check-auth`, { withCredentials: true }).subscribe({
      next: (response) => {
        this.currentUserSubject.next(response.user);
      },
      error: () => {
        this.currentUserSubject.next(null);
      }
    });
  }

  /**
   * Checks if the user is authenticated by calling the backend /check-auth endpoint.
   * If not authenticated, logs out the user on the frontend.
   */
  checkAuthentication(): void {
    this.http.get<any>(`${this.apiUrl}/check-auth`, { withCredentials: true }).subscribe({
      next: (response) => {
        if (response && response.user) {
          this.currentUserSubject.next(response.user);
        } else {
          this.logout();
        }
      },
      error: () => {
        this.logout();
      }
    });
  }

  /**
   * Logs out the user and clears the session on the frontend.
   */
  frontendLogout(): void {
    this.currentUserSubject.next(null);
    // Optionally, clear localStorage/sessionStorage if used
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }

  updateProfile(userData: Partial<User>): Observable<any> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      return throwError(() => new Error('No user logged in'));
    }

    const updatedUser = { ...currentUser, ...userData };
    const response = { user: updatedUser };

    return of(response).pipe(
      delay(500),
      tap(response => {
        this.currentUserSubject.next(response.user);
      })
    );
  }

  updateUser(updates: Partial<User>): void {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;

    const updatedUser = { ...currentUser, ...updates };
    this.currentUserSubject.next(updatedUser);
  }

  addAddress(address: Omit<Address, 'id'>): Observable<any> {
    return this.http.post<any>(`${this.addressApiUrl}/`, address, { withCredentials: true });
  }

  updateAddress(addressId: string, updates: Partial<Address>): Observable<any> {
    return this.http.put<any>(`${this.addressApiUrl}/${addressId}`, updates, { withCredentials: true });
  }

  deleteAddress(addressId: string): Observable<any> {
    return this.http.delete<any>(`${this.addressApiUrl}/${addressId}`, { withCredentials: true });
  }

  getAddresses(): Observable<any> {
    return this.http.get<any>(`${this.addressApiUrl}/`, { withCredentials: true });
  }

  getAddressById(addressId: string): Observable<any> {
    return this.http.get<any>(`${this.addressApiUrl}/${addressId}`, { withCredentials: true });
  }

  setDefaultAddress(addressId: string): Observable<any> {
    // If your backend supports a dedicated endpoint for setting default, use it. Otherwise, update the address with isDefault: true
    return this.http.put<any>(`${this.addressApiUrl}/${addressId}`, { isDefault: true }, { withCredentials: true });
  }

  getAllUsers() {
    return this.http.get<{ success: boolean, users: User[] }>('http://localhost:9000/api/auth/users', { withCredentials: true });
  }
} 