export interface CreateUserDTO {
  userId?: number;
  displayName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  roleId?: number;
  roleName?: string;
  status?: string;
}
