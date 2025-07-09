import { Component, inject, OnInit } from '@angular/core';
import { User } from '../../../models/user.class';
import {MatCardModule} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import {MatDividerModule} from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { getDoc, onSnapshot } from '@angular/fire/firestore';

@Component({
  selector: 'app-channel-section',
  imports: [MatCardModule, MatIcon, MatButtonModule, MatDividerModule, CommonModule],
  templateUrl: './channel-section.component.html',
  styleUrl: './channel-section.component.scss'
})
export class ChannelSectionComponent implements OnInit {

  dialogRef = inject(MatDialogRef<ChannelSectionComponent>);
  dataUser = inject(UserService);

  showEditChannelName = false;
  showEditChannelDescription = false;
  showChannels = false;


   ngOnInit(): void {
   
  }

  editChannelName() {
    this.showEditChannelName = true;
  }

  saveEditedChannelName() {
    this.showEditChannelName = false;
  }

  editChannelDescription() {
    this.showEditChannelDescription = true;
  }

  saveEditedChannelDescription() {
    this.showEditChannelDescription = false;
  }

}