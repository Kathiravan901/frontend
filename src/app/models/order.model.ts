export interface OrderLineCreateDto {
  itemId: number;
  qtyOrdered: number;
  unitPrice?: number;
}

export interface OrderCreateDto {
  orderType: string; // PO | SO | Transfer
  partnerId?: number;
  originLocationId?: number;
  destinationLocationId?: number;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  lines: OrderLineCreateDto[];
}

export interface OrderResponseDto {
  orderId: number;
  orderType: string;
  partnerId?: number;
  originLocationId?: number;
  destinationLocationId?: number;
  orderDateUtc: Date;
  expectedDeliveryDateUtc?: Date;
  status: string;
  lines: OrderLineResponseDto[];
}

export interface OrderLineResponseDto {
  orderLineId: number;
  itemId: number;
  qtyOrdered: number;
  unitPrice?: number;
}
