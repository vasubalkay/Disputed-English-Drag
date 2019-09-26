import { Component, OnInit } from '@angular/core';
import { ElementEventsService } from '../../../services/element-events.service';

@Component({
  selector: 'umsa-horizontal-line-element',
  templateUrl: './horizontal-line-element.component.html',
  styleUrls: ['./horizontal-line-element.component.scss']
})
export class HorizontalLineElementComponent implements OnInit {

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
