import { Component, OnInit } from '@angular/core';
import {ElementEventsService} from "../../../services/element-events.service";

@Component({
  selector: 'umsa-check-box-element',
  templateUrl: './check-box-element.component.html',
  styleUrls: ['./check-box-element.component.scss']
})
export class CheckBoxElementComponent implements OnInit {

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
