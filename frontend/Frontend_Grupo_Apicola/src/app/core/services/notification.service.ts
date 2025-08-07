import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { NotificationType } from '../../shared/components/notification/notification.component';

export interface NotificationConfig {
  message: string;
  type: NotificationType;
  duration?: number;
  dismissible?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<NotificationConfig | null>(null);
  public notification$: Observable<NotificationConfig | null> = this.notificationSubject.asObservable();

  constructor() { }

  /**
   * Muestra una notificación
   * @param config Configuración de la notificación
   */
  show(config: NotificationConfig): void {
    this.notificationSubject.next({
      ...config,
      duration: config.duration || 5000,
      dismissible: config.dismissible !== false
    });
  }

  /**
   * Muestra una notificación de éxito
   * @param message Mensaje a mostrar
   * @param duration Duración en ms (por defecto 5000ms)
   */
  success(message: string, duration: number = 5000): void {
    this.show({
      message,
      type: 'success',
      duration
    });
  }

  /**
   * Muestra una notificación de error
   * @param message Mensaje a mostrar
   * @param duration Duración en ms (por defecto 5000ms)
   */
  error(message: string, duration: number = 5000): void {
    this.show({
      message,
      type: 'error',
      duration
    });
  }

  /**
   * Muestra una notificación de advertencia
   * @param message Mensaje a mostrar
   * @param duration Duración en ms (por defecto 5000ms)
   */
  warning(message: string, duration: number = 5000): void {
    this.show({
      message,
      type: 'warning',
      duration
    });
  }

  /**
   * Muestra una notificación informativa
   * @param message Mensaje a mostrar
   * @param duration Duración en ms (por defecto 5000ms)
   */
  info(message: string, duration: number = 5000): void {
    this.show({
      message,
      type: 'info',
      duration
    });
  }

  /**
   * Cierra la notificación actual
   */
  dismiss(): void {
    this.notificationSubject.next(null);
  }
}
