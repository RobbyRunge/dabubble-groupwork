import { Component, inject } from '@angular/core';
import { ChatSectionComponent } from "./chat-section/chat-section.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-content',
  imports: [ChatSectionComponent, CommonModule],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss'
})
export class MainContentComponent {

}