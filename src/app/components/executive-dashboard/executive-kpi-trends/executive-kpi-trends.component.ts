import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { KpiTrendsDto } from '../../../models/kpi.model';
import { KpiService } from '../../../services/kpi.service';
import { PerformanceTrendsComponent } from './performance-trends/performance-trends.component';
import { TopInventoryTurnsComponent } from './top-inventory-turns/top-inventory-turns.component';

@Component({
  selector: 'app-executive-kpi-trends',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PerformanceTrendsComponent, TopInventoryTurnsComponent],
  templateUrl: './executive-kpi-trends.component.html',
  styleUrls: ['./executive-kpi-trends.component.scss']
})
export class ExecutiveKpiTrendsComponent implements OnInit, OnChanges {
  @Input() trendsData: KpiTrendsDto | null = null;
  filterForm: FormGroup;
  filteredTrendsData: KpiTrendsDto | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private kpiService: KpiService
  ) {
    this.filterForm = this.fb.group({
      scope: ['Network'],
      fromDate: [this.getDefaultFromDate()],
      toDate: [this.getDefaultToDate()],
      bucket: ['Week'],
      topNInventoryBars: [10]
    });
  }

  get viewTrendsData(): KpiTrendsDto | null {
    return this.filteredTrendsData ?? this.trendsData;
  }

  ngOnInit(): void {
    this.syncFilterWithInput();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['trendsData']) {
      this.syncFilterWithInput();
    }
  }

  applyFilters(): void {
    this.errorMessage = '';
    const fromDate = new Date(this.filterForm.value.fromDate);
    const toDate = new Date(this.filterForm.value.toDate);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      this.errorMessage = 'Please select valid dates.';
      return;
    }

    if (fromDate > toDate) {
      this.errorMessage = 'From Date cannot be after To Date.';
      return;
    }

    toDate.setHours(23, 59, 59, 999);

    this.isLoading = true;
    this.kpiService.getTrends({
      scope: this.filterForm.value.scope,
      fromUtc: fromDate,
      toUtc: toDate,
      bucket: this.filterForm.value.bucket,
      topNInventoryBars: Number(this.filterForm.value.topNInventoryBars) || 10
    }).subscribe({
      next: (data) => {
        this.filteredTrendsData = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load KPI trends. Please try again.';
        this.isLoading = false;
      }
    });
  }

  resetFilters(): void {
    this.filterForm.patchValue({
      scope: this.trendsData?.scope || 'Network',
      fromDate: this.toDateInputValue(this.trendsData?.fromUtc) || this.getDefaultFromDate(),
      toDate: this.toDateInputValue(this.trendsData?.toUtc) || this.getDefaultToDate(),
      bucket: this.trendsData?.bucket || 'Week',
      topNInventoryBars: this.trendsData?.inventoryBars?.length || 10
    });
    this.filteredTrendsData = null;
    this.errorMessage = '';
  }

  private syncFilterWithInput(): void {
    if (!this.trendsData) {
      return;
    }

    this.filterForm.patchValue({
      scope: this.trendsData.scope || 'Network',
      fromDate: this.toDateInputValue(this.trendsData.fromUtc) || this.getDefaultFromDate(),
      toDate: this.toDateInputValue(this.trendsData.toUtc) || this.getDefaultToDate(),
      bucket: this.trendsData.bucket || 'Week',
      topNInventoryBars: this.trendsData.inventoryBars?.length || 10
    }, { emitEvent: false });
  }

  private toDateInputValue(value?: string | Date): string | null {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0];
  }

  private getDefaultFromDate(): string {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  }

  private getDefaultToDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}
