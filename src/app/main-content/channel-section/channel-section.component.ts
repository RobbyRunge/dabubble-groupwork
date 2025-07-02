import { Component, inject, OnInit } from '@angular/core';
import { User } from '../../../models/user.class';
import {MatCardModule} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import {MatDividerModule} from '@angular/material/divider';

@Component({
  selector: 'app-channel-section',
  imports: [MatCardModule, MatIcon, MatButtonModule, MatDividerModule],
  templateUrl: './channel-section.component.html',
  styleUrl: './channel-section.component.scss'
})
export class ChannelSectionComponent implements OnInit {

  dialogRef = inject(MatDialogRef<ChannelSectionComponent>);

  currentUser!: User;
  currentUserId!: string; 
  channels: any[] = [];

   ngOnInit(): void {
    console.log('current user is', this.currentUser);
    console.log('current user id is', this.currentUserId);
    console.log('channels is' , this.channels);
  }

}
