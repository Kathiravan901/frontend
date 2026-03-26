import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppSettings } from '../settings/app-settings';
import {
  LocationCreateDto,
  LocationUpdateDto,
  LocationResponseDto
} from '../models/location.model';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiUrl = AppSettings.apiEndpoint + 'locations';

  constructor(private http: HttpClient) {}

  /**
   * Create location
   * POST /api/locations
   */
  createLocation(dto: LocationCreateDto): Observable<LocationResponseDto> {
    return this.http.post<LocationResponseDto>(`${this.apiUrl}`, dto);
  }

  /**
   * Get location by ID
   * GET /api/locations/{id}
   */
  getLocation(id: number): Observable<LocationResponseDto> {
    return this.http.get<LocationResponseDto>(`${this.apiUrl}/${id}`);
  }

  /**
   * Update location
   * PUT /api/locations/{id}
   */
  updateLocation(dto: LocationUpdateDto): Observable<LocationResponseDto> {
    return this.http.put<LocationResponseDto>(`${this.apiUrl}/${dto.locationId}`, dto);
  }

  /**
   * Delete location
   * DELETE /api/locations/{id}
   */
  deleteLocation(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * List locations with optional filters
   * GET /api/locations?Type={Type}&Search={Search}
   */
  listLocations(type?: string, search?: string): Observable<LocationResponseDto[]> {
    let params = new HttpParams();

    if (type) {
      params = params.set('Type', type);
    }
    if (search) {
      params = params.set('Search', search);
    }

    return this.http.get<LocationResponseDto[]>(`${this.apiUrl}`, { params });
  }
}
