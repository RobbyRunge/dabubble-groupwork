import { Component } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDrawer, MatSidenavModule} from '@angular/material/sidenav';

@Component({
  selector: 'app-thread-section',
  imports: [
    MatButtonModule,
    MatSidenavModule
  ],
  templateUrl: './thread-section.component.html',
  styleUrl: './thread-section.component.scss'
})
export class ThreadSectionComponent {

  isDrawerOpen = false;

  toggleDrawer(drawer: MatDrawer) {
    this.isDrawerOpen = !this.isDrawerOpen;
    drawer.toggle();
  }

}
