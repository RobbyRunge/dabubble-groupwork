import { Component, OnInit, OnDestroy, inject, HostListener } from '@angular/core';
import { HeaderStartComponent } from "../../shared/header-start/header-start.component";
import { FooterStartComponent } from "../../shared/footer-start/footer-start.component";
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../../models/user.class';
import { MatDialogContent } from '@angular/material/dialog';

@Component({
  selector: 'app-avatar',
  imports: [
    HeaderStartComponent,
    FooterStartComponent,
    MatDialogContent
  ],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss'
})
export class AvatarComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  public userService = inject(UserService);
  private registrationCompleted = false;

  selectedAvatar = '/avatar/empty-avatar.png';
  user: User = new User();

  items = [
    '/avatar/woman1.png',
    '/avatar/men1.png',
    '/avatar/men2.png',
    '/avatar/men3.png',
    '/avatar/woman2.png',
    '/avatar/men4.png',
  ];

  ngOnInit() {
    this.userService.pendingRegistrationId$.subscribe;
  }

  getUserName(): string {
    return this.userService.pendingUser?.name || 'Unbekannter Benutzer';
  }

  selectAvatar(avatarSrc: string) {
    this.selectedAvatar = avatarSrc;
    const filename = avatarSrc.replace('/avatar/', '');
    this.user.avatar = filename;
  }

  async showSuccessfullyCreateContactOverlay() {
    const backgroundOverlay = document.getElementById('background-overlay');

    try {
      const avatarFilename = this.selectedAvatar.replace('/avatar/', '');
      const success = await this.userService.completeUserRegistration(avatarFilename);

      if (success) {
        this.registrationCompleted = true;

        if (backgroundOverlay) {
          backgroundOverlay.classList.add('active');
          setTimeout(() => {
            backgroundOverlay.classList.remove('active');
            setTimeout(() => {
              this.router.navigate(['/']);
              this.userService.pendingUser = null;
            }, 125);
          }, 2000);
        }
      } else {
        console.error('Registrierung konnte nicht abgeschlossen werden');
      }
    } catch (error) {
      console.error('Fehler bei der Registrierung:', error);
    }
  }

  navigateBack() {
    this.userService.cleanupIncompleteRegistration();
    this.router.navigate(['/signup']);
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadHandler(event: any) {
    if (!this.registrationCompleted) {
      this.userService.cleanupIncompleteRegistration();
    }
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    if (!this.registrationCompleted) {
      this.userService.cleanupIncompleteRegistration();
    }
  }

  ngOnDestroy() {
    if (!this.registrationCompleted) {
      this.userService.cleanupIncompleteRegistration();
    }
  }
}
