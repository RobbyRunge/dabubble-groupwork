import { Component, inject } from '@angular/core';
import { ChatSectionComponent } from "./chat-section/chat-section.component";
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-main-content',
  imports: [ChatSectionComponent, CommonModule, HeaderComponent],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss'
})
export class MainContentComponent {

}