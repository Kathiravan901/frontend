import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiTrendsDto } from '../../../../models/kpi.model';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-top-inventory-turns',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-inventory-turns.component.html',
  styleUrls: ['./top-inventory-turns.component.scss']
})
export class TopInventoryTurnsComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() trendsData: KpiTrendsDto | null = null;
  @ViewChild('inventoryChart', { static: false }) inventoryChartRef!: ElementRef<HTMLCanvasElement>;

  private inventoryChart: Chart | null = null;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.trendsData) {
      setTimeout(() => {
        this.renderInventoryChart();
      }, 100);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['trendsData'] && this.trendsData && this.inventoryChartRef) {
      this.destroyChart(this.inventoryChart);
      setTimeout(() => {
        this.renderInventoryChart();
      }, 100);
    }
  }

  private renderInventoryChart(): void {
    if (!this.inventoryChartRef || !this.trendsData?.inventoryBars) return;

    const ctx = this.inventoryChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.trendsData.inventoryBars.map(d => d.label);
    const turnsData = this.trendsData.inventoryBars.map(d => d.inventoryTurns);

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Inventory Turns',
            data: turnsData,
            backgroundColor: [
              'rgba(0, 102, 204, 0.8)',
              'rgba(0, 102, 204, 0.7)',
              'rgba(0, 102, 204, 0.6)',
              'rgba(40, 167, 69, 0.8)',
              'rgba(40, 167, 69, 0.7)',
              'rgba(40, 167, 69, 0.6)'
            ],
            borderColor: [
              '#0066cc',
              '#0066cc',
              '#0066cc',
              '#28a745',
              '#28a745',
              '#28a745'
            ],
            borderWidth: 1,
            borderRadius: 4,
            hoverBackgroundColor: 'rgba(0, 80, 163, 0.9)'
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: { size: 12, weight: 'bold' }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: { size: 13, weight: 'bold' },
            bodyFont: { size: 12 },
            borderColor: '#ddd',
            borderWidth: 1,
            callbacks: {
              label: (context) => {
                const value = context.parsed.x;
                return `${context.dataset.label}: ${value !== null ? value.toFixed(2) : 'N/A'}`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: 'rgba(0, 0, 0, 0.05)' }
          },
          y: {
            grid: { display: false }
          }
        }
      }
    };

    this.inventoryChart = new Chart(ctx, config);
  }

  private destroyChart(chart: Chart | null): void {
    if (chart) {
      chart.destroy();
    }
  }

  ngOnDestroy(): void {
    this.destroyChart(this.inventoryChart);
  }
}
