import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiTrendsDto } from '../../../../models/kpi.model';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-performance-trends',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './performance-trends.component.html',
  styleUrls: ['./performance-trends.component.scss']
})
export class PerformanceTrendsComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() trendsData: KpiTrendsDto | null = null;
  @ViewChild('otifChart', { static: false }) otifChartRef!: ElementRef<HTMLCanvasElement>;

  private otifChart: Chart | null = null;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.trendsData) {
      setTimeout(() => {
        this.renderOtifChart();
      }, 100);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['trendsData'] && this.trendsData && this.otifChartRef) {
      this.destroyChart(this.otifChart);
      setTimeout(() => {
        this.renderOtifChart();
      }, 100);
    }
  }

  private renderOtifChart(): void {
    if (!this.otifChartRef || !this.trendsData?.otifVsDelay) return;

    const ctx = this.otifChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.trendsData.otifVsDelay.map(d => 
      new Date(d.periodStartUtc).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );
    const otifData = this.trendsData.otifVsDelay.map(d => d.otif);
    const delayData = this.trendsData.otifVsDelay.map(d => d.delayRate);

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'OTIF %',
            data: otifData,
            borderColor: '#0066cc',
            backgroundColor: 'rgba(0, 102, 204, 0.05)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#0066cc',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 6
          },
          {
            label: 'Delay Rate %',
            data: delayData,
            borderColor: '#dc3545',
            backgroundColor: 'rgba(220, 53, 69, 0.05)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#dc3545',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 15,
              font: { size: 12, weight: 'bold' }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: { size: 13, weight: 'bold' },
            bodyFont: { size: 12 },
            borderColor: '#ddd',
            borderWidth: 1
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: { callback: (value) => value + '%' },
            grid: { color: 'rgba(0, 0, 0, 0.05)' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    };

    this.otifChart = new Chart(ctx, config);
  }

  private destroyChart(chart: Chart | null): void {
    if (chart) {
      chart.destroy();
    }
  }

  ngOnDestroy(): void {
    this.destroyChart(this.otifChart);
  }
}
