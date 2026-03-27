import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManageUserService } from '../../../services/manage-user.service';
import { AuditLogDTO } from '../../../models/audit-log.model';
import { ToastService } from '../../../services/toast.service';

interface AuditLog extends AuditLogDTO {}

@Component({
  selector: 'app-admin-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-audit-logs.component.html',
  styleUrls: ['./admin-audit-logs.component.scss']
})
export class AdminAuditLogsComponent implements OnInit {
  logs: AuditLog[] = [];
  filteredLogs: AuditLog[] = [];
  isLoading = false;
  errorMessage = '';

  // Filter properties
  filterAction: string = '';

  // Unique values for filter dropdowns
  uniqueActions: string[] = [];

  constructor(private manageUserService: ManageUserService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.loadAuditLogs();
  }

  loadAuditLogs(): void {
    this.isLoading = true;
    this.manageUserService.viewAuditLog().subscribe({
      next: (data: AuditLogDTO[]) => {
        this.logs = data.map(log => ({
          auditId: log.auditId,
          userId: log.userId,
          displayName: log.displayName || 'N/A',
          action: log.action || 'Unknown',
          timestamp: log.timestamp
        })) as AuditLog[];

        // Extract unique values for filters
        this.uniqueActions = [...new Set(this.logs.map(l => l.action))].sort();

        // Initialize filtered logs
        this.filteredLogs = this.logs;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading audit logs:', error);
        this.toastService.error('Failed to load audit logs from database');
        this.isLoading = false;
      }
    });
  }

  filterLogs(): void {
    this.filteredLogs = this.logs.filter(log => {
      const actionMatch = !this.filterAction || log.action === this.filterAction;
      return actionMatch;
    });
  }

  getActionBadgeClass(action: string): string {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('create') || actionLower.includes('insert')) {
      return 'badge bg-success';
    } else if (actionLower.includes('update') || actionLower.includes('edit')) {
      return 'badge bg-info';
    } else if (actionLower.includes('delete') || actionLower.includes('remove')) {
      return 'badge bg-danger';
    } else if (actionLower.includes('view') || actionLower.includes('read')) {
      return 'badge bg-primary';
    }
    return 'badge bg-secondary';
  }

  getStatusBadgeClass(date: Date | undefined): string {
    if (!date) return 'bg-secondary';
    const logDate = new Date(date);
    const now = new Date();
    const hoursAgo = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60);
    
    if (hoursAgo < 1) return 'bg-success';
    if (hoursAgo < 24) return 'bg-info';
    return 'bg-warning';
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  }

  onFilterActionChange(): void {
    this.filterLogs();
  }

  exportLogs(): void {
    if (this.filteredLogs.length === 0) {
      this.errorMessage = 'No logs to export';
      return;
    }

    // Prepare CSV data
    const headers = ['Timestamp', 'User Name', 'Action'];
    const csvContent = [
      headers.join(','),
      ...this.filteredLogs.map(log =>
        [
          this.formatDate(log.timestamp),
          log.displayName,
          log.action
        ].map(field => `"${field}"`).join(',')
      )
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const fileName = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
