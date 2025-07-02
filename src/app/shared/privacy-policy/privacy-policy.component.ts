import { Component } from '@angular/core';
import { HeaderStartComponent } from "../header-start/header-start.component";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  imports: [
    HeaderStartComponent,
    RouterLink,
  ],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent {

}
