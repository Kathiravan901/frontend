/**
 * Notification event data model
 */
export interface NotificationDto {
  id: number;
  userId: number;
  message: string;
  category: string; // Exception | Shipment | Inventory | KPI
  eventType?: string; // Event type for display
  priority?: string; // Critical | High | Medium | Low
  status: string; // Unread | Read
  isRead: boolean;
  createdDate: Date;
  createdAt?: Date; // Alias for createdDate
  acknowledgedBy?: number | null;
  acknowledgedAt?: Date | null;
}

export interface NotificationCreateDto {
  userId: number;
  message: string;
  category: string;
  priority?: string;
}

export interface NotificationUpdateStatusDto {
  status: string;
}

export interface NotificationAcknowledgeDto {
  acknowledgedBy: number;
  acknowledgedAt: Date;
}
