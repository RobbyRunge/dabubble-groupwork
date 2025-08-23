import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { UserService } from '../../../services/user.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Router } from '@angular/router';

@Component({
  selector: 'app-select-user-to-add',
  imports: [MatIcon, MatRadioModule, MatButtonModule, FormsModule, CommonModule, MatAutocompleteModule],
  templateUrl: './select-user-to-add.component.html',
  styleUrl: './select-user-to-add.component.scss'
})
export class SelectUserToAddComponent {
  dialog = inject(MatDialogRef<SelectUserToAddComponent>);
  userService = inject(UserService);
  selectAllUsersInChannel: boolean | null = null;
  isEnabled = false;
  showUserSearchBar = false;
  filteredUsers: { name: string; avatar: string; userId: string }[] = [];
  selectedUsers: { name: string; avatar: string; userId: string }[] = [];
  searchInput: string = '';
  router = inject(Router);
  currentChannelId?: string;

  createChannel() {
    console.log('select number', this.selectAllUsersInChannel);
  }

  checkboxValue() {
    if (this.selectAllUsersInChannel) {
      this.isEnabled = true;
      this.showUserSearchBar = false;
    } else if (!this.selectAllUsersInChannel) {
      this.isEnabled = false;
      this.showUserSearchBar = true;
    }
    console.log('select users', this.selectAllUsersInChannel);
    console.log('show seearchbar', this.showUserSearchBar);
    
  }

  showfilterUsers() {
    if (this.searchInput === '') {
      this.filteredUsers = [];
      this.isEnabled = false;
      return;
    }
      this.isEnabled = true;
      this.userService.showFilteredUsers(this.searchInput).subscribe((users) => {
      this.filteredUsers = users;
    });
  }

  displayUser(user: any): string {
    return user && user.name ? user.name : '';
  }

  selectUser(user: any) {
  this.selectedUsers = user;
  // this.showSelectedUser = true;
  const parts = this.router.url.split('/').filter(Boolean);
  const channelId = parts[3];
  this.currentChannelId = channelId;
  }

}