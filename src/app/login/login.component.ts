import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FooterStartComponent } from "../shared/footer-start/footer-start.component";
import { CommonModule } from '@angular/common';
import { IntroService } from '../services/intro.service';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FooterStartComponent, CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  loginError = '';
  showIntroLogo = false;

  private introService = inject(IntroService);
  private userService = inject(UserService);
  private router = inject(Router);

  get isFormValid(): boolean {
    return (
      !!this.email &&
      !!this.password
    );
  }

  ngOnInit() {
    if (!this.introService.hasIntroBeenShown()) {
      this.showIntroLogo = true;
      this.introService.markIntroAsShown();
      setTimeout(() => {
        this.showIntroLogo = false;
      }, 6000);
    } else {
      this.showIntroLogo = false;
    }
  }

  async login() {
    try {
      const success = await this.userService.loginService(this.email, this.password);
      if (success) {
        this.email = '';
        this.password = '';
        this.loginError = '';
        this.router.navigate(['mainpage']);
      } else {
        this.loginError = 'Ungültige Email oder Passwort';
      }
    } catch (error) {
      console.error('Login-Fehler:', error);
    }
  }
}
