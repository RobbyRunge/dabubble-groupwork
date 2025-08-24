import { Component, inject, OnInit } from '@angular/core';
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
import { SearchService } from '../../services/search.service';
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
  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

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
      if (term) {
        this.searchService.searchMessages(term).subscribe(results => {
          this.searchResults = results;
        });
      } else {
        this.searchResults = [];
      }
    });
  }

  onSearchInput() {
    this.searchSubject.next(this.searchTerm);
  }

  onSearch() {
    this.searchSubject.next(this.searchTerm);
  }

  ngOnDestroy() {
    this.searchSub?.unsubscribe();
  }
}