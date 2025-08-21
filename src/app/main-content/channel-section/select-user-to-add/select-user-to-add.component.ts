import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-select-user-to-add',
  imports: [MatIcon, MatRadioModule],
  templateUrl: './select-user-to-add.component.html',
  styleUrl: './select-user-to-add.component.scss'
})
export class SelectUserToAddComponent {
  dialog = inject(MatDialogRef<SelectUserToAddComponent>);
}
