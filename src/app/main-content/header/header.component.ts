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

  onSearch() {
    this.searchSubject.next(this.searchTerm);
  }

  selectChannelResult(channel: SearchResult) {
    // Ersetze das # und den Suchbegriff mit dem ausgewählten Channel
    const beforeHash = this.searchTerm.substring(0, this.searchTerm.lastIndexOf('#'));
    this.searchTerm = beforeHash + '#' + channel.name + ' ';
    this.showDropdown = false;
    this.dropdownType = 'normal';

    // Hier kannst du zusätzliche Logik für Channel-Auswahl hinzufügen
    console.log('Channel ausgewählt:', channel);
  }

  selectUserResult(user: SearchResult) {
    // Ersetze das @ und den Suchbegriff mit dem ausgewählten User
    const beforeAt = this.searchTerm.substring(0, this.searchTerm.lastIndexOf('@'));
    this.searchTerm = beforeAt + '@' + user.name + ' ';
    this.showDropdown = false;
    this.dropdownType = 'normal';

    // Hier kannst du zusätzliche Logik für User-Auswahl hinzufügen
    console.log('User ausgewählt:', user);
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