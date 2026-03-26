export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface UserFromToken {
  userId: number;
  email: string;
  displayName: string;
  role: string;
}

export type UserRole = 'Admin' | 'Planner' | 'Logistics' | 'Executive' | 'Procurement' | 'Warehouse';

export const ROLE_DASHBOARDS: Record<UserRole, string> = {
  'Admin': '/admin-dashboard',
  'Planner': '/planner-dashboard',
  'Logistics': '/logistics-dashboard',
  'Executive': '/executive-dashboard',
  'Procurement': '/procurement-dashboard',
  'Warehouse': '/warehouse-dashboard'
};

export const AVAILABLE_ROLES: UserRole[] = [
  'Admin',
  'Planner',
  'Logistics',
  'Executive',
  'Procurement',
  'Warehouse'
];
