import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppSettings } from '../settings/app-settings';
import {
  OrderCreateDto,
  OrderResponseDto
} from '../models/order.model';
import {
  ShipmentDispatchDto,
  ShipmentDeliveryDto,
  ShipmentResponseDto
} from '../models/shipment.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = AppSettings.apiEndpoint + 'orders';
  private shipmentApiUrl = AppSettings.apiEndpoint + 'shipments';

  constructor(private http: HttpClient) {}

  /**
   * Place a new order
   * POST /api/orders
   */
  placeOrder(dto: OrderCreateDto): Observable<OrderResponseDto> {
    return this.http.post<OrderResponseDto>(`${this.apiUrl}`, dto);
  }

  /**
   * Get order by ID
   * GET /api/orders/{id}
   */
  getOrder(id: number): Observable<OrderResponseDto> {
    return this.http.get<OrderResponseDto>(`${this.apiUrl}/${id}`);
  }

  /**
   * List orders with optional filters
   * GET /api/orders?type={type}&status={status}&fromUtc={fromUtc}&toUtc={toUtc}
   */
  listOrders(
    type?: string,
    status?: string,
    fromUtc?: Date,
    toUtc?: Date
  ): Observable<OrderResponseDto[]> {
    let params = new HttpParams();

    if (type) {
      params = params.set('type', type);
    }
    if (status) {
      params = params.set('status', status);
    }
    if (fromUtc) {
      params = params.set('fromUtc', fromUtc.toISOString());
    }
    if (toUtc) {
      params = params.set('toUtc', toUtc.toISOString());
    }

    return this.http.get<OrderResponseDto[]>(`${this.apiUrl}`, { params });
  }

  /**
   * Get shipment by ID
   * GET /api/shipments/{id}
   */
  getShipment(id: number): Observable<ShipmentResponseDto> {
    return this.http.get<ShipmentResponseDto>(`${this.shipmentApiUrl}/${id}`);
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

    return this.http.get<ShipmentResponseDto[]>(`${this.shipmentApiUrl}`, { params });
  }

  /**
   * Dispatch order (create shipment)
   * POST /api/shipments/{orderId}/dispatch
   */
  dispatchOrder(orderId: number, dto: ShipmentDispatchDto): Observable<ShipmentResponseDto> {
    return this.http.post<ShipmentResponseDto>(`${this.shipmentApiUrl}/${orderId}/dispatch`, dto);
  }

  /**
   * Deliver shipment
   * POST /api/shipments/shipments/{shipmentId}/deliver
   */
  deliverShipment(shipmentId: number, dto: ShipmentDeliveryDto): Observable<ShipmentResponseDto> {
    return this.http.post<ShipmentResponseDto>(`${this.shipmentApiUrl}/shipments/${shipmentId}/deliver`, dto);
  }
}
