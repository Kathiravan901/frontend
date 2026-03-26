import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AuthenticationService } from '../../../../services/authentication.service';
import { UserRole } from '../../../../models/login.model';

interface NavLink {
  label: string;
  route: string;
  icon?: string;
  queryParams?: { [key: string]: string };
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  navLinks: NavLink[] = [];
  private destroy$ = new Subject<void>();

  // Navigation by role
  private navigationByRole: { [key: string]: NavLink[] } = {
    'Admin': [
      { label: 'Dashboard', route: '/admin-dashboard', icon: 'house-door' },
      { label: 'Manage Users', route: '/admin-dashboard/users', icon: 'people' },
      { label: 'Manage Network', route: '/admin-dashboard/manage-network', icon: 'diagram-3' },
      { label: 'Audit Logs', route: '/admin-dashboard/audit-logs', icon: 'clock-history' }
    ],
    'Planner': [
      { label: 'Dashboard', route: '/planner-dashboard', icon: 'house-door' },
      { label: 'Exceptions', route: '/planner-dashboard/exceptions', icon: 'exclamation-triangle' },
      { label: 'Resolutions', route: '/planner-dashboard/resolutions', icon: 'check-circle' }
    ],
    'Executive': [
      { label: 'Dashboard', route: '/executive-dashboard', icon: 'house-door' },
      { label: 'KPI Trends', route: '/executive-dashboard', icon: 'graph-up', queryParams: { section: 'trends' } },
      { label: 'Risk', route: '/executive-dashboard', icon: 'exclamation-circle', queryParams: { section: 'risk' } },
      { label: 'Reports', route: '/executive-dashboard', icon: 'file-earmark-pdf', queryParams: { section: 'reports' } }
    ],
    'Logistics': [
      { label: 'Orders', route: '/logistics-dashboard/orders', icon: 'box-seam' },
      { label: 'Dispatch', route: '/logistics-dashboard/dispatch', icon: 'send' },
      { label: 'Shipments', route: '/logistics-dashboard/shipments', icon: 'truck' }
    ],
    'Procurement': [
      { label: 'Dashboard', route: '/procurement-dashboard', icon: 'house-door' },
      { label: 'View Locations', route: '/procurement-dashboard/view-locations', icon: 'geo-alt' },
      { label: 'View Partners', route: '/procurement-dashboard/view-partners', icon: 'people' },
      { label: 'Orders', route: '/procurement-dashboard/orders', icon: 'file-earmark' }
    ],
    'Warehouse': [
      { label: 'Inventory Management', route: '/warehouse-dashboard/inventory', icon: 'boxes' },
      { label: 'View Orders', route: '/warehouse-dashboard/view-orders', icon: 'eye' },
      { label: 'Place Order', route: '/warehouse-dashboard/place-order', icon: 'file-earmark' },
      { label: 'Manage UOM', route: '/warehouse-dashboard/add-uom', icon: 'plus-circle' },
      { label: 'Manage Items', route: '/warehouse-dashboard/add-item', icon: 'plus-lg' }
    ]
  };

  constructor(
    private router: Router,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    // Get current user role
    const currentUser = this.authService.currentUser;
    if (currentUser) {
      this.updateNavigationForRole(currentUser.role as UserRole);
    }

    // Update navigation when route changes
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        const user = this.authService.currentUser;
        if (user) {
          this.updateNavigationForRole(user.role as UserRole);
        }
      });
  }

  /**
   * Update navigation links based on user role
   */
  private updateNavigationForRole(role: UserRole): void {
    this.navLinks = this.navigationByRole[role] || [];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isLinkActive(link: NavLink): boolean {
    const urlTree = this.router.parseUrl(this.router.url);
    const currentPath = '/' + (urlTree.root.children['primary']?.segments.map(s => s.path).join('/') || '');
    const currentQueryParams = urlTree.queryParams || {};

    if (currentPath !== link.route) {
      return false;
    }

    // If link has query params, they must match exactly
    if (link.queryParams) {
      return Object.entries(link.queryParams).every(([key, value]) => currentQueryParams[key] === value);
    }

    // If link has no query params, only match if current URL also has no query params
    return Object.keys(currentQueryParams).length === 0;
  }

  /**
   * Logout user
   */
  onLogout(): void {
    // Clear auth data
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}


