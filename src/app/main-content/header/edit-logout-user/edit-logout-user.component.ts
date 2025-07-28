import { Component, Inject, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { UserCardComponent } from '../../user-card/user-card.component';
import { User } from '../../../../models/user.class';
import { UserService } from '../../../services/user.service';
import { Router } from '@angular/router';
import { ChannelService } from '../../../services/channel.service';

@Component({
  selector: 'app-edit-logout-user',
  imports: [MatButtonModule, MatDialogActions],
  templateUrl: './edit-logout-user.component.html',
  styleUrl: './edit-logout-user.component.scss'
})
export class EditLogoutUserComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { user: User, urlUserId: string },
    private dialogRef: MatDialogRef<EditLogoutUserComponent>,
  ) {
  }
  private router = inject(Router);
  readonly dialog = inject(MatDialog);
  readonly userService = inject(UserService);
  readonly channelService = inject(ChannelService);

  openDialog(): void {
    const currentUser = this.channelService.currentUser;
    const currentUserId = this.channelService.currentUserId;

    this.dialog.open(UserCardComponent, {
      data: {
        user: currentUser,
        urlUserId: currentUserId
      }
    });
  }

  async logout() {
    await this.userService.updateUserDocument(this.userService.channelService.currentUserId, { active: false });
    this.router.navigate(['']);
    this.dialogRef.close();
  }
}
