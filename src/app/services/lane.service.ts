import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppSettings } from '../settings/app-settings';
import {
  LaneCreateDto,
  LaneUpdateDto,
  LaneResponseDto
} from '../models/lane.model';

@Injectable({
  providedIn: 'root'
})
export class LaneService {
  private apiUrl = AppSettings.apiEndpoint + 'lanes';

  constructor(private http: HttpClient) {}

  /**
   * Create lane
   * POST /api/lanes
   */
  createLane(dto: LaneCreateDto): Observable<LaneResponseDto> {
    return this.http.post<LaneResponseDto>(`${this.apiUrl}`, dto);
  }

  /**
   * Get lane by ID
   * GET /api/lanes/{id}
   */
  getLane(id: number): Observable<LaneResponseDto> {
    return this.http.get<LaneResponseDto>(`${this.apiUrl}/${id}`);
  }

  /**
   * Update lane
   * PUT /api/lanes
   */
  updateLane(dto: LaneUpdateDto): Observable<LaneResponseDto> {
    return this.http.put<LaneResponseDto>(`${this.apiUrl}`, dto);
  }

  /**
   * Delete lane
   * DELETE /api/lanes/{id}
   */
  deleteLane(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * List lanes with optional filters
   * GET /api/lanes?originId={originId}&destId={destId}&mode={mode}
   */
  listLanes(originId?: number, destId?: number, mode?: string): Observable<LaneResponseDto[]> {
    let params = new HttpParams();

    if (originId) {
      params = params.set('originId', originId.toString());
    }
    if (destId) {
      params = params.set('destId', destId.toString());
    }
    if (mode) {
      params = params.set('mode', mode);
    }

    return this.http.get<LaneResponseDto[]>(`${this.apiUrl}`, { params });
  }
}
