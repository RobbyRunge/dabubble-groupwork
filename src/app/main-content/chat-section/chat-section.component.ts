import { Component, inject, Injector, OnInit, runInInjectionContext } from '@angular/core';
import { WorkSpaceSectionComponent } from "../work-space-section/work-space-section.component";
import { ThreadSectionComponent } from "../thread-section/thread-section.component";
import { HeaderComponent } from "../header/header.component";
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { docData, onSnapshot } from '@angular/fire/firestore';
import { User } from '../../../models/user.class';
import { Observable, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ChannelSectionComponent } from '../channel-section/channel-section.component';
import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { UserCardComponent } from '../user-card/user-card.component';


@Component({
  selector: 'app-chat-section',
  imports: [
    WorkSpaceSectionComponent,
    ThreadSectionComponent,
    HeaderComponent,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    NgIf,
    NgFor,
    AsyncPipe,
    NgClass
  ],
  templateUrl: './chat-section.component.html',
  styleUrl: './chat-section.component.scss'
})

export class ChatSectionComponent implements OnInit {

  dataUser = inject(UserService);
  private injector = inject(Injector);
  route = inject(ActivatedRoute);
  dialog = inject(MatDialog);
  readonly userDialog = inject(MatDialog);
  messageText: string = '';
  unsubscribeUserData!: Subscription;
  private routeSub?: Subscription;
  unsubscribeUserChannels?: () => void;
  imgSrcReaction: any = 'add reaction.png';
  imgSrcMention: any = 'mention.png'
  imgSrcSend: any = 'send.png';
  users$: Observable<User[]> | undefined;
  showUserList: boolean = false;
  showChanelList: boolean = false;
  selectedUser: any;

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      this.dataUser.currentUserId = params['id'];
      this.showCurrentUserData();
      this.showUserChannel();
      this.users$ = this.dataUser.getAllUsers();
      this.getUserData()
    });
  }

  getUserData(){
    this.dataUser.isChecked$.subscribe(user => {
     this.selectedUser = user
    })
  }

  showCurrentUserData() {
    const userRef = this.dataUser.getSingleUserRef(this.dataUser.currentUserId);
    this.unsubscribeUserData = runInInjectionContext(this.injector, () => docData(userRef).subscribe(data => {
      this.dataUser.currentUser = new User(data);
    }));
  }

  showUserChannel() {
    const channelRef = this.dataUser.getChannelRef();
    this.unsubscribeUserChannels = runInInjectionContext(this.injector, () =>onSnapshot(channelRef, (element) => {
      this.dataUser.channels = [];
      element.forEach(doc => {
        this.dataUser.channels.push({ ...doc.data(), channelId: doc.id });
      })
    }));
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    if (this.unsubscribeUserChannels) {
      this.unsubscribeUserChannels();
    }
  }

  openDialog(button: HTMLElement) {
    const rect = button.getBoundingClientRect();
    const dialog = this.dialog.open(ChannelSectionComponent, {
       position: {
      top: `${rect.bottom + window.scrollY}px`,   // unterhalb des Buttons
      left: `${rect.left + window.scrollX}px`,    // auf gleicher horizontaler Position
    },
      width: '872px',
      height: '612px',
      maxWidth: '872px',
      maxHeight: '612px',
      panelClass: 'channel-dialog-container'
    });
  }

  userMention() {
    this.messageText += '@';
    this.onInputChange();
  }



  onInputChange(): void {
    this.checkInputFieldForUserMention();
    this.checkInputFieldForChannelMention();
  }



  checkInputFieldForUserMention() {
    const cursorPosition = this.messageText.lastIndexOf('@');
    if (cursorPosition === -1) {
      this.showUserList = false;
      return;
    }

    const afterAt = this.messageText.substring(cursorPosition + 1);

    if (afterAt.length === 0 || /^[a-zA-ZäöüÄÖÜß]*$/.test(afterAt)) {
      this.showUserList = true;
    } else {
      this.showUserList = false;
    }
  }

  checkInputFieldForChannelMention() {
    const cursorPosition = this.messageText.lastIndexOf('#');
    if (cursorPosition === -1) {
      this.showChanelList = false;
      return;
    }

    const afterAt = this.messageText.substring(cursorPosition + 1);

    if (afterAt.length === 0 || /^[a-zA-ZäöüÄÖÜß]*$/.test(afterAt)) {
      this.showChanelList = true;
    } else {
      this.showChanelList = false;
    }
  }

  selecetedUserMention(user: User, index: number) {
    this.messageText += user.name;
    this.showUserList = false;
  }

  openUserDialog(){
    this.userDialog.open(UserCardComponent, {
      data: {user: this.selectedUser}
    })
  }
}