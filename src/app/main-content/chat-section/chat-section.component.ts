import { Component, inject, OnInit } from '@angular/core';
import { WorkSpaceSectionComponent } from "../work-space-section/work-space-section.component";
import { ThreadSectionComponent } from "../thread-section/thread-section.component";
import { HeaderComponent } from "../header/header.component";
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { collectionData, docData, onSnapshot } from '@angular/fire/firestore';
import { User } from '../../../models/user.class';
import { Subscription } from 'rxjs';


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

  currentUserId!: string;

  currentUser?: User;

  channels?:  any;

  channelId!: string;

  unsubscribeUserData!: Subscription;
  private routeSub?: Subscription;

   ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
    this.currentUserId = params['id'];
     this.showCurrentUserData();
     this.showUserChannel();
    });
    setTimeout(() => {
      console.log(this.channelId);
      console.log(this.channels);
      
    }, 1000);
  }

  showCurrentUserData() {
    const userRef = this.dataUser.getSingleUserRef(this.currentUserId);
    this.unsubscribeUserData = docData(userRef).subscribe(data => {
    this.currentUser = new User(data);
    console.log(this.currentUser);
    
    });
  }

  showUserChannel() {    
   const channelsRef = this.dataUser.getChanbelRef(this.currentUserId);
  this.unsubscribeUserData = collectionData(channelsRef, { idField: 'id' }).subscribe(data => {
    this.channels = data;
    this.channelId = data[0].id;
    console.log(this.channels);
  });
  }

  ngOnDestroy(): void {
    this.unsubscribeUserData.unsubscribe();
    this.routeSub?.unsubscribe();
}
  
}