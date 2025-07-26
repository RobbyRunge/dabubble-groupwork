import { Component, inject, Input } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { ChatService } from '../../../services/chat.service';
import { ChannelService } from '../../../services/channel.service';

@Component({
  selector: 'app-received-message',
  imports: [NgIf, DatePipe],
  templateUrl: './received-message.component.html',
  styleUrl: './received-message.component.scss'
})
export class ReceivedMessageComponent {

  dataUser = inject(ChannelService);
  @Input() message: any;
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
