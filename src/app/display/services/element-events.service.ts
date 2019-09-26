import { Injectable } from '@angular/core';
import { DragLifecycleService } from './drag-lifecycle.service';
import { UtilsService } from './utils.service';
import { PropertiesChangeDialogComponent } from '../dialog/properties-change-dialog/properties-change-dialog.component';
import { MatDialog } from '@angular/material';
import { BehaviorSubject } from 'rxjs';
import { PostDropActionsService } from './post-drop-actions.service';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

@Injectable()
export class ElementEventsService {

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
  resultData = {
    id: '',
    type: '',
    placeholder: '',
    width: '',
    height: '',
    maxLength: '',
    minLength: '',
    dataType: '',
    value: '',
    fillChar: '',
    justification: ''
  };

  postDropData = {
    inFocus: {},
    multiple: false,
    setByMultiSelect: false
  };

  resizeData = {
    id: null,
    resizeMargin: 4,
    inMargin: false,
    resizing: false,
    boolTop: false,
    boolBottom: false,
    boolLeft: false,
    boolRight: false
  };


  private dblEvent = new Subject();
  dblData$ = this.dblEvent.asObservable();

  constructor(
    private dragDataService: DragLifecycleService,
    private utilsService: UtilsService,
    public dialog: MatDialog,
    private postDropService: PostDropActionsService) {
    // Listen to changes on global data in DragLifecycle service
    this.dragDataService.dragData.subscribe((newData) => {
      this.dragData = newData;
    });
  }

  onMouseMove(event: any) {
    // console.log(this.resizeData.resizing);
    if (!this.resizeData.resizing) {
      this.checkMargin(event);
    }
  }

  onMouseDown(event: any) {
    if (this.resizeData.inMargin) {
      this.resizeData.resizing = true;
      this.resizeData.id = event.target.id;

      // COORDINATES OF THE CURRENT ELEMENT
      const domElem = document.getElementById(this.resizeData.id);
      let top = domElem.offsetTop;
      let left = domElem.offsetLeft;
      let bottom = top + domElem.offsetHeight;
      let right = left + domElem.offsetWidth;

      const optimumPos = this.utilsService.getOptimumPos(this.dragData.step, top, right, bottom, left);
      top = optimumPos.top;
      right = optimumPos.right;
      bottom = optimumPos.bottom;
      left = optimumPos.left;

      const fleft = Math.round(left);
      const ftop = Math.round(top);
      const fright = Math.round(right);
      const fbottom = Math.round(bottom);

      const centerx = Math.round((fleft + fright) / 2);
      const centery = Math.round((ftop + fbottom) / 2);

      const xarray = [fleft, fright, centerx];
      const yarray = [ftop, fbottom, centery];

      // REMOVE FROM GUIDEPOS
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

      console.log('Window listeners set');
      window.addEventListener('mousemove', (ev: any) => {
        this.resizeHandler(ev);
      });
      window.addEventListener('mouseup', (ev: any) => {
        this.stopResize(ev);
      });
    }
  }

  onMouseUp(event: any) {
    this.resizeData.resizing = false;
  }

  resizeHandler(event: any) {
    if (this.resizeData.resizing) {
      if (this.resizeData.boolRight) {
        this.resizeRight(event);
      }
      if (this.resizeData.boolBottom) {
        this.resizeBottom(event);
      }
      if (this.resizeData.boolLeft) {
        this.resizeLeft(event);
      }
      if (this.resizeData.boolTop) {
        this.resizeTop(event);
      }
    }
  }

  stopResize(event: any) {
    console.log('stopResize');
    window.removeEventListener('mousemove', (ev: any) => {
      this.resizeHandler(ev);
    }, true);

    if (this.resizeData.id) {
      this.utilsService.formatElement(this.resizeData.id);

      const domElem = document.getElementById(this.resizeData.id);
      let top = domElem.offsetTop;
      let left = domElem.offsetLeft;
      let bottom = top + domElem.offsetHeight;
      let right = left + domElem.offsetWidth;

      const optimumPos = this.utilsService.getOptimumPos(this.dragData.step, top, right, bottom, left);
      top = optimumPos.top;
      right = optimumPos.right;
      bottom = optimumPos.bottom;
      left = optimumPos.left;

      const fleft = Math.round(left);
      const ftop = Math.round(top);
      const fright = Math.round(right);
      const fbottom = Math.round(bottom);

      const centerx = Math.round((fleft + fright) / 2);
      const centery = Math.round((ftop + fbottom) / 2);

      const xarray = [fleft, fright, centerx];
      const yarray = [ftop, fbottom, centery];

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

      // change position properties in global array
      for (const i in this.dragData.allElems) {
        if (this.dragData.allElems[i].id === this.resizeData.id) {
          this.dragData.allElems[i].top = top;
          this.dragData.allElems[i].left = left;
          this.dragData.allElems[i].bottom = bottom;
          this.dragData.allElems[i].right = right;
        }
      }
    }

    this.resizeData = {
      id: null,
      resizeMargin: 6,
      inMargin: false,
      resizing: false,
      boolTop: false,
      boolBottom: false,
      boolLeft: false,
      boolRight: false
    };
    this.resizeData.resizing = false;
  }

