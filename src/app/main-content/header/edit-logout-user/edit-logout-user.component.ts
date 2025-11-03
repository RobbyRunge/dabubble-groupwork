import { Component, Inject, inject, Optional } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { UserCardComponent } from '../../user-card/user-card.component';
import { User } from '../../../../models/user.class';
import { UserService } from '../../../services/user.service';
import { Router } from '@angular/router';
import { ChannelService } from '../../../services/channel.service';
import { ChatService } from '../../../services/chat.service';
import { NavigationService } from '../../../services/navigation.service';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-edit-logout-user',
  imports: [MatButtonModule, MatDialogActions],
  templateUrl: './edit-logout-user.component.html',
  styleUrl: './edit-logout-user.component.scss'
})
export class EditLogoutUserComponent {
  private openingNewDialog = false;
  
  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public dialogData: { user: User; urlUserId: string } | null,
    @Optional() @Inject(MAT_BOTTOM_SHEET_DATA) public sheetData: { user: User; urlUserId: string } | null,
    @Optional() private dialogRef?: MatDialogRef<EditLogoutUserComponent>,
    @Optional() private bottomSheetRef?: MatBottomSheetRef<EditLogoutUserComponent>
  ) {
    if (this.bottomSheetRef) {
      this.bottomSheetRef.afterDismissed().subscribe(() => {
        if (!this.openingNewDialog) {
          this.navigationService.setDialogOpen(false);
        }
      });
    }
  }

  private router = inject(Router);
  readonly userDialog = inject(MatDialog);
  readonly userService = inject(UserService);
  readonly channelService = inject(ChannelService);
  readonly chatService = inject(ChatService);
  readonly navigationService = inject(NavigationService);
  private dataUser = this.userService;


  openUserDialog() {
    this.openingNewDialog = true;
    const dialogRef = this.userDialog.open(UserCardComponent, {
      panelClass: 'user-profil',
      data: { 
        user: this.channelService.currentUser, 
        urlUserId: this.channelService.currentUserId 
      }
    });
    this.close();
    dialogRef.afterClosed().subscribe(() => {
      this.navigationService.setDialogOpen(false);
    });
  }

  close(): void {
    this.dialogRef?.close();
    this.bottomSheetRef?.dismiss();
  }
  
  closeAndResetDialog(): void {
    this.dialogRef?.close();
    this.bottomSheetRef?.dismiss();
    this.navigationService.setDialogOpen(false);
  }

  async logout() {
    this.openingNewDialog = true;
    await this.userService.updateUserDocument(this.userService.channelService.currentUserId, { active: false });
    this.router.navigate(['']);
    this.closeAndResetDialog();
    this.dataUser.showChannel = false;
    this.dataUser.showChatPartnerHeader = false;
    this.dataUser.showNewMessage = true;
    this.chatService.showThread = false;
  }
}
