import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-admin-customers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-customers.component.html',
  styleUrls: ['./admin-customers.component.css']
})
export class AdminCustomersComponent implements OnInit {
  customers: User[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.getAllUsers().subscribe({
      next: (response) => {
        this.customers = response.users;
      },
      error: (err) => {
        this.customers = [];
      }
    });
  }
} 