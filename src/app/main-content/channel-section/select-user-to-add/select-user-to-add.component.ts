import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-select-user-to-add',
  imports: [MatIcon, MatRadioModule, MatButtonModule, FormsModule, CommonModule],
  templateUrl: './select-user-to-add.component.html',
  styleUrl: './select-user-to-add.component.scss'
})
export class SelectUserToAddComponent {
  dialog = inject(MatDialogRef<SelectUserToAddComponent>);
  selectAllUsersInChannel: boolean | null = null;
  isEnabled = false;

  createChannel() {
    console.log('select number', this.selectAllUsersInChannel);
  }

  checkboxValue() {
    if (this.selectAllUsersInChannel === true) {
      this.isEnabled = true;
    } else {
      this.isEnabled = false;
    }
    console.log('select users', this.selectAllUsersInChannel);
  }
}