import {Component, EventEmitter, OnInit, Output} from '@angular/core';

import {DragLifecycleService} from '../../services/drag-lifecycle.service';
import {ElementEventsService} from '../../services/element-events.service';
import {UtilsService} from '../../services/utils.service';
import {PostDropActionsService} from '../../services/post-drop-actions.service';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit {

  @Output() emitAfterDrop = new EventEmitter();

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
    precision: 32,
    step: 10,

    // Coordinates to draw guidelines with other elements
    guidepos: {
      x: {},
      y: {}
    }
  };

  postDropData = {
    inFocus: {},
    setByMultiSelect: false,
    multiple: false
  };

  multiSelectData = {
    multiselect: false,
    startX: null,
    startY: null,
    endX: null,
    endY: null
  };

  constructor(private dragDataService: DragLifecycleService,
              private elementService: ElementEventsService,
              private utilsService: UtilsService, private postDropService: PostDropActionsService) {
  }

  ngOnInit() {
    this.dragDataService.dragData.subscribe((newData) => {
      this.dragData = newData;
    });
    this.dragData.precision = 128;
    this.drawCanvasGrid();
    this.resizeDraggable();
    this.postDropService.postDropData.subscribe(postData => {
      this.postDropData = postData;
    });
  }

  onClick(event: any) {

    // console.log('Canvas clicked', event.target.id);
    // console.log('Set By Multiselect', this.postDropData.setByMultiSelect);
    if (!this.postDropData.setByMultiSelect) {
      if (this.dragData.allElemIDs.indexOf(event.target.id) < 0) {
        for (const elemID of Object.keys(this.postDropData.inFocus)) {
          const domElem = document.getElementById(elemID);
          domElem.classList.remove('select');
          delete this.postDropData.inFocus[elemID];
        }
      }
      // console.log('onClick');

    }
    this.postDropData.setByMultiSelect = false;
    this.postDropService.change({...this.postDropData});
  }


  dragEnter(event: any) {
    console.log('Drag Enter Element', this.dragData.element_ID);
  }

  dragOver(event: any) {
    event.preventDefault();

    console.log('Drag Over Element', this.dragData.element_ID);

    /* Events dont seem to bubble up to the element with the event handler
    Therefore, had to use getElementById(event.target.offsetParent.id) instead of using event.target.id */
    console.log('Dragging Over Target', event.target.id);
    console.log('Dragging Over Parent', event.target.offsetParent.id);

    const mxc = event.clientX, myc = event.clientY; // Current X and Y coordinates of mouse pointer. at drop.
    const dropbox = <HTMLElement> document.getElementById(event.target.offsetParent.id);
    const dropboxRect = dropbox.getBoundingClientRect(); // Bounding box around the dropzone

    const dropw = dropboxRect.width, droph = dropboxRect.height; // size of the dropzone

    // coordinates of top left corner of dropzone
    const refX = dropboxRect.left;
    const refY = dropboxRect.top;

    /* IMPORTANT
    Correct coordinates of element inside the dropzone, considering
    current mouse pointer location,
    initial offset (dx and dy) and
    coordinates of dropzone top left corner */
    let left = mxc - this.dragData.dx - refX, top = myc - this.dragData.dy - refY;
    // bottom right coordinates of element relative to dropzone top left corner
    let right = left + this.dragData.ew, bottom = top + this.dragData.eh;

    // Exact position to drop after auto-alignment
    const optimumPos = this.utilsService.getOptimumPos(this.dragData.step, top, right, bottom, left);
    top = optimumPos.top;
    right = optimumPos.right;
    bottom = optimumPos.bottom;
    left = optimumPos.left;

    // Center coordinates of the element
    const centerx = (left + right) / 2;
    const centery = (top + bottom) / 2;

    // Every coordinate along which guidelines are drawn
    const checkx = [Math.round(left), Math.round(centerx), Math.round(right)];
    const checky = [Math.round(top), Math.round(centery), Math.round(bottom)];

    const canvas = <HTMLCanvasElement> document.getElementById('guidelines');
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Alignment to other elements
    context.beginPath();
    for (const xpos of checkx) {
      if (this.dragData.guidepos.x[xpos]) {
        context.moveTo(xpos, 0);
        context.lineTo(xpos, canvas.height);
      }
    }
    for (const ypos of checky) {
      if (this.dragData.guidepos.y[ypos]) {
        context.moveTo(0, ypos);
        context.lineTo(canvas.width, ypos);
      }
    }
    context.strokeStyle = '#009BDE'; // Guidelines to other elements are blue
    context.lineWidth = 1;
    context.stroke();

    // Center of the canvas
    context.beginPath()
    for (const xpos of checkx) {
      if (xpos === Math.round(dropw / 2)) {
        context.moveTo(canvas.width / 2, 0);
        context.lineTo(canvas.width / 2, canvas.height);
      }
    }
    for (const ypos of checky) {
      if (ypos === Math.round(droph / 2)) {
        context.moveTo(0, canvas.height / 2);
        context.lineTo(canvas.width, canvas.height / 2);
      }
    }
    context.strokeStyle = '#FFA400'; // Guidelines to canvas center are purple
    context.lineWidth = 1;
    context.stroke();

    // Edges of the canvas
    context.beginPath();
    if (Math.round(right) === Math.round(dropw)) {
      context.moveTo(canvas.width, 0);
      context.lineTo(canvas.width, canvas.height);
    }
    if (Math.round(left) === 0) {
      context.moveTo(0, 0);
      context.lineTo(0, canvas.height);
    }
    if (Math.round(top) === 0) {
      context.moveTo(0, 0);
      context.lineTo(canvas.width, 0);
    }
    if (Math.round(bottom) === Math.round(droph)) {
      context.moveTo(0, canvas.height);
      context.lineTo(canvas.width, canvas.height);
    }
    context.strokeStyle = '#EB0029'; // Guidelines to canvas edges are red
    context.lineWidth = 5;
    context.stroke();

    // Update data in service
    this.dragDataService.change(this.dragData);
  }

  dragLeave(event: any) {
    // Clear all guidelines when element leaves canvas
    const canvas = <HTMLCanvasElement> document.getElementById('guidelines');
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    console.log('Guidelines cleared');
  }

  dragDrop(event: any) {
    event.preventDefault();
    if (!this.dragData.element_ID) { return; } // just to avoid annoying errors in browser console. works without this.

    const mxc = event.clientX, myc = event.clientY; // Current X and Y coordinates of mouse pointer. at drop.

    // Because events for some reason dont bubble up in angular, and the topmost element is "#guidelines", select its parent "#dropzone"
    const dropbox = <HTMLElement> document.getElementById(event.target.offsetParent.id);
    const dropboxRect = dropbox.getBoundingClientRect(); // Bounding box around the dropzone

    const dropw = dropboxRect.width, droph = dropboxRect.height; // size of the dropzone

    // coordinates of top left corner of dropzone
    const refX = dropboxRect.left;
    const refY = dropboxRect.top;

    /* IMPORTANT
    Correct coordinates of element inside the dropzone, considering
    current mouse pointer location,
    initial offset (dx and dy) and
    coordinates of dropzone top left corner */
    let left = mxc - this.dragData.dx - refX, top = myc - this.dragData.dy - refY;
    // bottom right coordinates of element relative to dropzone top left corner
    let right = left + this.dragData.ew, bottom = top + this.dragData.eh;

    // Exact position to drop after auto-alignment
    const optimumPos = this.utilsService.getOptimumPos(this.dragData.step, top, right, bottom, left);
    top = optimumPos.top;
    right = optimumPos.right;
    bottom = optimumPos.bottom;
    left = optimumPos.left;

    // Storing coordinates which are used to calculate guidelines
    const fleft = Math.round(left);
    const ftop = Math.round(top);
    const fright = Math.round(right);
    const fbottom = Math.round(bottom);
    const centerx = Math.round((fleft + fright) / 2);
    const centery = Math.round((ftop + fbottom) / 2);

    const xarray = [fleft, fright, centerx];
    const yarray = [ftop, fbottom, centery];

    // true if element is within the canvas area
    const inCanvas = (left >= 0 && top >= 0 && right <= dropw && bottom <= droph);

    // true if element is not overlapping with other elements
    let canDrop = true;

    for (const block of this.dragData.allElems) {
      // If repositioning an element, doesnt conflict with canDrop
      if (this.dragData.element_ID === block.id && this.dragData.reposition) {
        canDrop = true;
      } else { // Else check coordinates with the element to check overlap
        const blockAbove = (block.bottom <= top);
        const blockBelow = (block.top >= bottom);
        const blockLeft = (block.right <= left);
        const blockRight = (block.left >= right);
        canDrop = canDrop && (blockAbove || blockBelow || blockLeft || blockRight);
      }
      if (!canDrop) { break; }
    }

    // console.log(`canDrop: ${canDrop}, inCanvas=${inCanvas}`);

    // Element is inside canvas and not overlapping with other elements
    if (inCanvas && canDrop) {
      const refNode = <HTMLElement>document.getElementById(this.dragData.element_ID);

      // Adding new element
      if (!this.dragData.reposition) {
        var cloneNode = <HTMLElement>refNode.cloneNode(true);

        // increase count in global dictionary, for new element IDs
        if (!this.dragData.idCounts[this.dragData.element_ID]) {
          this.dragData.idCounts[this.dragData.element_ID] = 1;
        } else {
          this.dragData.idCounts[this.dragData.element_ID] += 1;
        }

        // of the type originalID.1 for all elements
        const newid = this.dragData.element_ID + '.' + this.dragData.idCounts[this.dragData.element_ID];

        // position within a dropzone with "position: relative"
        cloneNode.style.position = 'absolute';

        // As percentages instead, to scale on different screen sizes
        cloneNode.style.top = (top * 100 / droph) + '%';
        cloneNode.style.left = (left * 100 / dropw) + '%';
        // cloneNode.style.width = (this.dragData.ew * 100 / dropw) + '%';
        // cloneNode.style.height = (this.dragData.eh * 100 / droph) + '%';
        cloneNode.style.zIndex = '1';
        // cloneNode.style.overflow = 'auto';
        // cloneNode.style.resize = 'both';

        cloneNode.setAttribute('id', newid);

        console.log('Cloning');

        dropbox.appendChild(cloneNode);

        // Newly added element is also draggable, register event listeners from the service
        cloneNode.addEventListener('dragstart', (ev: any) => {
          this.elementService.dragStart(ev);
        });
        cloneNode.addEventListener('dragend', (ev: any) => {
          this.elementService.dragEnd(ev);
        });

        cloneNode.addEventListener('click', (ev: any) => {
          this.elementService.onClick(ev);
        }, true);
        cloneNode.addEventListener('mousedown', (ev: any) => {
          this.elementService.onMouseDown(ev);
        });
        cloneNode.addEventListener('mouseup', (ev: any) => {
          this.elementService.onMouseUp(ev);
        });
        cloneNode.addEventListener('mousemove', (ev: any) => {
          this.elementService.onMouseMove(ev);
        });
        const testNode = <HTMLElement>document.getElementById(newid);
        /*testNode.addEventListener('dblclick', (ev: any) => {
          this.elementService.onDoubleClick(ev);
        });*/

        console.log(this.dragData, 'dragData');


        // add an object with properties into global array, to check for overlap later
        const newElem = {
          id: newid,
          // Keep these as pixels cuz used only in one session, no scaling to different screens
          top: top,
          left: left,
          bottom: bottom,
          right: right
        };
        this.dragData.allElems.push(newElem);
        this.dragData.allElemIDs.push(newid);

        // Adding guideline coordinates to guidepos array globbally
        for (let xpos of xarray) {
          if (this.dragData.guidepos.x[xpos] === undefined) {
            this.dragData.guidepos.x[xpos] = 1;
          } else {
            this.dragData.guidepos.x[xpos] += 1;
          }
        }
        for (let ypos of yarray) {
          if (this.dragData.guidepos.y[ypos] === undefined) {
            this.dragData.guidepos.y[ypos] = 1;
          } else {
            this.dragData.guidepos.y[ypos] += 1;
          }
        }
      } else { // Reposition existing element

        // just change position
        refNode.style.top = top + 'px';
        refNode.style.left = left + 'px';

        refNode.style.top = (top * 100 / droph) + '%';
        refNode.style.left = (left * 100 / dropw) + '%';

        // change position properties in global array
        for (const i in this.dragData.allElems) {
          if (this.dragData.allElems[i].id === this.dragData.element_ID) {
            this.dragData.allElems[i].top = top;
            this.dragData.allElems[i].left = left;
            this.dragData.allElems[i].bottom = bottom;
            this.dragData.allElems[i].right = right;
          }
        }

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
      }
    }

    const guidecanvas = <HTMLCanvasElement> document.getElementById('guidelines');
    const context = guidecanvas.getContext('2d');
    context.clearRect(0, 0, guidecanvas.width, guidecanvas.height);

    this.dragData.element_ID = null;
    this.dragData.reposition = false;

    this.dragDataService.change(this.dragData);

    this.emitAfterDrop.emit(cloneNode);
  }

  // Draw grid with canvas
  drawCanvasGrid() {

    const drop = <HTMLElement>document.getElementById('dropzone');
    const dropzoneRect = drop.getBoundingClientRect();

    const dropw = dropzoneRect.width;
    const droph = dropzoneRect.height;

    // IMPORTANT: This sets up equally sized grid cells, auto-alignment and guidelines
    this.dragData.step = dropw / this.dragData.precision;

    // Without this, the guidelines are pixellated
    const guidecanvas = <HTMLCanvasElement>document.getElementById('guidelines');
    guidecanvas.width = dropw;
    guidecanvas.height = droph;

    // Same reason
    const canvas = <HTMLCanvasElement>document.getElementById('canvas');
    canvas.width = dropw;
    canvas.height = droph;

    // Draw grid
    const context = canvas.getContext('2d');
    context.lineWidth = 0.5;
    context.beginPath();
    for (let x = 0; x < dropw; x += this.dragData.step) {
      context.moveTo(x, 0);
      context.lineTo(x, droph);
    }
    for (let y = 0; y < droph; y += this.dragData.step) {
      context.moveTo(0, y);
      context.lineTo(dropw, y);
    }

    // Edges: just for pretty looking uniform canvas
    context.moveTo(0, 0);
    context.lineTo(0, droph);
    context.moveTo(dropw, 0);
    context.lineTo(dropw, droph);
    context.moveTo(0, 0);
    context.lineTo(dropw, 0);
    context.moveTo(0, droph);
    context.lineTo(dropw, droph);

    context.strokeStyle = '#999'; // grey lines on grey canvas at start
    context.stroke();

    this.dragDataService.change(this.dragData);
  }

  resizeDraggable() {
    /* IMPORTANT
    This resizes all draggable elements to exactly fit inside the cells and not be of odd dimensions
    This function is called in onInit right after drawCanvas set the value of step variable in DragLifecycle Service
    Works with different values of precision variable in DragLifecycle Service */

    const drags = <HTMLElement[]><any> document.querySelectorAll('.drag'); // All draggable elements

    for (const drag of drags) {
      // Initial resize each draggable to fit cells according to precision level

      const dragRect = drag.getBoundingClientRect();
      const dragwidth = dragRect.width;
      const dragheight = dragRect.height;

      // values with which to increase or decrease dimensions of element
      const decdw = -(dragwidth % this.dragData.step);
      const incdw = decdw + this.dragData.step;
      const decdh = -(dragheight % this.dragData.step);
      const incdh = decdh + this.dragData.step;

      // Resize considering whatever makes the smallest alteration
      if (-decdw < incdw) {
        drag.style.width = (dragwidth + decdw) + 'px';
      } else {
        drag.style.width = (dragwidth + incdw) + 'px';
      }
      if (-decdh < incdh) {
        drag.style.height = (dragheight + decdh) + 'px';
      } else {
        drag.style.height = (dragheight + incdh) + 'px';
      }
    }
  }

  onMouseDown(event: any) {
    // console.log('mouse down');
    // console.log(event.target.id);
    if (event.target.id === 'guidelines') {
      this.multiSelectData.multiselect = true;

      const guide = <HTMLCanvasElement>document.getElementById('guidelines');
      const guideRect = guide.getBoundingClientRect();

      // console.log(event.clientX);

      this.multiSelectData.startX = event.clientX - guideRect.left;
      this.multiSelectData.startY = event.clientY - guideRect.top;
    }
  }

  onMouseMove(event: any) {
    // console.log('mouseMove');
    // console.log('Set By Multiselect', this.postDropData.setByMultiSelect);
    if (this.multiSelectData.multiselect) {
      const canvas = <HTMLCanvasElement>document.getElementById('guidelines');
      const context = canvas.getContext('2d');

      context.clearRect(0, 0, canvas.width, canvas.height);

      const guideRect = canvas.getBoundingClientRect();

      const nowX = event.clientX - guideRect.left;
      const nowY = event.clientY - guideRect.top;

      // console.log('X', nowX, this.multiSelectData.startX);
      // console.log('Y', nowY, this.multiSelectData.startY);

      const rectwidth = Math.abs(nowX - this.multiSelectData.startX);
      const rectheight = Math.abs(nowY - this.multiSelectData.startY);

      // console.log('Rect:', rectwidth, rectheight);

      const rectLeft = Math.min(nowX, this.multiSelectData.startX);
      const rectTop = Math.min(nowY, this.multiSelectData.startY);

      context.beginPath();
      context.lineWidth = 1;
      context.strokeStyle = '#00CFC1';
      context.fillStyle = '#00CFC1';

      context.globalAlpha = 0.3;
      context.fillRect(rectLeft, rectTop, rectwidth, rectheight);
      context.globalAlpha = 1;
      context.stroke();

      for (const elem of this.dragData.allElems) {
        const domElem = document.getElementById(elem.id);

        const midX = (elem.left + elem.right) / 2;
        const midY = (elem.top + elem.bottom) / 2;

        const xInside = midX > rectLeft && midX < (rectLeft + rectwidth);
        const yInside = midY > rectTop && midY < (rectTop + rectheight);
        if (xInside && yInside) {
          // console.log(elem.id);
          this.postDropData.inFocus[elem.id] = 1;
          domElem.classList.add('select');
        } else {
          delete this.postDropData.inFocus[elem.id];
          domElem.classList.remove('select');
        }
      }

      if (Object.keys(this.postDropData.inFocus).length >= 1) {
        this.postDropData.setByMultiSelect = true;
        this.postDropData.multiple = true;
      }

      this.postDropService.change(this.postDropData);
    }
  }

  onMouseUp(event: any) {
    // console.log('mouseUp');
    // console.log('Set By Multiselect', this.postDropData.setByMultiSelect);
    this.multiSelectData.multiselect = false;

    // console.log(this.postDropData.inFocus);

    const canvas = <HTMLCanvasElement>document.getElementById('guidelines');
    const context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);
    this.postDropService.change(this.postDropData);
  }
}
