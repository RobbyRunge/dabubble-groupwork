import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ChannelSectionComponent } from '../channel-section/channel-section.component';
import { UserService } from '../../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogActions } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Allchannels } from '../../../models/allchannels.class';
import { ChannelService } from '../../services/channel.service';

@Component({
  selector: 'app-user-channel-chat-section',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, CommonModule, MatButtonModule, MatMenuModule],
  templateUrl: './user-channel-chat-section.component.html',
  styleUrl: './user-channel-chat-section.component.scss',
})
export class UserChannelChatSectionComponent implements OnInit {
  
  dataUser = inject(UserService);
  channelService = inject(ChannelService);
  route = inject(ActivatedRoute);
  dialog = inject(MatDialog);
  newChannel = new Allchannels();
  currentUserId = this.channelService.currentUserId;

  private routeSub?: Subscription;

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap) => {
    const channelId = paramMap.get('channelId')!;
    this.channelService.currentChannelId = channelId;
  });
  }

  openDialog(button: HTMLElement) {
    const rect = button.getBoundingClientRect();
    this.dialog.open(ChannelSectionComponent, {
    position: {
        top:  `${rect.bottom + window.scrollY}px`, 
        left: `${rect.left   + window.scrollX}px`  
      },
      width: '750px',
      height: '500px',
      maxWidth: '750px',
      maxHeight: '500px',
      panelClass: 'channel-dialog-container',
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }
}
