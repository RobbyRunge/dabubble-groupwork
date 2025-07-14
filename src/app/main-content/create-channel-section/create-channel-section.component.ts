import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Allchannels } from '../../../models/allchannels.class';

@Component({
  selector: 'app-create-channel-section',
  imports: [MatIcon, MatInputModule, MatButtonModule, MatFormFieldModule, MatDialogActions, CommonModule, FormsModule],
  templateUrl: './create-channel-section.component.html',
  styleUrl: './create-channel-section.component.scss'
})
export class CreateChannelSectionComponent {

  dialogRef = inject(MatDialogRef<CreateChannelSectionComponent>);

  dataUser = inject(UserService);

  newChannel = new Allchannels();

  currentUserId = this.dataUser.currentUserId;

  createChannel() {
    this.userCreateChannel();  
  }

  userCreateChannel() {
     this.dataUser.addNewChannel(this.newChannel.toJSON(),this.currentUserId,this.currentUserId).then(() => {
      this.dialogRef.close();
    });
  }
}