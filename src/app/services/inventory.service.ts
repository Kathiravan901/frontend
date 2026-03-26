import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppSettings } from '../settings/app-settings';
import {
  InventoryAdjustDto,
  InventoryAdjustBatchDto,
  InventoryPositionResponseDto
} from '../models/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = AppSettings.apiEndpoint + 'inventory';

  constructor(private http: HttpClient) {}

  /**
   * List inventory with optional filters
   * GET /api/inventory?locationId={locationId}&itemId={itemId}&onlyLowStock={onlyLowStock}&search={search}
   */
  listInventory(
    locationId?: number,
    itemId?: number,
    onlyLowStock: boolean = false,
    search?: string
  ): Observable<InventoryPositionResponseDto[]> {
    let params = new HttpParams();

    if (locationId) {
      params = params.set('locationId', locationId.toString());
    }
    if (itemId) {
      params = params.set('itemId', itemId.toString());
    }
    if (onlyLowStock) {
      params = params.set('onlyLowStock', 'true');
    }
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<InventoryPositionResponseDto[]>(`${this.apiUrl}`, { params });
  }

  /**
   * Adjust inventory
   * POST /api/inventory/adjust
   */
  adjustInventory(dto: InventoryAdjustDto): Observable<InventoryPositionResponseDto> {
    return this.http.post<InventoryPositionResponseDto>(`${this.apiUrl}/adjust`, dto);
  }

  /**
   * Adjust inventory in batch
   * POST /api/inventory/adjust-batch
   */
  adjustInventoryBatch(dto: InventoryAdjustBatchDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/adjust-batch`, dto);
  }
}
