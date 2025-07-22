import { Component, OnDestroy, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CartService, CartItem } from '../../services/cart.service';
import { SearchService, SearchResult } from '../../services/search.service';
import { Observable, Subject, BehaviorSubject, of, Subscription } from 'rxjs';
import { map, filter, switchMap, takeUntil, debounceTime, distinctUntilChanged, catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-white">
      <div class="container">
        <!-- Logo -->
        <a class="navbar-brand" (click)="navigateToHome($event)">
          <img src="./assets/images/logo.png" alt="Meat Shop Logo" height="50">
        </a>
        
        <!-- Mobile Toggle -->
        <button class="navbar-toggler" type="button" (click)="toggleMobileMenu()">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <!-- Main Navigation Content -->
        <div class="collapse navbar-collapse" [class.show]="isMobileMenuOpen" id="navbarContent">
          <!-- Location Selector -->
          <div class="nav-item location-selector" (click)="openLocationInMaps()">
            <i class="bi bi-geo-alt"></i>
            <a class="location-link">
              <span class="location-text">Thoothukudi</span>
              <span class="location-subtext">Tamil Nadu, India</span>
            </a>
          </div>

          <!-- Enhanced Search Bar -->
          <div class="nav-item search-container">
            <div class="search-wrapper">
              <input
                class="form-control search-input" 
                type="search" 
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearchChange($event)"
                (focus)="showResults = true"
                (click)="showResults = true"
                placeholder="Search for meat products..."
                name="search"
                autocomplete="off">
              <button class="btn btn-outline-brown" type="button" (click)="performSearch()">
                <i class="bi bi-search"></i>
              </button>

              <!-- Search Results Dropdown -->
              <div class="search-results-dropdown" *ngIf="showResults" (mousedown)="$event.preventDefault()">
                <!-- Popular Searches -->
                <div class="search-section" *ngIf="!searchQuery">
                  <h6 class="section-title">Popular Searches</h6>
                  <div class="search-item" *ngFor="let search of popularSearches" (click)="selectSuggestion(search)">
                    <i class="bi bi-fire"></i>
                    <span>{{ search }}</span>
                  </div>
                </div>

                <!-- Search Results -->
                <div class="search-results" *ngIf="searchResults.length > 0">
                  <div class="result-item" *ngFor="let result of searchResults" (click)="navigateTo(result.route, $event)">
                    <img [src]="result.image" [alt]="result.name" class="result-image">
                    <div class="result-details">
                      <div class="result-name">{{ result.name }}</div>
                      <div class="result-category">in {{ result.category }}</div>
                      <div class="result-price">₹{{ result.price }}</div>
                    </div>
                  </div>
                </div>

                <!-- No Results -->
                <div class="no-results" *ngIf="searchResults.length === 0 && searchQuery">
                  <i class="bi bi-search"></i>
                  <p>No products found for "{{ searchQuery }}"</p>
                  <small>Try searching for different terms or browse our categories</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Navigation Items -->
          <ul class="navbar-nav ms-auto">
            <li class="nav-item dropdown" [class.show]="activeDropdown === 'categories'">
              <a class="nav-link dropdown-toggle" (click)="toggleDropdown('categories', $event)">
                <i class="bi bi-grid"></i>
                Categories
              </a>
              <ul class="dropdown-menu" [class.show]="activeDropdown === 'categories'">
                <li><a class="dropdown-item" (click)="navigateTo('/chicken', $event)">
                  <i class="bi bi-arrow-right-circle"></i>Chicken
                </a></li>
                <li><a class="dropdown-item" (click)="navigateTo('/country-chicken', $event)">
                  <i class="bi bi-arrow-right-circle"></i>Country Chicken
                </a></li>
                <li><a class="dropdown-item" (click)="navigateTo('/japanese-quail', $event)">
                  <i class="bi bi-arrow-right-circle"></i>Japanese Quail
                </a></li>
                <li><a class="dropdown-item" (click)="navigateTo('/turkey', $event)">
                  <i class="bi bi-arrow-right-circle"></i>Turkey Bird
                </a></li>
                <li><a class="dropdown-item" (click)="navigateTo('/goat', $event)">
                  <i class="bi bi-arrow-right-circle"></i>Goat
                </a></li>
              </ul>
            </li>
            <li class="nav-item">
              <ng-container *ngIf="authService.currentUser$ | async as user; else loginLink">
                <div class="dropdown" [class.show]="activeDropdown === 'account'">
                  <a class="nav-link dropdown-toggle" (click)="toggleDropdown('account', $event)">
                    <i class="bi bi-person"></i> My Account
                  </a>
                  <ul class="dropdown-menu" [class.show]="activeDropdown === 'account'">
                    <li><a class="dropdown-item" (click)="navigateTo('/orders', $event)">
                      <i class="bi bi-box-seam me-2"></i>My Orders
                    </a></li>
                    <li><a class="dropdown-item" (click)="navigateTo('/profile', $event)">
                      <i class="bi bi-person-circle me-2"></i>Profile Settings
                    </a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" (click)="logout($event)">
                      <i class="bi bi-box-arrow-right me-2"></i>Logout
                    </a></li>
                  </ul>
                </div>
              </ng-container>
              <ng-template #loginLink>
                <a class="nav-link" (click)="navigateTo('/login', $event)">
                  <i class="bi bi-person"></i> Login
                </a>
              </ng-template>
            </li>
            <li class="nav-item">
              <a class="nav-link cart-link" (click)="navigateTo('/cart', $event)">
                <i class="bi bi-cart3"></i>
                <div class="cart-info" *ngIf="cartCount > 0">
                  <span class="items-count">{{ cartCount }} items</span>
                </div>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    /* Navbar styles */
    .navbar {
      box-shadow: 0 1px 1px rgba(0,0,0,0.1);
      padding: 0;
      height: 56px;
      min-height: 56px;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      z-index: 1050;
    }

    .navbar-brand {
      padding: 0;
      margin-right: 2rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: all 0.3s;
    }

    .navbar-brand img {
      height: 50px;
      width: auto;
      max-width: 140px;
      transition: all 0.3s;
    }

    /* Mobile Toggle */
    .navbar-toggler {
      border: none;
      font-size: 1.5rem;
      padding: 0.25rem 0.75rem;
    }

    .navbar-toggler-icon {
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%280, 0, 0, 0.55%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
    }

    /* Location Selector Styles */
    .location-selector {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0 1rem;
      border-right: 1px solid #e0e0e0;
      margin-right: 1rem;
      height: 100%;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .location-selector i {
      color: #E31837;
      font-size: 1rem;
    }

    .location-link {
      text-decoration: none;
      display: flex;
      flex-direction: column;
      color: inherit;
    }

    .location-text {
      font-weight: 500;
      font-size: 0.9rem;
      color: #333;
    }

    .location-subtext {
      font-size: 0.75rem;
      color: #666;
    }

    /* Enhanced Search Styles */
    .search-container {
      flex: 1;
      max-width: 600px;
      position: relative;
      margin: 0 1rem;
      height: 100%;
      display: flex;
      align-items: center;
    }

    .search-wrapper {
      display: flex;
      position: relative;
      width: 100%;
    }

    .search-input {
      border-radius: 4px 0 0 4px !important;
      border-right: none;
      padding-right: 40px;
      font-size: 0.9rem;
      height: 36px;
      transition: all 0.3s ease;
    }

    .search-input:focus {
      box-shadow: none;
      border-color: #E31837;
      background-color: #fff;
    }

    .btn-outline-brown {
      color: #E31837;
      border-color: #E31837;
      border-radius: 0 4px 4px 0;
      border-left: none;
      padding: 0.375rem 1rem;
      height: 36px;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .btn-outline-brown:hover {
      color: white;
      background-color: #E31837;
      transform: translateX(2px);
    }

    .btn-outline-brown:active {
      transform: translateX(0);
    }

    /* Search Results Dropdown */
    .search-results-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      margin-top: 4px;
      z-index: 1000;
      max-height: 400px;
      overflow-y: auto;
    }

    .search-section {
      padding: 12px 16px;
      border-bottom: 1px solid #eee;
    }

    .section-title {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .search-item {
      display: flex;
      align-items: center;
      padding: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      border-radius: 4px;
    }

    .search-item:hover {
      background-color: #f5f5f5;
      transform: translateX(4px);
    }

    .search-item:active {
      transform: translateX(2px);
    }

    .search-item i {
      margin-right: 12px;
      color: #666;
    }

    .result-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      border-bottom: 1px solid #eee;
    }

    .result-item:hover {
      background-color: #f5f5f5;
      transform: translateX(4px);
    }

    .result-item:active {
      transform: translateX(2px);
    }

    .result-image {
      width: 40px;
      height: 40px;
      object-fit: cover;
      border-radius: 4px;
      margin-right: 12px;
    }

    .result-details {
      flex: 1;
    }

    .result-name {
      font-weight: 500;
      color: #333;
      margin-bottom: 2px;
    }

    .result-category {
      font-size: 12px;
      color: #666;
    }

    .result-price {
      font-weight: 500;
      color: #8B4513;
      font-size: 14px;
    }

    .no-results {
      padding: 24px 16px;
      text-align: center;
      color: #666;
    }

    .no-results i {
      font-size: 24px;
      margin-bottom: 8px;
      color: #999;
    }

    .no-results p {
      margin-bottom: 4px;
      font-weight: 500;
    }

    .no-results small {
      color: #999;
    }

    /* Cart Link Styles */
    .cart-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 12px !important;
      background-color: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      margin-left: 1rem;
      height: 36px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .cart-link:hover {
      background-color: #f8f8f8;
      border-color: #E31837;
      color: #E31837;
    }

    .cart-link:active {
      transform: translateY(1px);
    }

    .cart-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      line-height: 1.1;
    }

    .items-count {
      font-size: 0.75rem;
      color: #666;
    }

    .total-amount {
      font-weight: 600;
      color: #E31837;
      font-size: 0.85rem;
    }

    /* Navigation Items */
    .navbar-nav {
      height: 100%;
      display: flex;
      align-items: center;
    }

    .nav-item {
      height: 100%;
      display: flex;
      align-items: center;
    }

    .nav-link {
      height: 100%;
      display: flex;
      align-items: center;
      padding: 0 1rem;
      font-size: 0.9rem;
      cursor: pointer;
      transition: color 0.3s ease;
    }

    .nav-link:hover {
      color: #E31837;
    }

    .dropdown-menu {
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      background: white;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      border: 1px solid #f0f0f0;
      min-width: 200px;
      z-index: 1000;
      opacity: 0;
      transform: translateY(-10px);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }

    .dropdown-menu.show {
      display: block;
      opacity: 1;
      transform: translateY(0);
    }

    .dropdown-toggle::after {
      display: inline-block;
      margin-left: 8px;
      vertical-align: middle;
      content: "";
      border-top: 4px solid;
      border-right: 4px solid transparent;
      border-bottom: 0;
      border-left: 4px solid transparent;
      transition: transform 0.3s ease;
    }

    .dropdown.show .dropdown-toggle::after {
      transform: rotate(180deg);
    }

    .dropdown-item {
      padding: 10px 16px;
      color: #333;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .dropdown-item:hover {
      background-color: #f8f8f8;
      color: #E31837;
    }

    .dropdown-item i {
      font-size: 1rem;
      color: #666;
    }

    .dropdown-item:hover i {
      color: #E31837;
    }

    .dropdown-divider {
      margin: 8px 0;
      border-top: 1px solid #f0f0f0;
    }

    /* Mobile specific styles */
    @media (max-width: 768px) {
      .navbar {
        height: auto;
        min-height: 56px;
        padding: 0.5rem 1rem;
      }

      .navbar-brand {
        margin-right: 1rem;
      }

      .navbar-brand img {
        height: 40px;
      }

      .location-selector {
        border-right: none;
        padding: 0;
        margin-right: 0;
        justify-content: center;
        width: 100%;
        text-align: center;
      }

      .location-link {
        align-items: center;
      }

      .location-text,
      .location-subtext {
        font-size: 0.8rem;
      }

      .search-container {
        order: 1;
        width: 100%;
        margin: 0.5rem 0;
        max-width: none;
      }

      .search-input {
        font-size: 0.85rem;
        height: 40px;
        padding-right: 50px;
      }

      .search-wrapper .btn-outline-brown {
        height: 40px;
        width: 40px;
      }

      .navbar-collapse {
        flex-direction: column;
        align-items: flex-start;
        width: 100%;
      }

      .navbar-nav {
        width: 100%;
        margin-top: 1rem;
      }

      .nav-item {
        width: 100%;
        text-align: left;
      }

      .nav-item .dropdown-menu {
        width: 100%;
        text-align: left;
      }

      .nav-link {
        padding: 0.5rem 1rem;
      }

      .cart-link .cart-info {
        top: 5px;
        right: 5px;
      }
    }

    body {
      padding-top: 56px;
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  searchQuery = '';
  showResults = false;
  searchResults: SearchResult[] = [];
  popularSearches: string[] = [];
  activeDropdown: string | null = null;
  isMobileMenuOpen = false;
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  cartCount = 0;
  private cartSubscription!: Subscription;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.activeDropdown = null;
      this.isMobileMenuOpen = false;
      this.hideResults();
      this.cdr.markForCheck();
    }
  }

  constructor(
    private searchService: SearchService,
    public cartService: CartService,
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef
  ) {
    this.popularSearches = this.searchService.getPopularSearches();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      if (query) {
        this.searchService.search(query).subscribe(results => {
          this.searchResults = results;
          this.showResults = true;
        });
      } else {
        this.searchResults = [];
      }
    });
  }

  ngOnInit() {
    // Subscribe to router events to handle scroll behavior and close dropdowns
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      window.scrollTo(0, 0);
      this.activeDropdown = null;
      this.isMobileMenuOpen = false;
    });

    this.cartSubscription = this.cartService.cartItems$.subscribe(items => {
      this.cartCount = items.length;
      this.cdr.markForCheck();
    });
  }

  toggleDropdown(dropdownName: string, event: Event) {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === dropdownName ? null : dropdownName;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  openLocationInMaps() {
    window.open('https://g.co/kgs/Lxbc95d', '_blank');
  }

  navigateToHome(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/']);
    window.scrollTo(0, 0);
  }

  navigateTo(path: string, event: Event): void {
    event.preventDefault();
    this.router.navigate([path]).then(() => {
      window.scrollTo(0, 0);
    });
  }

  onSearchChange(query: string) {
    this.searchSubject.next(query);
  }

  logout(event: Event) {
    event.preventDefault();
    this.authService.logout();
    this.cdr.markForCheck();
    this.navigateTo('/', event);
  }

  addToCart(product: SearchResult) {
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      image: product.image,
      weight: '500g', // Default weight
      price: product.price,
      quantity: 1
    };

    this.cartService.addToCart(cartItem);
  }

  selectSuggestion(suggestion: string) {
    this.searchQuery = suggestion;
    this.onSearchChange(suggestion);
  }

  performSearch() {
    if (this.searchQuery.trim()) {
      this.searchService.search(this.searchQuery).subscribe(results => {
        if (results.length > 0) {
          // Navigate to the first result's route
          this.navigateTo(results[0].route, new Event('click'));
        }
      });
    }
    this.hideResults();
  }

  hideResults() {
    setTimeout(() => {
      this.showResults = false;
    }, 200);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }
}