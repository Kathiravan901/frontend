import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppSettings } from '../settings/app-settings';
import {
  OrderCreateDto,
  OrderResponseDto
} from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = AppSettings.apiEndpoint + 'orders';

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

}
