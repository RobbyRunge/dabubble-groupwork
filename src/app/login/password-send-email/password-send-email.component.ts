import { Component, inject } from '@angular/core';
import { HeaderStartComponent } from '../../shared/header-start/header-start.component';
import { Router, RouterLink } from '@angular/router';
import { FooterStartComponent } from "../../shared/footer-start/footer-start.component";
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { query, where, getDocs } from '@angular/fire/firestore';
import emailjs from '@emailjs/browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-password-send-email',
  imports: [
    HeaderStartComponent,
    FooterStartComponent,
    FormsModule,
    MatDialogModule,
    RouterLink,
    FormsModule,
    CommonModule
  ],
  templateUrl: './password-send-email.component.html',
  styleUrl: './password-send-email.component.scss'
})
export class PasswordSendEmailComponent {
  emailTouched = false;

  public userService = inject(UserService);
  public user = { email: '' };
  private router = inject(Router);

  private emailjsConfig = {
    serviceId: 'service_mnrcyib',
    templateId: 'template_h7uqtyb',
    publicKey: 'ckQdz_0ZFKfuDjXTf'
  };

  get isFormValid() {
    return (
      !!this.user.email && this.isValidEmail(this.user.email)
    );
  }

  private isValidEmail(email: string): boolean {
    const emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailPattern.test(email);
  }

  get showEmailError(): boolean {
    return this.emailTouched && !!this.user.email && !this.isValidEmail(this.user.email);
  }

  markEmailTouched() {
    this.emailTouched = true;
  }

  async sendEmailForResetPassword() {
    this.showSuccessfullyCreateContactOverlay();
    try {
      const userQuery = query(
        this.userService.getUsersCollection(),
        where('email', '==', this.user.email)
      );

      const result = await getDocs(userQuery);

      if (!result.empty) {
        const userDoc = result.docs[0];
        const userId = userDoc.id;
        const userData = userDoc.data();

        const resetToken = this.generateResetToken();
        const resetExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await this.userService.updateUserDocument(userId, {
          resetToken,
          resetTokenExpiry: resetExpiry
        });

        const resetLink = `http://localhost:4200/password-reset?token=${resetToken}&userId=${userId}`;

        const templateParams = {
          to_name: userData['name'] || 'Benutzer',
          user_email: this.user.email,
          reset_link: resetLink,
          company_name: 'DABubble',
          logo: 'https://deine-domain.de/assets/logo.png'
        };

        await emailjs.send(
          this.emailjsConfig.serviceId,
          this.emailjsConfig.templateId,
          templateParams,
          this.emailjsConfig.publicKey
        );
      } else {
        this.showError('Diese E-Mail-Adresse ist nicht in unserem System registriert.');
      }

    } catch (error: any) {
      console.error('Fehler beim Passwort-Reset:', error);
      const message = error.text
        ? `Fehler beim Senden der E-Mail: ${error.text}`
        : 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
      alert(message);
    }
  }

  private showError(message: string) {
    console.log('❌', message);
    alert(message);
  }

  // Reset-Token generieren
  generateResetToken(): string {
    return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15) +
      Date.now().toString(36);
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