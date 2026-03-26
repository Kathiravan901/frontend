import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageUserService } from '../../../services/manage-user.service';

interface UserStats {
  userId: number;
  displayName: string;
  email: string;
  roleName: string;
  status: string;
  createdDate?: string;
}

@Component({
  selector: 'app-admin-dashboard-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard-content.component.html',
  styleUrls: ['./admin-dashboard-content.component.scss']
})
export class AdminDashboardContentComponent implements OnInit {
  users: UserStats[] = [];
  loading = false;
  stats = {
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    roles: 0
  };

  constructor(private manageUserService: ManageUserService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadStatistics();
  }

  loadUsers(): void {
    this.loading = true;
    this.manageUserService.getAllUsers().subscribe({
      next: (data: any[]) => {
        this.users = data.map(user => ({
          userId: user.userId,
          displayName: user.displayName || 'N/A',
          email: user.email || 'N/A',
          roleName: user.roleName || 'N/A',
          status: user.status || 'Active',
          createdDate: user.createdDate || new Date().toISOString().split('T')[0]
        }));
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading users:', err);
        this.loading = false;
      }
    });
  }

  loadStatistics(): void {
    this.manageUserService.getAllUsers().subscribe({
      next: (data: any[]) => {
        this.stats = {
          totalUsers: data.length,
          activeUsers: data.filter(u => u.status === 'Active').length,
          inactiveUsers: data.filter(u => u.status === 'Inactive').length,
          roles: 6
        };
      },
      error: (err: any) => {
        console.error('Error loading statistics:', err);
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    return status === 'Active' ? 'bg-success' : 'bg-danger';
  }
}
