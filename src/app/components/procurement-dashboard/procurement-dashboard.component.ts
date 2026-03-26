import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-procurement-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './procurement-dashboard.component.html',
  styleUrls: ['./procurement-dashboard.component.scss']
})
export class ProcurementDashboardComponent {
}
