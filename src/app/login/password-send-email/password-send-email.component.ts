import { Component, inject } from '@angular/core';
import { HeaderStartComponent } from '../../shared/header-start/header-start.component';
import { Router } from '@angular/router';
import { FooterStartComponent } from "../../shared/footer-start/footer-start.component";
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-password-send-email',
  imports: [
    HeaderStartComponent,
    FooterStartComponent,
    FormsModule,
    MatDialogModule,
  ],
  templateUrl: './password-send-email.component.html',
  styleUrl: './password-send-email.component.scss'
})
export class PasswordSendEmailComponent {
  public userService = inject(UserService);
  public user = { email: '' };
  private router = inject(Router)

  get isFormValid(): boolean {
    return (
      !!this.user.email
    );
  }

  async showSuccessfullyCreateContactOverlay() {
    const backgroundOverlay = document.getElementById('background-overlay');
    if (backgroundOverlay) {
      backgroundOverlay.classList.add('active');
      setTimeout(() => {
        backgroundOverlay.classList.remove('active');
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 125);
      }, 2000);
    }
  }
}