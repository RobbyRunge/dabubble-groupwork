import { Component, inject, Injector, OnInit } from '@angular/core';
import { User } from '../../../models/user.class';
import {MatCardModule} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import {MatDividerModule} from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { getDoc, onSnapshot } from '@angular/fire/firestore';
import { Allchannels } from '../../../models/allchannels.class';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-channel-section',
  imports: [MatCardModule, MatIcon, MatButtonModule, MatDividerModule, CommonModule, FormsModule],
  templateUrl: './channel-section.component.html',
  styleUrl: './channel-section.component.scss'
})
export class ChannelSectionComponent implements OnInit {

  dialogRef = inject(MatDialogRef<ChannelSectionComponent>);
  dataUser = inject(UserService);

  showEditChannelName = false;
  showEditChannelDescription = false;
  showChannels = false;

  newChannel = new Allchannels();

   ngOnInit(): void {
  }

  editChannelName() {
    this.showEditChannelName = true;
    let baseName = this.dataUser.currentChannelName ? this.dataUser.currentChannelName : this.dataUser.userSubcollectionChannelName;
    this.newChannel.channelname = '# ' + baseName;
  }

  saveEditedChannelName() {
    this.showEditChannelName = false;
    this.dataUser.editChannel(this.dataUser.currentChannelId, this.newChannel.toJSON());
    const cleaned = this.newChannel.channelname.replace(/^#\s*/, '').trim();
    this.dataUser.currentChannelName = cleaned;
    this.showEditChannelName = false;
    this.newChannel.channelId = this.dataUser.currentChannelId;
    this.newChannel.channelname = cleaned;
    this.dataUser.editChannel(this.dataUser.currentChannelId, this.newChannel.toJSON()).then(() => {
    this.dataUser.updateUserStorage(this.dataUser.currentUserId, this.dataUser.userSubcollectionId, this.newChannel.toJSON())
    });
  }

  editChannelDescription() {
    this.showEditChannelDescription = true;
  }

  saveEditedChannelDescription() {
    this.showEditChannelDescription = false;
    // this.newChannel.description = channelDescription;
  }

  // async loadChannelCreatorData() {
  // await this.dataUser.getChannelUserName();
  // }

}