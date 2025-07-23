import { Component, EventEmitter, inject, Inject, Input, OnInit, Output, } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../../models/user.class';
import { MatIcon } from '@angular/material/icon';
import { NgClass, NgIf } from '@angular/common';
import { UserService } from './../../services/user.service'
import { FormsModule, NgModel } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ChannelService } from '../../services/channel.service';


@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [MatIcon, NgClass, FormsModule, NgIf],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.scss'
})

export class UserCardComponent implements OnInit {
  newName = '';
  urlUserId: string;
  dataUser = inject(UserService);
  channelService = inject(ChannelService);
  userUpdateNameAktiv: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { user: User, urlUserId: string }, private dialogRef: MatDialogRef<UserCardComponent>,
    private userService: UserService,
    private route: ActivatedRoute
  ) {
    this.urlUserId = data.urlUserId;
  }
  ngOnInit() {
    this.checkUserId();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  async updateName() {
    try {
      await this.userService.updateUserName(this.newName);
      alert('Name erfolgreich geändert!');
    } catch (err) {
      console.error('Fehler beim Aktualisieren des Namens:', err);
    }
  }

  checkUserId() {
    return this.urlUserId === this.channelService.currentUserId;
  }

  changeName() {
    this.userUpdateNameAktiv = true;
  }

  discardChangeName() {
    this.userUpdateNameAktiv = false;
  }

    getUserIdFromUrl() {
    this.route.params.subscribe(parms => {
      this.urlUserId = parms['id'];
    })
  }

  isCurrentUser(): boolean {
    return this.channelService.currentUserId === this.urlUserId;
  }
}

