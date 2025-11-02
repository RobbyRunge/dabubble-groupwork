import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { UserService } from '../../../services/user.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Router } from '@angular/router';
import { ChannelService } from '../../../services/channel.service';
import { Allchannels } from '../../../../models/allchannels.class';
import { firstValueFrom } from 'rxjs';
import {
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-select-user-to-add',
  imports: [MatIcon, MatRadioModule, MatButtonModule, FormsModule, CommonModule, MatAutocompleteModule],
  templateUrl: './select-user-to-add.component.html',
  styleUrl: './select-user-to-add.component.scss'
})
export class SelectUserToAddComponent {
  dialogRef = inject(MatDialogRef<SelectUserToAddComponent>, { optional: true });
  bottomSheetRef = inject(MatBottomSheetRef<SelectUserToAddComponent>, { optional: true });
  userService = inject(UserService);
  channelService = inject(ChannelService);
  newChannel = new Allchannels();
  selectAllUsersInChannel: boolean | null = null;
  isEnabled = false;
  showUserSearchBar = false;
  filteredUsers: { name: string; avatar: string; userId: string; active: boolean }[] = [];
  selectedUsers: { name: string; avatar: string; userId: string }[] = [];
  addUserId: string[] = [];
  searchInput: string = '';
  router = inject(Router);
  channelName?: string;
  channelDescription?: string;
  placeHolderActive = false;
  @ViewChild('searchUserInput') searchUserInput!: ElementRef<HTMLInputElement>;

  async createChannel() {
    if (this.newChannel) {
      this.newChannel.channelname = this.channelName ?? '';
      this.newChannel.description = this.channelDescription ?? '';
    }
    if(!this.selectAllUsersInChannel) {
      this.createChannelWithNewUsernames();
    } else if (this.selectAllUsersInChannel) {
      await this.createChannelWithUsersInChannel();
    }
    await this.channelService.addNewChannel(this.newChannel.toJSON(),this.addUserId,this.channelService.currentUserId).then(() => {
      this.close();
      this.addUserId = [];
      this.filteredUsers = [];
    });
    this.placeHolderActive = false;
  }

  close() {
    this.dialogRef?.close();
    this.bottomSheetRef?.dismiss();
    this.placeHolderActive = false;
  }

  setFocusInput() {
    if (this.showUserSearchBar) {
      setTimeout(() => {
        this.searchUserInput?.nativeElement.focus();
      });
    }
  }

  checkboxValue() {
    if (this.selectAllUsersInChannel) {
      this.isEnabled = true;
      this.showUserSearchBar = false;
    } else if (!this.selectAllUsersInChannel) {
      this.isEnabled = false;
      this.showUserSearchBar = true;
    }
    this.updateBtnStatus();
  }

  showfilterUsers() {
    if (this.searchInput === '') {
      this.filteredUsers = [];
      this.isEnabled = false;
      this.placeHolderActive = false;
      return;
    }
      this.userService.showFilteredUsers(this.searchInput).subscribe((users) => {
      this.filteredUsers = users;
      this.placeHolderActive = true;
    });
  }

  displayUser(user: any): string {
    return user && user.name ? user.name : '';
  }

  selectUser(user: any) {
    if (!this.selectedUsers.some(u => u.userId === user.userId)) {
      this.selectedUsers.push(user);
    }
    this.searchInput = '';
    this.isEnabled = true;
    this.filteredUsers = [];
    this.placeHolderActive = false;
    this.setFocusInput();
  }

   private updateBtnStatus() {
    if(!this.selectAllUsersInChannel) {
       const count = this.selectedUsers.length;
    this.isEnabled = count > 0;
    }
  }

  removeSelectedUser(userId: string, event: MouseEvent) {
    event.stopPropagation();
    this.selectedUsers = this.selectedUsers.filter(u => u.userId !== userId);
    this.searchInput = '';
    this.filteredUsers = [];
    this.updateBtnStatus();
    this.setFocusInput();
  }

  createChannelWithNewUsernames() {
    this.addUserId = [];
    this.addUserId.push(this.channelService.currentUserId);
    this.selectedUsers.forEach(user => {
      this.addUserId.push(user.userId);
    });
  }

  async createChannelWithUsersInChannel() {
    this.addUserId = [];
    const users = await firstValueFrom(this.userService.getAllUsers());
    users.forEach(user => {
        this.addUserId.push(user.userId);
    });
  }
}