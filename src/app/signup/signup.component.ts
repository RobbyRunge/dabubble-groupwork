import { Component, inject } from '@angular/core';
import { HeaderStartComponent } from "../shared/header-start/header-start.component";
import { Router, RouterLink } from '@angular/router';
import { FooterStartComponent } from "../shared/footer-start/footer-start.component";
import { User } from '../../models/user.class';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-signup',
  imports: [HeaderStartComponent, RouterLink, FooterStartComponent, FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  isPolicyAccepted = false;
  isHovering = false;
  user = new User();
  public userService = inject(UserService);
  private router = inject(Router);

  get isFormValid(): boolean {
    return (
      this.isPolicyAccepted &&
      !!this.user.name &&
      !!this.user.email &&
      !!this.user.password
    );
  }

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

  navigateToAvatar() {
    this.userService.saveUserToLocalStorage(this.user);
    this.router.navigate(['/avatar']);
  }
}
