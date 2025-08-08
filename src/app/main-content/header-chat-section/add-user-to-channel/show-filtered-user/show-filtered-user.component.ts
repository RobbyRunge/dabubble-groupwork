import { Component } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-show-filtered-user',
  imports: [MatListModule, MatDividerModule],
  templateUrl: './show-filtered-user.component.html',
  styleUrl: './show-filtered-user.component.scss'
})
export class ShowFilteredUserComponent {

}
