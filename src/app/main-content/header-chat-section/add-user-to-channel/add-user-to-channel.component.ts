import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { ChannelService } from '../../../services/channel.service';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '../../../services/user.service';
import { Subscription } from 'rxjs';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@Component({
  selector: 'app-add-user-to-channel',
  imports: [MatIcon, FormsModule, MatButtonModule, MatListModule, MatDividerModule, CommonModule, MatAutocompleteModule],
  templateUrl: './add-user-to-channel.component.html',
  styleUrl: './add-user-to-channel.component.scss'
})
export class AddUserToChannelComponent {

  channelService = inject(ChannelService);
  unserService = inject(UserService);
  dialog = inject(MatDialogRef<AddUserToChannelComponent>);
  filterUserSubscription!: Subscription;

  searchInput: string = '';
  filteredUsers: any;

  addUserToChannel() {
   
  }

 filterUsers(inputFilterUser: HTMLElement) {
  if (this.searchInput === '') {
    this.filteredUsers = [];
    return;
  }
  this.unserService.getAllUsers().subscribe(users => {
    this.filteredUsers = users
      .filter(user =>
        user.name.toLowerCase().startsWith(this.searchInput.toLowerCase())
      )
      .map(user => ({
        name: user.name,
        avatar: user.avatar
      }));
    console.log('Gefilterte Benutzer:', this.filteredUsers);
  });
}

ngOnDestroy() {
  if (this.filterUserSubscription) {
    this.filterUserSubscription.unsubscribe();
  }
}

}