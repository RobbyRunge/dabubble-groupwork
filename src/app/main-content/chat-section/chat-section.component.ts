import { Component, inject, OnInit } from '@angular/core';
import { WorkSpaceSectionComponent } from "../work-space-section/work-space-section.component";
import { ThreadSectionComponent } from "../thread-section/thread-section.component";
import { HeaderComponent } from "../header/header.component";
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ChannelSectionComponent } from '../channel-section/channel-section.component';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-chat-section',
  imports: [
    WorkSpaceSectionComponent,
    ThreadSectionComponent,
    HeaderComponent,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule
],
  templateUrl: './chat-section.component.html',
  styleUrl: './chat-section.component.scss'
})

export class ChatSectionComponent implements OnInit {

  dataUser = inject(UserService);
  route = inject(ActivatedRoute);
  dialog = inject(MatDialog);

  private routeSub?: Subscription;   

   ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
    this.dataUser.currentUserId = params['id'];
     this.dataUser.showCurrentUserData();
     this.dataUser.showUserChannel();
    });
  }

  openDialog() {
    this.dialog.open(ChannelSectionComponent, {
      width: '872px',
      height: '616px',
      maxWidth: '872px',     
      maxHeight: '616px',
      panelClass: 'channel-dialog-container'
    });
}

 ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
   }
  
}