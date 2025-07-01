import { Component, inject, OnInit } from '@angular/core';
import { WorkSpaceSectionComponent } from "../work-space-section/work-space-section.component";
import { ThreadSectionComponent } from "../thread-section/thread-section.component";
import { HeaderComponent } from "../header/header.component";
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { onSnapshot } from '@angular/fire/firestore';
import { User } from '../../../models/user.class';


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

  currentUser!: User;

  private unsubscribeUserData!: () => void;

   ngOnInit(): void {
    this.route.params.subscribe(params => {
    this.currentUserId = params['id'];
    });
    this.unsubscribeUserData = this.showCurrentUserData();
  }

  showCurrentUserData() {
    return onSnapshot(this.dataUser.getSingleUserRef(this.currentUserId), (element) => {
      this.currentUser = new User({ ...element.data(), id: element.id });
      console.log(this.currentUser);
    });
  }

  ngOnDestroy(): void {
    if (this.unsubscribeUserData) {
      this.unsubscribeUserData();
    }
  }
  
}