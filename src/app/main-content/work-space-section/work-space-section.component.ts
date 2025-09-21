import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
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
import { combineLatest, filter, firstValueFrom, Observable, Subscription, switchMap, take, timestamp } from 'rxjs';
import { User } from '../../../models/user.class';
import { Allchannels } from '../../../models/allchannels.class';
import { ChannelService } from '../../services/channel.service';
import { ChatService } from '../../services/chat.service';
import { Userstorage } from '../../../models/userStorage.class';
import { FormsModule } from '@angular/forms';

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
    FormsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './work-space-section.component.html',
  styleUrl: './work-space-section.component.scss',
})
export class WorkSpaceSectionComponent implements OnInit, OnDestroy {

  dataUser = inject(UserService);
  channelService = inject(ChannelService);
  chatService = inject(ChatService);
  private router = inject(Router);
  route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  unsubChannels!: Subscription;
  private userDataSub?: Subscription;
  private channelDataSub?: Subscription;
  newChannel = new Allchannels();
  userstorage = new Userstorage();
  isDrawerOpen = true;
  selectedUser: any;
  urlUserId!: string;
  users$: Observable<User[]> | undefined;
  myPanel: any = true;

  channels$: Observable<Allchannels[]> | undefined;
  onlineUser: string = 'status/online.png';
  offlineUser: string = 'status/offline.png';
  imgSrc: string = 'work-space/edit-square.png';

  accordion = viewChild.required(MatAccordion);
  activeChannelId!: string;
  activeUserId!: string;
  searchTerm: string = '';


  onChange(user: any) {
    console.log(user);
  }

  ngOnInit(): void {
    this.channels$ = this.channelService.showChannelByUser$;
    this.users$ = this.dataUser.getAllUsers();
    this.dataUser.showCurrentUserData();
    this.getUserData();
    this.getChannelData();

    combineLatest([
      this.channelService.channelsLoaded$.pipe(filter(Boolean)),
      this.channelService.showChannelByUser$
    ])
      .pipe(take(1))
      .subscribe(([_, channels]) => {
        if (channels?.length) {
          const c = channels[0];
          this.openChannel('channels', c.channelname, c.channelId, c.description ?? '');
        }
      });
  }

  getUserData() {
    this.userDataSub = this.channelService.isChecked$.subscribe(user => {
      console.log('WorkSpace: User selection changed:', user);
      this.selectedUser = user;
      this.activeUserId = user?.userId || '';
      if (user?.userId) {
        this.activeChannelId = '';
      }
      this.cdr.detectChanges();
    })
  }

  getChannelData() {
    this.channelDataSub = this.channelService.activeChannelId$.subscribe(channelId => {
      this.activeChannelId = channelId;
      if (channelId) {
        this.activeUserId = '';
      }
      this.cdr.detectChanges();
    })
  }

  toggleDrawer(drawer: MatDrawer) {
    this.isDrawerOpen = !this.isDrawerOpen;
    drawer.toggle();
  }

  readonly dialog = inject(MatDialog);

  createChannel() {
    (document.activeElement as HTMLElement)?.blur();
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
      this.router.navigate(['mainpage', this.channelService.currentUserId, 'channels', channelId,]);
    } else {
      this.router.navigate(['mainpage', this.channelService.currentUserId]);
    }
  }

  async openChannel(type: string, channelName: string, channelId: string, channelDescription: string,) {
    this.chatService.chatMode = 'channels';
    this.dataUser.showChannel = true;
    this.dataUser.showChatPartnerHeader = false;
    this.activeUserId = '';
    this.router.navigate(['mainpage', this.channelService.currentUserId, 'channels', channelId,]);
    this.userstorage.channelId = channelId;
    this.userstorage.showChannel = true;
    this.getChannelNameandId(channelName, channelId, channelDescription);
    this.channelService.updateUserStorage(this.channelService.currentUserId, this.channelService.userSubcollectionId, this.userstorage.toJSON(['channelId', 'showChannel']));
    this.chatService.checkIfChatOrChannel();
    this.chatService.listenToMessages(type);
    this.chatService.getChannelMessages(channelId);
    this.channelService.setCheckdValue(channelId);
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
    this.userDataSub?.unsubscribe();
    this.channelDataSub?.unsubscribe();
  }

  onSearchInput() {
    const term = this.searchTerm;
    /*     if (this.isChannelSearch(term)) {
          this.dropdownType = 'channel';
          const channelKeyword = this.extractKeyword(term, '#');
          this.searchChannels(channelKeyword);
        } else if (this.isUserSearch(term)) {
          this.dropdownType = 'user';
          const userKeyword = this.extractKeyword(term, '@');
          this.searchUsers(userKeyword);
        } else {
          this.dropdownType = 'normal';
          this.searchSubject.next(term);
        }
        this.showDropdown = term.length > 0; */
  }
}