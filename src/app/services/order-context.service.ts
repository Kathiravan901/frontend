import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderContextService {
  private disabledOrderTypesSubject = new BehaviorSubject<string[]>([]);
  disabledOrderTypes$ = this.disabledOrderTypesSubject.asObservable();

  private visibleOrderTypesSubject = new BehaviorSubject<string[]>(['PO', 'SO', 'Transfer']);
  visibleOrderTypes$ = this.visibleOrderTypesSubject.asObservable();

  setDisabledOrderTypes(orderTypes: string[]): void {
    this.disabledOrderTypesSubject.next(orderTypes);
  }

  getDisabledOrderTypes(): string[] {
    return this.disabledOrderTypesSubject.value;
  }

  clearDisabledOrderTypes(): void {
    this.disabledOrderTypesSubject.next([]);
  }

  setVisibleOrderTypes(orderTypes: string[]): void {
    this.visibleOrderTypesSubject.next(orderTypes);
  }

  getVisibleOrderTypes(): string[] {
    return this.visibleOrderTypesSubject.value;
  }

  clearVisibleOrderTypes(): void {
    this.visibleOrderTypesSubject.next(['PO', 'SO', 'Transfer']);
  }
}
