import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { ChannelService } from '../../services/channel.service';
import { MatDialog } from '@angular/material/dialog';
import { ChannelSectionComponent } from '../channel-section/channel-section.component';
import { UserCardComponent } from '../user-card/user-card.component';
import { ChatService } from '../../services/chat.service';

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
    const dialog = this.dialog.open(ChannelSectionComponent, {
      position: {
        top: `${rect.bottom + window.scrollY}px`,
        left: `${rect.left + window.scrollX}px`,
      },
      width: '872px',
      height: '612px',
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
}
