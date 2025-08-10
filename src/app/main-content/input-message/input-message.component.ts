import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/select';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { Observable } from 'rxjs';
import { User } from '../../../models/user.class';
import { ChannelService } from '../../services/channel.service';
import { ChatService } from '../../services/chat.service';
import { Allchannels } from '../../../models/allchannels.class';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-input-message',
  imports: [
    NgIf,
    NgFor,
    MatLabel,
    MatFormField,
    PickerComponent,
    FormsModule,
    AsyncPipe,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './input-message.component.html',
  styleUrl: './input-message.component.scss'
})
export class InputMessageComponent implements OnInit {

  showUserList: boolean = false;
  showChanelList: boolean = false;
  showEmojis: boolean = false;
  channelService = inject(ChannelService);
  chatService = inject(ChatService);
  dataUser = inject(UserService)
  users$: Observable<User[]> | undefined;
  messageText: string = '';
  imgSrcReaction: any = 'add reaction.png';
  imgSrcMention: any = 'mention.png'
  imgSrcSend: any = 'send.png';
  selectedEmoji: any;
  @Input() mode: 'chat' | 'thread' = 'chat';


  ngOnInit(): void {
    this.users$ = this.dataUser.getAllUsers();
  }

  userMention() {
    this.messageText += '@';
    this.onInputChange();
  }



  onInputChange(): void {
    this.checkInputFieldForUserMention();
    this.checkInputFieldForChannelMention();
  }



  checkInputFieldForUserMention() {
    const cursorPosition = this.messageText.lastIndexOf('@');
    if (cursorPosition === -1) {
      this.showUserList = false;
      return;
    }

    const afterAt = this.messageText.substring(cursorPosition + 1);

    if (afterAt.length === 0 || /^[a-zA-ZäöüÄÖÜß]*$/.test(afterAt)) {
      this.showUserList = true;
    } else {
      this.showUserList = false;
    }
  }

  checkInputFieldForChannelMention() {
    const cursorPosition = this.messageText.lastIndexOf('#');
    if (cursorPosition === -1) {
      this.showChanelList = false;
      return;
    }

    const afterAt = this.messageText.substring(cursorPosition + 1);

    if (afterAt.length === 0 || /^[a-zA-ZäöüÄÖÜß]*$/.test(afterAt)) {
      this.showChanelList = true;
    } else {
      this.showChanelList = false;
    }
  }

  selecetedUserMention(user: User, index: number) {
    this.messageText += user.name;
    this.showUserList = false;
  }
  selecetedChannelMention(channel: Allchannels, index: number) {
    this.messageText += channel.channelname;
    this.showChanelList = false;
  }

  sendMessage() {
    if (!this.messageText.trim()) return;

    if (this.mode === 'thread') {
      this.chatService.sendThreadMessage(this.dataUser.chatId, this.chatService.parentMessageId, this.channelService.currentUserId, this.messageText);
    } else {
      this.chatService.sendChatMessage(this.messageText, this.channelService.currentUserId);
    }
    this.messageText = ''
  }

  addEmoji($event: any) {
    this.messageText += $event.emoji.native;
    this.showEmojis = false;
  }

  showAllEmojisMessage(index: number) {
    this.selectedEmoji = index;
  }

  showAllEmojis() {
    this.showEmojis = true;
  }
}
