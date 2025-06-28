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

}
