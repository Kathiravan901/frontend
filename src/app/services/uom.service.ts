import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppSettings } from '../settings/app-settings';
import {
  UomCreateDto,
  UomUpdateDto,
  UomResponseDto
} from '../models/uom.model';

@Injectable({
  providedIn: 'root'
})
export class UomService {
  private apiUrl = AppSettings.apiEndpoint + 'uoms';

  constructor(private http: HttpClient) {}

  /**
   * Create UOM
   * POST /api/uoms
   */
  createUom(dto: UomCreateDto): Observable<UomResponseDto> {
    return this.http.post<UomResponseDto>(`${this.apiUrl}`, dto);
  }

  /**
   * Get UOM by ID
   * GET /api/uoms/{id}
   */
  getUom(id: number): Observable<UomResponseDto> {
    return this.http.get<UomResponseDto>(`${this.apiUrl}/${id}`);
  }

  /**
   * Update UOM
   * PUT /api/uoms
   */
  updateUom(dto: UomUpdateDto): Observable<UomResponseDto> {
    return this.http.put<UomResponseDto>(`${this.apiUrl}`, dto);
  }

  /**
   * Delete UOM
   * DELETE /api/uoms/{id}
   */
  deleteUom(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * List UOMs with optional filters
   * GET /api/uoms?search={search}
   */
  listUoms(search?: string): Observable<UomResponseDto[]> {
    let params = new HttpParams();

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<UomResponseDto[]>(`${this.apiUrl}`, { params });
  }
}
