export interface ItemCreateDto {
  itemName: string;
  itemDescription?: string;
  unitPrice: number;
  uomId?: number;
  itemThreshold: number;
  category?: string;
}

export interface ItemUpdateDto extends ItemCreateDto {
  itemId: number;
}

export interface ItemResponseDto {
  itemId: number;
  itemName: string;
  itemDescription?: string;
  unitPrice: number;
  uomId?: number;
  itemThreshold: number;
  category?: string;
}
