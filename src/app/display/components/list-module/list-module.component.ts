import { Component, OnInit } from '@angular/core';
import {DisplayService} from "../../services/display.service";

@Component({
  selector: 'umsa-list-module',
  templateUrl: './list-module.component.html',
  styleUrls: ['./list-module.component.scss']
})
export class ListModuleComponent implements OnInit {

  modules: any;

  constructor(private displayService: DisplayService) { }

  ngOnInit() {
    this.displayService.getAllModules().subscribe(data => {
      console.log(data, " display Service");
    });
  }

}