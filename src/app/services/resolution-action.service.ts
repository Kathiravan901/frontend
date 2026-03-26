import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppSettings } from '../settings/app-settings';
import {
  ResolutionActionDTO,
  ResolutionActionUpsertDTO
} from '../models/resolution-action.model';
import { AppUserDTO } from '../models/app-user.model';

@Injectable({
  providedIn: 'root'
})
export class ResolutionActionService {
  private apiUrl = AppSettings.apiEndpoint + 'resolutionaction';
  private fallbackApiUrl = AppSettings.apiEndpoint + 'resolutionactions';

  constructor(private http: HttpClient) {}

  /**
   * Get all resolution actions
   * GET /api/resolutionaction
   */
  getAllResolutionActions(): Observable<ResolutionActionDTO[]> {
    return this.http.get<ResolutionActionDTO[]>(`${this.apiUrl}`);
  }

  /**
   * Get assignable users for resolution owner dropdown
   * GET /api/resolutionaction/owners
   */
  getAssignableUsers(): Observable<AppUserDTO[]> {
    return this.http.get<AppUserDTO[]>(`${this.apiUrl}/owners`).pipe(
      catchError(() =>
        this.http.get<AppUserDTO[]>(`${this.fallbackApiUrl}/owners`).pipe(
          catchError(() => of([]))
        )
      )
    );
  }

  /**
   * Get resolution action by ID
   * GET /api/resolutionaction/{id}
   */
  getResolutionActionById(id: number): Observable<ResolutionActionDTO> {
    return this.http.get<ResolutionActionDTO>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get resolution actions by exception ID
   * GET /api/resolutionaction/by-exception/{exceptionId}
   */
  getByExceptionId(exceptionId: number): Observable<ResolutionActionDTO[]> {
    return this.http.get<ResolutionActionDTO[]>(`${this.apiUrl}/by-exception/${exceptionId}`);
  }

  /**
   * Filter resolution actions
   * GET /api/resolutionaction/filter?status={status}
   */
  filterResolutionActions(status: string): Observable<ResolutionActionDTO[]> {
    let params = new HttpParams().set('status', status);
    return this.http.get<ResolutionActionDTO[]>(`${this.apiUrl}/filter`, { params });
  }

  /**
   * Create resolution action
   * POST /api/resolutionaction
   */
  createResolutionAction(dto: ResolutionActionUpsertDTO): Observable<ResolutionActionDTO> {
    return this.http.post<ResolutionActionDTO>(`${this.apiUrl}`, dto);
  }

  /**
   * Update resolution action
   * PUT /api/resolutionaction/{id}
   */
  updateResolutionAction(id: number, dto: ResolutionActionUpsertDTO): Observable<ResolutionActionDTO> {
    return this.http.put<ResolutionActionDTO>(`${this.apiUrl}/${id}`, dto);
  }

  /**
   * Delete resolution action
   * DELETE /api/resolutionaction/{id}
   */
  deleteResolutionAction(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
