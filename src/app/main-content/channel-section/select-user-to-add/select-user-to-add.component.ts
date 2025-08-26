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
  showSelectedUser = false;
  filteredUsers: { name: string; avatar: string; userId: string }[] = [];
  selectedUsers: { name: string; avatar: string; userId: string }[] = [];
  searchInput: string = '';
  router = inject(Router);
  currentChannelId?: string;

  createChannel() {
    console.log('selected users', this.selectedUsers);
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
      this.userService.showFilteredUsers(this.searchInput).subscribe((users) => {
      this.filteredUsers = users;
    });
  }

  displayUser(user: any): string {
    return user && user.name ? user.name : '';
  }

  selectUser(user: any) {
    if (!this.selectedUsers.some(u => u.userId === user.userId)) {
      this.selectedUsers.push(user);
    }
    this.showSelectedUser = true;
    this.isEnabled = true;
    console.log('selected user', this.showSelectedUser);
    console.log('show searchbar', this.showUserSearchBar);
    console.log('array filtered users', this.filteredUsers);
      // this.showSelectedUser = true;
    // const parts = this.router.url.split('/').filter(Boolean);
    // const channelId = parts[3];
    // this.currentChannelId = channelId;
  }

   private updateBtnStatus() {
    const count = this.selectedUsers.length;
    this.showSelectedUser = count > 0;
    this.isEnabled = count > 0;
  }

  removeSelectedUser(userId: string, event: MouseEvent) {
    event.stopPropagation();
    this.selectedUsers = this.selectedUsers.filter(u => u.userId !== userId);
    this.searchInput = '';
    this.filteredUsers = [];
    this.updateBtnStatus();
    console.log('benutzer in array', this.selectedUsers);
  }

  showSearchBar() {
    this.showSelectedUser = false;
  }
}