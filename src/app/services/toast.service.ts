import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts$ = new BehaviorSubject<Toast[]>([]);
  private toastCounter = 0;

  constructor() {}

  /**
   * Get observable of toasts
   */
  getToasts(): Observable<Toast[]> {
    return this.toasts$.asObservable();
  }

  /**
   * Show success toast
   */
  success(message: string, duration: number = 5000): void {
    this.showToast(message, 'success', duration);
  }

  /**
   * Show error toast
   */
  error(message: string, duration: number = 5000): void {
    this.showToast(message, 'error', duration);
  }

  /**
   * Show warning toast
   */
  warning(message: string, duration: number = 5000): void {
    this.showToast(message, 'warning', duration);
  }

  /**
   * Show info toast
   */
  info(message: string, duration: number = 5000): void {
    this.showToast(message, 'info', duration);
  }

  /**
   * Show custom toast
   */
  private showToast(message: string, type: 'success' | 'error' | 'warning' | 'info', duration: number = 5000): void {
    const toast: Toast = {
      id: `toast-${++this.toastCounter}`,
      message,
      type,
      duration
    };

    const currentToasts = this.toasts$.value;
    this.toasts$.next([...currentToasts, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(toast.id);
      }, duration);
    }
  }

  /**
   * Remove toast by ID
   */
  removeToast(id: string): void {
    const currentToasts = this.toasts$.value;
    this.toasts$.next(currentToasts.filter(t => t.id !== id));
  }

  /**
   * Clear all toasts
   */
  clearAll(): void {
    this.toasts$.next([]);
  }
}
