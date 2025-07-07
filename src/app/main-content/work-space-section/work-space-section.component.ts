import { ChangeDetectionStrategy, Component, inject, OnInit, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { UserCardComponent } from './user-card/user-card.component';
import { User } from '../../../models/user.class';
import { AsyncPipe, NgIf } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { CreateChannelSectionComponent } from '../create-channel-section/create-channel-section.component';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';


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
    AsyncPipe,
    NgIf
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './work-space-section.component.html',
  styleUrl: './work-space-section.component.scss'
})
export class WorkSpaceSectionComponent implements OnInit {

  constructor(private route: ActivatedRoute) { }

  isDrawerOpen: boolean = false;
  selectedUser: any;
  urlUserId!: string;
  dataUser = inject(UserService);

  /* dialog = inject(MatDialog); */

  accordion = viewChild.required(MatAccordion);

  firestore = inject(Firestore);
  itemCollection = collection(this.firestore, 'users');
  item$ = collectionData(this.itemCollection, { idField: 'userId' });

  ngOnInit() {
    this.getUserIdFromUrl();
  }

  toggleDrawer(drawer: MatDrawer) {
    this.isDrawerOpen = !this.isDrawerOpen;
    drawer.toggle();
  }

  onUserClick(index: number, user: any) {
    this.selectedUser = user;

  }

  readonly dialog = inject(MatDialog);

  openDialog(index: number, user: any) {
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

  getUserIdFromUrl() {
    this.route.params.subscribe(parms => {
      this.urlUserId = parms['id'];
    })
  }

  isCurrentUser(): boolean {
    return this.dataUser.currentUserId === this.urlUserId;
  }
}