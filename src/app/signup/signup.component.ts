import { Component } from '@angular/core';
import { HeaderStartComponent } from "../shared/header-start/header-start.component";
import { RouterLink } from '@angular/router';
import { FooterStartComponent } from "../shared/footer-start/footer-start.component";

@Component({
  selector: 'app-signup',
  imports: [HeaderStartComponent, RouterLink, FooterStartComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  isPolicyAccepted = false;
  isHovering = false;

  togglePolicy() {
    this.isPolicyAccepted = !this.isPolicyAccepted;
  }

  getCheckboxImage(): string {
    if (this.isPolicyAccepted) {
      return this.isHovering ? 'signup/box-checked-hover.png' : 'signup/box-checked.png';
    } else {
      return this.isHovering ? 'signup/box-hover.png' : 'signup/box.png';
    }
  }
}
