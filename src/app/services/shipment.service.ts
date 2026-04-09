import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppSettings } from '../settings/app-settings';
import {
  ShipmentDispatchDto,
  ShipmentDeliveryDto,
  ShipmentResponseDto
} from '../models/shipment.model';

@Injectable({
  providedIn: 'root'
})
export class ShipmentService {
  private apiUrl = AppSettings.apiEndpoint + 'shipments';

  constructor(private http: HttpClient) {}

  /**
   * Get shipment by ID
   * GET /api/shipments/{id}
   */
  getShipment(id: number): Observable<ShipmentResponseDto> {
    return this.http.get<ShipmentResponseDto>(`${this.apiUrl}/${id}`);
  }

  /**
   * List shipments with optional filters
   * GET /api/shipments?status={status}
   */
  listShipments(status?: string): Observable<ShipmentResponseDto[]> {
    let params = new HttpParams();

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<ShipmentResponseDto[]>(`${this.apiUrl}`, { params });
  }

  /**
   * Dispatch shipment
   * POST /api/shipments/{orderId}/dispatch
   */
  dispatch(orderId: number, dto: ShipmentDispatchDto): Observable<ShipmentResponseDto> {
    return this.http.post<ShipmentResponseDto>(`${this.apiUrl}/${orderId}/dispatch`, dto);
  }



  /**
   * Deliver shipment
   * POST /api/shipments/{shipmentId}/deliver
   */
  deliver(shipmentId: number, dto: ShipmentDeliveryDto): Observable<ShipmentResponseDto> {
    return this.http.post<ShipmentResponseDto>(`${this.apiUrl}/shipments/${shipmentId}/deliver`, dto);
  }

  /**
   * Update shipment status
   * PUT /api/shipments/{shipmentId}/status
   */
  updateStatus(shipmentId: number, dto: any): Observable<ShipmentResponseDto> {
    return this.http.put<ShipmentResponseDto>(`${this.apiUrl}/${shipmentId}/status`, dto);
  }
}
