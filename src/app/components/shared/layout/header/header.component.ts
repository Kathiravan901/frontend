import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../../services/authentication.service';
import { NotificationCenterComponent } from '../../notification-center/notification-center.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, NotificationCenterComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  userName: string = 'User';
  userRole: string = '';

  constructor(
    private router: Router,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    // Get current user info from auth service
    const currentUser = this.authService.currentUser;
    if (currentUser) {
      this.userName = currentUser.displayName || 'User';
      this.userRole = currentUser.role;
    }
  }

  goToProfile(): void {
    // Navigate to profile based on current dashboard
    const currentUrl = this.router.url;
    
    if (currentUrl.includes('admin-dashboard')) {
      this.router.navigate(['/admin-dashboard/profile']);
    } else if (currentUrl.includes('planner-dashboard')) {
      this.router.navigate(['/planner-dashboard/profile']);
    } else if (currentUrl.includes('logistics-dashboard')) {
      this.router.navigate(['/logistics-dashboard/profile']);
    } else if (currentUrl.includes('executive-dashboard')) {
      this.router.navigate(['/executive-dashboard/profile']);
    } else if (currentUrl.includes('procurement-dashboard')) {
      this.router.navigate(['/procurement-dashboard/profile']);
    } else if (currentUrl.includes('warehouse-dashboard')) {
      this.router.navigate(['/warehouse-dashboard/profile']);
    } else {
      this.router.navigate(['/admin-dashboard/profile']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
