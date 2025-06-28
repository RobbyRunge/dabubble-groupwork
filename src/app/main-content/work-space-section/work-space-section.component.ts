import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-work-space-section',
  imports: [
    MatButtonModule,
    MatSidenavModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './work-space-section.component.html',
  styleUrl: './work-space-section.component.scss'
})
export class WorkSpaceSectionComponent {
  isDrawerOpen = false;

  toggleDrawer(drawer: MatDrawer) {
    this.isDrawerOpen = !this.isDrawerOpen;
    drawer.toggle();
  }
}
