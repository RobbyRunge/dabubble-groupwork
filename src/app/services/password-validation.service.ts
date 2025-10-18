import { Injectable } from '@angular/core';

export function isValidPassword(password: string) {
  if (!password || password.length < 8) {
    return false;
  }
  return true;
}

@Injectable({
  providedIn: 'root'
})
export class PasswordValidationService {

  isValidPassword(password: string): boolean {
    return isValidPassword(password);
  }

  showPasswordError(password: string, passwordTouched: boolean): boolean {
    return passwordTouched && !!password && !this.isValidPassword(password);
  }

  getPasswordErrorMessage(password: string): string {
    if (!password) return '';
    if (password.length < 8) {
      return 'Das Passwort muss mindestens 8 Zeichen lang sein.';
    }
    return '';
  }
}