  resizeRight(event: any) {
    const domElem = document.getElementById(this.resizeData.id);
    const domRect = domElem.getBoundingClientRect();

    const dropzone = domElem.parentElement;
    const dropRect = dropzone.getBoundingClientRect();

    let newWidth = Math.min(event.clientX, dropRect.right) - domRect.left;

    const newRight = domElem.offsetLeft + newWidth;
    const top = domElem.offsetTop;
    const bottom = top + domElem.offsetHeight;

    let limited = false;
    for (const elem of this.dragData.allElems) {
      if (elem.id !== this.resizeData.id) {
        const canExtend = (domElem.offsetLeft >= elem.right ) || ( (top >= elem.bottom || bottom <= elem.top) || newRight <= elem.left );
        const widthLimit = elem.left - domElem.offsetLeft;
        if (!canExtend && !limited) {
          newWidth = widthLimit;
          limited = true;
        }
      }
    }

    const fitGrid = (newWidth % this.dragData.step) < 1;
    if (fitGrid) {
      domElem.style.width = newWidth + 'px';
    }
  }

  resizeBottom(event: any) {
    const domElem = document.getElementById(this.resizeData.id);
    const domRect = domElem.getBoundingClientRect();

    const dropzone = domElem.parentElement;
    const dropRect = dropzone.getBoundingClientRect();

    let newHeight = Math.min(event.clientY, dropRect.bottom) - domRect.top;

    const newBottom = domElem.offsetTop + newHeight;
    const left = domElem.offsetLeft;
    const right = left + domElem.offsetWidth;

    let limited = false;
    for (const elem of this.dragData.allElems) {
      if (elem.id !== this.resizeData.id) {
        const canExtend = (domElem.offsetTop >= elem.bottom) || ((left >= elem.right || right <= elem.left) || newBottom <= elem.top);
        const heightLimit = elem.top - domElem.offsetTop;
        console.log(canExtend, limited);
        if (!canExtend && !limited) {
          newHeight = heightLimit;
          limited = true;
        }
      }
    }

    const fitGrid = (newHeight % this.dragData.step) < 1;
    if (fitGrid) {
      domElem.style.height = newHeight + 'px';
    }
  }

  resizeTop(event: any) {
    const domElem = document.getElementById(this.resizeData.id);
    const domRect = domElem.getBoundingClientRect();

    const dropzone = domElem.parentElement;
    const dropRect = dropzone.getBoundingClientRect();

    const style = getComputedStyle(domElem);

    // tslint:disable-next-line: radix
    const paddingTop = Number.parseInt(style.paddingTop) || 0;
    // tslint:disable-next-line: radix
    const paddingBottom = Number.parseInt(style.paddingBottom) || 0;
    // tslint:disable-next-line: radix
    const borderTop = Number.parseInt(style.borderTop) || 0;
    // tslint:disable-next-line: radix
    const borderBottom = Number.parseInt(style.borderBottom) || 0;
    const sum = paddingTop + paddingBottom + borderTop + borderBottom;

    let newHeight = domRect.bottom - Math.max(event.clientY, dropRect.top);

    let newTop = Math.max(event.clientY, dropRect.top) - dropRect.top;

    const left = domElem.offsetLeft;
    const right = left + domElem.offsetWidth;
    const bottom = domElem.offsetTop + domElem.offsetWidth;

    let limited = false;
    for (const elem of this.dragData.allElems) {
      if (elem.id !== this.resizeData.id) {
        const canExtend = ( bottom <= elem.top ) || ( (left >= elem.right || right <= elem.left) || newTop >= elem.bottom );
        const heightLimit = domElem.offsetTop + domElem.offsetHeight - elem.bottom;
        if (!canExtend && !limited) {
          newHeight = heightLimit;
          newTop = elem.bottom;
          limited = true;
        }
      }
    }

    const fitGrid = (newHeight % this.dragData.step) < 1;
    if (fitGrid && (newHeight - sum >= 0)) {
      domElem.style.height = newHeight + 'px';
      domElem.style.top = newTop + 'px';
    }
  }

