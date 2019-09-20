import {Injectable} from '@angular/core';

import {MatSnackBar} from '@angular/material';

import {Notification} from '../model/notification.model';

@Injectable({
    providedIn: 'root'
  })
export class NotificationService {

  constructor(private snackBar: MatSnackBar) {
  }

  /**
   * @desc Displays Notification Messages
   * @param data - Message and type of notification to be shown
   */
  showNotification(data: Notification): void {
    this.snackBar.open(data.msg, 'X', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: data.type
    });
  }

}
