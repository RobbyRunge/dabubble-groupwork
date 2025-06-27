import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterStartComponent } from "../shared/footer-start/footer-start.component";

@Component({
  selector: 'app-login',
  imports: [RouterLink, FooterStartComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

}
