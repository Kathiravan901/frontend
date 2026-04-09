import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppSettings } from '../settings/app-settings';
import { AppUserDTO } from '../models/app-user.model';
import { AuditLogDTO } from '../models/audit-log.model';

@Injectable({
  providedIn: 'root'
})
export class ManageUserService {
  private manageUsersUrl = AppSettings.apiEndpoint + 'ManageUsers';
  private managerUserUrl = AppSettings.apiEndpoint + 'ManagerUser';
  private newUserUrl = AppSettings.apiEndpoint + 'NewUserRegistration';

  constructor(private http: HttpClient) {}

  /**
   * Get all users
   * GET /api/ManageUsers
   */
  getAllUsers(): Observable<AppUserDTO[]> {
    return this.http.get<AppUserDTO[]>(`${this.manageUsersUrl}`);
  }

  /**
   * Get user by ID
   * GET /api/ManageUsers/view/{id}
   */
  getUserById(id: number): Observable<AppUserDTO> {
    return this.http.get<AppUserDTO>(`${this.manageUsersUrl}/view/${id}`);
  }

  /**
   * Get audit logs
   * GET /api/ManageUsers/ViewAuditLog
   */
  viewAuditLog(): Observable<AuditLogDTO[]> {
    return this.http.get<AuditLogDTO[]>(`${this.manageUsersUrl}/ViewAuditLog`);
  }

  /**
   * Create new user
   * POST /api/NewUserRegistration
   */
  createUser(dto: AppUserDTO): Observable<string> {
    return this.http.post<string>(`${this.newUserUrl}`, dto);
  }

  /**
   * Edit user
   * PATCH /api/ManageUsers
   */
  editUser(dto: AppUserDTO): Observable<string> {
    return this.http.patch<string>(`${this.manageUsersUrl}`, dto);
  }
}
