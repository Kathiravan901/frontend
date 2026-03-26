import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppSettings } from '../settings/app-settings';
import {
  ItemCreateDto,
  ItemUpdateDto,
  ItemResponseDto
} from '../models/item.model';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private apiUrl = AppSettings.apiEndpoint + 'items';

  constructor(private http: HttpClient) {}

  /**
   * Create item
   * POST /api/items
   */
  createItem(dto: ItemCreateDto): Observable<ItemResponseDto> {
    return this.http.post<ItemResponseDto>(`${this.apiUrl}`, dto);
  }

  /**
   * Get item by ID
   * GET /api/items/{id}
   */
  getItem(id: number): Observable<ItemResponseDto> {
    return this.http.get<ItemResponseDto>(`${this.apiUrl}/${id}`);
  }

  /**
   * Update item
   * PUT /api/items
   */
  updateItem(dto: ItemUpdateDto): Observable<ItemResponseDto> {
    return this.http.put<ItemResponseDto>(`${this.apiUrl}`, dto);
  }

  /**
   * Delete item
   * DELETE /api/items/{id}
   */
  deleteItem(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * List items with optional filters
   * GET /api/items?search={search}&category={category}
   */
  listItems(search?: string, category?: string): Observable<ItemResponseDto[]> {
    let params = new HttpParams();

    if (search) {
      params = params.set('search', search);
    }
    if (category) {
      params = params.set('category', category);
    }

    return this.http.get<ItemResponseDto[]>(`${this.apiUrl}`, { params });
  }
}
