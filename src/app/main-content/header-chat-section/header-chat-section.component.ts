import { AsyncPipe, NgClass, NgFor, NgIf, CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
  HostListener,
  runInInjectionContext,
  Injector,
  OnDestroy
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ChannelService } from '../../services/channel.service';
import { MatDialog } from '@angular/material/dialog';
import { ChannelSectionComponent } from '../channel-section/channel-section.component';
import { UserCardComponent } from '../user-card/user-card.component';
import { ChatService } from '../../services/chat.service';
import { AddUserToChannelComponent } from '../channel-section/add-user-to-channel/add-user-to-channel.component';
import { UsersInChannelComponent } from '../channel-section/users-in-channel/users-in-channel.component';
import { SearchService, SearchResult } from '../../services/search.service';
import { Router } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header-chat-section',
  imports: [NgIf, NgClass, AsyncPipe, FormsModule, CommonModule, MatIconModule, NgFor],
  templateUrl: './header-chat-section.component.html',
  styleUrl: './header-chat-section.component.scss',
})
export class HeaderChatSectionComponent implements OnInit, AfterViewInit, OnDestroy {
  dataUser = inject(UserService);
  channelService = inject(ChannelService);
  chatService = inject(ChatService);
  dialog = inject(MatDialog);
  userDialog = inject(MatDialog);

  private searchService = inject(SearchService);
  private router = inject(Router);
  private firestore = inject(Firestore);
  private injector = inject(Injector);
  
  onlineUser: string = 'status/online.png';
  offlineUser: string = 'status/offline.png';

  newMessageSearchTerm: string = '';
  channelResults: SearchResult[] = [];
  userResults: SearchResult[] = [];
  showDropdown: boolean = false;
  dropdownType: 'channel' | 'user' = 'channel';

  @ViewChild('referenceButton') referenceButton!: ElementRef<HTMLButtonElement>;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const searchContainer = target.closest('.new-message-input-container');
    const searchResults = target.closest('.search-results');
    if (!searchContainer && !searchResults) {
      this.showDropdown = false;
    }
  }

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

  onNewMessageSearchInput() {
    const term = this.newMessageSearchTerm;    
    if (this.isChannelSearch(term)) {
      this.dropdownType = 'channel';
      const channelKeyword = this.extractKeyword(term, '#');
      this.searchChannels(channelKeyword);
    } else if (this.isUserSearch(term)) {
      this.dropdownType = 'user';
      const userKeyword = this.extractKeyword(term, '@');
      this.searchUsers(userKeyword);
    } else {
      this.showDropdown = false;
      return;
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
    this.newMessageSearchTerm = `#${channel.name}`;
  }

  selectUserResult(type: string, user: SearchResult) {
    this.showDropdown = false;
    this.newMessageSearchTerm = `@${user.name}`;
  }

  truncateDescription(text: string, maxWords: number = 6): string {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= maxWords) {
      return text;
    }
    return words.slice(0, maxWords).join(' ') + '...';
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

  ngOnDestroy() {
    // Cleanup if needed
  }
}
