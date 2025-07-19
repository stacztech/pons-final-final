import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { NotificationComponent } from './components/notification/notification.component';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, NotificationComponent],
  template: `
    <app-notification></app-notification>
    <ng-container *ngIf="!isAdminRoute()">
      <app-header></app-header>
    </ng-container>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .main-content {
      flex: 1;
      padding-top: 72px; /* Height of the header */
    }
  `]
})
export class AppComponent {
  title = 'meat-website';
  constructor(private router: Router) {}
  isAdminRoute() {
    return this.router.url.startsWith('/admin');
  }
}