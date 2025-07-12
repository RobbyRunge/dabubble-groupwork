import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ChannelSectionComponent } from '../channel-section/channel-section.component';
import { UserService } from '../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogActions } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Channel } from '../../../models/channel.class';
import { Allchannels } from '../../../models/allchannels.class';

@Component({
  selector: 'app-user-channel-chat-section',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, CommonModule, MatButtonModule, MatMenuModule],
  templateUrl: './user-channel-chat-section.component.html',
  styleUrl: './user-channel-chat-section.component.scss',
})
export class UserChannelChatSectionComponent implements OnInit {
  
  dataUser = inject(UserService);
  route = inject(ActivatedRoute);
  dialog = inject(MatDialog);
  createNewChannel = new Channel();
  newChannel = new Allchannels();
  currentUserId = this.dataUser.currentUserId;

  private routeSub?: Subscription;

  ngOnInit(): void {
    // this.routeSub = this.route.paramMap.subscribe((paramMap) => {
    //   const channelId = paramMap.get('channelId');   
    // });
  }

  openDialog() {
    this.dialog.open(ChannelSectionComponent, {
      width: '872px',
      height: '616px',
      maxWidth: '872px',
      maxHeight: '616px',
      panelClass: 'channel-dialog-container',
    });
  }

  createChannel() {
    this.userCreateChannel();  
  }

  userCreateChannel() {
     this.dataUser.addNewChannel(this.newChannel.toJSON(),this.currentUserId,this.currentUserId).then(() => {
      // this.dialogRef.close();
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }
}
