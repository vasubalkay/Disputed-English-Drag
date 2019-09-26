import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DisplayContainerComponent } from './containers/display-container/display-container.component';

const routes: Routes = [
  {
    path: '',
    component: DisplayContainerComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DisplayRoutingModule { }
