import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ExecutiveDashboardService } from '../../../services/executive-dashboard.service';
import { KpiReportDto } from '../../../models/kpi.model';

interface ReportItem {
  reportId: number;
  scope: string;
  otif: number;
  fillRate: number;
  inventoryTurn: number;
  delayRate: number;
  generatedDate: Date;
  metrics: string;
}

@Component({
  selector: 'app-executive-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './executive-reports.component.html',
  styleUrls: ['./executive-reports.component.scss']
})
export class ExecutiveReportsComponent implements OnInit {
  filterForm: FormGroup;
  reports: ReportItem[] = [];
  isLoading = false;
  isGenerating = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private dashboardService: ExecutiveDashboardService
  ) {
    this.filterForm = this.fb.group({
      scope: ['Network'],
      fromDate: [this.getDefaultFromDate()],
      toDate: [new Date().toISOString().split('T')[0]],
      bucket: ['Week']
    });
  }

  getDefaultFromDate(): string {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadReports();
  }

  onFilterChange(): void {
    this.loadReports();
  }

  generateReport(): void {
    if (this.isGenerating) return;

    this.isGenerating = true;
    this.errorMessage = '';
    this.successMessage = '';

    const scope = this.filterForm.value.scope;
    const fromDate = new Date(this.filterForm.value.fromDate);
    const toDate = new Date(this.filterForm.value.toDate);

    this.dashboardService.generateReport(scope, fromDate, toDate).subscribe({
      next: (data: KpiReportDto) => {
        this.isGenerating = false;
        
        // Check if backend returned a message indicating report already exists
        const message = (data as any)?.message || '';
        if (message.toLowerCase().includes('already exists') || message.toLowerCase().includes('duplicate')) {
          this.successMessage = `Report already exists for ${scope} scope with these parameters.`;
        } else {
          this.successMessage = `Report generated successfully for ${scope} scope!`;
        }
        
        setTimeout(() => {
          this.successMessage = '';
        }, 4000);
        this.loadReports();
      },
      error: (error: any) => {
        console.error('Error generating report:', error);
        this.isGenerating = false;
        
        // Check if error is due to duplicate report
        const errorMsg = error?.error?.message || '';
        if (errorMsg.toLowerCase().includes('already exists') || errorMsg.toLowerCase().includes('duplicate')) {
          this.successMessage = `Report already exists for ${scope} scope with these parameters.`;
          setTimeout(() => {
            this.successMessage = '';
          }, 4000);
        } else {
          this.errorMessage = errorMsg || 'Failed to generate report. Please check your date range.';
        }
        
        this.loadReports();
      }
    });
  }

  loadReports(): void {
    this.isLoading = true;
    this.errorMessage = '';
    const scope = this.filterForm.value.scope;

    this.dashboardService.loadReports(scope).subscribe({
      next: (data: KpiReportDto[]) => {
        this.reports = data || [];
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading reports:', error);
        this.errorMessage = 'Failed to load reports. Please try again.';
        this.isLoading = false;
      }
    });
  }

  downloadReport(report: ReportItem): void {
    this.successMessage = '';
    try {
      // Create CSV content
      const csvContent = this.generateCSV(report);
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `Report_${report.scope}_${new Date(report.generatedDate).toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      this.successMessage = 'Report downloaded successfully!';
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } catch (error) {
      console.error('Error downloading report:', error);
      this.errorMessage = 'Failed to download report.';
    }
  }

  private generateCSV(report: ReportItem): string {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Report ID', report.reportId.toString()],
      ['Scope', report.scope],
      ['OTIF (%)', report.otif.toFixed(2)],
      ['Fill Rate (%)', report.fillRate.toFixed(2)],
      ['Inventory Turns', report.inventoryTurn.toFixed(2)],
      ['Delay Rate (%)', report.delayRate.toFixed(2)],
      ['Generated Date', new Date(report.generatedDate).toLocaleString()],
      ['Additional Metrics', report.metrics]
    ];

    const csvArray = [headers, ...rows];
    return csvArray.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  getMetricsPreview(metrics: string): string {
    if (!metrics) return 'N/A';
    return metrics.substring(0, 50) + (metrics.length > 50 ? '...' : '');
  }
}
