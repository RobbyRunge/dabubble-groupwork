import { Component, ElementRef, inject, Injector, OnInit, runInInjectionContext, SimpleChanges, ViewChild, AfterViewInit, AfterViewChecked, OnDestroy, HostListener, ViewContainerRef } from '@angular/core';
import { WorkSpaceSectionComponent } from "../work-space-section/work-space-section.component";
import { ThreadSectionComponent } from "../thread-section/thread-section.component";
import { HeaderComponent } from "../header/header.component";
import { UserService } from '../../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { docData, onSnapshot } from '@angular/fire/firestore';
import { User } from '../../../models/user.class';
import { Observable, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AsyncPipe, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { UserCardComponent } from '../user-card/user-card.component';
import { ReceivedMessageComponent } from './received-message/received-message.component';
import { SentMessageComponent } from "./sent-message/sent-message.component";
import { ChatService } from '../../services/chat.service';
import { ChannelService } from '../../services/channel.service';
import { InputMessageComponent } from '../input-message/input-message.component';
import { HeaderChatSectionComponent } from "../header-chat-section/header-chat-section.component";
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

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
    NgStyle,
    PickerComponent
  ],
  templateUrl: './chat-section.component.html',
  styleUrl: './chat-section.component.scss'
})

export class ChatSectionComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  @ViewChild('chatContainer', { static: false })
  chatContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('emojiPicker') emojiPicker?: ElementRef<HTMLDivElement>;

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
  readonly emojiDialog = inject(MatDialog);
  private shouldScrollToBottom = false;
  private lastMessageCount = 0;
  picker = { visible: false, top: 0, left: 0 };
  private anchorEl?: HTMLElement;
  currentMessage?: any;
  currentMessageIndex?: number;


  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      this.channelService.currentUserId = params['id'];
      this.showCurrentUserData();
      this.showUserChannel();
      this.getUserData();
      this.shouldScrollToBottom = true;
    });
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  ngAfterViewChecked(): void {
    if (this.chatService.messages.length > this.lastMessageCount) {
      this.lastMessageCount = this.chatService.messages.length;
      this.shouldScrollToBottom = true;
    }

    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  getUserData() {
    this.channelService.isChecked$.subscribe(user => {
      this.selectedUser = user;
      this.shouldScrollToBottom = true;
      this.lastMessageCount = 0;
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

  private scrollToBottom(): void {
    try {
      if (this.chatContainer?.nativeElement) {
        setTimeout(() => {
          const element = this.chatContainer.nativeElement;
          element.scrollTop = element.scrollHeight;
        }, 200);
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
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

  hideAllEmojis() {
    this.showEmojis = false;
    this.picker.visible = false;
  }

  openEmojiPicker(ev: { anchor: HTMLElement; message: any; index: number }) {
    this.anchorEl = ev.anchor;
    this.currentMessage = ev.message;
    this.currentMessageIndex = ev.index;

    this.repositionPicker();
    this.picker.visible = true;
  }

  repositionPicker() {
    if (!this.anchorEl) return;
    const container = this.chatContainer.nativeElement;
    const containerRect = container.getBoundingClientRect();
    const anchorRect = this.anchorEl.getBoundingClientRect();
    const pickerWidth = this.emojiPicker?.nativeElement.offsetWidth ?? 320;
    const anchorTopInContainer = anchorRect.top - containerRect.top + container.scrollTop;
    const anchorLeftInContainer = anchorRect.left - containerRect.left + container.scrollLeft;
    const estimatedH = 347;

    let top = anchorTopInContainer - estimatedH;
    if (top < container.scrollTop) {
      top = anchorTopInContainer + anchorRect.height;
    }

    let left = anchorLeftInContainer + anchorRect.width - pickerWidth + 50;

    this.picker.top = top;
    this.picker.left = left;
  }

  addEmoji(event: any) {
    if (!this.currentMessage) return;
    const emoji = event.emoji.native;
    this.chatService.saveEmojisInDatabase(emoji, this.currentMessage.id,);

    this.picker.visible = false;
  }

}