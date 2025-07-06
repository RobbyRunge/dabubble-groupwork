import { Component, inject } from '@angular/core';
import { HeaderStartComponent } from '../../shared/header-start/header-start.component';
import { RouterLink } from '@angular/router';
import { FooterStartComponent } from "../../shared/footer-start/footer-start.component";
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-send-email',
  imports: [
    HeaderStartComponent,
    RouterLink,
    FooterStartComponent,
    FormsModule
  ],
  templateUrl: './password-send-email.component.html',
  styleUrl: './password-send-email.component.scss'
})
export class PasswordSendEmailComponent {
  public userService = inject(UserService);
  public user = { email: '' };

  get isFormValid(): boolean {
    return (
      !!this.user.email
    );
  }
}