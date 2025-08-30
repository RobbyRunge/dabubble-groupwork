import { Component, inject, OnInit, HostListener } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { UserService } from '../../services/user.service';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { EditLogoutUserComponent } from './edit-logout-user/edit-logout-user.component';
import { ChannelService } from '../../services/channel.service';
import { SearchService, SearchResult } from '../../services/search.service';
import { ChatService } from '../../services/chat.service';
import { NavigationService } from '../../services/navigation.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Firestore, doc, getDoc, collection } from '@angular/fire/firestore';

@Component({
  selector: 'app-header',
  imports: [
    MatIconModule,
    MatButtonModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    CommonModule,
    DatePipe
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  readonly dialog = inject(MatDialog);
  private dataUser = inject(UserService);
  public channelService = inject(ChannelService);
  private searchService = inject(SearchService);
  private chatService = inject(ChatService);
  private navigationService = inject(NavigationService);
  private router = inject(Router);
  private firestore = inject(Firestore);

  onlineUser: string = 'status/online.png';
  offlineUser: string = 'status/offline.png';
  searchTerm: string = '';
  searchResults: any[] = [];
  channelResults: SearchResult[] = [];
  userResults: SearchResult[] = [];

  showDropdown: boolean = false;
  dropdownType: 'normal' | 'channel' | 'user' = 'normal';

  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const searchContainer = target.closest('.search-container');
    const searchResults = target.closest('.search-results');
    if (!searchContainer && !searchResults) {
      this.showDropdown = false;
    }
  }

  openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(EditLogoutUserComponent, {
      width: '250px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

  ngOnInit() {
    this.searchSub = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.performSearch(term);
    });
  }

  onSearchInput() {
    const term = this.searchTerm;
    if (this.isChannelSearch(term)) {
      this.dropdownType = 'channel';
      const channelKeyword = this.extractKeyword(term, '#');
      this.searchChannels(channelKeyword);
    } else if (this.isUserSearch(term)) {
      this.dropdownType = 'user';
      const userKeyword = this.extractKeyword(term, '@');
      this.searchUsers(userKeyword);
    } else {
      this.dropdownType = 'normal';
      this.searchSubject.next(term);
    }
    this.showDropdown = term.length > 0;
  }

  private isChannelSearch(term: string): boolean {
    return /(?:^|[\s])#/.test(term);
  }

  private isUserSearch(term: string): boolean {
    return /(?:^|[\s])@/.test(term);
  }

  private extractKeyword(term: string, prefix: string): string {
    const lastIndex = term.lastIndexOf(prefix);
    if (lastIndex === -1) return '';
    const afterPrefix = term.substring(lastIndex + 1);
    const match = afterPrefix.match(/^([^\s]*)/);
    return match ? match[1] : '';
  }

  private performSearch(term: string) {
    if (term) {
      this.searchService.searchMessages(term).subscribe(results => {
        this.searchResults = results;
      });
    } else {
      this.searchResults = [];
    }
  }

  private searchChannels(keyword: string) {
    if (keyword) {
      this.searchService.searchChannels(keyword).subscribe(results => {
        this.channelResults = results;
      });
    } else {
      this.searchService.searchChannels('').subscribe(results => {
        this.channelResults = results;
      });
    }
  }

  private searchUsers(keyword: string) {
    if (keyword) {
      this.searchService.searchUsers(keyword).subscribe(results => {
        this.userResults = results;
      });
    } else {
      this.searchService.searchUsers('').subscribe(results => {
        this.userResults = results;
      });
    }
  }

  selectChannelResult(channel: SearchResult) {
    this.showDropdown = false;
    this.dropdownType = 'normal';
    this.searchTerm = '';
    this.openChannel(channel);
  }

  private openChannel(channel: SearchResult) {
    try {
      this.channelService.currentChannelId = channel.id;
      this.channelService.currentChannelName = channel.name;
      this.dataUser.getUserIdsFromChannel(channel.id);
      this.dataUser.showChannel = true;
      this.dataUser.showChatPartnerHeader = false;
      this.channelService.setActiveChannelId(channel.id);
      this.router.navigate(['/mainpage', this.channelService.currentUserId, 'channel', channel.id]);
    } catch (error) {
      console.error('Fehler beim Öffnen des Channels:', error);
    }
  }

  selectUserResult(user: SearchResult) {
    this.showDropdown = false;
    this.dropdownType = 'normal';
    this.searchTerm = '';
    this.openPrivateChat(user);
  }

  private async openPrivateChat(user: SearchResult) {
    try {
      const userForChat = {
        userId: user.id,
        name: user.name,
        avatar: user.avatar,
        active: user.description === 'Online'
      };
      await this.chatService.onUserClick(0, userForChat);
    } catch (error) {
      console.error('Fehler beim Öffnen des privaten Chats:', error);
    }
  }

  selectMessageResult(result: SearchResult) {
    this.showDropdown = false;
    this.dropdownType = 'normal';
    this.searchTerm = '';
    
    if (result.type === 'message') {
      this.navigateToMessage(result);
    }
  }

  private navigateToMessage(messageResult: SearchResult) {
    try {
      if (messageResult.isDirectMessage) {
        // Navigate to direct message/chat
        this.navigateToDirectMessage(messageResult);
      } else if (messageResult.channelName) {
        // Navigate to channel message
        this.navigateToChannelMessage(messageResult);
      }
    } catch (error) {
      console.error('Fehler beim Navigieren zur Nachricht:', error);
    }
  }

  private async navigateToDirectMessage(messageResult: SearchResult) {
    // Extract chat ID and message ID from search result ID (format: chat-{chatId}-{messageId})
    const idParts = messageResult.id.split('-');
    if (idParts.length >= 3 && idParts[0] === 'chat') {
      const chatId = idParts[1];
      const messageId = idParts.slice(2).join('-'); // Join remaining parts in case message ID contains dashes
      
      try {
        // Get the chat document to find the other user
        const chatDoc = await this.getChatDocument(chatId);
        if (chatDoc) {
          const chatUsers = chatDoc['user'] || [];
          const otherUserId = chatUsers.find((userId: string) => userId !== this.channelService.currentUserId);
          
          if (otherUserId) {
            // Get user information
            const otherUser = await this.getUserById(otherUserId);
            if (otherUser) {
              // Use the existing chat service method to open the chat
              await this.chatService.onUserClick(0, {
                userId: otherUser.userId,
                name: otherUser.name,
                avatar: otherUser.avatar,
                active: otherUser.active || false
              });
              
              // Navigate to the chat
              this.dataUser.showChannel = false;
              this.dataUser.showChatPartnerHeader = true;
              this.router.navigate(['/mainpage', this.channelService.currentUserId]);
              
              // After navigation, trigger scroll to the specific message
              setTimeout(() => {
                this.navigationService.navigateToMessage(messageId, true);
              }, 500); // Wait for chat to load
            }
          }
        }
      } catch (error) {
        console.error('Fehler beim Öffnen des Chats:', error);
      }
    }
  }

  private navigateToChannelMessage(messageResult: SearchResult) {
    // Extract channel ID and message ID from search result ID (format: channel-{channelId}-{messageId})
    const idParts = messageResult.id.split('-');
    if (idParts.length >= 3 && idParts[0] === 'channel') {
      const channelId = idParts[1];
      const messageId = idParts.slice(2).join('-'); // Join remaining parts in case message ID contains dashes
      
      // Find the channel by ID and navigate to it
      const channel = this.channelService.showChannelByUser.find(ch => ch.channelId === channelId);
      if (channel) {
        this.openChannel({
          id: channelId,
          name: channel.channelname,
          type: 'channel',
          description: channel.description
        });
        
        // After navigation, trigger scroll to the specific message
        setTimeout(() => {
          this.navigationService.navigateToMessage(messageId, true);
        }, 500); // Wait for channel to load
      } else {
        console.log('Channel not found or user not a member');
      }
    }
  }

  ngOnDestroy() {
    this.searchSub?.unsubscribe();
  }

  private async getChatDocument(chatId: string): Promise<any> {
    try {
      const chatDocRef = doc(this.firestore, 'chats', chatId);
      const chatSnap = await getDoc(chatDocRef);
      return chatSnap.exists() ? chatSnap.data() : null;
    } catch (error) {
      console.error('Error getting chat document:', error);
      return null;
    }
  }

  private async getUserById(userId: string): Promise<any> {
    try {
      const userDocRef = doc(this.firestore, 'users', userId);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        return {
          userId: userSnap.id,
          name: userData['name'],
          avatar: userData['avatar'],
          active: userData['active'] || false
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }
}