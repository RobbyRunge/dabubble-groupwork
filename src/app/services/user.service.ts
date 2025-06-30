import { Injectable, inject } from '@angular/core';
import { Firestore, collection, query, where, getDocs, addDoc, onSnapshot, doc, CollectionReference } from '@angular/fire/firestore';
import { User } from '../../models/user.class';

@Injectable({ providedIn: 'root' })
export class UserService {
  
  private firestore = inject(Firestore);
  
  userData: User[] = [];

  getUsersCollection(): CollectionReference {
    return collection(this.firestore, 'users');
  }
  
  async login(email: string, password: string) {

    const userQuery = query(
      this.getUsersCollection(),
      where('email', '==', email),
      where('password', '==', password)
    );

    const result = await getDocs(userQuery);

    return !result.empty;
  }

  async createUserWithSubcollections(user: User) {
    
    const userRef = await addDoc(this.getUsersCollection(), { ...user });

    const channelsCollection = collection(this.firestore, `users/${userRef.id}/channels`);
    await addDoc(channelsCollection, {});

    const chatsCollection = collection(this.firestore, `users/${userRef.id}/chats`);
    await addDoc(chatsCollection, {});

    return userRef;
  }

  showUserData() {
    return onSnapshot(this.getUsersCollection(), (element) => {
      this.userData = [];
      element.forEach((docSnap) => {
         this.userData.push(new User({...docSnap.data(), id: docSnap.id   }));
        const collChannel = collection(this.getUsersCollection(), docSnap.id, 'channel');
        onSnapshot(collChannel, (dataChannel) => {
            const userIndex = this.userData.findIndex(u => u.id === docSnap.id);
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