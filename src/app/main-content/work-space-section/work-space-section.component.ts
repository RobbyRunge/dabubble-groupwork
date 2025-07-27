import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { UserCardComponent } from '../user-card/user-card.component';
import { AsyncPipe, CommonModule, NgFor } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { CreateChannelSectionComponent } from '../create-channel-section/create-channel-section.component';
import { UserService } from '../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription, timestamp } from 'rxjs';
import { User } from '../../../models/user.class';
import { Allchannels } from '../../../models/allchannels.class';
import { ChannelService } from '../../services/channel.service';
import { ChatService } from '../../services/chat.service';

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
    CommonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './work-space-section.component.html',
  styleUrl: './work-space-section.component.scss',
})
export class WorkSpaceSectionComponent implements OnInit {

  dataUser = inject(UserService);
  channelService = inject(ChannelService);
  chatService = inject(ChatService);
  private router = inject(Router);
  route = inject(ActivatedRoute);
  unsubChannels!: Subscription;
  newChannel = new Allchannels();
  isDrawerOpen = false;
  selectedUser: any;
  urlUserId!: string;
  users$: Observable<User[]> | undefined;
  myPanel: any = true;

  channels$: Observable<Allchannels[]> | undefined;

  /* dialog = inject(MatDialog); */

  accordion = viewChild.required(MatAccordion);
  activeChannelId!: string;


  onChange(user: any){
  console.log(user);
  }

   ngOnInit(): void {
    this.channels$ = this.channelService.showChannelByUser$;
    this.users$ = this.dataUser.getAllUsers();
    this.channelService.showCurrentUserData();
    this.unsubChannels = this.channelService.channelsLoaded$.subscribe(loaded => {
      if (loaded) {
        console.log('channel route', this.channelService.userSubcollectionChannelId);
        this.loadSaveRoute();
      }
    });
  }

  toggleDrawer(drawer: MatDrawer) {
    this.isDrawerOpen = !this.isDrawerOpen;
    drawer.toggle();
  }

  async onUserClick(index: number, user: any) {
    this.selectedUser = user;
    this.channelService.setCheckdValue(user);
    this.dataUser.chatId = await this.chatService.getOrCreateChatId(this.channelService.currentUserId, user.userId);
    this.router.navigate(['/mainpage', this.channelService.currentUserId, 'chats', this.dataUser.chatId]);
    this.chatService.listenToMessages();
    this.dataUser.showChannel = false;
    this.dataUser.showChatPartnerHeader = true;
  }

  readonly dialog = inject(MatDialog);

  createChannel() {
    this.dialog.open(CreateChannelSectionComponent, {
      width: '872px',
      height: '539px',
      maxWidth: '872px',
      maxHeight: '539px',
      panelClass: 'channel-dialog-container',
    });
  }

  loadSaveRoute() {
    const channelId = this.channelService.userSubcollectionChannelId;
    if (channelId) {
      this.router.navigate(['mainpage', this.channelService.currentUserId, 'channel', channelId,]); 
    } else {
      this.router.navigate(['mainpage', this.channelService.currentUserId]);
    }
  }

  openChannel(channelName: string, channelId: string, channelDescription: string) {
    console.log('channels by user', this.channelService.showChannelByUser);
    this.dataUser.showChannel = true;
    this.dataUser.showChatPartnerHeader = false;
    this.router.navigate(['mainpage', this.channelService.currentUserId, 'channel', channelId,]);
    this.newChannel.channelname = channelName;
    this.newChannel.channelId = channelId;
    this.newChannel.description = channelDescription;
    this.getChannelNameandId(channelName, channelId, channelDescription);
    this.channelService.updateUserStorage(this.channelService.currentUserId, this.channelService.userSubcollectionId, this.newChannel.toJSON())
  }

  getChannelNameandId(channelName: string, channelId: string, channelDescription: string) {
    this.activeChannelId = channelId;
    this.channelService.currentChannelId = channelId;
    this.channelService.currentChannelName = channelName;
    this.channelService.currentChannelDescription = channelDescription;
    this.channelService.getChannelUserId(this.activeChannelId);
    this.dataUser.getUserIdsFromChannel(channelId);
  }

  ngOnDestroy(): void {
    this.unsubChannels.unsubscribe();
  }
}