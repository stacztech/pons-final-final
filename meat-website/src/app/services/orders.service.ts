import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, BehaviorSubject, of, Subscription, throwError } from 'rxjs';
import { map, filter, switchMap, takeUntil, debounceTime, distinctUntilChanged, catchError, tap } from 'rxjs/operators';
import { CartItem } from './cart.service';
import { AuthService, User } from './auth.service';
import { HttpClient } from '@angular/common/http';

export interface OrderItem extends CartItem {
  id: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  weight: string;
}

export interface DeliveryDetails {
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  deliveryDetails: DeliveryDetails;
  orderDate: string;
  expectedDeliveryDate?: string;
}

export interface OrderTracking {
  orderId: string;
  status: Order['status'];
  updates: Array<{
    status: Order['status'];
    message: string;
    date: Date;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService implements OnDestroy {
  private apiUrl = 'https://ponsbackend.onrender.com/api/orders';

  constructor(private authService: AuthService, private http: HttpClient) {
    // No need to subscribe to user changes for backend
  }

  ngOnDestroy(): void {
    // No cleanup needed
  }

  placeOrder(orderData: {
    items: CartItem[];
    total: number;
    deliveryDetails: DeliveryDetails;
    paymentMethod: string;
    expectedDeliveryDate?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/`, orderData, { withCredentials: true });
  }

  getOrders(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/`, { withCredentials: true });
  }

  getOrderById(orderId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${orderId}`, { withCredentials: true });
  }

  cancelOrder(orderId: string): Observable<any> {
    // Assuming cancel means delete
    return this.http.delete<any>(`${this.apiUrl}/${orderId}`, { withCredentials: true });
  }

  updateOrderStatus(orderId: string, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${orderId}/status`, { status }, { withCredentials: true });
  }
} 
