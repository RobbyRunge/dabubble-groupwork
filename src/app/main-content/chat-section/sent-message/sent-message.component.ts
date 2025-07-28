import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { ChatService } from '../../../services/chat.service';
import { UserService } from '../../../services/user.service';
import { ChannelService } from '../../../services/channel.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormField, MatLabel } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
  selector: 'app-sent-message',
  imports: [DatePipe, NgIf, MatMenuModule, MatFormField, MatInputModule, NgClass, PickerComponent, FormsModule],
  templateUrl: './sent-message.component.html',
  styleUrl: './sent-message.component.scss'
})
export class SentMessageComponent {

  public chatService = inject(ChatService);
  userService = inject(UserService);
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
  imgReactionInput: any = 'add reaction.png';
  selectedUser: any;
  editMessageActive: boolean = false;
  editMessageText: string = '';


  getUserData() {
    this.dataUser.isChecked$.subscribe(user => {
      this.selectedUser = user
    })
  }
  editMessage() {
    this.editMessageText = this.message.text;
    this.editMessageActive = true;
  }
  showAllEmojis() {
    this.showEmojis = true;
  }
  discardEditMessage() {
    this.editMessageActive = false;
  }

  addEmoji($event: any) {
    this.editMessageText += $event.emoji.native;
    this.showEmojis = false;
  }
  async updateMessage() {
    await this.chatService.updateUserMessage(this.message.id, this.editMessageText);
  }
}
