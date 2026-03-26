import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppSettings } from '../settings/app-settings';
import {
  PartnerCreateDto,
  PartnerUpdateDto,
  PartnerResponseDto
} from '../models/partner.model';
import { PartnerStatus } from '../models/enums';

@Injectable({
  providedIn: 'root'
})
export class PartnerService {
  private apiUrl = AppSettings.apiEndpoint + 'partner';

  constructor(private http: HttpClient) {}

  /**
   * Create partner
   * POST /api/partner
   */
  createPartner(dto: PartnerCreateDto): Observable<PartnerResponseDto> {
    return this.http.post<PartnerResponseDto>(`${this.apiUrl}`, dto);
  }

  /**
   * Get partner by ID
   * GET /api/partner/{id}
   */
  getPartner(id: number): Observable<PartnerResponseDto> {
    return this.http.get<PartnerResponseDto>(`${this.apiUrl}/${id}`);
  }

  /**
   * Update partner
   * PUT /api/partner/{id}
   */
  updatePartner(dto: PartnerUpdateDto): Observable<PartnerResponseDto> {
    return this.http.put<PartnerResponseDto>(`${this.apiUrl}/${dto.partnerId}`, dto);
  }

  /**
   * Delete partner
   * DELETE /api/partner/{id}
   */
  deletePartner(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * List partners with optional filters
   * GET /api/partner?Type={Type}&Status={Status}&Search={Search}
   */
  listPartners(type?: string, status?: PartnerStatus, search?: string): Observable<PartnerResponseDto[]> {
    let params = new HttpParams();

    if (type) {
      params = params.set('Type', type);
    }
    if (status) {
      params = params.set('Status', status.toString());
    }
    if (search) {
      params = params.set('Search', search);
    }

    return this.http.get<PartnerResponseDto[]>(`${this.apiUrl}`, { params });
  }
}
