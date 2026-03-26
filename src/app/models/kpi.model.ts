export interface GenerateKpiRequest {
  scope: string;
  fromUtc: Date;
  toUtc: Date;
  laneId?: number;
}

export interface KpiReportDto {
  reportId: number;
  scope: string;
  otif: number;
  fillRate: number;
  inventoryTurn: number;
  delayRate: number;
  generatedDate: Date;
  metrics: string;
}

export interface RiskRequest {
  scope: string; // Network/Lane/Period
  fromUtc: Date;
  toUtc: Date;
  laneId?: number;
}

export interface RiskSummaryDto {
  shipmentDelayRiskPercent: number;
  shipmentsDelayed: number;
  shipmentsTotal: number;
  inventoryShortagePositions: number;
  inventoryPositionsTotal: number;
  suppliersAtRisk: number;
  openPurchaseOrdersOverdue: number;
  capacityRiskOpenEvents: number;
}

export interface TrendRequest {
  scope: string;
  fromUtc: Date;
  toUtc: Date;
  bucket: string; // Day | Week | Month
  topNInventoryBars: number;
}

export interface KpiTrendsDto {
  scope: string;
  fromUtc: Date;
  toUtc: Date;
  bucket: string;
  otifVsDelay: KpiTrendPoint[];
  inventoryBars: InventoryBar[];
}

export interface KpiTrendPoint {
  periodStartUtc: Date;
  otif: number;
  delayRate: number;
}

export interface InventoryBar {
  label: string;
  inventoryTurns: number;
}
