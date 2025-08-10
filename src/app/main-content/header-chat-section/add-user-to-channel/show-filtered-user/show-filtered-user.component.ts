import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-show-filtered-user',
  imports: [MatListModule],
  templateUrl: './show-filtered-user.component.html',
  styleUrl: './show-filtered-user.component.scss'
})
export class ShowFilteredUserComponent {
}