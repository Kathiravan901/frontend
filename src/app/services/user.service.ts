import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppSettings } from '../settings/app-settings';
import { AppUserDTO } from '../models/app-user.model';
import { CreateUserDTO } from '../models/create-user.model';
import { LoginRequest } from '../models/login.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = AppSettings.apiEndpoint + 'user';

  constructor(private http: HttpClient) {}

  /**
   * Get all users
   * GET /api/user
   */
  getAllUsers(): Observable<AppUserDTO[]> {
    return this.http.get<AppUserDTO[]>(`${this.apiUrl}`);
  }

  /**
   * Create new user
   * POST /api/user/Registration
   */
  createUser(dto: CreateUserDTO): Observable<string> {
    return this.http.post(`${this.apiUrl}/Registration`, dto, { responseType: 'text' });
  }
}
