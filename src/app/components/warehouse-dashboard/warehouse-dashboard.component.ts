import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-warehouse-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './warehouse-dashboard.component.html',
  styleUrls: ['./warehouse-dashboard.component.scss']
})
export class WarehouseDashboardComponent {
}
