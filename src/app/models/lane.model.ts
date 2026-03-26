export interface LaneCreateDto {
  originLocationId: number;
  destinationLocationId: number;
  mode: string; // Road | Rail | Air | Sea
  transitTimeDays?: number;
}

export interface LaneUpdateDto extends LaneCreateDto {
  laneId: number;
}

export interface LaneResponseDto {
  laneId: number;
  originLocationId: number;
  destinationLocationId: number;
  mode: string;
  transitTimeDays?: number;
}
