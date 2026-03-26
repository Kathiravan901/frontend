import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-logistics-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './logistics-dashboard.component.html',
  styleUrls: ['./logistics-dashboard.component.scss']
})
export class LogisticsDashboardComponent {
}
