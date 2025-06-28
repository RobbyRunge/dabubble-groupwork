import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterStartComponent } from "../shared/footer-start/footer-start.component";
import { CommonModule } from '@angular/common';
import { IntroService } from '../services/intro.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FooterStartComponent, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  showIntroLogo = false;

  private introService = inject(IntroService);

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
}
