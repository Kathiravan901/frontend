export interface ShipmentDispatchDto {
  carrierPartnerId: number;
  shipmentRefNo?: string;
  dispatchDateUtc: Date;
  estimatedArrivalUtc?: Date;
}

export interface ShipmentDeliveryDto {
  actualArrivalUtc: Date;
}

export interface ShipmentResponseDto {
  shipmentId: number;
  orderId: number;
  carrierPartnerId: number;
  shipmentRefNo?: string;
  dispatchDateUtc?: Date;
  estimatedArrivalUtc?: Date;
  actualArrivalUtc?: Date;
  status: string;
}
