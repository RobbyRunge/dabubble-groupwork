import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { User } from '../../models/user.class';

@Injectable({ providedIn: 'root' })
export class UserService {
  private firestore = inject(Firestore);

  async createUserWithSubcollections(user: User) {
    const usersCollection = collection(this.firestore, 'users');
    const userRef = await addDoc(usersCollection, { ...user });

    const channelsCollection = collection(this.firestore, `users/${userRef.id}/channels`);
    await addDoc(channelsCollection, {});

    const chatsCollection = collection(this.firestore, `users/${userRef.id}/chats`);
    await addDoc(chatsCollection, {});

    return userRef;
  }
}