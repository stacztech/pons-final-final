import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="notification" class="notification" [ngClass]="notification.type">
      {{ notification.message }}
    </div>
  `,
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent {
  notification: Notification | null = null;
  constructor(private notificationService: NotificationService) {
    this.notificationService.notification$.subscribe(n => this.notification = n);
  }
} 