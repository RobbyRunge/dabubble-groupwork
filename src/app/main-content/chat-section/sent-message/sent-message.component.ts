import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, inject, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ChatService } from '../../../services/chat.service';
import { UserService } from '../../../services/user.service';
import { ChannelService } from '../../../services/channel.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormField, MatLabel } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sent-message',
  imports: [
    DatePipe,
    NgIf,
    MatMenuModule,
    MatFormField,
    MatInputModule,
    NgClass,
    PickerComponent,
    FormsModule,
    NgFor,
  ],
  templateUrl: './sent-message.component.html',
  styleUrl: './sent-message.component.scss'
})
export class SentMessageComponent implements OnInit {

  public chatService = inject(ChatService);
  userService = inject(UserService);
  channelService = inject(ChannelService);
  @Input() message: any;
  @Input() index: number | undefined
  @Input() mode: string = '';
  showEmojis: boolean = false;
  messageReacton: string = '';
  constructor() { this.getUserData(); }
  imgSrcMore: any = 'img/more_vert.png';
  imgComment: any = 'img/comment.png';
  imgReaction: any = 'img/add_reaction.png';
  imgReactionInput: any = 'add reaction.png';
  selectedUser: any;
  editMessageActive: boolean = false;
  editMessageText: string = '';
  showEmojisMessage: boolean = false;
  shiftContainer: boolean = false;
  hoveredReactionIndex: number | null = null;
  showAllMessageReactions: boolean = false;


  ngOnInit() {
    this.chatService.loadMostUsedEmojis();
  }

  getUserData() {
    this.channelService.isChecked$.subscribe(user => {
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
    const native = $event?.emoji?.native ?? $event?.native ?? '';
    if (!native) return;

    this.chatService.saveEmoji(native);
    this.editMessageText += native;
    this.showEmojis = false;
  }
  async updateMessage() {
    await this.chatService.updateUserMessage(this.message.id, this.editMessageText);
  }

  showAllEmojisMessage(index: number | any, event: MouseEvent) {
    event.stopPropagation();
    this.showEmojisMessage = true;
  }
  addEmojiMessage($event: any) {
    this.messageReacton += $event.emoji.native;
    this.showEmojisMessage = false;
    this.chatService.loadMostUsedEmojis();
    this.chatService.saveEmojisInDatabase($event.emoji.native, this.message.id);
    this.shiftContainer = true;
    setTimeout(() => {
      this.shiftContainer = false;
    }, 300);
  }

  addMostUsedEmojiMessage(emoji: any, index: number) {
    this.messageReacton += emoji;
    this.chatService.saveEmojisInDatabase(emoji, this.message.id)
  }

  showReactionUserName(index: number) {
    this.hoveredReactionIndex = index;
  }

  hideReactionUserName() {
    this.hoveredReactionIndex = null;
  }


  hideAllEmojis() {
    this.showEmojisMessage = false;
  }

  getLastThreadReplyTime(): Date | null {
    return this.chatService.getLastThreadReplyTime(this.message.id);
  }

  showAllReactions(){
    this.showAllMessageReactions = true;
  }
  hideAllReactions(){
    this.showAllMessageReactions = false; 
  }
}
