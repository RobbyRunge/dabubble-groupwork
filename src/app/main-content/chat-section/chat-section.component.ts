import { Component, inject, OnInit } from '@angular/core';
import { WorkSpaceSectionComponent } from "../work-space-section/work-space-section.component";
import { ThreadSectionComponent } from "../thread-section/thread-section.component";
import { HeaderComponent } from "../header/header.component";
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-chat-section',
  imports: [
    WorkSpaceSectionComponent,
    ThreadSectionComponent,
    HeaderComponent,
    FormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './chat-section.component.html',
  styleUrl: './chat-section.component.scss'
})

export class ChatSectionComponent implements OnInit {

  dataUser = inject(UserService);

  private unsubscribeUserData!: () => void;

   ngOnInit(): void {
    this.unsubscribeUserData = this.dataUser.showUserData();
  }

  ngOnDestroy(): void {
    if (this.unsubscribeUserData) {
      this.unsubscribeUserData();
    }
  }
  
}