import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Channel } from '../../../models/channel.class';

@Component({
  selector: 'app-create-channel-section',
  imports: [MatIcon, MatInputModule, MatButtonModule, MatFormFieldModule, MatDialogActions, CommonModule, FormsModule],
  templateUrl: './create-channel-section.component.html',
  styleUrl: './create-channel-section.component.scss'
})
export class CreateChannelSectionComponent {

  dialogRef = inject(MatDialogRef<CreateChannelSectionComponent>);

  dataUser = inject(UserService);

  createNewChannel = new Channel();

  createChannel() {
    this.userCreateChannel();  
  }


  userCreateChannel() {
    this.dataUser.addChannel(this.createNewChannel.toJSON()).then(() => {
      console.log('user created channel');
      this.dialogRef.close();
    });
  }
}