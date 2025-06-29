import { Injectable, inject } from '@angular/core';
import { Firestore, collection, query, where, getDocs, addDoc } from '@angular/fire/firestore';
import { User } from '../../models/user.class';

@Injectable({ providedIn: 'root' })
export class UserService {
  private firestore = inject(Firestore);

  async login(email: string, password: string) {
    const usersCollection = collection(this.firestore, 'users');

    const userQuery = query(
      usersCollection,
      where('email', '==', email),
      where('password', '==', password)
    );

    const result = await getDocs(userQuery);

    return !result.empty;
  }

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