import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiTrendsDto } from '../../../models/kpi.model';
import { PerformanceTrendsComponent } from './performance-trends/performance-trends.component';
import { TopInventoryTurnsComponent } from './top-inventory-turns/top-inventory-turns.component';

@Component({
  selector: 'app-executive-kpi-trends',
  standalone: true,
  imports: [CommonModule, PerformanceTrendsComponent, TopInventoryTurnsComponent],
  templateUrl: './executive-kpi-trends.component.html',
  styleUrls: ['./executive-kpi-trends.component.scss']
})
export class ExecutiveKpiTrendsComponent implements OnInit {
  @Input() trendsData: KpiTrendsDto | null = null;

  ngOnInit(): void {}
}
