import { Component, inject, OnInit, HostListener } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { EditLogoutUserComponent } from './edit-logout-user/edit-logout-user.component';
import { ChannelService } from '../../services/channel.service';
import { SearchService, SearchResult } from '../../services/search.service';
import { ChatService } from '../../services/chat.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [
    MatIconModule,
    MatButtonModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    CommonModule
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

  onlineUser: string = 'status/online.png';
  offlineUser: string = 'status/offline.png';
  searchTerm: string = '';
  searchResults: any[] = [];
  channelResults: SearchResult[] = [];
  userResults: SearchResult[] = [];

  // Dropdown-Steuerung
  showDropdown: boolean = false;
  dropdownType: 'normal' | 'channel' | 'user' = 'normal';

  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const searchContainer = target.closest('.search-container');
    const searchResults = target.closest('.search-results');

    // Schließe Dropdown nur wenn außerhalb der Suchkomponente geklickt wird
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

    // Prüfe auf spezielle Zeichen am Anfang oder nach einem Leerzeichen
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
    // Prüfe ob # am Anfang steht oder nach einem Leerzeichen
    return /(?:^|[\s])#/.test(term);
  }

  private isUserSearch(term: string): boolean {
    // Prüfe ob @ am Anfang steht oder nach einem Leerzeichen
    return /(?:^|[\s])@/.test(term);
  }

  private extractKeyword(term: string, prefix: string): string {
    // Extrahiere das Keyword nach dem letzten Vorkommen des Prefix
    const lastIndex = term.lastIndexOf(prefix);
    if (lastIndex === -1) return '';

    const afterPrefix = term.substring(lastIndex + 1);
    // Nimm alles bis zum nächsten Leerzeichen oder Ende
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
      // Zeige alle verfügbaren Channels
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
      // Zeige alle verfügbaren User
      this.searchService.searchUsers('').subscribe(results => {
        this.userResults = results;
      });
    }
  }

  selectChannelResult(channel: SearchResult) {
    // Schließe das Dropdown
    this.showDropdown = false;
    this.dropdownType = 'normal';
    this.searchTerm = '';

    // Öffne den ausgewählten Channel
    this.openChannel(channel);
  }

  private openChannel(channel: SearchResult) {
    try {
      // Setze den aktuellen Channel im ChannelService
      this.channelService.currentChannelId = channel.id;
      this.channelService.currentChannelName = channel.name;

      // Navigiere zum Channel (du musst eventuell die Router-Navigation anpassen)
      console.log('Channel geöffnet:', channel.name);

      // Hier kannst du die Navigation zum Channel implementieren
      // Beispiel: this.router.navigate(['/mainpage', this.channelService.currentUserId, 'channels', channel.id]);
    } catch (error) {
      console.error('Fehler beim Öffnen des Channels:', error);
    }
  }

  selectUserResult(user: SearchResult) {
    // Schließe das Dropdown
    this.showDropdown = false;
    this.dropdownType = 'normal';
    this.searchTerm = '';

    // Öffne den privaten Chat mit dem ausgewählten User
    this.openPrivateChat(user);
  }

  private async openPrivateChat(user: SearchResult) {
    try {
      // Erstelle User-Objekt im erwarteten Format für den ChatService
      const userForChat = {
        userId: user.id,
        name: user.name,
        avatar: user.avatar,
        active: user.description === 'Online'
      };

      // Verwende die ChatService onUserClick Methode
      await this.chatService.onUserClick(0, userForChat);

    } catch (error) {
      console.error('Fehler beim Öffnen des privaten Chats:', error);
    }
  }

  selectMessageResult(result: any) {
    // Logik für normale Suchergebnisse
    console.log('Nachricht ausgewählt:', result);
    this.showDropdown = false;
  }

  ngOnDestroy() {
    this.searchSub?.unsubscribe();
  }
}