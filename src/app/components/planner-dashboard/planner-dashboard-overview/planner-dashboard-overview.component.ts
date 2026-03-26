import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExceptionEventService } from '../../../services/exception-event.service';
import { ResolutionActionService } from '../../../services/resolution-action.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActionStatus } from '../../../models/enums';

interface StatCard {
  title: string;
  value: number | string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-planner-dashboard-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './planner-dashboard-overview.component.html',
  styleUrls: ['./planner-dashboard-overview.component.scss']
})
export class PlannerDashboardOverviewComponent implements OnInit, OnDestroy {
  statCards: StatCard[] = [];
  isLoading = false;
  recentExceptions: any[] = [];
  totalExceptions = 0;
  activeExceptions = 0;
  resolvedExceptions = 0;
  pendingActions = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private exceptionService: ExceptionEventService,
    private resolutionActionService: ResolutionActionService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    this.loadExceptionStats();
    this.loadResolutionStats();
  }

  private loadExceptionStats(): void {
    this.exceptionService.getAllExceptionEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (exceptions) => {
          this.totalExceptions = exceptions.length;
          this.activeExceptions = exceptions.filter(e => e.status !== 'Resolved').length;
          this.resolvedExceptions = exceptions.filter(e => e.status === 'Resolved').length;
          this.recentExceptions = exceptions.slice(0, 5);
          this.updateStatCards();
        },
        error: (error) => {
          console.error('Error loading exception stats:', error);
          this.isLoading = false;
        }
      });
  }

  private loadResolutionStats(): void {
    this.resolutionActionService.getAllResolutionActions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (actions) => {
          this.pendingActions = actions.filter(a => a.status !== 'Completed').length;
          this.isLoading = false;
          this.updateStatCards();
        },
        error: (error) => {
          console.error('Error loading resolution stats:', error);
          this.isLoading = false;
        }
      });
  }

  private updateStatCards(): void {
    this.statCards = [
      {
        title: 'Total Exceptions',
        value: this.totalExceptions,
        icon: 'exclamation-triangle',
        color: 'warning'
      },
      {
        title: 'Active Exceptions',
        value: this.activeExceptions,
        icon: 'hourglass-split',
        color: 'danger'
      },
      {
        title: 'Resolved',
        value: this.resolvedExceptions,
        icon: 'check-circle',
        color: 'success'
      },
      {
        title: 'Pending Actions',
        value: this.pendingActions,
        icon: 'list-check',
        color: 'info'
      }
    ];
  }
}
