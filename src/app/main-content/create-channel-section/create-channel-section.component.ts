import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-create-channel-section',
  imports: [MatIcon, MatInputModule, MatButtonModule],
  templateUrl: './create-channel-section.component.html',
  styleUrl: './create-channel-section.component.scss'
})
export class CreateChannelSectionComponent {

  dialogRef = inject(MatDialogRef<CreateChannelSectionComponent>);

}