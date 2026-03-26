export interface UomCreateDto {
  uomCode: string;
}

export interface UomUpdateDto extends UomCreateDto {
  uomId: number;
}

export interface UomResponseDto {
  uomId: number;
  uomCode: string;
}
