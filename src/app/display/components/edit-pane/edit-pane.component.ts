import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {PostDropActionsService} from '../../services/post-drop-actions.service';
import {DragLifecycleService} from '../../services/drag-lifecycle.service';
import {SaveCanvasService} from '../../services/save-canvas.service';
import {ElementEventsService} from '../../services/element-events.service';
import {UtilsService} from '../../services/utils.service';
import {DisplayService} from '../../services/display.service';
import {DisplayModel} from '../../model/display.model';
import {FormBuilder, ValidationErrors, Validators} from '@angular/forms';

@Component({
  selector: 'app-edit-pane',
  templateUrl: './edit-pane.component.html',
  styleUrls: ['./edit-pane.component.scss']
})
export class EditPaneComponent implements OnInit {

  objectKeys = Object.keys;
  form;
  @Output() saveMessageEmit = new EventEmitter<any>();

  CommandButton = {
    id: null,
    name: null,
    action: null,
    height: null,
    breadth: null,
    coordX: null,
    coordY: null,
    sizeX: null,
    sizeY: null
  };

  displayModel = {
    id: null,
    msaVersionId: null,
    moduleName: null,
    moduleDescription: null,
    moduleStatus: null,
    lockedOn: null,
    version: null,
    prevVersion: null,
    lockedBy: null,
    importedBy: null,
    importDate: null,
    teamId: null,
    workflowState: null,
    commonCmfVersion: null,
    commonTemplateTypeByTemplateTypeId: null,
    commandButtonList: [],
    constantTextList: [],
    lineList: null,
    nonMenuEntryBoxList: null,
    pagePromptList: null,
    textBlockList: [],
    nonExclusiveButtonGroupList: [],
    exclusiveButtonGroupList: [],
    umsaMsaVersion: {},
    umsaTemplateType: {},
  };


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

  postDropData = {
    inFocus: {},
    setByMultiSelect: false,
    multiple: false
  };

  saveData = {
    canvas: []
  };

