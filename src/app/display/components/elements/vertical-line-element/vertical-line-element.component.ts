import { Component, OnInit } from '@angular/core';
import {ElementEventsService} from '../../../services/element-events.service';

@Component({
  selector: 'umsa-vertical-line-element',
  templateUrl: './vertical-line-element.component.html',
  styleUrls: ['./vertical-line-element.component.scss']
})
export class VerticalLineElementComponent implements OnInit {

  constructor(private elementService: ElementEventsService) { }

  ngOnInit() {
  }

  dragStart(event: any) {
    this.elementService.dragStart(event);
  }
  dragEnd(event: any) {
    this.elementService.dragEnd(event);
  }

}
