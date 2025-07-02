import { Component, inject, OnInit } from '@angular/core';
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
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ChannelSectionComponent } from '../channel-section/channel-section.component';


@Component({
  selector: 'app-chat-section',
  imports: [
    WorkSpaceSectionComponent,
    ThreadSectionComponent,
    HeaderComponent,
    FormsModule,
    MatFormFieldModule,
    MatInputModule
],
  templateUrl: './chat-section.component.html',
  styleUrl: './chat-section.component.scss'
})

export class ChatSectionComponent implements OnInit {

  dataUser = inject(UserService);
  route = inject(ActivatedRoute);
  dialog = inject(MatDialog);

  unsubscribeUserData!: Subscription;
  private routeSub?: Subscription;

   ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
    this.dataUser.currentUserId = params['id'];
     this.showCurrentUserData();
     this.showUserChannel();
    });
    setTimeout(() => {
      console.log(this.dataUser.channels);
    }, 2000);
  }

  showCurrentUserData() {
    const userRef = this.dataUser.getSingleUserRef(this.dataUser.currentUserId);
    this.unsubscribeUserData = docData(userRef).subscribe(data => {
    this.dataUser.currentUser = new User(data);
    console.log(this.dataUser.currentUserId);
    console.log(this.dataUser.currentUser);
    
    });
  }

  showUserChannel() {    
    const channelsRef = this.dataUser.getChannelRef(this.dataUser.currentUserId);
    this.dataUser.channels = [];
    onSnapshot(channelsRef, (element) => {
    element.forEach(doc => {
      this.dataUser.channels.push({ ...doc.data(), channelId: doc.id });
      });
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeUserData.unsubscribe();
    this.routeSub?.unsubscribe();
}

openDialog() {
  const dialog = this.dialog.open(ChannelSectionComponent, {
    width: '872px',
    height: '616px',
    maxWidth: '872px',     
    maxHeight: '616px',
    panelClass: 'channel-dialog-container'
  });
  dialog.componentInstance.currentUser = new User(this.dataUser.currentUser); 
  dialog.componentInstance.currentUserId = this.dataUser.currentUserId;
  dialog.componentInstance.channels = this.dataUser.channels;
}
  
}