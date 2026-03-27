export interface InventoryAdjustDto {
  locationId: number;
  itemId: number;
  deltaQty: number;
  safetyStock?: number;
}

export interface InventoryAdjustBatchDto {
  movements: InventoryAdjustDto[];
}

export interface InventoryPositionResponseDto {
  inventoryId: number;
  locationId: number;
  itemId: number;
  quantityOnHand: number;
  safetyStock: number;
  itemThreshold: number;
  reorderLevel: number;
}
