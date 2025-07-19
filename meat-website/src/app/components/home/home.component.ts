import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

interface Category {
  name: string;
  image: string;
  route: string;
  description: string;
}

interface ComboPack {
  name: string;
  items: string[];
  weight: string;
  price: number;
  image: string;
  isAddedToCart?: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-container">
      <!-- Welcome Banner Section -->
      <div class="welcome-banner">
        <div class="banner-content">
          <h1>PONS Mutton Stall & Broilers</h1>
          <p class="banner-subtitle">Your favourite meat shop is now online</p>
          <button class="shop-now-btn" (click)="scrollToCategories()">Shop Now</button>
              </div>
        <div class="banner-image-container">
          <img src="assets/images/ban11.jpeg" alt="Fresh Chicken" class="banner-img">
            </div>
          </div>

      <!-- Carousel and QR Section -->
      <div class="carousel-section">
        <div class="carousel-container">
          <div class="carousel-grid">
            <!-- Left Side: Main Carousel -->
            <div class="main-carousel">
              <div class="carousel">
                <div class="carousel-track" [style.transform]="'translateX(-' + (currentSlide * 100) + '%)'">
                  <div class="carousel-slide" *ngFor="let item of carouselItems">
                    <div class="carousel-content">
                      <img [src]="item.image" [alt]="item.title" class="carousel-image">
                    </div>
                  </div>
                </div>
              </div>

              <!-- Carousel Controls -->
              <button class="carousel-control prev" (click)="prevSlide()">
                <i class="bi bi-chevron-left"></i>
              </button>
              <button class="carousel-control next" (click)="nextSlide()">
                <i class="bi bi-chevron-right"></i>
              </button>

              <!-- Carousel Indicators -->
              <div class="carousel-indicators">
                <button *ngFor="let _ of carouselItems; let i = index" 
                      [class.active]="i === currentSlide"
                      (click)="goToSlide(i)">
                </button>
              </div>
            </div>
            
            <!-- Right Side: QR Section -->
            <div class="qr-section">
              <div class="qr-carousel" [style.transform]="'translateX(-' + (currentQR * 100) + '%)'">
                <div class="qr-item" *ngFor="let qr of qrCodes">
                  <img [src]="qr.image" [alt]="qr.name" class="qr-image">
                  <div class="qr-label">{{ qr.name }}</div>
                </div>
              </div>
              <div class="qr-indicators">
                <button *ngFor="let qr of qrCodes; let i = index" 
                        [class.active]="i === currentQR"
                        (click)="goToQR(i)">
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Categories Section -->
      <section class="categories-section" #categoriesSection>
        <div class="section-header">
          <h2>Shop by Category</h2>
        </div>
          <div class="categories-grid">
            <a [routerLink]="category.route" class="category-card" *ngFor="let category of mainCategories">
            <div class="category-image">
              <img [src]="category.image" [alt]="category.name">
            </div>
            <h3>{{ category.name }}</h3>
            <p>{{ category.description }}</p>
            </a>
        </div>
      </section>

