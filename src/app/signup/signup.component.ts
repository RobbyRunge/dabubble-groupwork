import { Component, inject } from '@angular/core';
import { HeaderStartComponent } from "../shared/header-start/header-start.component";
import { RouterLink } from '@angular/router';
import { FooterStartComponent } from "../shared/footer-start/footer-start.component";
import { User } from '../../models/user.class';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-signup',
  imports: [HeaderStartComponent, RouterLink, FooterStartComponent, FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  isPolicyAccepted = false;
  isHovering = false;
  user = new User();
  firestore = inject(Firestore);

  togglePolicy() {
    this.isPolicyAccepted = !this.isPolicyAccepted;
  }

  getCheckboxImage(): string {
    if (this.isPolicyAccepted) {
      return this.isHovering ? 'signup/box-checked-hover.png' : 'signup/box-checked.png';
    } else {
      return this.isHovering ? 'signup/box-hover.png' : 'signup/box.png';
    }
  }

  async saveUser() {
    try {
      const usersCollection = collection(this.firestore, 'users');
      const userRef = await addDoc(usersCollection, { ...this.user });

      const channelsCollection = collection(this.firestore, `users/${userRef.id}/channels`);
      await addDoc(channelsCollection, {});

      const chatsCollection = collection(this.firestore, `users/${userRef.id}/chats`);
      await addDoc(chatsCollection, {});
      
      console.log('User saved:', this.user);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  }
}
