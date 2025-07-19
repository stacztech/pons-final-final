import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, of, throwError } from 'rxjs';
import { map, filter, switchMap, takeUntil, debounceTime, distinctUntilChanged, catchError, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Review {
  id: string;
  userId: string;
  orderId: string;
  productId?: string; // Optional, if reviews are product-specific
  rating: number; // 1-5 stars
  comment: string;
  date: string; // ISO string
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private reviews: Review[] = [];

  constructor(private authService: AuthService) {
    this.loadReviews();
  }

  private loadReviews() {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    const savedReviews = localStorage.getItem(`reviews_${user.id}`);
    if (savedReviews) {
      this.reviews = JSON.parse(savedReviews);
    }
  }

  private saveReviews() {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    localStorage.setItem(`reviews_${user.id}`, JSON.stringify(this.reviews));
  }

  submitReview(reviewData: { orderId: string; productId?: string; rating: number; comment: string }): Observable<Review> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User must be logged in to submit a review');
    }

    const newReview: Review = {
      id: 'REV' + Date.now() + Math.random().toString(36).substr(2, 9),
      userId: user.id,
      date: new Date().toISOString(),
      ...reviewData
    };

    this.reviews.unshift(newReview);
    this.saveReviews();
    return of(newReview);
  }

  getReviewsByUserId(userId: string): Observable<Review[]> {
    this.loadReviews(); // Ensure latest data
    return of(this.reviews.filter(review => review.userId === userId));
  }

  getReviewById(reviewId: string): Observable<Review | undefined> {
    this.loadReviews();
    return of(this.reviews.find(review => review.id === reviewId));
  }

  updateReview(reviewId: string, updatedData: { rating?: number; comment?: string }): Observable<boolean> {
    const user = this.authService.getCurrentUser();
    if (!user) return of(false);

    const reviewIndex = this.reviews.findIndex(r => r.id === reviewId && r.userId === user.id);
    if (reviewIndex === -1) return of(false);

    this.reviews[reviewIndex] = { ...this.reviews[reviewIndex], ...updatedData, date: new Date().toISOString() };
    this.saveReviews();
    return of(true);
  }

  deleteReview(reviewId: string): Observable<boolean> {
    const user = this.authService.getCurrentUser();
    if (!user) return of(false);

    const initialLength = this.reviews.length;
    this.reviews = this.reviews.filter(r => r.id !== reviewId || r.userId !== user.id);
    if (this.reviews.length < initialLength) {
      this.saveReviews();
      return of(true);
    }
    return of(false);
  }
} 