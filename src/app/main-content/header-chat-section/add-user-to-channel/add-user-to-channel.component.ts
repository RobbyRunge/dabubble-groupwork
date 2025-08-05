import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { ChannelService } from '../../../services/channel.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-add-user-to-channel',
  imports: [MatIcon, FormsModule, MatButtonModule],
  templateUrl: './add-user-to-channel.component.html',
  styleUrl: './add-user-to-channel.component.scss'
})
export class AddUserToChannelComponent {

  channelService = inject(ChannelService);
  dialogRef = inject(MatDialogRef<AddUserToChannelComponent>);

}