      <!-- Combo Packs Section -->
      <section class="combo-packs-section">
        <div class="section-header">
          <h2>Special Combo Packs</h2>
        </div>
        <div class="combo-packs-grid">
          <div class="combo-pack-card" *ngFor="let pack of comboPacks">
            <div class="combo-image">
              <img [src]="pack.image" [alt]="pack.name">
              <div class="combo-badge">COMBO</div>
            </div>
            <div class="combo-info">
              <h3>{{ pack.name }}</h3>
              <ul class="combo-items">
                <li *ngFor="let item of pack.items">{{ item }}</li>
              </ul>
              <div class="combo-details">
                <span class="weight">{{ pack.weight }}</span>
                <span class="price">₹{{ pack.price }}</span>
              </div>
              <div class="button-group">
                <button class="btn-buy-now" (click)="buyNowCombo(pack)">
                  Buy Now
                </button>
                <button class="btn-add-cart" 
                        [class.added]="pack.isAddedToCart"
                        (click)="addComboToCart(pack)">
                  <span *ngIf="!pack.isAddedToCart">Add to Cart</span>
                  <span *ngIf="pack.isAddedToCart">
                    <i class="bi bi-check-circle-fill"></i> Added to Cart
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      padding-top: 0;
      background:rgb(232, 236, 241);
    }

    /* Welcome Banner Styles */
    .welcome-banner {
      background: linear-gradient(to right,rgba(229, 47, 74, 0.85),rgba(185, 22, 47, 0.72));
      padding: 30px 40px;
      position: relative;
      overflow: hidden;
      border-radius: 20px;
      margin: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 240px;
      box-shadow: 0 8px 25px rgba(227, 24, 55, 0.15);
    }

    .banner-content {
      flex: 1;
      color: white;
      position: relative;
      z-index: 2;
      max-width: 60%;
      padding-right: 40px;
    }

    .banner-content h1 {
      font-size: 48px;
      font-weight: 700;
      margin: 0;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
      font-family: 'Arial', sans-serif;
    }

    .banner-subtitle {
      font-size: 24px;
      margin: 10px 0 20px;
      font-weight: 300;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    }

    .shop-now-btn {
      background: white;
      color: #E31837;
      border: none;
      padding: 12px 30px;
      border-radius: 25px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    .shop-now-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
      background: #f8f8f8;
      color: #c41530;
    }

    .banner-image-container {
      position: absolute;
      right: 0;
      top: 0;
      height: 100%;
      width: 40%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .banner-img {
      height: 100%;
      width: 100%;
      object-fit: cover;
      object-position: center;
      transition: all 0.3s ease;
    }

    @media (max-width: 1024px) {
      .welcome-banner {
        padding: 25px 30px;
      }

      .banner-content {
        max-width: 55%;
        padding-right: 20px;
      }

      .banner-content h1 {
        font-size: 40px;
      }

      .banner-subtitle {
        font-size: 20px;
      }

      .banner-image-container {
        width: 45%;
      }
    }

    @media (max-width: 768px) {
      .welcome-banner {
        flex-direction: column;
        text-align: center;
        padding: 30px 20px;
        min-height: auto;
      }

      .banner-content {
        max-width: 100%;
        padding-right: 0;
        margin-bottom: 220px;
      }

      .banner-image-container {
      position: absolute;
      bottom: 0;
        top: auto;
        left: 0;
        width: 100%;
        height: 200px;
      }

      .banner-img {
        border-radius: 0;
        border-bottom-left-radius: 20px;
        border-bottom-right-radius: 20px;
      }
    }

    @media (max-width: 480px) {
      .welcome-banner {
        margin: 10px;
        padding: 20px 15px;
      }

      .banner-content {
        margin-bottom: 180px;
      }

      .banner-content h1 {
        font-size: 32px;
      }

      .banner-subtitle {
        font-size: 18px;
        margin: 8px 0 15px;
      }

      .shop-now-btn {
        padding: 10px 25px;
        font-size: 14px;
      }

      .banner-image-container {
        height: 160px;
      }
    }

    /* Welcome Section Styles */
    .welcome-section {
      background: linear-gradient(135deg, rgba(227, 24, 55, 0.05) 0%, #fff 100%);
      padding: 25px 0;
      margin-top: 0;
      position: relative;
      overflow: hidden;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }

    .welcome-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 40px;
      display: grid;
      grid-template-columns: 1fr;
      gap: 25px;
      align-items: start;
    }

    .welcome-content {
      padding-right: 25px;
    }

    .location-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #E31837;
      color: white;
      padding: 10px 24px;
      border-radius: 30px;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 24px;
      box-shadow: 0 4px 15px rgba(227, 24, 55, 0.2);
      font-style: italic;
      transition: transform 0.3s ease;
    }

    .location-badge:hover {
      transform: translateY(-2px);
    }

    .welcome-message {
      text-align: left;
      margin-bottom: 30px;
    }

    .welcome-message h1 {
      color: #1a1a1a;
      font-size: 42px;
      font-weight: 800;
      margin: 0;
      padding: 0;
      line-height: 1.2;
      letter-spacing: -0.5px;
    }

    .highlight {
      color: #E31837;
      position: relative;
      display: inline-block;
      font-style: italic;
      font-family: 'Playfair Display', serif;
    }

    .tagline {
      color: #666;
      font-size: 18px;
      margin: 12px 0 20px;
      font-weight: 500;
      font-style: italic;
      font-family: 'Playfair Display', serif;
      letter-spacing: 0.3px;
    }

    .welcome-features {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-top: 20px;
    }

    .welcome-feature {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .welcome-feature:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
      border-color: rgba(227, 24, 55, 0.2);
    }

    .welcome-feature i {
      font-size: 24px;
      color: #E31837;
    }

    .feature-text h4 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .feature-text p {
      margin: 4px 0 0;
      font-size: 13px;
      color: #666;
    }

    /* Carousel and QR Section */
    .carousel-section {
      position: relative;
      background: #fff;
      padding: 25px 0;
      margin-bottom: 25px;
      width: 100%;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .carousel-container {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 40px;
    }

    .carousel-grid {
      display: grid;
      grid-template-columns: 2.5fr 1fr;
      gap: 30px;
      align-items: start;
    }

    /* Main Carousel */
    .carousel {
      position: relative;
      overflow: hidden;
      width: 100%;
      height: 400px;
      border-radius: 16px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    .carousel-track {
      display: flex;
      width: 100%;
      height: 100%;
      transition: transform 0.5s ease-in-out;
    }

    .carousel-slide {
      min-width: 100%;
      height: 100%;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #000;
    }

    .carousel-content {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
    }

    .carousel-image {
      width: 100%;
      height: 100%;
      object-fit: contains;
      object-position: center;
      transition: transform 0.3s ease;
    }

    .carousel-control {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(236, 194, 194, 0.94);
      border: none;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      z-index: 10;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .carousel-control:hover {
      background: #fff;
      transform: translateY(-50%) scale(1.1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .carousel-control.prev {
      left: 20px;
    }

    .carousel-control.next {
      right: 20px;
    }

    .carousel-control i {
      font-size: 22px;
      color: #1a1a1a;
    }

    /* QR Section */
    .qr-section {
      height: 400px;
      position: relative;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .qr-carousel {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: row;
      transition: transform 0.5s ease-in-out;
    }
    .qr-item {
      min-width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: white;
      position: relative;
      padding: 20px;
    }
    .qr-image {
      width: 80%;
      max-width: 320px;
      height: auto;
      aspect-ratio: 1/1;
      object-fit: contain;
      transition: transform 0.3s ease;
      margin-bottom: 18px;
      display: block;
      box-shadow: 0 2px 12px rgba(227, 24, 55, 0.08);
      border-radius: 16px;
      background: #fffbe6;
      padding: 12px;
    }
    .qr-item:hover .qr-image {
      transform: scale(1.05);
    }
    .qr-label {
      position: static;
      text-align: center;
      font-size: 16px;
      color: #1a1a1a;
      font-weight: 600;
      background: rgba(209, 182, 182, 0.15);
      padding: 10px 0 0 0;
      margin: 0;
      border-radius: 8px;
      box-shadow: none;
      backdrop-filter: none;
    }
    @media (max-width: 900px) {
      .carousel, .qr-section {
        height: 260px;
      }
      .qr-image {
        max-width: 200px;
        padding: 8px;
      }
    }
    @media (max-width: 600px) {
      .carousel, .qr-section {
        height: 260px;
      }
      .qr-image {
        width: 95vw;
        max-width: 95vw;
        height: auto;
        aspect-ratio: 1/1;
        padding: 4vw;
        margin-bottom: 10px;
      }
      .qr-section {
        padding: 0 0 10px 0;
        border-radius: 12px;
      }
    }
    @media (max-width: 480px) {
      .carousel, .qr-section {
        height: 220px;
      }
      .qr-image {
        width: 90vw;
        max-width: 90vw;
        height: auto;
        aspect-ratio: 1/1;
        padding: 2vw;
        margin-bottom: 8px;
      }
      .qr-section {
        padding: 0 0 8px 0;
        border-radius: 10px;
      }
    }

    /* Categories Section */
    .categories-section {
      padding: 25px 0;
      background: #fff;
      position: relative;
      scroll-margin-top: 80px;
    }

    /* Section Headers - Left Aligned */
    .section-header {
      text-align: left;
      margin-bottom: 25px;
      position: relative;
      padding: 0 20px;
      max-width: 1200px;
      margin-left: auto;
      margin-right: auto;
    }

    .section-header h2 {
      color: #1a1a1a;
      font-size: 28px;
      font-weight: 600;
      margin: 0;
      padding-bottom: 12px;
      position: relative;
      display: inline-block;
    }

    .section-header h2::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      transform: none;
      width: 50px;
      height: 3px;
      background: #E31837;
      border-radius: 2px;
    }

    /* Categories Grid */
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      padding: 0 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .category-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-decoration: none;
      padding: 15px;
      border-radius: 12px;
      background: #fff;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .category-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 120px;
      background: linear-gradient(45deg, rgba(227, 24, 55, 0.05), rgba(255, 241, 244, 0.5));
      z-index: 0;
      border-radius: 12px 12px 50% 50%;
      transition: all 0.3s ease;
    }

    .category-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
      border-color: rgba(227, 24, 55, 0.2);
    }

    .category-card:hover::before {
      height: 130px;
      background: linear-gradient(45deg, rgba(243, 241, 241, 0.08), rgba(255, 241, 244, 0.6));
    }

    .category-image {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      overflow: hidden;
      margin-bottom: 15px;
      position: relative;
      z-index: 1;
      border: 3px solid #fff;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .category-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
     
    .category-card:hover .category-image {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(227, 24, 55, 0.15);
    }

    .category-card:hover .category-image img {
      transform: scale(1.1);
    }

    .category-card h3 {
      color: #1a1a1a;
      font-size: 18px;
      text-align: center;
      margin: 0 0 5px;
      font-weight: 600;
      position: relative;
      z-index: 1;
      transition: color 0.3s ease;
    }

    .category-card:hover h3 {
      color: #E31837;
    }

    .category-card p {
      color: #666;
      font-size: 14px;
      text-align: center;
      margin: 0;
      position: relative;
      z-index: 1;
      line-height: 1.4;
    }

    /* Combo Packs Section */
    .combo-packs-section {
      padding: 25px 0;
      background:rgba(237, 240, 243, 0.98);
      position: relative;
    }

    /* Combo Packs Grid */
    .combo-packs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      padding: 0 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .combo-pack-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .combo-pack-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
      border-color: rgba(227, 24, 55, 0.2);
    }

    .combo-image {
      position: relative;
      height: 220px;
      overflow: hidden;
      }

    .combo-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    .combo-pack-card:hover .combo-image img {
      transform: scale(1.1);
    }

    .combo-info {
      padding: 24px;
    }

    .combo-info h3 {
      color: #1a1a1a;
      font-size: 20px;
      margin: 0 0 12px;
      font-weight: 600;
    }

    .combo-items {
      list-style: none;
      padding: 0;
      margin: 0 0 20px;
      color: #666;
      font-size: 14px;
    }

    .combo-items li {
      margin-bottom: 8px;
      padding-left: 20px;
      position: relative;
    }

    .combo-items li::before {
      content: '•';
      color: #E31837;
      position: absolute;
      left: 0;
      font-size: 18px;
      line-height: 1;
    }

    .weight {
      color: #666;
      font-size: 14px;
      font-weight: 500;
    }

    .price {
      color: #E31837;
      font-size: 24px;
      font-weight: 700;
    }

    .button-group {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .btn-buy-now,
    .btn-add-cart {
      padding: 12px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      border: none;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      height:40px;
      width:100%;
     }

    .btn-buy-now {
      background: #E31837;
      color: white;
    }

    .btn-buy-now:hover {
      background: #c41530;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(227, 24, 55, 0.2);
    }

    .btn-add-cart {
      background: #fff;
      color: #E31837;
      border: 2px solid #E31837;
    }

    .btn-add-cart:hover:not(.added) {
      background: #fff1f4;
      transform: translateY(-2px);
    }

    .btn-add-cart.added {
      background: #4CAF50;
      color: white;
      border-color: #4CAF50;
    }

    @media (max-width: 1024px) {
      .carousel-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .welcome-message h1 {
        font-size: 32px;
      }

      .section-header h2 {
        font-size: 24px;
      }

      .categories-grid {
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      }
    }

    @media (max-width: 768px) {
      .welcome-section,
      .carousel-section,
      .categories-section,
      .combo-packs-section {
        padding: 20px 0;
      }

      .categories-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
    }

      .category-image {
        width: 120px;
        height: 120px;
        margin-bottom: 12px;
      }

      .category-card h3 {
        font-size: 16px;
      }

      .category-card p {
        font-size: 13px;
      }

      .section-header {
        padding: 0 15px;
      }

      .section-header h2 {
        font-size: 24px;
      }
    }

    @media (max-width: 480px) {
      .categories-grid {
        grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

      .category-image {
        width: 100px;
        height: 100px;
        margin-bottom: 10px;
      }

      .category-card h3 {
      font-size: 14px;
      }

      .category-card p {
        font-size: 12px;
      }

      .section-header {
        padding: 0 10px;
      }

      .section-header h2 {
        font-size: 22px;
      }
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('categoriesSection') categoriesSection!: ElementRef;
  
  currentSlide = 0;
  currentQR = 0;
  private autoScrollInterval: any;
  private qrScrollInterval: any;

  carouselItems = [
    {
      title: 'Fresh Farm Chicken',
      description: 'Enjoy organic chicken delivered to your doorstep!',
      image: 'assets/images/p1.jpg'
    },
    {
      title: 'Weekend Special',
      description: 'Get 20% off on combo meat packs this weekend!',
      image: 'assets/images/p2.jpg'
    },
    {
      title: 'Premium Cuts',
      description: 'Premium goat, quail, and turkey meat now available!',
      image: 'assets/images/p3.jpeg'
    }
  ];

  qrCodes = [
    {
      
      image: 'assets/images/pos1.PNG'
    },
    {
      name: 'WhatsApp',
      image: 'assets/images/qr1.jpeg'
    },
    {
      name: 'Instagram',
      image: 'assets/images/qr2.jpeg'
    }
    
  ];

  mainCategories: Category[] = [
    {
      name: 'Chicken',
      image: 'assets/images/m1.jpg',
      route: '/chicken',
      description: 'Fresh farm-raised chicken'
    },
    {
      name: 'Country Chicken',
      image: 'assets/images/m2.png',
      route: '/country-chicken',
      description: 'Traditional free-range chicken'
    },
    {
      name: 'Japanese Quail',
      image: 'assets/images/m3.jpg',
      route: '/japanese-quail',
      description: 'Premium quality quail meat'
    },
    {
      name: 'Turkey Bird',
      image: 'assets/images/m4.jpg',
      route: '/turkey',
      description: 'Fresh turkey meat'
    },
    {
      name: 'Goat',
      image: 'assets/images/m5.jpg',
      route: '/goat',
      description: 'Premium goat meat cuts'
    }
  ];

  comboPacks: ComboPack[] = [
    {
      name: 'Gym Protein Pack',
      items: ['Chicken Breast Boneless'],
      weight: '250g',
      price: 100,
      image: 'assets/images/Gym Pack.jpg',
      isAddedToCart: false
    },
    {
      name: 'Pets Special Pack',
      items: ['Chicken Bone'],
      weight: '1kg',
      price: 70,
      image: 'assets/images/cb.webp',
      isAddedToCart: false
    },
    {
      name: 'Liver Pack',
      items: ['Liver Frozen'],
      weight: '1kg',
      price: 90,
      image: 'assets/images/Chicken liver .jpg',
      isAddedToCart: false
    },
    {
      name: 'Leg Pack',
      items: ['Chicken Leg'],
      weight: '1kg',
      price: 50,
      image: 'assets/images/legpack.avif',
      isAddedToCart: false
    }
  ];

  bestSellers = [
    {
      name: 'Fresh Chicken Breast',
      weight: '500g',
      price: 180,
      originalPrice: 200,
      discount: 10,
      image: 'assets/images/chicken-breast.jpg'
    },
    {
      name: 'Country Chicken',
      weight: '1kg',
      price: 320,
      image: 'assets/images/country-chicken.jpg'
    },
    {
      name: 'Goat Meat',
      weight: '500g',
      price: 400,
      originalPrice: 450,
      discount: 11,
      image: 'assets/images/goat-meat.jpg'
    },
    {
      name: 'Japanese Quail',
      weight: '4 pieces',
      price: 240,
      image: 'assets/images/quail.jpg'
    }
  ];

  constructor(
    private cartService: CartService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.startAutoScroll();
    this.startQRScroll();
  }

  ngOnDestroy() {
    this.stopAutoScroll();
    this.stopQRScroll();
  }

  startAutoScroll() {
    this.autoScrollInterval = setInterval(() => {
      this.nextSlide();
    }, 4000);
  }

  stopAutoScroll() {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
    }
  }

  startQRScroll() {
    this.qrScrollInterval = setInterval(() => {
      this.nextQR();
    }, 3000);
  }

  stopQRScroll() {
    if (this.qrScrollInterval) {
      clearInterval(this.qrScrollInterval);
    }
  }

  nextSlide() {
    this.stopAutoScroll();
    this.currentSlide = (this.currentSlide + 1) % this.carouselItems.length;
    this.startAutoScroll();
  }

  prevSlide() {
    this.stopAutoScroll();
    this.currentSlide = this.currentSlide === 0 ? 
      this.carouselItems.length - 1 : this.currentSlide - 1;
    this.startAutoScroll();
  }

  goToSlide(index: number) {
    this.stopAutoScroll();
    this.currentSlide = index;
    this.startAutoScroll();
  }

  nextQR() {
    this.stopQRScroll();
    this.currentQR = (this.currentQR + 1) % this.qrCodes.length;
    this.startQRScroll();
  }

  goToQR(index: number) {
    this.stopQRScroll();
    this.currentQR = index;
    this.startQRScroll();
  }

  addComboToCart(pack: ComboPack) {
    if (pack.isAddedToCart) return;
    const cartItem: CartItem = {
      id: pack.name,
      name: pack.name,
      price: pack.price,
      quantity: 1,
      weight: pack.weight,
      image: pack.image,
      isCombo: true
    };
    if (this.authService.isLoggedIn()) {
      this.cartService.addToCart(cartItem);
      pack.isAddedToCart = true;
    } else {
      this.cartService.savePendingCartItem(cartItem);
      this.router.navigate(['/login']);
    }
  }

  getAllSlides() {
    return new Array(this.carouselItems.length + 1);
  }

  scrollToCategories() {
    this.categoriesSection.nativeElement.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }

  buyNowCombo(pack: ComboPack) {
    const cartItem: CartItem = {
      id: pack.name,
      name: pack.name,
      price: pack.price,
      quantity: 1,
      weight: pack.weight,
      image: pack.image,
      isCombo: true
    };
    this.cartService.setBuyNowItem([cartItem]);
    this.router.navigate(['/checkout']);
  }

  getBadgeIcon(type: string) {
    switch (type) {
      case 'daily':
        return 'bi bi-clock-fill';
      case 'sunday':
        return 'bi bi-calendar-heart-fill';
      case 'combo':
        return 'bi bi-gift-fill';
      default:
        return '';
    }
  }

  onOrderNowClick() {
    this.router.navigate(['/chicken']);
  }
}