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
  @Input() index: number | undefined
  @Input() mode: string = '';
  public chatService = inject(ChatService);
  constructor() {
    this.getUserData();
  }
  imgSrcMore: any = 'img/more_vert.png';
  imgComment: any = 'img/comment.png';
  imgReaction: any = 'img/add_reaction.png';
  selectedUser: any;


  getUserData() {
    this.dataUser.isChecked$.subscribe(user => {
      this.selectedUser = user
    })
  }
}
