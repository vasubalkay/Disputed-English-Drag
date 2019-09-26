import { Component, OnInit } from '@angular/core';
import { ElementEventsService} from '../../../services/element-events.service';

@Component({
  selector: 'app-textbox-element',
  templateUrl: './textbox-element.component.html',
  styleUrls: ['./textbox-element.component.scss']
})
export class TextboxElementComponent implements OnInit {

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
