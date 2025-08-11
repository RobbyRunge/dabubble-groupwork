import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { ChannelService } from '../../services/channel.service';
import { MatDialog } from '@angular/material/dialog';
import { ChannelSectionComponent } from '../channel-section/channel-section.component';
import { UserCardComponent } from '../user-card/user-card.component';
import { ChatService } from '../../services/chat.service';
import { AddUserToChannelComponent } from './add-user-to-channel/add-user-to-channel.component';

@Component({
  selector: 'app-header-chat-section',
  imports: [
    NgIf,
    NgClass,
    AsyncPipe,
  ],
  templateUrl: './header-chat-section.component.html',
  styleUrl: './header-chat-section.component.scss'
})
export class HeaderChatSectionComponent implements OnInit {

  dataUser = inject(UserService);
  channelService = inject(ChannelService);
  chatService = inject(ChatService);
  dialog = inject(MatDialog);
  userDialog = inject(MatDialog);
  /* selectedUser: any; */
  onlineUser: string = 'Online.png';
  offlineUser: string = 'offline.png';

  ngOnInit(): void {
    this.getUserData();
  }

  getUserData() {
    this.channelService.isChecked$.subscribe(user => {
      this.chatService.selectedUser = user
    })
  }

  openDialog(button: HTMLElement) {
    const rect = button.getBoundingClientRect();
    const width = window.innerWidth < 1080 ? '800px' : '872px';
    const height = window.innerHeight < 700 ? '500px' : '612px';
    this.dialog.open(ChannelSectionComponent, {
      position: {
        top: `${rect.bottom + window.scrollY}px`,
        left: `${rect.left + window.scrollX}px`,
      },
      width,
      height,
      maxWidth: '872px',
      maxHeight: '612px',
      panelClass: 'channel-dialog-container'
    });
  }

  openUserDialog() {
    this.userDialog.open(UserCardComponent, {
      data: { user: this.chatService.selectedUser }
    })
  }

  addUserToChannel(button: HTMLElement) {
    const rect = button.getBoundingClientRect();
    const dialogWidth = 514;
    this.dialog.open(AddUserToChannelComponent, {
      autoFocus: false,
      position: {
        top: `${rect.bottom + window.scrollY}px`,
        left: `${rect.right + window.scrollX - dialogWidth}px`,
      },
      width: '514px',
      height: '294px',
      maxWidth: '514px',
      maxHeight: '294px',
      panelClass: 'add-user'
    });
  }
}