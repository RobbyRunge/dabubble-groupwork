import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import {  MatDialog } from '@angular/material/dialog';
import { EditLogoutUserComponent } from './edit-logout-user/edit-logout-user.component';
import { ChannelService } from '../../services/channel.service';

@Component({
  selector: 'app-header',
  imports: [
    MatIconModule,
    MatButtonModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    CommonModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  value = 'Clear me';
  readonly dialog = inject(MatDialog);
  dataUser = inject(UserService);
  channelService = inject(ChannelService);

  openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(EditLogoutUserComponent, {
      width: '250px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }
}