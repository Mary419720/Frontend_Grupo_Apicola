import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, NotificationConfig } from '../../../core/services/notification.service';
import { NotificationComponent } from '../notification/notification.component';

@Component({
  selector: 'app-notification-container',
  standalone: true,
  imports: [CommonModule, NotificationComponent],
  template: `
    <div class="notification-container">
      <app-notification
        *ngIf="activeNotification"
        [message]="activeNotification.message"
        [type]="activeNotification.type"
        [duration]="activeNotification.duration || 5000"
        [dismissible]="activeNotification.dismissible !== false"
      ></app-notification>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1050;
      max-width: 350px;
      width: 100%;
    }
  `]
})
export class NotificationContainerComponent implements OnInit, OnDestroy {
  activeNotification: NotificationConfig | null = null;
  private subscription: Subscription | null = null;

  constructor(private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.subscription = this.notificationService.notification$.subscribe(notification => {
      this.activeNotification = notification;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
