import { Component, EventEmitter, Inject, Input, Output, } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../../../models/user.class';
import { MatIcon } from '@angular/material/icon';
import { NgClass } from '@angular/common';


@Component({
  selector: 'app-user-card',
  imports: [MatIcon, NgClass],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.scss'
})

export class UserCardComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: {user: User}, private dialogRef: MatDialogRef<UserCardComponent>) {}

closeDialog(){
this.dialogRef.close();
}



}

