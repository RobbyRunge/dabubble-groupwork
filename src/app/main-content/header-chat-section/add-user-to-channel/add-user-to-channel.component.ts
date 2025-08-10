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
import { ShowFilteredUserComponent } from './show-filtered-user/show-filtered-user.component';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-user-to-channel',
  imports: [MatIcon, FormsModule, MatButtonModule, MatListModule, MatDividerModule, CommonModule],
  templateUrl: './add-user-to-channel.component.html',
  styleUrl: './add-user-to-channel.component.scss'
})
export class AddUserToChannelComponent {

  channelService = inject(ChannelService);
  unserService = inject(UserService);
  filterDialog = inject(MatDialog);
  dialogRef: MatDialogRef<ShowFilteredUserComponent> | null = null;
  dialog = inject(MatDialogRef<ShowFilteredUserComponent>);
  showFilteredUser = false;
  filterUserSubscription!: Subscription;

  searchInput: string = '';
  filteredUsers: any;

  addUserToChannel() {
   
  }

 filterUsers(inputFilterUser: HTMLElement) {
  if (this.searchInput === '') {
    this.showFilteredUser = false;
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
      this.showFilteredUser = true;
      this.showFilteredUsers(inputFilterUser, this.filteredUsers)
    console.log('Gefilterte Benutzer:', this.filteredUsers);
    console.log('boolean', this.showFilteredUser);
  });
}

showFilteredUsers(inputFilterUser: HTMLElement, filteredUser: string) {
  const rect = inputFilterUser.getBoundingClientRect();
  const width = window.innerWidth < 1080 ? '335px' : '335px';
  const height = window.innerHeight < 700 ? '171px' : '171px';
  if(!this.dialogRef) {
    this.dialogRef = this.filterDialog.open(ShowFilteredUserComponent, {
    position: {
    top: `${rect.bottom + window.scrollY}px`,
    left: `${rect.left + window.scrollX}px`,
    },
    width,
    height,
    maxWidth: '335px',
    maxHeight: '171px',
    panelClass: 'channel-dialog-container'
    });
      this.dialogRef.afterClosed().subscribe(() => {
      this.dialogRef = null; 
     });
    } else {
      console.log('dialog geöffnete');
      // this.dialogRef.componentInstance.updateQuery(filteredUser);
  }
}

ngOnDestroy() {
  if (this.filterUserSubscription) {
    this.filterUserSubscription.unsubscribe();
  }
}

}