import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-planner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './planner-dashboard.component.html',
  styleUrls: ['./planner-dashboard.component.scss']
})
export class PlannerDashboardComponent {
}
