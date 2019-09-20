import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Injectable()
export class PostDropActionsService {

    private source = new BehaviorSubject<any>({
        inFocus: {},
      setByMultiSelect: false,
        multiple: false
    });
    postDropData = this.source.asObservable();

    constructor() { }

    change(newData: object) {
        // Update the data for all elements
        this.source.next(newData);
    }

}
