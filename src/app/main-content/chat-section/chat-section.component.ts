import { Component, ElementRef, inject, Injector, OnInit, runInInjectionContext, SimpleChanges, ViewChild, AfterViewInit, AfterViewChecked, OnDestroy, HostListener, ViewContainerRef } from '@angular/core';
import { WorkSpaceSectionComponent } from "../work-space-section/work-space-section.component";
import { ThreadSectionComponent } from "../thread-section/thread-section.component";
import { HeaderComponent } from "../header/header.component";
import { UserService } from '../../services/user.service';
import { NavigationService } from '../../services/navigation.service';
import { ActivatedRoute } from '@angular/router';
import { docData, onSnapshot } from '@angular/fire/firestore';
import { User } from '../../../models/user.class';
import { Observable, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AsyncPipe, NgClass, NgFor, NgIf, NgStyle, DatePipe } from '@angular/common';
import { UserCardComponent } from '../user-card/user-card.component';
import { ReceivedMessageComponent } from './received-message/received-message.component';
import { SentMessageComponent } from "./sent-message/sent-message.component";
import { ChatService } from '../../services/chat.service';
import { ChannelService } from '../../services/channel.service';
import { InputMessageComponent } from '../input-message/input-message.component';
import { HeaderChatSectionComponent } from "../header-chat-section/header-chat-section.component";
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiPickerService } from '../../services/emojiPicker.service';

@Component({
  selector: 'app-chat-section',
  imports: [
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
  constructor(public pickerService: EmojiPickerService) { }
  @ViewChild('chatContainer', { static: false }) chatContainer!: ElementRef<HTMLElement>;
  @ViewChild('emojiPickerChat', { static: false }) emojiPickerChat!: ElementRef<HTMLElement>;
  @ViewChild('messagesContainer', { static: false }) messagesContainer!: ElementRef<HTMLElement>;

  dataUser = inject(UserService);
  channelService = inject(ChannelService);
  private injector = inject(Injector);
  chatService = inject(ChatService);
  navigationService = inject(NavigationService);
  route = inject(ActivatedRoute);
  dialog = inject(MatDialog);
  readonly userDialog = inject(MatDialog);
  unsubscribeUserData!: Subscription;
  private routeSub?: Subscription;
  private navigationSub?: Subscription;
  unsubscribeUserChannels?: () => void;
  users$: Observable<User[]> | undefined;
  users: any;
  selectedUser: any;
  showEmojis: boolean = false;
  showEmojisMessage: boolean = false;
  readonly emojiDialog = inject(MatDialog);
  private shouldScrollToBottom = false;
  private lastMessageCount = 0;
  currentMessage?: any;
  currentMessageIndex?: number;
  anchorSide: 'left' | 'right' = 'left';


  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      this.channelService.currentUserId = params['id'];
      this.showCurrentUserData();
      this.showUserChannel();
      this.getUserData();
      this.shouldScrollToBottom = true;
    });

    // Subscribe to navigation service for message scrolling
    this.navigationSub = this.navigationService.scrollToMessage$.subscribe(scrollTarget => {
      if (scrollTarget) {
        setTimeout(() => {
          this.scrollToMessage(scrollTarget.messageId, scrollTarget.highlight);
        }, 100);
      }
    });
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
    setTimeout(() => this.pickerService.bindElements('chat', this.chatContainer, this.emojiPickerChat));
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
      if (this.messagesContainer?.nativeElement) {
        setTimeout(() => {
          const element = this.messagesContainer.nativeElement;
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
    this.navigationSub?.unsubscribe();
    if (this.unsubscribeUserChannels) {
      this.unsubscribeUserChannels()
    }
    if (this.unsubscribeUserChannels) {
      this.unsubscribeUserChannels();
    }
  }

  // Method to scroll to a specific message and optionally highlight it
  private scrollToMessage(messageId: string, highlight: boolean = true): void {
    try {
      // Find the message element by looking for elements with data-message-id attribute
      const messageElements = document.querySelectorAll('[data-message-id]');
      let targetElement: Element | null = null;

      for (const element of messageElements) {
        if (element.getAttribute('data-message-id') === messageId) {
          targetElement = element;
          break;
        }
      }

      if (targetElement) {
        // Scroll to the message
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });

        // Highlight the message if requested
        if (highlight) {
          targetElement.classList.add('highlighted-message');

          // Remove highlight after 3 seconds
          setTimeout(() => {
            targetElement?.classList.remove('highlighted-message');
          }, 3000);
        }

        // Clear the navigation target
        this.navigationService.clearScrollTarget();
      } else {
        console.log('Message not found:', messageId);
      }
    } catch (error) {
      console.error('Error scrolling to message:', error);
    }
  }

  hideAllEmojis() {
    this.showEmojis = false;
  }
  openEmojiPicker(ev: { anchor: HTMLElement; side: 'left' | 'right'; message: any; index: number; context: 'chat' | 'thread' }) {
    this.pickerService.open(ev);
  }

  @HostListener('window:resize')
  onResize() { this.pickerService.reposition('chat'); }

  addEmoji(e: any) {
    const s = this.pickerService.state.chat;
    if (!s.currentMessage) return;
    const emoji = e?.emoji?.native ?? e?.emoji ?? e;
    this.chatService.saveEmojisInDatabase('chats', emoji, s.currentMessage.id);
    this.pickerService.hide('chat');
  }
}