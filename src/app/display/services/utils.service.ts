import { Injectable } from '@angular/core';
import { DragLifecycleService } from './drag-lifecycle.service';

@Injectable()
export class UtilsService {

  dragData = {

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
    precision: 64,
    step: 10,

    // Coordinates to draw guidelines with other elements
    guidepos: {
      x: {},
      y: {}
    }
  };

  constructor(private dragDataService: DragLifecycleService) {
    this.dragDataService.dragData.subscribe( (newData) => {this.dragData = newData; } );
  }

  getOptimumPos(step, top, right, bottom, left) {

    let newtop, newright, newbottom, newleft;

    // number of pixels to move in all cases of reducing or increasing the coordinates
    const decTop = -(top % step);
    const incTop = decTop + step;
    const decLeft = -(left % step);
    const incLeft = decLeft + step;
    const decBottom = -(bottom % step);
    const incBottom = decBottom + step;
    const decRight = -(right % step);
    const incRight = decRight + step;

    let topOffset;
    let rightOffset;
    let bottomOffset;
    let leftOffset;

    // select the move with the smallest magnitude for each coordinate
    if (-decTop < incTop) {
      topOffset = decTop;
    } else {
      topOffset = incTop;
    }
    if (-decRight < incRight) {
      rightOffset = decRight;
    } else {
      rightOffset = incRight;
    }
    if (-decBottom < incBottom) {
      bottomOffset = decBottom;
    } else {
      bottomOffset = incBottom;
    }
    if (-decLeft < incLeft) {
      leftOffset = decLeft;
    } else {
      leftOffset = incLeft;
    }

    // Whether Top or Bottom cooridnate is closer to a grid cell boundary
    if (Math.abs(topOffset) < Math.abs(bottomOffset)) {
      newtop = top + topOffset;
      newbottom = bottom + topOffset;
    } else {
      newtop = top + bottomOffset;
      newbottom = bottom + bottomOffset;
    }
    // Same with Right and Left coordinate
    if (Math.abs(leftOffset) < Math.abs(rightOffset)) {
      newleft = left + leftOffset;
      newright = right + leftOffset;
    } else {
      newleft = left + rightOffset;
      newright = right + rightOffset;
    }

    return {
      top: newtop,
      right: newright,
      bottom: newbottom,
      left: newleft
    };
  }

  formatElement(id: string) {
    const domElem = document.getElementById(id);
    const domRect = domElem.getBoundingClientRect();

    const dropzone = domElem.parentElement;
    const dropRect = dropzone.getBoundingClientRect();

    // RESIZE PERFECTLY FOR GRID
    const domWidth = domRect.width;
    const domHeight = domRect.height;

    // values with which to increase or decrease dimensions of element
    const decdw = -(domWidth % this.dragData.step);
    const incdw = decdw + this.dragData.step;
    const decdh = -(domHeight % this.dragData.step);
    const incdh = decdh + this.dragData.step;


    // Resize considering whatever makes the smallest alteration
    if (-decdw < incdw) {
      domElem.style.width = (domWidth + decdw) + 'px';
    } else {
      domElem.style.width = (domWidth + incdw) + 'px';
    }
    if (-decdh < incdh) {
      domElem.style.height = (domHeight + decdh) + 'px';
    } else {
      domElem.style.height = (domHeight + incdh) + 'px';
    }


    let top = domRect.top - dropRect.top;
    let left = domRect.left - dropRect.left;
    let bottom = top + domElem.offsetHeight;
    let right = left + domElem.offsetWidth;

    let fleft = Math.round(left);
    let ftop = Math.round(top);
    let fright = Math.round(right);
    let fbottom = Math.round(bottom);

    let centerx = Math.round((fleft + fright) / 2);
    let centery = Math.round((ftop + fbottom) / 2);

    let xarray = [fleft, fright, centerx];
    let yarray = [ftop, fbottom, centery];

    for (const xpos of xarray) {
      if (this.dragData.guidepos.x[xpos]) {
        this.dragData.guidepos.x[xpos] -= 1;
        if (this.dragData.guidepos.x[xpos] === 0) {
          delete this.dragData.guidepos.x[xpos];
        }
      }
    }
    for (const ypos of yarray) {
      if (this.dragData.guidepos.y[ypos]) {
        this.dragData.guidepos.y[ypos] -= 1;
        if (this.dragData.guidepos.y[ypos] === 0) {
          delete this.dragData.guidepos.y[ypos];
        }
      }
    }

    const optimumPos = this.getOptimumPos(this.dragData.step, top, right, bottom, left);
    top = optimumPos.top;
    left = optimumPos.left;
    right = optimumPos.right;
    bottom = optimumPos.bottom;

    // Storing coordinates which are used to calculate guidelines
    fleft = Math.round(left);
    ftop = Math.round(top);
    fright = Math.round(right);
    fbottom = Math.round(bottom);
    centerx = Math.round( (fleft + fright) / 2 );
    centery = Math.round( (ftop + fbottom) / 2 );

    xarray = [fleft, fright, centerx];
    yarray = [ftop, fbottom, centery];

    // Adding guideline coordinates to guidepos array globbally
    for (const xpos of xarray) {
      if (this.dragData.guidepos.x[xpos] === undefined) {
        this.dragData.guidepos.x[xpos] = 1;
      } else {
        this.dragData.guidepos.x[xpos] += 1;
      }
    }
    for (const ypos of yarray) {
      if (this.dragData.guidepos.y[ypos] === undefined) {
        this.dragData.guidepos.y[ypos] = 1;
      } else {
        this.dragData.guidepos.y[ypos] += 1;
      }
    }

    domElem.style.top = top + 'px';
    domElem.style.left = left + 'px';
  }
}
