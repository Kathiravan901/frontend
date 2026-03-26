import { Injectable } from '@angular/core';
import { Router, CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { UserRole } from '../models/login.model';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.checkAccess(route, state);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.checkAccess(childRoute, state);
  }

  private checkAccess(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    // Get required roles from route data
    const requiredRoles = route.data['roles'] as UserRole[];
    
    // If no roles specified, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Check if user has one of the required roles
    if (this.authService.hasRole(requiredRoles)) {
      return true;
    }

    // User doesn't have required role - redirect to their dashboard
    const userRole = this.authService.currentRole;
    const roleDashboards: { [key: string]: string } = {
      'Admin': '/admin-dashboard',
      'Executive': '/executive-dashboard',
      'Logistics': '/logistics-dashboard',
      'Planner': '/planner-dashboard',
      'Procurement': '/procurement-dashboard',
      'Warehouse': '/warehouse-dashboard'
    };

    const dashboard = userRole ? roleDashboards[userRole] : '/admin-dashboard';
    this.router.navigate([dashboard]);
    
    return false;
  }
}
