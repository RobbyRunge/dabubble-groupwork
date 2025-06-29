import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  showIntroLogo = false;

  private introService = inject(IntroService);
  private userService = inject(UserService);

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
      const success = await this.userService.login(this.email, this.password);
      if (success) {
        alert('Login erfolgreich!');
        // Weiterleitung etc.
        this.email = '';
        this.password = '';
      } else {
        alert('E-Mail oder Passwort falsch!');
      }
    } catch (error) {
      console.error('Login-Fehler:', error);
    }
  }
}
