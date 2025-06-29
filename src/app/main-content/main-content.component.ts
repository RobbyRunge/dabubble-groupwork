import { Component } from '@angular/core';
import { LoginComponent } from "../login/login.component";
import { ChatSectionComponent } from "./chat-section/chat-section.component";

@Component({
  selector: 'app-main-content',
  imports: [ChatSectionComponent],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss'
})
export class MainContentComponent {

}
