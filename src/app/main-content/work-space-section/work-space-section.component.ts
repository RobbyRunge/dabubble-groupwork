import { ChangeDetectionStrategy, Component, inject, OnInit, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { UserCardComponent } from '../user-card/user-card.component';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { CreateChannelSectionComponent } from '../create-channel-section/create-channel-section.component';
import { UserService } from '../../services/user.service';
import { Observable } from 'rxjs';
import { User } from '../../../models/user.class';


@Component({
  selector: 'app-work-space-section',
  imports: [
    MatButtonModule,
    MatSidenavModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIcon,
    MatExpansionModule,
    MatAccordion,
    MatInputModule,
    NgFor,
    AsyncPipe,
    NgIf
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './work-space-section.component.html',
  styleUrl: './work-space-section.component.scss'
})
export class WorkSpaceSectionComponent implements OnInit {

  isDrawerOpen: boolean = false;
  selectedUser: any;
  urlUserId!: string;
  dataUser = inject(UserService);
  users$: Observable<User[]> | undefined;

  constructor(private userService: UserService) { }

  ngOnInit() :void {
    this.users$ = this.userService.getAllUsers();
  }
  /* dialog = inject(MatDialog); */

  accordion = viewChild.required(MatAccordion);

  toggleDrawer(drawer: MatDrawer) {
    this.isDrawerOpen = !this.isDrawerOpen;
    drawer.toggle();
  }

  onUserClick(index: number, user: any) {
    this.selectedUser = user;

  }

  readonly dialog = inject(MatDialog);

  openDialog(index: number, user: User) {
    const urlUserId = this.urlUserId
    this.dialog.open(UserCardComponent, {
      data: { user, urlUserId },
    });
  }

  createChannel() {
    this.dialog.open(CreateChannelSectionComponent, {
      width: '872px',
      height: '539px',
      maxWidth: '872px',
      maxHeight: '539px',
      panelClass: 'channel-dialog-container'
    });
  }
}