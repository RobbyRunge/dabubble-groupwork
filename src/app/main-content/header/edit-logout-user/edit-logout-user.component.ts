import { Component, Inject, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions } from '@angular/material/dialog';
import { UserCardComponent } from '../../work-space-section/user-card/user-card.component';
import { User } from '../../../../models/user.class';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-edit-logout-user',
  imports: [MatButtonModule, MatDialogActions],
  templateUrl: './edit-logout-user.component.html',
  styleUrl: './edit-logout-user.component.scss'
})
export class EditLogoutUserComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { user: User, urlUserId: string },
  ) { 
    /* this.urlUserId = data.urlUserId; */
  }
  readonly dialog = inject(MatDialog);
  readonly userService = inject(UserService);

  openDialog(): void {
    const currentUser = this.userService.currentUser;
    const currentUserId = this.userService.currentUserId;

    this.dialog.open(UserCardComponent, {
      data: {
      user: currentUser,
      urlUserId: currentUserId
     }
    });
  }
}
