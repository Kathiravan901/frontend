import { Routes } from '@angular/router';
import { MainLayoutComponent } from './components/shared/layout/main-layout/main-layout.component';
import { LoginComponent } from './components/login/login.component';
import { RoleGuard } from './guards/role.guard';
import { authGuard } from './guards/auth.guard';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { OrderContextResolver, ProcurementOrderContextResolver, WarehouseOrderContextResolver } from './guards/order-context.resolver';
import { ViewProfileComponent } from './components/shared/view-profile/view-profile.component';
import { NotFoundComponent } from './components/shared/not-found/not-found.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'admin-dashboard',
        component: AdminDashboardComponent,
        canActivate: [RoleGuard],
        canActivateChild: [RoleGuard],
        data: { roles: ['Admin'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./components/admin-dashboard/admin-dashboard-content/admin-dashboard-content.component').then(m => m.AdminDashboardContentComponent),
            pathMatch: 'full'
          },
          {
            path: 'profile',
            component: ViewProfileComponent
          },
          {
            path: 'users',
            loadComponent: () => import('./components/admin-dashboard/admin-manage-users/admin-manage-users.component').then(m => m.AdminManageUsersComponent)
          },
          {
            path: 'audit-logs',
            loadComponent: () => import('./components/admin-dashboard/admin-audit-logs/admin-audit-logs.component').then(m => m.AdminAuditLogsComponent)
          },
          {
            path: 'create-user',
            loadComponent: () => import('./components/admin-dashboard/admin-create-user/admin-create-user.component').then(m => m.AdminCreateUserComponent)
          },
          {
            path: 'manage-network',
            loadComponent: () => import('./components/admin-dashboard/admin-manage-network/admin-manage-network.component').then(m => m.AdminManageNetworkComponent)
          }
        ]
      },
      {
        path: 'planner-dashboard',
        loadComponent: () => import('./components/planner-dashboard/planner-dashboard.component').then(m => m.PlannerDashboardComponent),
        canActivate: [RoleGuard],
        canActivateChild: [RoleGuard],
        data: { roles: ['Planner'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./components/planner-dashboard/planner-dashboard-overview/planner-dashboard-overview.component').then(m => m.PlannerDashboardOverviewComponent),
            pathMatch: 'full'
          },
          {
            path: 'profile',
            component: ViewProfileComponent
          },
          {
            path: 'exceptions',
            loadComponent: () => import('./components/planner-dashboard/planner-manage-exception-events/planner-manage-exception-events.component').then(m => m.PlannerManageExceptionEventsComponent)
          },
          {
            path: 'resolutions',
            loadComponent: () => import('./components/planner-dashboard/planner-manage-resolution-actions/planner-manage-resolution-actions.component').then(m => m.PlannerManageResolutionActionsComponent)
          }
        ]
      },
      {
        path: 'logistics-dashboard',
        loadComponent: () => import('./components/logistics-dashboard/logistics-dashboard.component').then(m => m.LogisticsDashboardComponent),
        canActivate: [RoleGuard],
        canActivateChild: [RoleGuard],
        data: { roles: ['Logistics'] },
        children: [
          {
            path: '',
            redirectTo: 'orders',
            pathMatch: 'full'
          },
          {
            path: 'profile',
            component: ViewProfileComponent
          },
          {
            path: 'orders',
            loadComponent: () => import('./components/shared/view-orders/view-orders.component').then(m => m.ViewOrdersComponent),
            resolve: { orderContext: OrderContextResolver }
          },
          {
            path: 'dispatch',
            loadComponent: () => import('./components/logistics-dashboard/logistics-dispatch-orders/logistics-dispatch-orders.component').then(m => m.LogisticsDispatchOrdersComponent)
          },
          {
            path: 'shipments',
            loadComponent: () => import('./components/logistics-dashboard/logistics-manage-shipments/logistics-manage-shipments.component').then(m => m.LogisticsManageShipmentsComponent)
          }
        ]
      },
      {
        path: 'executive-dashboard',
        loadComponent: () => import('./components/executive-dashboard/executive-dashboard.component').then(m => m.ExecutiveDashboardComponent),
        canActivate: [RoleGuard],
        canActivateChild: [RoleGuard],
        data: { roles: ['Executive'] },
        children: [
          {
            path: 'profile',
            component: ViewProfileComponent
          }
        ]
      },
      {
        path: 'procurement-dashboard',
        loadComponent: () => import('./components/procurement-dashboard/procurement-dashboard.component').then(m => m.ProcurementDashboardComponent),
        canActivate: [RoleGuard],
        canActivateChild: [RoleGuard],
        data: { roles: ['Procurement'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./components/shared/view-orders/view-orders.component').then(m => m.ViewOrdersComponent),
            resolve: { orderContext: ProcurementOrderContextResolver },
            pathMatch: 'full'
          },
          {
            path: 'profile',
            component: ViewProfileComponent
          },
          {
            path: 'view-locations',
            loadComponent: () => import('./components/procurement-dashboard/procurement-view-locations/procurement-view-locations.component').then(m => m.ProcurementViewLocationsComponent)
          },
          {
            path: 'view-partners',
            loadComponent: () => import('./components/procurement-dashboard/procurement-view-partners/procurement-view-partners.component').then(m => m.ProcurementViewPartnersComponent)
          },
          {
            path: 'orders',
            loadComponent: () => import('./components/shared/add-order/add-order.component').then(m => m.AddOrderComponent),
            resolve: { orderContext: ProcurementOrderContextResolver }
          }
        ]
      },
      {
        path: 'warehouse-dashboard',
        loadComponent: () => import('./components/warehouse-dashboard/warehouse-dashboard.component').then(m => m.WarehouseDashboardComponent),
        canActivate: [RoleGuard],
        canActivateChild: [RoleGuard],
        data: { roles: ['Warehouse'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./components/warehouse-dashboard/warehouse-manage-inventory/warehouse-manage-inventory.component').then(m => m.WarehouseManageInventoryComponent),
            pathMatch: 'full'
          },
          {
            path: 'profile',
            component: ViewProfileComponent
          },
          {
            path: 'inventory',
            loadComponent: () => import('./components/warehouse-dashboard/warehouse-manage-inventory/warehouse-manage-inventory.component').then(m => m.WarehouseManageInventoryComponent)
          },
          {
            path: 'view-orders',
            loadComponent: () => import('./components/shared/view-orders/view-orders.component').then(m => m.ViewOrdersComponent),
            resolve: { orderContext: OrderContextResolver }
          },
          {
            path: 'place-order',
            loadComponent: () => import('./components/shared/add-order/add-order.component').then(m => m.AddOrderComponent),
            resolve: { orderContext: WarehouseOrderContextResolver }
          },
          {
            path: 'add-uom',
            loadComponent: () => import('./components/warehouse-dashboard/warehouse-add-uom/warehouse-add-uom.component').then(m => m.WarehouseAddUomComponent)
          },
          {
            path: 'add-item',
            loadComponent: () => import('./components/warehouse-dashboard/warehouse-add-item/warehouse-add-item.component').then(m => m.WarehouseAddItemComponent)
          }
        ]
      },
      {
        path: '',
        redirectTo: 'admin-dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '404',
    component: NotFoundComponent
  },
  {
    path: '**',
    redirectTo: '404'
  }
];
