import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { ChatService } from '../../../services/chat.service';
import { UserService } from '../../../services/user.service';
import { ChannelService } from '../../../services/channel.service';
import {MatMenuModule} from '@angular/material/menu';
import { MatFormField, MatLabel } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-sent-message',
  imports: [DatePipe, NgIf, MatMenuModule, MatFormField, MatInputModule],
  templateUrl: './sent-message.component.html',
  styleUrl: './sent-message.component.scss'
})
export class SentMessageComponent {

  public chatService = inject(ChatService);
  dataUser = inject(ChannelService);
  @Input() message: any;
  @Input() index: number | undefined
  showEmojis: boolean = false;
  constructor() {
    this.getUserData();
  }
  imgSrcMore: any = 'img/more_vert.png';
  imgComment: any = 'img/comment.png';
  imgReaction: any = 'img/add_reaction.png';
  selectedUser: any;
  editMessageActive: boolean = false;


  getUserData() {
    this.dataUser.isChecked$.subscribe(user => {
      this.selectedUser = user
    })
  }
  editMessage(){
    this.editMessageActive = true;
  }
    showAllEmojis() {
    this.showEmojis = true;
  }

}
