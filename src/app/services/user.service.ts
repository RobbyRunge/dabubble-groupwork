import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  onSnapshot,
  doc,
  CollectionReference,
  collectionData,
  getDoc, updateDoc,
  docData,
} from '@angular/fire/firestore';
import { User } from '../../models/user.class';
import { Channel } from '../../models/channel.class';
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private firestore = inject(Firestore);
  private router = inject(Router);
  private auth = inject(Auth);

  userData: User[] = [];
  currentUser?: User;
  channels: any[] = [];
  currentUserId!: string;
  createChannel!: Channel;
  showChannelByUser: any[] = [];
  channelCreaterId!: string;
  channelCreaterName: string = '';
  currentChannelId: string = '';
  currentChannelName: string = '';
  currentChannelDescription: string = '';

  public channelsLoaded$ = new BehaviorSubject<boolean>(false);

  unsubscribeUserData!: Subscription;
  unsubscribeUserChannels!: Subscription;
  unsubscribeChannelCreater!: () => void;
  unsubscribeChannelCreaterName!: () => void;

  loginIsSucess = false;

  getUsersCollection(): CollectionReference {
    return collection(this.firestore, 'users');
  }

  getSingleUserRef(docId: string) {
    return doc(this.getUsersCollection(), docId);
  }

  getChannelRef() {
    return collection(this.firestore, 'channels');
  }

  getSingleChannelRef(docId: string) {
    return doc(this.getChannelRef(), docId)
  }

  getChatRef(docId: string) {
    return collection(this.getSingleUserRef(docId), 'chats');
  }

  async loginService(email: string, password: string) {
    const userQuery = query(
      this.getUsersCollection(),
      where('email', '==', email),
      where('password', '==', password)
    );

    const result = await getDocs(userQuery);

    if (!result.empty) {
      const userDoc = result.docs[0];
      this.currentUserId = userDoc.id;
      this.loginIsSucess = true;
    }
  }

  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(this.auth, provider);
      const user = credential.user;

      const userQuery = query(
        this.getUsersCollection(),
        where('email', '==', user.email)
      );

      const result = await getDocs(userQuery);

      if (result.empty) {
        const newUser = new User();
        newUser.email = user.email || '';
        newUser.name = user.displayName || user.email?.split('@')[0] || '';
        newUser.avatar = "empty-avatar.png";

        const userId = await this.createUser(newUser);
        this.currentUserId = userId;
      } else {
        const userDoc = result.docs[0];
        this.currentUserId = userDoc.id;
      }

      this.loginIsSucess = true;
      this.router.navigate(['mainpage', this.currentUserId]);
      return user;
    } catch (error) {
      console.error('Error during Google sign in', error);
      throw error;
    }
  }

  async signInWithGuest() {
    const guestEmail = 'guestemail@gmail.com';
    const userQuery = query(
      this.getUsersCollection(),
      where('email', '==', guestEmail)
    );

    const result = await getDocs(userQuery);

    if (!result.empty) {
      const userDoc = result.docs[0];
      this.currentUserId = userDoc.id;
      this.loginIsSucess = true;
    } else {
      console.error('Guest user not found. Please create a guest user first.');
    }
  }

  async createUser(user: User): Promise<string> {
    try {
      const userData: any = {
        name: user.name,
        email: user.email,
        avatar: user.avatar
      };
      if (user.password) {
        userData.password = user.password;
      }
      const userRef = await addDoc(collection(this.firestore, 'users'), userData);
      const userId = userRef.id;
      return userId;
    } catch (error) {
      throw error;
    }
  }

  saveUserToLocalStorage(user: User): void {
    localStorage.setItem('pendingUser', JSON.stringify(user));
  }

  getUserFromLocalStorage(): User | null {
    const userData = localStorage.getItem('pendingUser');
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  }

  clearUserFromLocalStorage(): void {
    localStorage.removeItem('pendingUser');
  }

  async completeUserRegistration(user: User): Promise<boolean> {
    try {
      await this.createUser(user);
      this.clearUserFromLocalStorage();
      return true;
    } catch (error) {
      console.error('Error completing registration:', error);
      return false;
    }
  }
  
  async addNewChannel(allChannels: {}, userId: string, user:string) {
    const dateNow = new Date();
    dateNow.setHours(0, 0, 0, 0);
    const channelWithUser = {
      ...allChannels,
      userId: [userId],
      createdBy: user,
      createdAt: dateNow,
    };
    await addDoc(collection(this.firestore, 'channels'), channelWithUser);
  }

  async getChannelUserId(channelId: string) {
    const channelRef = this.getSingleChannelRef(channelId);
    this.unsubscribeChannelCreaterName = onSnapshot (channelRef, (element) => {
      const data = element.data();
      if (data) {
      this.channelCreaterId = data['createdBy'];
      this.getChannelUserName(this.channelCreaterId);
      }
    });
  }

  getChannelUserName(userId: string) {
    console.log('channel creater id ist', this.channelCreaterId);
    const channelRef = this.getSingleUserRef(userId);
    this.unsubscribeChannelCreater = onSnapshot(channelRef, (element) => {
    const data = element.data();
     console.log('das sind die channel user data', data);
     if (data) {
      this.channelCreaterName = data['name'];
      console.log('channel creater name', this.channelCreaterName);
      }
    });
  }

  showCurrentUserData() {
    const userRef = this.getSingleUserRef(this.currentUserId);
    this.unsubscribeUserData = docData(userRef).subscribe((data) => {
      this.currentUser = new User(data);
      console.log('current user id', this.currentUserId);
      console.log('current detail', this.currentUser);
    });
    this.showUserChannel();
  }

  showUserChannel() {
    const channelRef = this.getChannelRef();
    this.unsubscribeUserChannels = collectionData(channelRef, { idField: 'channelId' })
    .subscribe(channels => {
      this.channels = [];
      this.channels = channels;
      this.checkChannel();
      console.log('channel by user',this.showChannelByUser);
      this.channelsLoaded$.next(true);
    });
  }

  checkChannel() {
    this.showChannelByUser = [];
    this.channels.forEach((channel) => {
      if (
        Array.isArray(channel.userId) &&
        channel.userId.includes(this.currentUserId)
      ) {
        this.showChannelByUser.push({
          ...channel,
        });
      }
    });
  }

   ngOnDestroy(): void {
    this.unsubscribeUserData?.unsubscribe();        
    this.unsubscribeUserChannels?.unsubscribe();
    if (this.unsubscribeChannelCreater) {
      this.unsubscribeChannelCreater();
    }
    if (this.unsubscribeChannelCreaterName) {
      this.unsubscribeChannelCreaterName();
    }
   }
}