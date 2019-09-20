import { Injectable } from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
// import {DownlinkModel} from "../model/downlink.model";

@Injectable()
export class DisplayService {

  endpoint: any = environment.production;
  filterObject = {
    moduleStatus: 0,
    pageSize: 10,
    sortBy: '',
    sortOrder: 'asc',
    startIndex: 0,
    teamId: 1
  };

  constructor(private http: HttpClient ) { }

  getModuleById(): any {
      return this.http.get<any>(this.endpoint + '/cmf/module/downlinkdisplay/47');
  }

  saveModule(displayModel) {
    return this.http.post(this.endpoint + '/cmf/module/downlinkdisplay', displayModel);
  }

  getAllModules(): any {
    return this.http.post<any>(this.endpoint + '/cmf/module/downlinkdisplay/list', this.filterObject);
  }

}
