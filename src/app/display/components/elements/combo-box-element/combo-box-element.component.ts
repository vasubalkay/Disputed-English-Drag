import { Component, OnInit } from '@angular/core';
import { ElementEventsService } from '../../../services/element-events.service';

@Component({
  selector: 'umsa-combo-box-element',
  templateUrl: './combo-box-element.component.html',
  styleUrls: ['./combo-box-element.component.scss']
})
export class ComboBoxElementComponent implements OnInit {

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
