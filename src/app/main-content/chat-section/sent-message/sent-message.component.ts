import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ChatService } from '../../../services/chat.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-sent-message',
  imports: [NgFor, DatePipe, NgIf],
  templateUrl: './sent-message.component.html',
  styleUrl: './sent-message.component.scss'
})
export class SentMessageComponent {

  public chatService = inject(ChatService);
  dataUser = inject(UserService);
  constructor() {
    this.getUserData();
  }

  selectedUser: any;


  getUserData() {
    this.dataUser.isChecked$.subscribe(user => {
      this.selectedUser = user
    })
  }

}
