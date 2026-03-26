import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationEventService } from '@services/notification-event.service';
import { AuthenticationService } from '@services/authentication.service';
import { Subject, interval, takeUntil } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { NotificationDto } from '@models/notification-event.model';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-center.component.html',
  styleUrls: ['./notification-center.component.scss']
})
export class NotificationCenterComponent implements OnInit, OnDestroy {
  private notificationEventService = inject(NotificationEventService);
  private authService = inject(AuthenticationService);
  private destroy$ = new Subject<void>();

  notifications: NotificationDto[] = [];
  unreadCount = 0;
  isOpen = false;
  currentUserId: number | null = null;
  isLoading = false;

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();

    if (this.currentUserId) {
      this.loadNotifications();
      this.startPolling();
      this.subscribeToNotificationUpdates();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load notifications from the backend
   */
  loadNotifications(): void {
    this.isLoading = true;
    this.notificationEventService
      .getMyNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: NotificationDto[]) => {

          // Ensure IDs are properly mapped - handle notificationId, Id, and id
          this.notifications = data.map(n => {
            const mappedNotif = {
              ...n,
              id: (n as any).id || (n as any).Id || (n as any).notificationId
            };
            return mappedNotif;
          });

          this.unreadCount = this.notifications.filter(n => !n.isRead).length;
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error('[NotificationCenter] Error loading notifications:', err);
          this.isLoading = false;
        }
      });
  }

  /**
   * Start polling for new notifications every 30 seconds
   */
  startPolling(): void {
    interval(30000)
      .pipe(
        switchMap(() => this.notificationEventService.getMyNotifications()),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data: NotificationDto[]) => {
          // Ensure IDs are properly mapped - handle notificationId, Id, and id
          this.notifications = data.map(n => ({
            ...n,
            id: (n as any).id || (n as any).Id || (n as any).notificationId
          }));
          this.unreadCount = this.notifications.filter(n => !n.isRead).length;
        },
        error: (err: any) => {
          console.error('Error polling notifications:', err);
        }
      });
  }

  /**
   * Subscribe to real-time notification updates
   */
  subscribeToNotificationUpdates(): void {
    this.notificationEventService
      .getNotificationUpdates()
      .pipe(takeUntil(this.destroy$))
      .subscribe((notification: NotificationDto | null) => {
        if (notification) {
          this.notifications.unshift(notification);
          if (!notification.isRead) {
            this.unreadCount++;
          }
        }
      });
  }

  /**
   * Toggle notification modal
   */
  toggleModal(): void {
    this.isOpen = !this.isOpen;
  }

  /**
   * Get CSS class based on notification priority
   */
  getDisplayClass(priority: string | undefined): string {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'alert-danger';
      case 'high':
        return 'alert-warning';
      case 'medium':
        return 'alert-info';
      case 'low':
        return 'alert-secondary';
      default:
        return 'alert-secondary';
    }
  }

  /**
   * Mark notification as read
   */
  markAsRead(notification: NotificationDto): void {
    if (!notification.id) {
      console.error('[NotificationCenter] Notification ID is missing or undefined:', notification);
      return;
    }

    if (!notification.isRead) {
      this.notificationEventService
        .markAsRead(notification.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            notification.isRead = true;
            this.unreadCount = Math.max(0, this.unreadCount - 1);
          },
          error: (err: any) => {
            console.error('Error marking notification as read:', err);
          }
        });
    }
  }

  /**
   * Delete notification
   */
  deleteNotification(notification: NotificationDto): void {
    this.notificationEventService
      .deleteNotification(notification.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notifications = this.notifications.filter(n => n.id !== notification.id);
          if (!notification.isRead) {
            this.unreadCount = Math.max(0, this.unreadCount - 1);
          }
        },
        error: (err: any) => {
          console.error('Error deleting notification:', err);
        }
      });
  }

  /**
   * Mark all as read
   */
  markAllAsRead(): void {
    this.notificationEventService
      .markAllAsRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notifications.forEach(n => n.isRead = true);
          this.unreadCount = 0;
        },
        error: (err: any) => {
          console.error('Error marking all as read:', err);
        }
      });
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notificationEventService
      .deleteAllNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notifications = [];
          this.unreadCount = 0;
          this.isOpen = false;
        },
        error: (err: any) => {
          console.error('Error clearing notifications:', err);
        }
      });
  }

  /**
   * Get sorted notifications (unread first)
   */
  getSortedNotifications(): NotificationDto[] {
    return this.notifications.sort((a, b) => {
      if (!a.isRead && b.isRead) return -1;
      if (a.isRead && !b.isRead) return 1;
      return 0;
    });
  }
}
