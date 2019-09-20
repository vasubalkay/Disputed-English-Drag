import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SaveCanvasService {


    jk = [
        {
            classList: ['drag', 'primary'],
            dimensions: {top: 252, left: 162, width: 144, height: 72},
            id: 'button.1',
            innerHTML: 'Primary',
            tagName: 'button'
        },
        {
            classList: ['drag', 'primary'],
            dimensions: {top: 342, left: 342, width: 144, height: 72},
            id: 'button.2',
            innerHTML: 'Primary 2',
            tagName: 'button'
        }
    ];

    private source = new BehaviorSubject<any>({
        canvas: []
    });
    saveData = this.source.asObservable();

    constructor() { }

    change(newData: object) {
        // Update the data for all elements
        this.source.next(newData);
        console.log('Data changes at save service', newData);
    }

}
