import { Component, inject } from '@angular/core';
import { HeaderStartComponent } from '../../shared/header-start/header-start.component';
import { Router, RouterLink } from '@angular/router';
import { FooterStartComponent } from "../../shared/footer-start/footer-start.component";
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { query, where, getDocs } from '@angular/fire/firestore';
import emailjs from '@emailjs/browser';

@Component({
  selector: 'app-password-send-email',
  imports: [
    HeaderStartComponent,
    FooterStartComponent,
    FormsModule,
    MatDialogModule,
    RouterLink
  ],
  templateUrl: './password-send-email.component.html',
  styleUrl: './password-send-email.component.scss'
})
export class PasswordSendEmailComponent {
  public userService = inject(UserService);
  public user = { email: '' };
  private router = inject(Router);

  private emailjsConfig = {
    serviceId: 'service_mnrcyib', // Deine Service ID
    templateId: 'template_h7uqtyb', // Deine Template ID  
    publicKey: 'ckQdz_0ZFKfuDjXTf'  // Dein Public Key
  };

  get isFormValid(): boolean {
    return !!this.user.email;
  }

  async sendEmailForResetPassword() {
    console.log('🚀 Versuche Passwort-Reset für:', this.user.email);

    try {
      // 1. Benutzer in Firestore finden
      const userQuery = query(
        this.userService.getUsersCollection(),
        where('email', '==', this.user.email)
      );

      const result = await getDocs(userQuery);

      if (!result.empty) {
        const userDoc = result.docs[0];
        const userId = userDoc.id;
        const userData = userDoc.data();

        // 2. Reset-Token generieren
        const resetToken = this.generateResetToken();
        const resetExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Stunden

        // 3. Reset-Token in Firestore speichern
        await this.userService.updateUserDocument(userId, {
          resetToken: resetToken,
          resetTokenExpiry: resetExpiry
        });

        // 4. Reset-Link erstellen
        const resetLink = `http://localhost:4200/reset-password?token=${resetToken}&userId=${userId}`;

        // 5. E-Mail-Parameter für Template
        const templateParams = {
          to_name: userData['name'] || 'Benutzer',
          user_email: this.user.email,
          reset_link: resetLink,
          company_name: 'DABubble',
          logo: 'https://deine-domain.de/assets/logo.png' // noch aktualisieren beim veröffentlichen
        };

        await emailjs.send(
          this.emailjsConfig.serviceId,
          this.emailjsConfig.templateId,
          templateParams,
          this.emailjsConfig.publicKey
        );
        await this.showSuccessfullyCreateContactOverlay();
      } else {
        console.log('E-Mail-Adresse nicht gefunden');
        alert('Diese E-Mail-Adresse ist nicht in unserem System registriert.');
      }

    } catch (error: any) {
      console.error('Fehler beim Passwort-Reset:', error);

      if (error.text) {
        // EmailJS-spezifischer Fehler
        alert(`Fehler beim Senden der E-Mail: ${error.text}`);
      } else {
        alert('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
      }
    }
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