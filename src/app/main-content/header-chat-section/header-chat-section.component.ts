import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { UserService } from '../../services/user.service';
import { ChannelService } from '../../services/channel.service';
import { MatDialog } from '@angular/material/dialog';
import { ChannelSectionComponent } from '../channel-section/channel-section.component';
import { UserCardComponent } from '../user-card/user-card.component';
import { ChatService } from '../../services/chat.service';
import { AddUserToChannelComponent } from '../channel-section/add-user-to-channel/add-user-to-channel.component';
import { UsersInChannelComponent } from '../channel-section/users-in-channel/users-in-channel.component';

@Component({
  selector: 'app-header-chat-section',
  imports: [NgIf, NgClass, AsyncPipe],
  templateUrl: './header-chat-section.component.html',
  styleUrl: './header-chat-section.component.scss',
})
export class HeaderChatSectionComponent implements OnInit, AfterViewInit {
  dataUser = inject(UserService);
  channelService = inject(ChannelService);
  chatService = inject(ChatService);
  dialog = inject(MatDialog);
  userDialog = inject(MatDialog);
  /* selectedUser: any; */
  onlineUser: string = 'status/online.png';
  offlineUser: string = 'status/offline.png';

  @ViewChild('referenceButton') referenceButton!: ElementRef<HTMLButtonElement>;

  ngOnInit(): void {
    this.getUserData();
  }

  ngAfterViewInit() {
    const rect = this.referenceButton.nativeElement.getBoundingClientRect();
    this.channelService.setButtonRect(rect);
  }

  getUserData() {
    this.channelService.isChecked$.subscribe((user) => {
      this.chatService.selectedUser = user;
    });
  }

  openDialog(button: HTMLElement) {
    (document.activeElement as HTMLElement)?.blur();
    const rect = button.getBoundingClientRect();
    const width = window.innerWidth < 1080 ? '800px' : '872px';
    const height = window.innerHeight < 700 ? '500px' : '612px';
    const dialogRef = this.dialog.open(ChannelSectionComponent, {
      position: {
        top: `${rect.bottom + window.scrollY}px`,
        left: `${rect.left + window.scrollX}px`,
      },
      width,
      height,
      maxWidth: '872px',
      maxHeight: '612px',
      panelClass: 'channel-dialog-container',
    });
  }

  openUserDialog() {
    this.userDialog.open(UserCardComponent, {
      data: { user: this.chatService.selectedUser },
    });
  }

  addUserToChannel() {
    (document.activeElement as HTMLElement)?.blur();
    this.channelService.buttonRect$.subscribe((rect) => {
      if (!rect) return;
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
        panelClass: 'add-user',
      });
    });
  }

  showUsersInChannel(div: HTMLElement) {
    (document.activeElement as HTMLElement)?.blur();
    const rect = div.getBoundingClientRect();
    const dialogWidth = 415;
    this.dialog.open(UsersInChannelComponent, {
      autoFocus: false,
      position: {
        top: `${rect.bottom + window.scrollY}px`,
        left: `${rect.right + window.scrollX - dialogWidth}px`,
      },
      width: '415px',
      height: '411px',
      maxWidth: '415px',
      maxHeight: '415px',
      panelClass: 'user-in-channel',
    });
  }
}
