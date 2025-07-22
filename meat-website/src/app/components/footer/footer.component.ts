import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="footer">
      <div class="footer-main">
        <div class="container">
          <div class="footer-grid">
            <!-- About Section -->
            <div class="footer-section">
              <div class="footer-logo">
                <img src="assets/images/logo.png" alt="Pons Broilers Logo" height="60">
              </div>
              <p class="about-text">
                Your trusted destination for premium quality meat products. We deliver fresh, hygienic, and high-quality meat directly to your doorstep.
              </p>
              <div class="social-links">
                <a href="#" target="_blank" aria-label="Facebook">
                  <i class="bi bi-facebook"></i>
                </a>
                <a href="https://www.instagram.com/pons_17?utm_source=qr&igsh=MW8xYmR6Z3Mxa3NraQ==" target="_blank" aria-label="Instagram">
                  <i class="bi bi-instagram"></i>
                </a>
               
                <a href="https://whatsapp.com/channel/0029VbAR1TGJ3jv5JzEbdL3e" target="_blank" aria-label="WhatsApp">
                  <i class="bi bi-whatsapp"></i>
                </a>
              </div>
            </div>

            <!-- Categories -->
            <div class="footer-section footer-categories-center">
              <h3>Categories</h3>
              <ul>
                <li><a routerLink="/chicken">Chicken</a></li>
                <li><a routerLink="/country-chicken">Country Chicken</a></li>
                <li><a routerLink="/japanese-quail">Japanese Quail</a></li>
                <li><a routerLink="/turkey">Turkey</a></li>
                <li><a routerLink="/goat">Goat</a></li>
              </ul>
            </div>
            
            <!-- Contact Info -->
            <div class="footer-section">
              <h3>Contact Us</h3>
              <ul class="contact-info">
                <li>
                  <i class="bi bi-shop"></i>
                  <span>PONS MUTTON STALL AND BROILERS</span>
                </li>
                <li>
                  <i class="bi bi-geo-alt"></i>
                  <span>97, Sethuraja Street near Mattakadai Bazaar, Tuticorin - 628001</span>
                </li>
                <li>
                  <i class="bi bi-telephone"></i>
                  <span>
                    <a href="tel:+917904294113">+91 7904294113</a>,
                    <a href="tel:+917904312338 ">+91 7904312338</a>
                  </span>
                </li>
                <li>
                  <i class="bi bi-clock"></i>
                  <span>
                    Morning: 6am - 3pm<br>
                    Evening: 6pm - 8pm
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      

      <!-- Copyright -->
<div class="footer-bottom">
  <div class="container">
    <p>&copy; 2024 Pons Broilers. All rights reserved.</p>
    <p class="developed-by">
      Developed by 
      <img src="assets/images/stacZ.png" alt="StacZ Logo" class="stacz-logo">
    </p>
  </div>
</div>

  `,
  styles: [`
    .footer {
      background-color:rgba(26, 26, 26, 0.88);
      color: #fff;
      margin-top: 40px;
    }

    .footer-main {
      padding: 60px 0 40px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 15px;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
      align-items: start;
    }

    .footer-section {
      padding: 0 15px;
      margin-top: 0;
      padding-top: 0;
    }

    .footer-logo {
      margin-bottom: 20px;
    }

    .footer-logo img {
      max-width: 60%;
      height: auto;
    }

    .about-text {
      color: #b0b0b0;
      line-height: 1.6;
      margin-bottom: 20px;
    }

    .social-links {
      display: flex;
      gap: 15px;
    }

    .social-links a {
      color: #fff;
      font-size: 20px;
      transition: color 0.3s ease;
    }

    .social-links a:hover {
      color: #E31837;
    }

    .footer-section h3 {
      color: #fff;
      font-size: 18px;
      margin-bottom: 20px;
      font-weight: 600;
      position: relative;
      padding-bottom: 10px;
      margin-top: 0;
    }

    .footer-section h3::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0;
      width: 50px;
      height: 2px;
      background-color: #E31837;
    }

    .footer-section ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-section ul li {
      margin-bottom: 12px;
    }

    .footer-section ul li a {
      color: #b0b0b0;
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .footer-section ul li a:hover {
      color: #E31837;
    }

    .contact-info li {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      color: #b0b0b0;
      margin-bottom: 15px;
    }

    .contact-info li i {
      color: #E31837;
      font-size: 18px;
      margin-top: 3px;
    }

    .contact-info li a {
      color: #b0b0b0;
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .contact-info li a:hover {
      color: #E31837;
    }

    .payment-methods {
      background-color: #222;
      padding: 20px 0;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .payment-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
    }

    .payment-wrapper h4 {
      color: #fff;
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }

    .payment-icons {
      display: flex;
      gap: 20px;
      color: #b0b0b0;
    }

    .payment-icons i {
      font-size: 24px;
      transition: color 0.3s ease;
    }

    .payment-icons i:hover {
      color: #fff;
    }

    .footer-bottom {
      background-color: #151515;
      padding: 15px 0;
      text-align: center;
    }

    .footer-bottom p {
      color: #b0b0b0;
      margin: 0;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .footer-main {
        padding: 40px 0 20px;
      }

      .footer-grid {
        grid-template-columns: 1fr;
        gap: 30px;
      }

      .footer-section {
        padding: 0;
      }

      .payment-wrapper {
        flex-direction: column;
        text-align: center;
      }

      .payment-icons {
        justify-content: center;
      }
    }

    .footer-categories-center {
      display: flex;
      flex-direction: column;
      align-items: left;
      justify-content: center;
      margin-left: 40px;
      margin-right: 40px;
    }
    .footer-categories-center h3,
    .footer-categories-center ul {
      text-align: left;
    }

    @media (max-width: 900px) {
      .footer-categories-center {
        margin-left: 0;
        margin-right: 0;
      }
    }
      .developed-by {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 14px;
  color: #b0b0b0;
  margin-top: 5px;
}

.stacz-logo {
  height: 36px;  /* Increase or decrease as needed */
  width: auto;   /* Optional: set width explicitly like width: 100px; */
  object-fit: contain;
}

  `]
})
export class FooterComponent {
  constructor() {}
}