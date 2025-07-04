import { Component } from '@angular/core';
import { HeaderStartComponent } from '../../shared/header-start/header-start.component';
import { RouterLink } from '@angular/router';
import { FooterStartComponent } from "../../shared/footer-start/footer-start.component";

@Component({
  selector: 'app-password-send-email',
  imports: [
    HeaderStartComponent,
    RouterLink,
    FooterStartComponent
],
  templateUrl: './password-send-email.component.html',
  styleUrl: './password-send-email.component.scss'
})
export class PasswordSendEmailComponent {

}
