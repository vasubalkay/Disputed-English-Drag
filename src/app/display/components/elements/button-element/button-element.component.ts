import {Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import { ElementEventsService} from '../../../services/element-events.service';

@Component({
  selector: 'app-button-element',
  templateUrl: './button-element.component.html',
  styleUrls: ['./button-element.component.css']
})
export class ButtonElementComponent implements OnInit {

  constructor(private elementService: ElementEventsService) { }

  ngOnInit() { }

  dragStart(event: any) {
    this.elementService.dragStart(event);
  }
  dragEnd(event: any) {
    this.elementService.dragEnd(event);
  }

}
