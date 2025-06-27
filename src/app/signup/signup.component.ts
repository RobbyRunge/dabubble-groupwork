import { Component } from '@angular/core';
import { HeaderStartComponent } from "../shared/header-start/header-start.component";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup',
  imports: [HeaderStartComponent, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {

}
