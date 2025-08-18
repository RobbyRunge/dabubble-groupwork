import { Component, ElementRef, inject, Injector, OnInit, runInInjectionContext, SimpleChanges, ViewChild } from '@angular/core';
import { WorkSpaceSectionComponent } from "../work-space-section/work-space-section.component";
import { ThreadSectionComponent } from "../thread-section/thread-section.component";
import { HeaderComponent } from "../header/header.component";
import { UserService } from '../../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { docData, onSnapshot } from '@angular/fire/firestore';
import { User } from '../../../models/user.class';
import { Observable, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { UserCardComponent } from '../user-card/user-card.component';
import { ReceivedMessageComponent } from './received-message/received-message.component';
import { SentMessageComponent } from "./sent-message/sent-message.component";
import { ChatService } from '../../services/chat.service';
import { ChannelService } from '../../services/channel.service';
import { InputMessageComponent } from '../input-message/input-message.component';
import { HeaderChatSectionComponent } from "../header-chat-section/header-chat-section.component";

@Component({
  selector: 'app-chat-section',
  imports: [
    WorkSpaceSectionComponent,
    ThreadSectionComponent,
    HeaderComponent,
    NgIf,
    NgFor,
    AsyncPipe,
    NgClass,
    ReceivedMessageComponent,
    SentMessageComponent,
    InputMessageComponent,
    HeaderChatSectionComponent,
    SentMessageComponent,
  ],
  templateUrl: './chat-section.component.html',
  styleUrl: './chat-section.component.scss'
})

export class ChatSectionComponent implements OnInit {

  dataUser = inject(UserService);
  channelService = inject(ChannelService);
  private injector = inject(Injector);
  chatService = inject(ChatService);
  route = inject(ActivatedRoute);
  dialog = inject(MatDialog);
  readonly userDialog = inject(MatDialog);
  unsubscribeUserData!: Subscription;
  private routeSub?: Subscription;
  unsubscribeUserChannels?: () => void;
  users$: Observable<User[]> | undefined;
  users: any;
  selectedUser: any;
  showEmojis: boolean = false;
  showEmojisMessage: boolean = false;
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  readonly emojiDialog = inject(MatDialog);

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      this.channelService.currentUserId = params['id'];
      this.showCurrentUserData();
      this.showUserChannel();
      this.getUserData();
      this.scrollToBottom();
    });
    /*     this.listenToMessages(this.route);
        console.log('test' + this.chatId);
      }); */
    // setTimeout(() => {
    //   this.checkChannel();
    //   console.log('Channels by user', this.dataUser.showChannelByUser);

    // }, 2000);
  }

  /*   ngOnChanges(changes: SimpleChanges) {
      if (changes[this.messageText]) {
        this.onInputChange();
        console.log('input feld is changed');
      }
    } */

  getUserData() {
    this.channelService.isChecked$.subscribe(user => {
      this.selectedUser = user
    })
  }

  showCurrentUserData() {
    const userRef = this.dataUser.getSingleUserRef(this.channelService.currentUserId);
    this.unsubscribeUserData = runInInjectionContext(this.injector, () => docData(userRef).subscribe(data => {
      this.channelService.currentUser = new User(data);
    }));
  }
  
  showUserChannel() {
    const channelRef = this.channelService.getChannelRef();
    this.unsubscribeUserChannels = runInInjectionContext(this.injector, () =>
      onSnapshot(channelRef, (snapshot) => {
        this.channelService.channels = [];
        snapshot.forEach(doc => {
          this.channelService.channels.push({
            ...doc.data(),
            channelId: doc.id
          });
        });
      })
    );
  }

  scrollToBottom(): void {
    if (this.chatContainer) {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    }
  }

  openUserDialog() {
    this.userDialog.open(UserCardComponent, {
      data: { user: this.selectedUser }
    })
  }

   ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    if (this.unsubscribeUserChannels) {
      this.unsubscribeUserChannels()
    }
    if (this.unsubscribeUserChannels) {
      this.unsubscribeUserChannels(); 
    }
  }

}