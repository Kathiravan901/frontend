import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppSettings } from '../settings/app-settings';
import {
  GenerateKpiRequest,
  KpiReportDto,
  RiskRequest,
  RiskSummaryDto,
  TrendRequest,
  KpiTrendsDto
} from '../models/kpi.model';

@Injectable({
  providedIn: 'root'
})
export class KpiService {
  private apiUrl = AppSettings.apiEndpoint + 'kpi';

  constructor(private http: HttpClient) {}

  /**
   * Generate KPI report
   * POST /api/kpi/generate
   */
  generateReport(request: GenerateKpiRequest): Observable<KpiReportDto> {
    return this.http.post<KpiReportDto>(`${this.apiUrl}/generate`, request);
  }

  /**
   * Get list of KPI reports
   * GET /api/kpi/reports?scope={scope}
   */
  viewReportList(scope?: string): Observable<KpiReportDto[]> {
    let params = new HttpParams();

    if (scope) {
      params = params.set('scope', scope);
    }

    return this.http.get<KpiReportDto[]>(`${this.apiUrl}/reports`, { params });
  }

  /**
   * Get KPI report by ID
   * GET /api/kpi/reports/{id}
   */
  getReportById(id: number): Observable<KpiReportDto> {
    return this.http.get<KpiReportDto>(`${this.apiUrl}/reports/${id}`);
  }

  /**
   * Get risk analysis
   * GET /api/kpi/risks?scope={scope}&fromUtc={fromUtc}&toUtc={toUtc}&laneId={laneId}
   */
  getRisks(request: RiskRequest): Observable<RiskSummaryDto> {
    let params = new HttpParams()
      .set('scope', request.scope)
      .set('fromUtc', request.fromUtc.toISOString())
      .set('toUtc', request.toUtc.toISOString());

    if (request.laneId) {
      params = params.set('laneId', request.laneId.toString());
    }

    return this.http.get<RiskSummaryDto>(`${this.apiUrl}/risks`, { params });
  }

  /**
   * Get trend analysis
   * GET /api/kpi/trends?scope={scope}&fromUtc={fromUtc}&toUtc={toUtc}&bucket={bucket}&topNInventoryBars={topNInventoryBars}
   */
  getTrends(request: TrendRequest): Observable<KpiTrendsDto> {
    let params = new HttpParams()
      .set('scope', request.scope)
      .set('fromUtc', request.fromUtc.toISOString())
      .set('toUtc', request.toUtc.toISOString())
      .set('bucket', request.bucket)
      .set('topNInventoryBars', request.topNInventoryBars.toString());

    return this.http.get<KpiTrendsDto>(`${this.apiUrl}/trends`, { params });
  }
}
