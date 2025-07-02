import { Component } from '@angular/core';
import { HeaderStartComponent } from "../header-start/header-start.component";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-imprint',
  imports: [
    HeaderStartComponent,
    RouterLink,
  ],
  templateUrl: './imprint.component.html',
  styleUrl: './imprint.component.scss'
})
export class ImprintComponent {

}
