import { Component, Inject, Input, } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from '../../../../models/user.class';


@Component({
  selector: 'app-user-card',
  imports: [],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.scss'
})

export class UserCardComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: {user: User}) {}

}

