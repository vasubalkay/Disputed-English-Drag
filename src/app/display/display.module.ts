import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

// import {DisplayRoutingModule} from './display-routing.module';
import {ElementsPaneComponent} from './components/elements-pane/elements-pane.component';
import {CanvasComponent} from './components/canvas/canvas.component';
import {ButtonElementComponent} from './components/elements/button-element/button-element.component';
import {TextboxElementComponent} from './components/elements/textbox-element/textbox-element.component';
import {LabelElementComponent} from './components/elements/label-element/label-element.component';
import {PropertiesChangeDialogComponent} from './dialog/properties-change-dialog/properties-change-dialog.component';
import {DragLifecycleService} from './services/drag-lifecycle.service';
import {ElementEventsService} from './services/element-events.service';
import { MaterialModule } from '../material/material.module';
import {UtilsService} from './services/utils.service';
import { DisplayRoutingModule } from './display-routing.module';
import {DisplayContainerComponent} from './containers/display-container/display-container.component';
// import {SharedModule} from "../../shared/shared.module";
import {EditPaneComponent} from './components/edit-pane/edit-pane.component';
import {PostDropActionsService} from './services/post-drop-actions.service';
import {SaveCanvasService} from './services/save-canvas.service';
import { ComboBoxElementComponent } from './components/elements/combo-box-element/combo-box-element.component';
import { CheckBoxElementComponent } from './components/elements/check-box-element/check-box-element.component';
import { RadioBoxElementComponent } from './components/elements/radio-box-element/radio-box-element.component';
import { HorizontalLineElementComponent } from './components/elements/horizontal-line-element/horizontal-line-element.component';
import { VerticalLineElementComponent } from './components/elements/vertical-line-element/vertical-line-element.component';
import {DisplayService} from './services/display.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
//  { CheckboxGroupComponent } from './components/elements/checkbox-group/checkbox-group.component';


const components = [
  ElementsPaneComponent,
  CanvasComponent,
  ButtonElementComponent,
  TextboxElementComponent,
  LabelElementComponent,
  PropertiesChangeDialogComponent, EditPaneComponent, ComboBoxElementComponent];

const imports = [
  // SharedModule,
  CommonModule,
  ReactiveFormsModule,
  FormsModule,
  MaterialModule,
  DisplayRoutingModule
];

const providres = [DragLifecycleService,
  ElementEventsService,
  UtilsService, PostDropActionsService, SaveCanvasService, DisplayService
];

@NgModule({
  imports: [
    ...imports
  ],
  declarations: [
    ...components,
    DisplayContainerComponent,
    CheckBoxElementComponent,
    RadioBoxElementComponent,
    HorizontalLineElementComponent,
    VerticalLineElementComponent,
    // CheckboxGroupComponent,
  ],
  providers: [
    ...providres
  ],
  entryComponents:
    [
      // PropertiesChangeDialogComponent
    ]
})

export class DisplayModule {
}
