import { Component, inject } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { ChatService } from '../../../services/chat.service';

@Component({
  selector: 'app-received-message',
  imports: [NgFor, NgIf, DatePipe],
  templateUrl: './received-message.component.html',
  styleUrl: './received-message.component.scss'
})
export class ReceivedMessageComponent {

  dataUser = inject(UserService);
  public chatService = inject(ChatService);
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
