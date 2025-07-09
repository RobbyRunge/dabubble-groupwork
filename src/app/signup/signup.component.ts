import { Component, inject } from '@angular/core';
import { HeaderStartComponent } from "../shared/header-start/header-start.component";
import { Router, RouterLink } from '@angular/router';
import { FooterStartComponent } from "../shared/footer-start/footer-start.component";
import { User } from '../../models/user.class';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-signup',
  imports: [
    HeaderStartComponent, 
    RouterLink, 
    FooterStartComponent, 
    FormsModule,
    NgClass
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  isPolicyAccepted = false;
  isHovering = false;
  user = new User();
  emailTouched = false;
  public userService = inject(UserService);
  private router = inject(Router);

  private isValidEmail(email: string): boolean {
    const emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailPattern.test(email);
  }

  get showEmailError(): boolean {
    return this.emailTouched && !!this.user.email && !this.isValidEmail(this.user.email);
  }

  get isFormValid(): boolean {
    return (
      this.isPolicyAccepted &&
      !!this.user.name &&
      !!this.user.email &&
      this.isValidEmail(this.user.email) &&
      !!this.user.password
    );
  }

  markEmailTouched() {
    this.emailTouched = true;
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