  resizeLeft(event: any) {
    const domElem = document.getElementById(this.resizeData.id);
    const domRect = domElem.getBoundingClientRect();

    const dropzone = domElem.parentElement;
    const dropRect = dropzone.getBoundingClientRect();

    const style = getComputedStyle(domElem);

    // tslint:disable-next-line: radix
    const paddingLeft = Number.parseInt(style.paddingLeft) || 0;
    // tslint:disable-next-line: radix
    const paddingRight = Number.parseInt(style.paddingRight) || 0;
    // tslint:disable-next-line: radix
    const borderLeft = Number.parseInt(style.borderLeft) || 0;
    // tslint:disable-next-line: radix
    const borderRight = Number.parseInt(style.borderRight) || 0;
    const sum = paddingRight + paddingLeft + borderLeft + borderRight;

    let newWidth = domRect.right - Math.max(event.clientX, dropRect.left);

    let newLeft = Math.max(event.clientX, dropRect.left) - dropRect.left;
    const top = domElem.offsetTop;
    const bottom = top + domElem.offsetHeight;
    const right = domElem.offsetLeft + domElem.offsetWidth;

    let limited = false;
    for (const elem of this.dragData.allElems) {
      if (elem.id !== this.resizeData.id) {
        const canExtend = (right <= elem.left) || ( (top >= elem.bottom || bottom <= elem.top) || newLeft >= elem.right );
        const widthLimit = domElem.offsetLeft + domElem.offsetWidth - elem.right;
        // console.log(elem.id, canExtend, limited);
        if (!canExtend && !limited) {
          console.log('limited');
          newWidth = widthLimit;
          newLeft = elem.right;
          limited = true;
        }
      }
    }


    const fitGrid = (newWidth % this.dragData.step) < 1;
    if (fitGrid && (newWidth - sum >= 0 )) {
      console.log('setting');
      domElem.style.width = newWidth + 'px';
      domElem.style.left = newLeft + 'px';
    }
  }

  checkMargin(event: any) {
    event.target.style.cursor = 'move';

    let target = event.target;
    while (target.id !== 'dropzone' && !this.dragData.allElemIDs.includes(target.id)) {
      // console.log(target, c);
      // const elem = document.getElementById(targetId);
      target = target.parentElement;
    }
    // console.log(target.id, 'outside');
    if (target.id === 'dropzone') {
      return;
    }

    const domElem = target;
    const elemRect = domElem.getBoundingClientRect();

    const nearTop = event.clientY - elemRect.top;
    const nearBottom = elemRect.top + elemRect.height - event.clientY;
    const nearLeft = event.clientX - elemRect.left;
    const nearRight = elemRect.left + elemRect.width - event.clientX;

    this.resizeData.boolTop = nearTop >= 0 && nearTop <= this.resizeData.resizeMargin;
    this.resizeData.boolBottom = nearBottom >= 0 && nearBottom <= this.resizeData.resizeMargin;
    this.resizeData.boolLeft = nearLeft >= 0 && nearLeft <= this.resizeData.resizeMargin;
    this.resizeData.boolRight = nearRight >= 0 && nearRight <= this.resizeData.resizeMargin;

    if ((this.resizeData.boolTop && this.resizeData.boolLeft) || (this.resizeData.boolBottom && this.resizeData.boolRight)) {
      domElem.style.cursor = 'nwse-resize';
    } else if ((this.resizeData.boolTop && this.resizeData.boolRight) || (this.resizeData.boolBottom && this.resizeData.boolLeft)) {
      domElem.style.cursor = 'nesw-resize';
    } else if (this.resizeData.boolTop || this.resizeData.boolBottom) {
      domElem.style.cursor = 'ns-resize';
    } else if (this.resizeData.boolLeft || this.resizeData.boolRight) {
      domElem.style.cursor = 'ew-resize';
    }

    if (this.resizeData.boolTop || this.resizeData.boolBottom || this.resizeData.boolLeft || this.resizeData.boolRight) {
      this.resizeData.inMargin = true;
      domElem.setAttribute('draggable', 'false');
      domElem.style.transition = '0s';
      // console.log('Drag events removed');
    } else {
      if (!this.resizeData.resizing) {
        this.resizeData.inMargin = false;
        domElem.style.transition = '0.3s';
        domElem.setAttribute('draggable', 'true');
      }
    }
  }


