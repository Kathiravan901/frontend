export interface LocationCreateDto {
  name: string;
  type: string; // Plant | Warehouse | DC
  region: string;
}

export interface LocationUpdateDto extends LocationCreateDto {
  locationId: number;
}

export interface LocationResponseDto {
  locationId: number;
  name: string;
  type: string;
  region: string;
}
