export interface AuditLogDTO {
  auditId: number;
  userId?: number;
  displayName: string;
  action: string;
  timestamp: Date;
}
