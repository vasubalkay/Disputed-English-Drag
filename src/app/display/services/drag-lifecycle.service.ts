import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DragLifecycleService {

  private source = new BehaviorSubject<any>({

    element_ID: null, // ID of current element being dragged
    reposition: false, // False: if new element addition to canvas, True: if existing element repositioning
    idCounts: {}, // Helper dictionary for naming newly added elements
    allElemIDs: [], // Record of IDs of all elements on canvas
    allElems: [], // Record of all elements' ID, top, left, right, bottom

    // Element's original X and Y coordinates
    exo: null,
    eyo: null,

    // Element's width and height
    ew: null,
    eh: null,

    // Mouse pointer's original X and Y coordinates
    mxo: null,
    myo: null,

    // Offset of the element's position from the mouse pointer position
    dx: null,
    dy: null,

    // number of cells the canvas is divided into, yet to give feature to change this dynamically from user end
    // Always keep precision as power of 2, this allows dynamically changing precision to still align the grid with elements on canvas
    precision: 128,
    step: 10,

    // Coordinates to draw guidelines with other elements
    guidepos: {
        x: {},
        y: {}
    }
  });
  dragData = this.source.asObservable();

  constructor() { }

  change(newData: object) {
    // Update the data for all elements
    this.source.next(newData);
  }
}
