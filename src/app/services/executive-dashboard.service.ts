import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { KpiService } from './kpi.service';
import { KpiReportDto, RiskSummaryDto, KpiTrendsDto, GenerateKpiRequest, RiskRequest, TrendRequest } from '../models/kpi.model';

export interface DashboardData {
  kpiData: KpiReportDto | null;
  riskData: RiskSummaryDto | null;
  trendsData: KpiTrendsDto | null;
}

@Injectable({
  providedIn: 'root'
})
export class ExecutiveDashboardService {

  constructor(private kpiService: KpiService) { }

  /**
   * Load all dashboard data in parallel
   */
  loadDashboardData(
    scope: string,
    fromDate: Date,
    toDate: Date,
    bucket: string
  ): Observable<DashboardData> {
    const kpiRequest: GenerateKpiRequest = {
      scope,
      fromUtc: fromDate,
      toUtc: toDate
    };

    const riskRequest: RiskRequest = {
      scope,
      fromUtc: fromDate,
      toUtc: toDate
    };

    const trendRequest: TrendRequest = {
      scope,
      fromUtc: fromDate,
      toUtc: toDate,
      bucket,
      topNInventoryBars: 10
    };

    // Load all three endpoints in parallel
    return forkJoin({
      kpiData: this.kpiService.generateReport(kpiRequest).pipe(
        catchError(() => of(null))
      ),
      riskData: this.kpiService.getRisks(riskRequest).pipe(
        catchError(() => of(null))
      ),
      trendsData: this.kpiService.getTrends(trendRequest).pipe(
        catchError(() => of(null))
      )
    });
  }

  /**
   * Generate a new KPI report
   */
  generateReport(
    scope: string,
    fromDate: Date,
    toDate: Date
  ): Observable<KpiReportDto> {
    const request: GenerateKpiRequest = {
      scope,
      fromUtc: fromDate,
      toUtc: toDate
    };

    return this.kpiService.generateReport(request);
  }

  /**
   * Load reports list
   */
  loadReports(scope?: string): Observable<KpiReportDto[]> {
    return this.kpiService.viewReportList(scope);
  }

  /**
   * Get report by ID
   */
  getReportById(id: number): Observable<KpiReportDto> {
    return this.kpiService.getReportById(id);
  }
}
