import {Component, Inject, Input, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {ElementEventsService} from '../../services/element-events.service';
import {FormBuilder} from '@angular/forms';
import {PostDropActionsService} from '../../services/post-drop-actions.service';

@Component({
  selector: 'app-properties-change-dialog',
  templateUrl: './properties-change-dialog.component.html',
  styleUrls: ['./properties-change-dialog.component.scss']
})
export class PropertiesChangeDialogComponent implements OnInit {

  _selectedWidget: any;
  form;
  resultData: any;
  widgetId: any;
  WidgetType: any;
  widgetSelected: boolean;
  widgetSelecetionMessage: string;

  dataTypes = [
    'number',
    'text'
  ];
  data = {
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

  @Input()
  set selectedWidget(value) {
    this._selectedWidget = value;
    if (value) {
      /*this.widgetId = value.id;
      this.form.patchValue({placeholder: value.textContent});
      console.log(this._selectedWidget.id, ' selected widget');*/
    }
  }

  postDropData = {
    inFocus: {},
    multiple: false
  };

  constructor(
    private elementService: ElementEventsService,
    private fb: FormBuilder,
    private postDropActionsService: PostDropActionsService) {
    this.form = fb.group({
      placeholder: [],
      width: [],
      height: [],
      maxLength: [],
      minLength: [],
      dataType: [],
      value: [],
      fillChar: [],
      justification: [],
      noOfClone: [],
      groupName: []
    });

  }

  ngOnInit() {
    this.elementService.dblData$.subscribe(data => {
      this.resultData = data;
    });

    this.postDropActionsService.postDropData.subscribe(data => {
      this.postDropData = data;

      const numOfSelectedWidget = Object.keys(data.inFocus).length;

      if (numOfSelectedWidget === 1) {
        this.addFormData();
      } else {
        this.form.reset();
        this.widgetId = '';
        this.widgetSelected = false;
        if (numOfSelectedWidget >= 1) {
          this.widgetSelecetionMessage = 'More than one widget is selected';
          return;
        }
        this.widgetSelecetionMessage = 'Please select select a widget to edit.';
      }
    });

  }

  addFormData() {
    const seldWidget = this.postDropData.inFocus;
    const keys = Object.keys(seldWidget);
    this.widgetId = keys[0];
    const newNode = <HTMLElement>document.getElementById(this.widgetId);
    this.showHideWidgetProperties(newNode);
  }

  showHideWidgetProperties(node) {
    const classList = node.classList.value;
    if (classList.includes('button')) {
      this.WidgetType = 'button';
      this.widgetSelected = true;
      this.form.patchValue({placeholder: node.innerText});
    } else if (classList.includes('text')) {
      this.WidgetType = 'input';
      this.widgetSelected = true;
      this.form.patchValue({placeholder: node.innerText});
    } else if (classList.includes('checkbox')) {
      this.WidgetType = 'checkbox';
      this.widgetSelected = true;
      this.form.patchValue({placeholder: node.innerText});
    } else if (classList.includes('rBox')) {
      this.WidgetType = 'radio';
      this.widgetSelected = true;
      console.log(node.childNodes, 'node');
      this.form.patchValue({placeholder: node.innerText});
    } else if (classList.includes('label')) {
      this.WidgetType = 'label';
      this.widgetSelected = true;
      this.form.patchValue({placeholder: node.innerText});
    }
  }

  onSubmit(event) {
    event.stopPropagation();
    const formData = this.form.value;
    if (this.WidgetType === 'button') {
      this.addProportiesForButton(formData);
    } else if (this.WidgetType === 'input') {
      this.addProportiesForInput(formData);
    } else if (this.WidgetType === 'checkbox') {
      this.addProportiesForCheckBox(formData);
    } else if (this.WidgetType === 'radio') {
      this.addProportiesForRadio(formData);
    } else if (this.WidgetType === 'label') {
      this.addProportiesForLabel(formData);
    }
  }

  addProportiesForButton(formData) {
    const newNode = <HTMLElement>document.getElementById(this.widgetId);
    newNode.innerText = formData.placeholder;
    newNode.style.width = formData.width + 'px';
    newNode.style.height = formData.height + 'px';
  }

  addProportiesForInput(formData) {
    const newNode = <HTMLElement>document.getElementById(this.widgetId);
    newNode.style.width = formData.width + 'px';
    newNode.style.height = formData.height + 'px';
    newNode.setAttribute('maxlength', formData.maxLength);
    newNode.setAttribute('minLength', formData.minLength);
    newNode.setAttribute('type', formData.dataType);
    newNode.setAttribute('value', formData.value);
    newNode.setAttribute('align', formData.justification);
  }

  addProportiesForRadio(formData) {
    const newNode = <HTMLElement>document.getElementById(this.widgetId);
    const cloneNode = newNode.lastElementChild.cloneNode(true);
    // const tempStr = newNode.innerHTML.substr(0, newNode.innerHTML.indexOf('>'));
    let tempStr = null;
    if (formData.groupName && formData.groupName !== '') {
      tempStr = newNode.innerHTML.substr(0, newNode.innerHTML.indexOf('>'));
      const groupName = ' name="' + formData.groupName + '">';
      tempStr = tempStr + groupName;
    } else {
      tempStr = newNode.innerHTML.substr(0, newNode.innerHTML.indexOf('>') + 1);
    }
    console.log(tempStr);
    const innerHtml = tempStr + formData.placeholder;
    console.log(innerHtml);
    newNode.innerHTML = innerHtml;
    // newNode.appendChild(cloneNode);
  }

  addProportiesForLabel(formData) {
    const newNode = <HTMLElement>document.getElementById(this.widgetId);
    newNode.innerText = formData.placeholder;
    newNode.style.width = formData.width + 'px';
    newNode.style.height = formData.height + 'px';
  }

  addProportiesForCheckBox(formData) {
    const newNode = <HTMLElement>document.getElementById(this.widgetId);
    const tempStr = newNode.innerHTML.substr(0, newNode.innerHTML.indexOf('>') + 1);
    const innerHtml = tempStr + formData.placeholder;
    newNode.innerHTML = innerHtml;
    const checkBoxNode = <HTMLElement>newNode.childNodes[1];
    // checkBoxNode.style.width = formData.width + 'px';
    // checkBoxNode.style.height = formData.height + 'px';
    // checkBoxNode.size = formData.width;

    // newNode.innerText = formData.placeholder;
    // const cNode = <HTMLElement>newNode.childNodes[2];
    // cNode.innerText = formData.placeholder;

   /* newNode.childNodes[0];
    newNode.childNodes[1];
    newNode.childNode[2];*/
    /*newNode.childNodes[0];
    newNode.childNodes[1];
    newNode.childNode[2];
    newNode.style.width = formData.width + 'px';
    newNode.style.height = formData.height + 'px';
    newNode.setAttribute('maxlength', formData.maxLength);
    newNode.setAttribute('minLength', formData.minLength);
    newNode.setAttribute('type', formData.dataType);
    newNode.setAttribute('value', formData.value);
    newNode.setAttribute('align', formData.justification);*/
  }


  onClear() {
    this.form.reset();
  }

  /**
   * @desc called when input for number of columns is changed to add table Heading property
   */
  /*  onColumnChange(): void {
        this.data.tableHeading = Array.from({length: this.data.noOfColumns}, (v, k) => 'column' + (k + 1));
    }

    /!**
     * @desc called when input for number of rows is changed to rows
     *!/
    onRowChange(): void {
        this.data.rows = Array(this.data.noOfRows).fill(null);
    }*/

  /**
   * @desc Close of Modal
   */
  /* closeDialog() {
       this.dialogRef.close(this.data);
   }*/


}
