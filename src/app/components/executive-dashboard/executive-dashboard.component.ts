import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ExecutiveDashboardService } from '../../services/executive-dashboard.service';
import { ToastService } from '../../services/toast.service';
import { KpiReportDto, RiskSummaryDto, KpiTrendsDto } from '../../models/kpi.model';
import { ExecutiveKpiSummaryComponent } from './executive-kpi-summary/executive-kpi-summary.component';
import { ExecutiveKpiTrendsComponent } from './executive-kpi-trends/executive-kpi-trends.component';
import { ExecutiveRisksComponent } from './executive-risks/executive-risks.component';
import { ExecutiveReportsComponent } from './executive-reports/executive-reports.component';

@Component({
  selector: 'app-executive-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ExecutiveKpiSummaryComponent, ExecutiveKpiTrendsComponent, ExecutiveRisksComponent, ExecutiveReportsComponent],
  templateUrl: './executive-dashboard.component.html',
  styleUrls: ['./executive-dashboard.component.scss']
})
export class ExecutiveDashboardComponent implements OnInit {
  kpiData: KpiReportDto | null = null;
  riskData: RiskSummaryDto | null = null;
  trendsData: KpiTrendsDto | null = null;
  isLoading = false;
  errorMessage = '';
  activeSection: 'all' | 'summary' | 'trends' | 'risk' | 'reports' = 'summary';

  constructor(
    private dashboardService: ExecutiveDashboardService,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {}

  get isProfileRoute(): boolean {
    return this.route.firstChild?.snapshot.routeConfig?.path === 'profile';
  }

  ngOnInit(): void {
    // Listen to query params for section selection
    this.route.queryParams.subscribe(params => {
      const section = params['section'];
      if (section === 'trends') {
        this.activeSection = 'trends';
      } else if (section === 'risk') {
        this.activeSection = 'risk';
      } else if (section === 'reports') {
        this.activeSection = 'reports';
      } else {
        this.activeSection = 'summary';
      }
    });

    if (!this.isProfileRoute) {
      this.loadDashboardData();
    }
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const scope = 'Network';
    const fromDate = new Date();
    fromDate.setMonth(fromDate.getMonth() - 1);
    const toDate = new Date();
    toDate.setHours(23, 59, 59, 999);
    const bucket = 'Week';

    this.dashboardService.loadDashboardData(scope, fromDate, toDate, bucket).subscribe({
      next: (data) => {
        this.kpiData = data.kpiData;
        this.riskData = data.riskData;
        this.trendsData = data.trendsData;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.toastService.error('Failed to load dashboard data. Please try again.');
        this.isLoading = false;
      }
    });
  }
}
