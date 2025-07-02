import { Component, OnInit, inject } from '@angular/core';
import { HeaderStartComponent } from "../../shared/header-start/header-start.component";
import { FooterStartComponent } from "../../shared/footer-start/footer-start.component";
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../../models/user.class';

@Component({
  selector: 'app-avatar',
  imports: [HeaderStartComponent, FooterStartComponent, RouterLink],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss'
})
export class AvatarComponent implements OnInit {
  private router = inject(Router);
  public userService = inject(UserService);
  
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
    const userData = this.userService.getUserFromLocalStorage();
    if (userData) {
      this.user = userData;
    }
  }

  selectAvatar(avatarSrc: string) {
    this.selectedAvatar = avatarSrc;
    this.user.avatar = avatarSrc;
  }

  async showSuccessfullyCreateContactOverlay() {
    const backgroundOverlay = document.getElementById('background-overlay');
    this.user.avatar = this.selectedAvatar;
    const saveSuccessful = await this.userService.completeUserRegistration(this.user);
    if (saveSuccessful && backgroundOverlay) {
      backgroundOverlay.classList.add('active');
      setTimeout(() => {
        backgroundOverlay.classList.remove('active');
        this.router.navigate(['/']);
      }, 2000);
    }
  }
}
