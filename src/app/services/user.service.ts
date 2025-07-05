import { Injectable, inject } from '@angular/core';
import { Firestore, collection, query, where, getDocs, addDoc, onSnapshot, doc, CollectionReference, collectionData, getDoc } from '@angular/fire/firestore';
import { User } from '../../models/user.class';
import { Channel } from '../../models/channel.class';

@Injectable({ providedIn: 'root' })
export class UserService {
  

  private firestore = inject(Firestore);
  
  userData: User[] = [];
  currentUser?: User;
  channels: any[] = [];
  currentUserId!: string;
  createChannel!: Channel;
  showChannelByUser: any[] = [];
  channelCreaterId!: string;
  channelCreaterName: string = '';
  channelCreaterLastname: string = '';


  loginIsSucess = false;

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

    if(!result.empty) {
      const userDoc = result.docs[0];
      this.currentUserId = userDoc.id;
      this.loginIsSucess = true;
    } 
  }

  async createUserWithSubcollections(user: User) {
    
    const userRef = await addDoc(this.getUsersCollection(), { ...user });

    const channelsCollection = collection(this.firestore, `users/${userRef.id}/channels`);
    await addDoc(channelsCollection, {});

    const chatsCollection = collection(this.firestore, `users/${userRef.id}/chats`);
    await addDoc(chatsCollection, {});

    return userRef;
  }

  getSingleUserRef(docId: string) {
    return doc((this.getUsersCollection()), docId);
  }

  getChannelRef() {
    return collection(this.firestore, 'channels');
  }

  getChatRef(docId: string) {
    return collection(this.getSingleUserRef(docId), 'chats');
  }

  async addNewChannel(allChannels: {}, userId: string, user:string) {
    const dateNow = new Date();
    dateNow.setHours(0, 0, 0, 0);
    const channelWithUser = {
    ...allChannels,
    userId: [userId],
    createdBy: user,
    createdAt: dateNow
  };
      await addDoc(collection(this.firestore, 'channels'),channelWithUser);
  }

    getChannelUserId() {
      const firstChannel = this.showChannelByUser[1];
      this.channelCreaterId = firstChannel.createdBy;
    }
  
    async getChannelUserName() {
      const channelRef = this.getSingleUserRef(this.channelCreaterId);
      const snapshot = await getDoc(channelRef);
      const data = snapshot.data();
      if(data) {
        this.channelCreaterName = data['name'];
        this.channelCreaterLastname = data['lastname'];
      }
    }
              
}