  constructor(private dragDataService: DragLifecycleService,
              private postDropService: PostDropActionsService, private saveCanvasService: SaveCanvasService,
              private elementService: ElementEventsService, private utilsService: UtilsService,
              private displayService: DisplayService, private fb: FormBuilder) {
    this.form = fb.group({
      moduleName: ['', [Validators.required]],
      moduleVersion: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.dragDataService.dragData.subscribe((newData) => {
      this.dragData = newData;
    });
    this.postDropService.postDropData.subscribe((newData) => {
      this.postDropData = newData;
    });
    this.saveCanvasService.saveData.subscribe((newData) => {
      this.saveData = newData;
    });

    document.onkeypress = (ev) => {
      if (ev.key === 'Delete') {
        this.deleteElements();
      }
    };
  }

  deleteElements() {
    for (const ele of this.objectKeys(this.postDropData.inFocus)) {
      this.removeElement(ele);
    }

    this.postDropService.change(this.postDropData);
  }

  removeElement(elementID: string) {

    // Remove from DOM
    if (elementID === '' || elementID === null || elementID === undefined) {
      return;
    }
    const domElem = document.getElementById(elementID);
    domElem.remove();
    delete this.postDropData.inFocus[elementID];

    // Remove the element ID from the array of elements in canvas
    this.dragData.allElemIDs.splice(this.dragData.allElemIDs.indexOf(elementID), 1);
    console.log(this.dragData.allElemIDs);

    // Remove the element's coordinates used from guidelines
    const elementCoords = this.dragData.allElems.filter((item) => {
      return (item.id === elementID);
    })[0];

    const fleft = Math.round(elementCoords.left);
    const ftop = Math.round(elementCoords.top);
    const fright = Math.round(elementCoords.right);
    const fbottom = Math.round(elementCoords.bottom);
    const centerx = Math.round((fleft + fright) / 2);
    const centery = Math.round((ftop + fbottom) / 2);

    const xarray = [fleft, fright, centerx];
    const yarray = [ftop, fbottom, centery];

    for (const xpos of xarray) {
      this.dragData.guidepos.x[xpos] -= 1;
      if (this.dragData.guidepos.x[xpos] === 0) {
        delete this.dragData.guidepos.x[xpos];
      }
    }
    for (const ypos of yarray) {
      this.dragData.guidepos.y[ypos] -= 1;
      if (this.dragData.guidepos.y[ypos] === 0) {
        delete this.dragData.guidepos.y[ypos];
      }
    }
    console.log(this.dragData.guidepos);

    // Remove the element's coordinates from overlap check
    this.dragData.allElems = this.dragData.allElems.filter((item) => {
      return (item.id !== elementID);
    });


    this.dragDataService.change(this.dragData);
  }

  saveElements() {


    const dropzone = document.getElementById('dropzone');
    let children = Array.from<any>(dropzone.childNodes);

    children = children.filter((item) => {
      return (item.nodeType === Node.ELEMENT_NODE && item.tagName !== 'CANVAS');
    });

    console.log(children);

    const generatedJSON = {
      precision: this.dragData.precision,
      idCounts: this.dragData.idCounts,
      allElemIDs: this.dragData.allElemIDs,
      allElems: this.dragData.allElems,
      elements: []
    };

    this.prepareSaveData(children, generatedJSON);

    this.saveData.canvas[0] = generatedJSON;

    this.saveCanvasService.change(this.saveData);

    console.log(generatedJSON);
    const version = this.form.value.moduleVersion;
    console.log(version, 'version');
    // this.downLinkModel.id = 11;
    this.displayModel.moduleName = this.form.value.moduleName;
    this.displayModel.moduleDescription = 'module description';
    this.displayModel.moduleStatus = 0;
    this.displayModel.version = version;
    this.displayModel.msaVersionId = 1;
    this.displayModel.prevVersion = 2;
    this.displayModel.umsaMsaVersion['id'] = 1;
    this.displayModel.umsaTemplateType['id'] = 1;

    this.displayService.saveModule(this.displayModel).subscribe(successData => {
        this.saveMessageEmit.emit('success');
    }, errorData => {
      if (errorData.error.errorCode === 'ERR_MODULE_0001') {
         this.saveMessageEmit.emit('not unique');
      }
    });


  }


  private prepareSaveData(
    children: Array<any>,
    generatedJSON: { precision: number; idCounts: ({} | any);
    allElemIDs: any; allElems: any; elements: any }) {
    for (const element of children) {
      // console.log(element);
      const newElement = {};
      const tagname = element.tagName.toLowerCase();
      let type;

      if (tagname === 'div' ) {
        type = element.firstElementChild.type.toLowerCase();
      } else {
        if (element.type) {
        type = element.type.toLowerCase();
        }
      }

      newElement['tagName'] = tagname;
      newElement['id'] = element.id;

      const arr = element.id.split('.');
      const idNo = Number(arr[-1]);
      newElement['classList'] = element.classList;
      newElement['innerHTML'] = element.innerHTML;

      // const top = element.offsetTop;
      // const left = element.offsetLeft;
      //
      // const width = element.offsetWidth;
      // const height = element.offsetHeight;
      //
      // const bottom = top + height;
      // const right = left + width;

      newElement['dimensions'] = {};
      newElement['dimensions']['top'] = element.offsetTop;
      newElement['dimensions']['left'] = element.offsetLeft;
      newElement['dimensions']['width'] = element.offsetWidth;
      newElement['dimensions']['height'] = element.offsetHeight;

      // console.log(newElement);
      generatedJSON.elements.push(newElement);

      if ( tagname === 'button') {
        // BUTTON
        const CommandButton = this.prepareCommandButton(element);
        this.displayModel.commandButtonList.push(CommandButton);
      } else if ( tagname === 'input' && type === 'text') {
        // TEXTBOX
        const textBlock = this.prepareTextBlock(element);
        this.displayModel.textBlockList.push(textBlock);
      } else if ( tagname === 'div' && type === 'checkbox') {
        // CHECKBOX
        const checkBox = this.prepareCheckBox(element);
        this.displayModel.nonExclusiveButtonGroupList.push(checkBox);
      } else if ( tagname === 'div' && type === 'radio') {
        // RADIO
        const radioButton = this.prepareRadioButton(element);
        this.displayModel.exclusiveButtonGroupList.push(radioButton);
      } else if ( tagname === 'label') {
        // LABEL
        const label = this.prepareLabel(element);
        this.displayModel.constantTextList.push(label);
      }
    }
  }

  private prepareLabel(element) {
    const label = {};
    label['elementId'] = element.id;
    label['height'] = element.offsetHeight;
    label['displayText'] = element.innerHTML;
    label['breadth'] = element.offsetWidth;
    label['coordX'] = element.offsetLeft;
    label['coordY'] = element.offsetTop;
    label['sizeX'] = element.offsetWidth;
    label['sizeY'] = element.offsetHeight;
    return label;
  }

  private prepareCheckBox(element) {
    const checkBox = {};
    checkBox['groupName'] = 'defaultCheckBoxGroup';
    checkBox['elementId'] = element.id;
    checkBox['coordX'] = element.offsetLeft;
    checkBox['coordY'] = element.offsetTop;
    checkBox['sizeY'] = element.offsetHeight;
    checkBox['sizeX'] = element.offsetWidth;
    checkBox['name'] = element.lastChild.nodeValue;
    return checkBox;
  }

  private prepareRadioButton(element) {
    const radioButton = {};
    radioButton['groupName'] = 'defaultRadioButtonGroup';
    radioButton['elementId'] = element.id;
    radioButton['coordX'] = element.offsetLeft;
    radioButton['coordY'] = element.offsetTop;
    radioButton['sizeY'] = element.offsetHeight;
    radioButton['sizeX'] = element.offsetWidth;
    radioButton['name'] = element.lastChild.nodeValue;
    return radioButton;
  }

  private prepareTextBlock(element) {
    const textBlock = {};
    textBlock['elementId'] = element.id;
    textBlock['coordX'] = element.offsetLeft;
    textBlock['coordY'] = element.offsetTop;
    textBlock['sizeY'] = element.offsetHeight;
    textBlock['sizeX'] = element.offsetWidth;
    textBlock['text'] = element.value;
    return textBlock;
  }

  private prepareCommandButton(element) {
    const CommandButton = {};
    CommandButton['elementId'] = element.id;
    CommandButton['height'] = element.offsetHeight;
    CommandButton['name'] = element.innerHTML;
    CommandButton['action'] = 'save action';
    CommandButton['breadth'] = element.offsetWidth;
    CommandButton['coordX'] = element.offsetLeft;
    CommandButton['coordY'] = element.offsetTop;
    CommandButton['sizeX'] = element.offsetWidth;
    CommandButton['sizeY'] = element.offsetHeight;
    return CommandButton;
  }

  reloadCanvas() {

    const dropzone = document.getElementById('dropzone');

    const dropzoneRect = dropzone.getBoundingClientRect();
    const dropw = dropzoneRect.width;
    this.dragData.step = dropw / this.dragData.precision;


    this.displayService.getModuleById().subscribe(data => {
      console.log('Downlink response', data);

      for (const elem of data.textBlockList) {
        this.createDomElement(elem, 'input', 'text');
      }
      for (const elem of data.commandButtonList) {
        this.createDomElement( elem, 'button', null);
      }
      for (const elem of data.nonExclusiveButtonGroupList) {
        this.createDomElement( elem, 'input', 'checkbox');
      }
      for (const elem of data.exclusiveButtonGroupList) {
        this.createDomElement( elem, 'input', 'radio');
      }
      for (const elem of data.constantTextList) {
        this.createDomElement( elem, 'label', 'label');
      }

    });
  }

  createDomElement(elem, tagname, type = null) {
    const dropzone = document.getElementById('dropzone');

    let domElem;

    if ( tagname === 'button') {
      // BUTTON
      domElem = document.createElement(tagname);
      domElem.innerHTML = elem.name; // DIFFERENT
      domElem.setAttribute( 'class', 'button' );
    } else if (tagname === 'label') {
      domElem = document.createElement(tagname);
      domElem.innerHTML = elem.displayText; // DIFFERENT
      domElem.setAttribute( 'class', 'label' );
      domElem.style.color = '#fff';
    } else if ( tagname === 'input' && type === 'text') {
      // TEXTBOX
      domElem = document.createElement(tagname);
      domElem.setAttribute('value', elem.text);
      domElem.setAttribute('placeholder', elem.text);
      domElem.setAttribute('type', 'text');
      domElem.setAttribute( 'class', 'text' );
    } else if ( tagname === 'input' && type === 'checkbox') {
      // CHECKBOX
      domElem = document.createElement('div');
      const inputElem = document.createElement('input');
      inputElem.type = 'checkbox';
      inputElem.name = 'checkbox';
      inputElem.value = 'checkbox';

      domElem.style.color = '#fff';
      domElem.appendChild(inputElem);
      domElem.insertAdjacentText('beforeend', elem.name); // TO BE CHANGED
      domElem.setAttribute( 'class', 'checkbox' );

    } else if ( tagname === 'input' && type === 'radio') {
      // RADIO
      domElem = document.createElement('div');
      const inputElem = document.createElement('input');
      inputElem.type = 'radio';
      inputElem.name = 'radio';
      inputElem.value = 'radio';
      domElem.setAttribute( 'class', 'rBox' );

      domElem.style.color = '#fff';
      domElem.appendChild(inputElem);
      domElem.insertAdjacentText('beforeend', elem.name); // TO BE CHANGED
    }

    domElem.setAttribute('draggable', 'true');

    domElem.id = elem.elementId;

    domElem.style.position = 'absolute';
    domElem.style.top = Number(elem.coordY) + 'px';
    domElem.style.left = Number(elem.coordX) + 'px';

    domElem.style.width = elem.sizeX + 'px';
    domElem.style.height = elem.sizeY + 'px';
    // domElem.style.overflow = 'auto';
    // domElem.style.resize = 'both';

    // Guidepos calculations
    let top = Number(elem.coordY);
    let left = Number(elem.coordX);
    let right = Number(elem.coordX) + elem.sizeX;
    let bottom = Number(elem.coordY) + elem.sizeY;


    // Exact position to drop after auto-alignment
    const optimumPos = this.utilsService.getOptimumPos(this.dragData.step, top, right, bottom, left);
    top = optimumPos.top;
    right = optimumPos.right;
    bottom = optimumPos.bottom;
    left = optimumPos.left;

    // Push coordinates into allElems[]
    const newElem = {
      id: elem.elementId,
      top: top,
      left: left,
      bottom: bottom,
      right: right
    };
    this.dragData.allElems.push(newElem);

    // Storing coordinates which are used to calculate guidelines
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

    // Event listeners
    domElem.addEventListener('dragstart', (ev: any) => {
      this.elementService.dragStart(ev);
    });
    domElem.addEventListener('dragend', (ev: any) => {
      this.elementService.dragEnd(ev);
    });
    domElem.addEventListener('click', (ev: any) => {
      this.elementService.onClick(ev);
    }, true);
    // domElem.addEventListener('focus', (ev: any) => { this.elementService.onFocus(ev); } );
    // domElem.addEventListener('blur', (ev: any) => { this.elementService.onBlur(ev); } );
    domElem.addEventListener('mousedown', (ev: any) => { this.elementService.onMouseDown(ev); } );
    domElem.addEventListener('mouseup', (ev: any) => { this.elementService.onMouseUp(ev); } );
    domElem.addEventListener('mousemove', (ev: any) => { this.elementService.onMouseMove(ev); } );

    // allElemIDs
    this.dragData.allElemIDs.push(elem.elementId);


    dropzone.appendChild(domElem);
  }

  onSubmit() {
    console.log(this.form.value, 'form value');
  }
}
