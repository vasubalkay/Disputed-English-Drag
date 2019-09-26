import { Component, OnInit } from '@angular/core';
import { ElementEventsService } from '../../../services/element-events.service';

@Component({
  selector: 'umsa-radio-box-element',
  templateUrl: './radio-box-element.component.html',
  styleUrls: ['./radio-box-element.component.scss']
})
export class RadioBoxElementComponent implements OnInit {

  constructor(private elementService: ElementEventsService) { }

  ngOnInit() {
  }


  dragStart(event: any) {
    console.log(event);
    this.elementService.dragStart(event);
  }
  dragEnd(event: any) {
    this.elementService.dragEnd(event);
  }

}
