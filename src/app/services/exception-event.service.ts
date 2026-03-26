import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { AppSettings } from '../settings/app-settings';
import {
  ExceptionEventDTO,
  ExceptionEventUpsertDTO
} from '../models/exception-event.model';
import { ExceptionType, ExceptionSeverity, ActionStatus } from '../models/enums';

@Injectable({
  providedIn: 'root'
})
export class ExceptionEventService {
  private apiUrl = AppSettings.apiEndpoint + 'exceptionevent';
  private fallbackApiUrl = AppSettings.apiEndpoint + 'exceptionevents';

  constructor(private http: HttpClient) {}

  /**
   * Get all exception events
   * GET /api/exceptionevent
   */
  getAllExceptionEvents(): Observable<ExceptionEventDTO[]> {
    return this.http.get<ExceptionEventDTO[]>(`${this.apiUrl}`);
  }

  /**
   * Get exception event by ID
   * GET /api/exceptionevent/{id}
   */
  getExceptionEventById(id: number): Observable<ExceptionEventDTO> {
    return this.http.get<ExceptionEventDTO>(`${this.apiUrl}/${id}`);
  }

  /**
   * Filter exception events
   * GET /api/exceptionevent/filter?type={type}&severity={severity}&status={status}
   */
  filterExceptionEvents(
    type?: string,
    severity?: string,
    status?: string
  ): Observable<ExceptionEventDTO[]> {
    let params = new HttpParams();

    if (type) {
      params = params.set('type', type);
    }
    if (severity) {
      params = params.set('severity', severity);
    }
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<ExceptionEventDTO[]>(`${this.apiUrl}/filter`, { params });
  }

  /**
   * Create exception event
   * POST /api/exceptionevent
   */
  createExceptionEvent(dto: ExceptionEventUpsertDTO): Observable<ExceptionEventDTO> {
    return this.http.post<ExceptionEventDTO>(`${this.apiUrl}`, dto);
  }

  /**
   * Update exception event
   * PUT /api/exceptionevent/{id}
   */
  updateExceptionEvent(id: number, dto: ExceptionEventUpsertDTO): Observable<ExceptionEventDTO> {
    return this.http.put<ExceptionEventDTO>(`${this.apiUrl}/${id}`, dto).pipe(
      catchError((error) => {
        if (error?.status === 404) {
          return this.http.put<ExceptionEventDTO>(`${this.fallbackApiUrl}/${id}`, dto);
        }
        throw error;
      })
    );
  }

  /**
   * Delete exception event
   * DELETE /api/exceptionevent/{id}
   */
  deleteExceptionEvent(id: number): Observable<void> {
    return this.http
      .delete(`${this.apiUrl}/${id}`, { responseType: 'text' })
      .pipe(map(() => void 0));
  }
}
