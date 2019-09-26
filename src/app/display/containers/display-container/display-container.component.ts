import { Component, Input, OnInit } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { DISPLAY_NOTIFICATION_SERVICE } from '../../constants/display-notification.constants';
import { Subject } from 'rxjs';
import { ElementEventsService } from '../../services/element-events.service';

@Component({
  selector: 'umsa-display-container',
  templateUrl: './display-container.component.html',
  styleUrls: ['./display-container.component.scss']
})
export class DisplayContainerComponent implements OnInit {

  @Input() widgetName: string;
  selectedWidget: any;

  constructor(
    private notificationService: NotificationService,
    private elementService: ElementEventsService) { }

  ngOnInit() {
  }

  onAfterDrop(event) {
    // console.log(event.attributes.id.value, " widget name");
    this.selectedWidget = event;
    this.notificationService.showNotification(DISPLAY_NOTIFICATION_SERVICE.DROP_MSG_SUCCESS);
  }

  saveMessage(event) {
    if (event === 'success') {
      this.notificationService.showNotification(DISPLAY_NOTIFICATION_SERVICE.Module_Save_Success);
    } else if (event === 'not unique') {
      this.notificationService.showNotification(DISPLAY_NOTIFICATION_SERVICE.Module_Save_UniqueError);
    }
  }
}
