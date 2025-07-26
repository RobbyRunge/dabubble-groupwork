import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { ChatService } from '../../../services/chat.service';
import { UserService } from '../../../services/user.service';
import { ChannelService } from '../../../services/channel.service';

@Component({
  selector: 'app-sent-message',
  imports: [DatePipe, NgIf],
  templateUrl: './sent-message.component.html',
  styleUrl: './sent-message.component.scss'
})
export class SentMessageComponent {

  public chatService = inject(ChatService);
  dataUser = inject(ChannelService);
  @Input() message: any;
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