  dragStart(event: any) {
    console.log('Drag Start', event.target.id);
    this.dragData.element_ID = event.target.id; // Set globally once
    if (this.dragData.allElemIDs.indexOf(this.dragData.element_ID) >= 0) {
      this.dragData.reposition = true; // if an existing element on canvas, repositioning action
    }

    const element = document.getElementById(this.dragData.element_ID);
    const rect = element.getBoundingClientRect(); // Bounding box coordinates around the element

    // Original element coordinates and dimensions
    this.dragData.exo = rect.left;
    this.dragData.eyo = rect.top;
    this.dragData.ew = rect.width;
    this.dragData.eh = rect.height;

    // If an existing element is repositioning, remove contribution of its coordinates from guidepos
    if (this.dragData.reposition) {

      const dropzone = document.getElementById('dropzone');
      const dropRect = dropzone.getBoundingClientRect();

      const refX = dropRect.left;
      const refY = dropRect.top;


      const optimumPos = this.utilsService.getOptimumPos(
        this.dragData.step,
        (rect.top - refY),
        (rect.right - refX),
        (rect.bottom - refY),
        (rect.left - refX));

      const top = optimumPos.top;
      const right = optimumPos.right;
      const bottom = optimumPos.bottom;
      const left = optimumPos.left;

      const fleft = Math.round(left);
      const ftop = Math.round(top);
      const fright = Math.round(right);
      const fbottom = Math.round(bottom);

      const centerx = Math.round((fleft + fright) / 2);
      const centery = Math.round((ftop + fbottom) / 2);

      const xarray = [fleft, fright, centerx];
      const yarray = [ftop, fbottom, centery];

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
    }

    // Capture "original" mouse pointer coordinates
    this.dragData.mxo = event.clientX;
    this.dragData.myo = event.clientY;

    // Offset between mouse pointer and element top left corner
    this.dragData.dx = this.dragData.mxo - this.dragData.exo;
    this.dragData.dy = this.dragData.myo - this.dragData.eyo;

    // event.dataTransfer.setData('text', event.target.id);
    event.dataTransfer.setData('text', 'anything');

    this.dragDataService.change(this.dragData);
  }

  dragEnd(event: any) {
    event.preventDefault();
    console.log('Drag End', event.target.id);
  }

  onClick(event: any) {
    event.preventDefault();

    let target = event.target;
    while (target.id !== 'dropzone' && !this.dragData.allElemIDs.includes(target.id)) {
      // console.log(target, c);
      // const elem = document.getElementById(targetId);
      target = target.parentElement;
    }
    // console.log(target.id, 'outside');
    if (target.id === 'dropzone') {
      return;
    }

    if (event.ctrlKey) {
      // console.log('Ctrl + Click', event.target.id);
      if (this.postDropData.inFocus[target.id] !== undefined) {
        delete this.postDropData.inFocus[target.id];
        target.classList.remove('select');
        console.log(target.id, 'remove select');
      } else {
        this.postDropData.inFocus[target.id] = 1;
        // event.target.classList.add('focus');
      }

      if (Object.keys(this.postDropData.inFocus)[1] !== undefined) {
        this.postDropData.multiple = true;
      } else {
        this.postDropData.multiple = false;
      }

      const otherElems = Object.keys(this.postDropData.inFocus);
      for (const elem of otherElems) {
        const domElem = document.getElementById(elem);
        domElem.classList.add('select');
        console.log(domElem.id, 'add select');
      }
    } else {
      // console.log('onClick', event.target.id);

      console.log(target, 'adding select');
      const otherElems = Object.keys(this.postDropData.inFocus);
      console.log(otherElems);
      for (const elem of otherElems) {
        const domElem = document.getElementById(elem);
        const slectedElem = domElem.innerHTML;
        console.log(domElem.getElementsByClassName('radio'));
        domElem.classList.remove('select');
        console.log(domElem.id, 'remove select');
      }

      this.postDropData.inFocus = {};
      this.postDropData.inFocus[target.id] = 1;
      this.postDropData.multiple = false;
      target.classList.add('select');
      this.postDropData.setByMultiSelect = true;
      console.log(this.postDropData, 'add select');
    }

    console.log(this.postDropData, 'before change');

    this.postDropService.change(this.postDropData);
  }

/*  onDoubleClick(event: any) {
    //this.dblEvent.next(event);
    console.log(event, 'event...');
    this.resultData.id = event.target.id;
    this.resultData.type = event.target.localName;
    //this.resultData.height =
    this.dblEvent.next(this.resultData);
    //this.openDialog();
  }*/


 /* openDialog() {
    const dialogRef = this.dialog.open(PropertiesChangeDialogComponent, {
      width: '250px',
      data: this.resultData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addProporties(result);
      }
    });
  }*/

  addProporties(props) {
    const newNode = <HTMLElement>document.getElementById(props.id);
    console.log(props, 'addProprties');
    newNode.innerHTML = props.placeholder;
    newNode.style.width = props.width + 'px';
    newNode.style.height = props.height + 'px';
    newNode.setAttribute('maxlength', props.maxLength);
    newNode.setAttribute('minLength', props.minLength);
    newNode.setAttribute('type', props.dataType);
    newNode.setAttribute('value', props.value);
    newNode.setAttribute('align', props.justification);
  }

}


/*onFocus(event:
any
)
{
  console.log('onFocus', event.target.id);
}

onBlur(event
:
any
)
{
  console.log('onBlur', event.target.id);
}

}*/
