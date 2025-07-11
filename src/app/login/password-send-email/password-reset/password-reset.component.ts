import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { FormsModule } from '@angular/forms';
import { HeaderStartComponent } from '../../../shared/header-start/header-start.component';
import { FooterStartComponent } from '../../../shared/footer-start/footer-start.component';
import { getDoc, doc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-password-reset',
  imports: [
    FormsModule,
    HeaderStartComponent,
    RouterLink,
    FooterStartComponent
  ],
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.scss'
})
export class PasswordResetComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);

  token: string = '';
  userId: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  tokenValid: boolean = false;
  isLoading: boolean = false;

  async ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    this.userId = this.route.snapshot.queryParamMap.get('userId') || '';

    if (this.token && this.userId) {
      await this.validateToken();
    } else {
      this.showError('Ungültiger Reset-Link.');
      this.router.navigate(['/']);
    }
  }

  async validateToken() {
    try {
      const userDoc = await getDoc(doc(this.userService.getUsersCollection(), this.userId));
      
      if (!userDoc.exists()) {
        this.showError('Benutzer nicht gefunden.');
        return;
      }

      const { resetToken, resetTokenExpiry } = userDoc.data();
      const isValid = resetToken === this.token && 
                     resetTokenExpiry && 
                     new Date() < resetTokenExpiry.toDate();

      if (isValid) {
        this.tokenValid = true;
        console.log('✅ Token ist gültig');
      } else {
      }
    } catch (error) {
      console.error('Fehler bei Token-Validierung:', error);
      this.showError('Fehler bei der Validierung des Reset-Links.');
    }
  }

  isFormValid(): boolean {
    return this.newPassword.length >= 6 && 
           this.newPassword === this.confirmPassword &&
           this.tokenValid;
  }

  async resetPassword() {
    if (!this.validateForm()) return;

    this.isLoading = true;

    try {
      await updateDoc(doc(this.userService.getUsersCollection(), this.userId), {
        password: this.newPassword,
        resetToken: null,
        resetTokenExpiry: null
      });

      alert('Passwort erfolgreich geändert! Sie können sich jetzt einloggen.');
      this.router.navigate(['/']);
      
    } catch (error) {
      console.error('Fehler beim Passwort-Reset:', error);
      alert('Fehler beim Zurücksetzen des Passworts. Bitte versuchen Sie es erneut.');
    } finally {
      this.isLoading = false;
    }
  }

  private validateForm(): boolean {
    if (this.newPassword.length < 6) {
      alert('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return false;
    }
    if (this.newPassword !== this.confirmPassword) {
      alert('Die Passwörter stimmen nicht überein.');
      return false;
    }
    return true;
  }

  private showError(message: string) {
    this.tokenValid = false;
    alert(message);
  }
}