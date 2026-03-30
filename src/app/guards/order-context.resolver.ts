import { Injectable, inject } from '@angular/core';
import { Resolve } from '@angular/router';
import { OrderContextService } from '../services/order-context.service';

@Injectable({
  providedIn: 'root'
})
export class OrderContextResolver implements Resolve<void> {
  private orderContextService = inject(OrderContextService);

  resolve(): void {
    // Reset to default context: show all order types with no disabled restrictions
    this.orderContextService.clearDisabledOrderTypes();
    this.orderContextService.clearVisibleOrderTypes();
  }
}

@Injectable({
  providedIn: 'root'
})
export class ProcurementOrderContextResolver implements Resolve<void> {
  private orderContextService = inject(OrderContextService);

  resolve(): void {
    // Disable Sales Order (SO) for procurement dashboard
    this.orderContextService.setDisabledOrderTypes(['SO']);
    // Show only PO and Transfer orders in procurement
    this.orderContextService.setVisibleOrderTypes(['PO', 'Transfer']);
  }
}

@Injectable({
  providedIn: 'root'
})
export class WarehouseOrderContextResolver implements Resolve<void> {
  private orderContextService = inject(OrderContextService);

  resolve(): void {
    // Disable Purchase Order (PO) for warehouse dashboard
    this.orderContextService.setDisabledOrderTypes(['PO']);
    // Show only SO and Transfer orders in warehouse
    this.orderContextService.setVisibleOrderTypes(['SO', 'Transfer']);
  }
}

