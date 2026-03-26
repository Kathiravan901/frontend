import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserRole } from '../models/login.model';

export interface CurrentUser {
  userId: number;
  email: string;
  displayName: string;
  role: UserRole;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<CurrentUser | null>;
  public currentUser$: Observable<CurrentUser | null>;

  constructor() {
    this.currentUserSubject = new BehaviorSubject<CurrentUser | null>(this.getUserFromStorage());
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  /**
   * Get current user
   */
  public get currentUser(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): number | null {
    const user = this.currentUser;
    return user && typeof user.userId === 'number' ? user.userId : null;
  }

  /**
   * Get current user role
   */
  public get currentRole(): UserRole | null {
    return this.currentUser?.role || null;
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  /**
   * Set current user after login
   */
  setCurrentUser(user: CurrentUser, token: string): void {
    this.currentUserSubject.next(user);
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  /**
   * Get current user from storage
   */
  private getUserFromStorage(): CurrentUser | null {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Get auth token
   */
  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: UserRole | UserRole[]): boolean {
    if (!this.currentUser) {
      return false;
    }

    if (Array.isArray(role)) {
      return role.includes(this.currentUser.role);
    }

    return this.currentUser.role === role;
  }
}
