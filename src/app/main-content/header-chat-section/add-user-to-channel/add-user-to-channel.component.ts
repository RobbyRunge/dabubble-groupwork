import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { ChannelService } from '../../../services/channel.service';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-add-user-to-channel',
  imports: [MatIcon, FormsModule, MatButtonModule],
  templateUrl: './add-user-to-channel.component.html',
  styleUrl: './add-user-to-channel.component.scss'
})
export class AddUserToChannelComponent {

  channelService = inject(ChannelService);
  unserService = inject(UserService);
  dialogRef = inject(MatDialogRef<AddUserToChannelComponent>);

  searchInput: string = '';
  filteredUsers: any;

  addUserToChannel() {
   this.filterUsers();
  }

 filterUsers() {
  this.unserService.getAllUsers().subscribe(users => {
    this.filteredUsers = users
      .filter(user =>
        user.name.toLowerCase().includes(this.searchInput.toLowerCase())
      )
      .map(user => ({
        name: user.name,
        avatar: user.avatar
      }));
    console.log('Gefilterte Benutzer:', this.filteredUsers);
  });
}

}