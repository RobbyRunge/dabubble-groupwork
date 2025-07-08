import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
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
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { CreateChannelSectionComponent } from '../create-channel-section/create-channel-section.component';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';


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
    CommonModule
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './work-space-section.component.html',
  styleUrl: './work-space-section.component.scss'
})
export class WorkSpaceSectionComponent {

  dataUser = inject(UserService);
  private router = inject(Router);
  
  isDrawerOpen = false;
  selectedUser: any;
  activeChannelId: string | null = null;


  toggleDrawer(drawer: MatDrawer) {
    this.isDrawerOpen = !this.isDrawerOpen;
    drawer.toggle();
  }

  accordion = viewChild.required(MatAccordion);

  firestore = inject(Firestore);
  itemCollection = collection(this.firestore, 'users');
  item$ = collectionData(this.itemCollection);

  onUserClick(index: number, user: any) {
    this.selectedUser = user;

  }

  readonly dialog = inject(MatDialog);

  openDialog(index: number, user: any) {
    this.dialog.open(UserCardComponent, {
      data: { user },
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

  openChannel(channelId: string, channelName: string) {
    console.log('Aktiver Channel:', this.activeChannelId);
    this.activeChannelId = channelId;
    this.router.navigate(['mainpage', this.dataUser.currentUserId, 'channel', channelId]);
    this.dataUser.currentChannelId = channelId;
    this.dataUser.cuurrenChannelName = channelName;
  }
}