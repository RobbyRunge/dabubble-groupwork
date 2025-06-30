import { Injectable, inject } from '@angular/core';
import { Firestore, collection, query, where, getDocs, addDoc, onSnapshot, doc } from '@angular/fire/firestore';
import { User } from '../../models/user.class';
import { Channels } from '../../models/channels.class';

@Injectable({ providedIn: 'root' })
export class UserService {
  private firestore = inject(Firestore);

  userData: User[] = [];

  channels: Channels[] = [];

  usersCollection = collection(this.firestore, 'users');

  channelCollection = collection(this.firestore, 'channnels');

  chatCollection = collection(this.firestore, 'chats');
  

  async login(email: string, password: string) {

    const userQuery = query(
      this.usersCollection,
      where('email', '==', email),
      where('password', '==', password)
    );

    const result = await getDocs(userQuery);

    return !result.empty;
  }

  async createUserWithSubcollections(user: User) {
    
    const userRef = await addDoc(this.usersCollection, { ...user });

    const channelsCollection = collection(this.firestore, `users/${userRef.id}/channels`);
    await addDoc(channelsCollection, {});

    const chatsCollection = collection(this.firestore, `users/${userRef.id}/chats`);
    await addDoc(chatsCollection, {});

    return userRef;
  }

  showUserData() {
    onSnapshot(this.usersCollection, (element) => {
      this.userData = [];
      element.forEach((doc) => {
         this.userData.push(new User({...doc.data(), id: doc.id   }));
        const collChannel = collection(this.usersCollection, doc.id, 'channel');
        onSnapshot(collChannel, (dataChannel) => {
            const userIndex = this.userData.findIndex(u => u.id === doc.id);
            const channels: { data: any; id: string }[] = []; 
            dataChannel.forEach((channelDoc) => {
              channels.push({data: channelDoc.data(), id: channelDoc.id })
          });
          if (userIndex !== -1) {
          this.userData[userIndex].channels = channels;
          }
        });
      });
      console.log(this.userData);
    });
  }

}