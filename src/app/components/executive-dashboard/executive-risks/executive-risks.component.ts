import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RiskSummaryDto } from '../../../models/kpi.model';

@Component({
  selector: 'app-executive-risks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './executive-risks.component.html',
  styleUrls: ['./executive-risks.component.scss']
})
export class ExecutiveRisksComponent {
  @Input() riskData: RiskSummaryDto | null = null;

  getRiskLevel(percentage: number): string {
    if (percentage >= 50) return 'critical';
    if (percentage >= 25) return 'high';
    if (percentage >= 10) return 'medium';
    return 'low';
  }

  getRiskIcon(level: string): string {
    const icons: { [key: string]: string } = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢'
    };
    return icons[level] || '🟡';
  }
}
