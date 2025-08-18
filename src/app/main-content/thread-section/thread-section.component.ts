import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { ChatService } from '../../services/chat.service';
import { MatIcon } from '@angular/material/icon';
import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ChannelService } from '../../services/channel.service';
import { SentMessageComponent } from '../chat-section/sent-message/sent-message.component';
import { ReceivedMessageComponent } from '../chat-section/received-message/received-message.component';
import { UserService } from '../../services/user.service';
import { UserCardComponent } from '../user-card/user-card.component';
import { MatDialog } from '@angular/material/dialog';
import { ChannelSectionComponent } from '../channel-section/channel-section.component';
import { InputMessageComponent } from "../input-message/input-message.component";
import { HeaderChatSectionComponent } from '../header-chat-section/header-chat-section.component';

@Component({
  selector: 'app-thread-section',
  imports: [
    MatButtonModule,
    MatSidenavModule,
    NgIf,
    NgFor,
    SentMessageComponent,
    ReceivedMessageComponent,
    InputMessageComponent,
    HeaderChatSectionComponent,
    MatIcon
  ],
  templateUrl: './thread-section.component.html',
  styleUrl: './thread-section.component.scss'
})
export class ThreadSectionComponent implements AfterViewInit, OnInit {

  @ViewChild('drawer') drawer!: MatDrawer;
  dataUser = inject(UserService);
  chatService = inject(ChatService);
  channelService = inject(ChannelService);
  selectedUser: any;
  readonly userDialog = inject(MatDialog);
  dialog = inject(MatDialog);
  parentMessageId: string | undefined;

  constructor(private chatServices: ChatService) { }

  ngAfterViewInit() {
    this.chatServices.setDrawer(this.drawer);
  }

  ngOnInit(): void {
    this.getUserData();
  }

  getUserData() {
    this.channelService.isChecked$.subscribe(user => {
      this.selectedUser = user
    })
  }

  closeThread() {
    this.chatServices.close()
  }

  openUserDialog() {
    this.userDialog.open(UserCardComponent, {
      data: { user: this.selectedUser }
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
}
