import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { map, filter, switchMap, takeUntil, debounceTime, distinctUntilChanged, catchError, tap } from 'rxjs/operators';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationSubject = new BehaviorSubject<Notification | null>(null);
  notification$ = this.notificationSubject.asObservable();

  show(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.notificationSubject.next({ message, type });
    setTimeout(() => this.clear(), 4000); // auto-hide after 4s
  }

  clear() {
    this.notificationSubject.next(null);
  }
} 