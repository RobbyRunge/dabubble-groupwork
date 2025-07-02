import { Component } from '@angular/core';
import { HeaderComponent } from "../../main-content/header/header.component";
import { HeaderStartComponent } from "../header-start/header-start.component";
import { FooterStartComponent } from "../footer-start/footer-start.component";

@Component({
  selector: 'app-imprint',
  imports: [HeaderStartComponent],
  templateUrl: './imprint.component.html',
  styleUrl: './imprint.component.scss'
})
export class ImprintComponent {

}
