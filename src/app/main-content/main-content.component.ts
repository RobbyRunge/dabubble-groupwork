import { Component, inject } from '@angular/core';
import { ChatSectionComponent } from "./chat-section/chat-section.component";
import { ShowFilteredUserComponent } from "./header-chat-section/add-user-to-channel/show-filtered-user/show-filtered-user.component";
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-content',
  imports: [ChatSectionComponent, ShowFilteredUserComponent, CommonModule],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss'
})
export class MainContentComponent {

}