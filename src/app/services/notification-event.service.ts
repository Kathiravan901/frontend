import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppSettings } from '../settings/app-settings';
import { NotificationDto, NotificationUpdateStatusDto, NotificationAcknowledgeDto } from '../models/notification-event.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationEventService {
  private apiUrl = AppSettings.apiEndpoint + 'notifications';
  private notificationUpdatesSubject = new BehaviorSubject<NotificationDto | null>(null);
  public notificationUpdates$ = this.notificationUpdatesSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Create notification
   */
  createNotification(dto: any): Observable<NotificationDto> {
    return this.http.post<NotificationDto>(`${this.apiUrl}`, dto);
  }

  /**
   * Get all notifications for current user
   */
  getMyNotifications(): Observable<NotificationDto[]> {
    return this.http.get<NotificationDto[]>(`${this.apiUrl}`);
  }

  /**
   * Get notifications for specific user
   */
  getForUser(userId: number): Observable<NotificationDto[]> {
    return this.http.get<NotificationDto[]>(`${this.apiUrl}/user/${userId}`);
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, { status: 'Read' } as NotificationUpdateStatusDto);
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/mark-all-read`, {});
  }

  /**
   * Delete notification
   */
  deleteNotification(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Delete all notifications
   */
  deleteAllNotifications(): Observable<any> {
    return this.http.delete(`${this.apiUrl}`);
  }

  /**
   * Acknowledge notification
   */
  acknowledge(id: number, dto: NotificationAcknowledgeDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/ack`, dto);
  }

  /**
   * Get real-time notification updates
   */
  getNotificationUpdates(): Observable<NotificationDto | null> {
    return this.notificationUpdates$;
  }

  /**
   * Emit notification update (for real-time updates)
   */
  notifyUpdate(notification: NotificationDto): void {
    this.notificationUpdatesSubject.next(notification);
  }

  /**
   * Update notification status
   */
  updateStatus(id: number, dto: NotificationUpdateStatusDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, dto);
  }
}
