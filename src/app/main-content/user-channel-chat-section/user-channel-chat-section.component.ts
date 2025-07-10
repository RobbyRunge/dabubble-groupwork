import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ChannelSectionComponent } from '../channel-section/channel-section.component';
import { UserService } from '../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-channel-chat-section',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, CommonModule],
  templateUrl: './user-channel-chat-section.component.html',
  styleUrl: './user-channel-chat-section.component.scss',
})
export class UserChannelChatSectionComponent implements OnInit {
  
  dataUser = inject(UserService);
  route = inject(ActivatedRoute);
  dialog = inject(MatDialog);
  private router = inject(Router);

  private routeSub?: Subscription;

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe((paramMap) => {
      const channelId = paramMap.get('channelId');   
    });
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

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }
}
