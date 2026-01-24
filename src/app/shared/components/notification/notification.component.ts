import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
  animations: [
    trigger('notificationAnimation', [
      state('void', style({
        transform: 'translateY(-20px)',
        opacity: 0
      })),
      state('visible', style({
        transform: 'translateY(0)',
        opacity: 1
      })),
      transition('void => visible', animate('300ms ease-out')),
      transition('visible => void', animate('200ms ease-in'))
    ])
  ]
})
export class NotificationComponent implements OnInit, OnDestroy {
  @Input() message: string = '';
  @Input() type: NotificationType = 'info';
  @Input() duration: number = 5000; // duración en ms, por defecto 5 segundos
  @Input() dismissible: boolean = true;
  
  visible: boolean = false;
  animationState: 'visible' | 'void' = 'void';
  
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.show();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  show(): void {
    this.visible = true;
    this.animationState = 'visible';
    
    if (this.duration > 0) {
      timer(this.duration)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.dismiss());
    }
  }

  dismiss(): void {
    this.visible = false;
    this.animationState = 'void';
  }

  // Devuelve la clase CSS según el tipo de notificación
  getNotificationClass(): string {
    return `notification notification-${this.type}`;
  }

  // Devuelve el icono según el tipo de notificación
  getIcon(): string {
    switch (this.type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return 'ℹ';
    }
  }
}
