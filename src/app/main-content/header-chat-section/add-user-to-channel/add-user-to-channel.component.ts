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
  selectedUser: any;
  filteredUsers: { name: string; avatar: string; userId: string }[] = [];
  selectedUsers: { name: string; avatar: string; userId: string }[] = [];

  showSelectedUser = false;

  addUserToChannel() {
   this.selectedUsers = [];
  }

 filterUsers() {
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
        avatar: user.avatar,
        userId: user.userId
      }));
  });
}

ngOnDestroy() {
  if (this.filterUserSubscription) {
    this.filterUserSubscription.unsubscribe();
  }
}

displayUser(user: any): string {
  return user && user.name ? user.name : '';
}

selectUser(user: any) {
  this.selectedUser = user;
  this.showSelectedUser = true;
  console.log('ausgewählter Benutzer', this.selectedUser);
  if (!this.selectedUsers.some(u => u.userId === this.selectedUser.userId)) {
  this.selectedUsers.push(this.selectedUser);
  }
  console.log('Benutzer in array selectedUsers', this.selectedUsers);
}

showSearchInput() {
  this.showSelectedUser = false;
}

}