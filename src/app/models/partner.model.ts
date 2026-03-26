import { PartnerStatus } from './enums';

export interface PartnerCreateDto {
  partnerName: string;
  partnerType: string; // Supplier | Carrier | 3PL
  status: PartnerStatus;
}

export interface PartnerUpdateDto {
  partnerId: number;
  partnerName: string;
  partnerType: string;
  status: PartnerStatus;
}


export interface PartnerResponseDto {
  partnerId: number;
  partnerName: string;
  partnerType: string;
  status: string;
}
