import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AppSettings } from '../settings/app-settings';
import { LoginRequest } from '../models/login.model';
import { AuthenticationService, CurrentUser } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = AppSettings.apiEndpoint + 'User';

  constructor(
    private http: HttpClient,
    private authService: AuthenticationService
  ) {}

  /**
   * Decode JWT token and extract claims
   */
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Extract user information from JWT token
   */
  private extractUserFromToken(token: string): CurrentUser | null {
    const payload = this.decodeToken(token);
    if (!payload) {
      return null;
    }

    // Extract userId from various possible claim names
    let userId = 0;
    const userIdClaim = payload['UserId'] || 
                        payload['uid'] || 
                        payload['sub'] ||
                        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
                        payload['user_id'] ||
                        payload['id'] ||
                        payload['oid'];
    
    if (userIdClaim !== undefined && userIdClaim !== null && userIdClaim !== '') {
      const parsedId = parseInt(userIdClaim, 10);
      userId = isNaN(parsedId) ? 0 : parsedId;
    }

    // Extract claims from JWT - Standard .NET JWT claim paths
    const email = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || 
                  payload['email'] || 
                  payload['sub'] || 
                  '';
    
    const displayName = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 
                        payload['name'] || 
                        email;
    
    const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 
                 payload['role'] || 
                 'Planner';

    // Map role name to proper format - case insensitive
    const roleMap: { [key: string]: string } = {
      'admin': 'Admin',
      'executive': 'Executive',
      'logistics': 'Logistics',
      'planner': 'Planner',
      'procurement': 'Procurement',
      'warehouse': 'Warehouse'
    };

    const normalizedRole = roleMap[role.toLowerCase()] || role;

    const user: CurrentUser = {
      userId: userId,
      email: email,
      displayName: displayName,
      role: normalizedRole as any
    };

    return user;
  }

  /**
   * Login user with email and password
   * POST /api/User/Login
   * Backend returns plain JWT token as text (not JSON)
   */
  login(request: LoginRequest): Observable<CurrentUser> {
    return this.http.post(`${this.apiUrl}/Login`, request, {
      responseType: 'text'
    }).pipe(
      map((token: string) => {
        // Token comes back as plain text, not JSON
        const trimmedToken = token.trim();

        const user = this.extractUserFromToken(trimmedToken);
        if (!user) {
          throw new Error('Failed to extract user from token');
        }

        // Store token and user in AuthenticationService
        this.authService.setCurrentUser(user, trimmedToken);

        return user;
      })
    );
  }
}
