import { ExceptionType, ExceptionSeverity } from './enums';

export interface ExceptionEventDTO {
  exceptionId: number;
  type: string; // Delay | Shortage | Capacity
  referenceType: string; // Order | Shipment | InventoryPosition
  referenceId: number;
  detectedDate: Date;
  severity: string; // Low | Medium | High
  status: string;
}

export interface ExceptionEventUpsertDTO {
  type: string;
  referenceType: string;
  referenceId: number;
  detectedDate: Date;
  severity: string;
  status: string;
}
