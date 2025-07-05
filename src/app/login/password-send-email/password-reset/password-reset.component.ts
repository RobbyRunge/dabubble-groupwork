import { Component } from '@angular/core';
import { HeaderStartComponent } from '../../../shared/header-start/header-start.component';
import { RouterLink } from '@angular/router';
import { FooterStartComponent } from "../../../shared/footer-start/footer-start.component";

@Component({
  selector: 'app-password-reset',
  imports: [
    HeaderStartComponent,
    RouterLink,
    FooterStartComponent
],
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.scss'
})
export class PasswordResetComponent {

}
