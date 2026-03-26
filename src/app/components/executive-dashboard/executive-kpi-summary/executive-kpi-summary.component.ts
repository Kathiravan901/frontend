import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiReportDto } from '../../../models/kpi.model';

@Component({
  selector: 'app-executive-kpi-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './executive-kpi-summary.component.html',
  styleUrls: ['./executive-kpi-summary.component.scss']
})
export class ExecutiveKpiSummaryComponent {
  @Input() kpiData: KpiReportDto | null = null;
}
