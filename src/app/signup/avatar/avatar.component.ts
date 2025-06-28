import { Component } from '@angular/core';
import { HeaderStartComponent } from "../../shared/header-start/header-start.component";
import { FooterStartComponent } from "../../shared/footer-start/footer-start.component";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-avatar',
  imports: [HeaderStartComponent, FooterStartComponent, RouterLink],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss'
})
export class AvatarComponent {
  items = [
    '/avatar/woman1.png',
    '/avatar/men1.png',
    '/avatar/men2.png',
    '/avatar/men3.png',
    '/avatar/woman2.png',
    '/avatar/men4.png',
  ];

}
