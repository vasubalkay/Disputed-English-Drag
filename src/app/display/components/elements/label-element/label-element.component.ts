import { Component, OnInit } from '@angular/core';
import {ElementEventsService} from "../../../services/element-events.service";

@Component({
  selector: 'umsa-label-element',
  templateUrl: './label-element.component.html',
  styleUrls: ['./label-element.component.scss']
})
export class LabelElementComponent implements OnInit {

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
