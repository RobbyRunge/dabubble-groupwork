import { Component, EventEmitter, inject, Inject, Input, OnInit, Output, } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../../../models/user.class';
import { MatIcon } from '@angular/material/icon';
import { NgClass, NgIf } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { FormsModule, NgModel } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [MatIcon, NgClass, FormsModule, NgIf],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.scss'
})

export class UserCardComponent {
  newName = '';
  urlUserId: string;
  dataUser = inject(UserService);
  userUpdateNameAktiv: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { user: User, urlUserId: string }, private dialogRef: MatDialogRef<UserCardComponent>,
    private userService: UserService,
  ) {
    this.urlUserId = data.urlUserId;
  }
  ngOnInit() {
    console.log('Übergebener User:', this.data.user);
    console.log('User-ID im Dialog:', this.data.user.userId);
    console.log('CurrentUserId im Service:', this.dataUser.currentUserId);
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
    return this.data.user.userId === this.dataUser.currentUserId;
  }

  changeName() {
    this.userUpdateNameAktiv = true;
  }

  discardChangeName() {
    this.userUpdateNameAktiv = false;
  }
}

