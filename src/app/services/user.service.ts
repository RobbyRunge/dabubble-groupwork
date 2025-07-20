import { Injectable, inject, Injector, runInInjectionContext, OnInit } from '@angular/core';
import { Firestore, collection, query, where, getDocs, addDoc, onSnapshot, doc, CollectionReference, collectionData, getDoc, updateDoc, deleteDoc, docData } from '@angular/fire/firestore';
import { User } from '../../models/user.class';
import { Allchannels } from '../../models/allchannels.class';
import { Observable } from 'rxjs';
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private updateChannelByUser = new BehaviorSubject<Allchannels[]>([]);
  showChannelByUser$ = this.updateChannelByUser.asObservable();

  private firestore = inject(Firestore);

  private router = inject(Router);
  private auth = inject(Auth);
  private injector = inject(Injector);

  private pendingRegistrationId = new BehaviorSubject<string | null>(null);
  pendingRegistrationId$ = this.pendingRegistrationId.asObservable();
  private isCheckedSubject = new BehaviorSubject<any>(null);
  public isChecked$ = this.isCheckedSubject.asObservable();
  userData: User[] = [];
  currentUser?: User;
  channels: any[] = [];
  currentUserId!: string;
  showChannelByUser: any[] = [];
  channelCreaterId!: string;
  channelCreaterName: string = '';
  currentChannelId: string = '';
  currentChannelName: string = '';
  currentChannelDescription: string = '';
  userSubcollectionId: string = '';
  userSubcollectionChannelId: string = '';
  userSubcollectionChannelName: string = '';
  userSubcollectionDescription: string = '';

  public channelsLoaded$ = new BehaviorSubject<boolean>(false);

  unsubscribeUserData!: Subscription;
  unsubscribeUserChannels!: Subscription;
  unsubscribeChannelCreater!: () => void;
  unsubscribeChannelCreaterName!: () => void;
  unsubscribeUserStorage!: Subscription;
  loginIsSucess = false;


  setCheckdValue(user: string){
    this.isCheckedSubject.next(user)
  }

  getUsersCollection(): CollectionReference {
    return runInInjectionContext(this.injector, () =>
      collection(this.firestore, 'users')
    );
  }

  getUserSubCol(docId: string) {
    return runInInjectionContext(this.injector, () =>
      collection(this.getSingleUserRef(docId), 'userstorage')
    );
  }

  getSingleChannelRef(docId: string) {
    return runInInjectionContext(this.injector, () =>
      doc(this.getChannelRef(), docId)
    );
  }

  getSingleUserRef(docId: string) {
    return runInInjectionContext(this.injector, () =>
      doc(this.getUsersCollection(), docId)
    );
  }

  getChannelRef() {
    return runInInjectionContext(this.injector, () =>
      collection(this.firestore, 'channels')
    );
  }

  getChatRef(docId: string) {
    return runInInjectionContext(this.injector, () =>
      collection(this.getSingleUserRef(docId), 'chats')
    );
  }

  async loginService(email: string, password: string) {
    const userQuery = runInInjectionContext(this.injector, () =>
      query(
        this.getUsersCollection(),
        where('email', '==', email),
        where('password', '==', password)
      )
    );

    const result = await runInInjectionContext(this.injector, () =>
      getDocs(userQuery)
    );

    if (!result.empty) {
      const userDoc = result.docs[0];
      this.currentUserId = userDoc.id;
    }
    const userStorageSnapshot = await runInInjectionContext(this.injector, () =>
      getDocs(this.getUserSubCol(this.currentUserId))
    );
    if (!userStorageSnapshot.empty) {
      const userStorage = userStorageSnapshot.docs[0];
      this.userSubcollectionId = userStorage.id;
    }
    this.loginIsSucess = true;
  }

  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const credential = await runInInjectionContext(this.injector, () =>
        signInWithPopup(this.auth, provider)
      );
      const user = credential.user;

      const userQuery = runInInjectionContext(this.injector, () =>
        query(
          this.getUsersCollection(),
          where('email', '==', user.email)
        )
      );

      const result = await runInInjectionContext(this.injector, () =>
        getDocs(userQuery)
      );

      if (result.empty) {
        const newUser = new User();
        newUser.email = user.email || '';
        newUser.name = user.displayName || user.email?.split('@')[0] || '';
        newUser.avatar = "empty-avatar.png";
        const { userId, userStorageId } = await this.createUserBySignInWithGoogle(newUser);
        this.currentUserId = userId;
        this.userSubcollectionId = userStorageId;
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
    const userQuery = runInInjectionContext(this.injector, () =>
      query(
        this.getUsersCollection(),
        where('email', '==', guestEmail)
      )
    );

    const result = await runInInjectionContext(this.injector, () =>
      getDocs(userQuery)
    );

    if (!result.empty) {
      if (!result.empty) {
        const userDoc = result.docs[0];
        this.currentUserId = userDoc.id;
        this.currentUser = new User(userDoc.data());
        this.loginIsSucess = true;
      }
    } else {
      console.error('Guest user not found. Please create a guest user first.');
    }
  }

  async createUserBySignInWithGoogle(user: User): Promise<{ userId: string; userStorageId: string }> {
    try {
      const userData: any = {
        name: user.name,
        email: user.email,
        avatar: user.avatar
      };
      if (user.password) {
        userData.password = user.password;
      }

      const userRef = await runInInjectionContext(this.injector, () =>
        addDoc(collection(this.firestore, 'users'), userData)
      );
      const userId = userRef.id;
      const userStorageColRef = runInInjectionContext(this.injector, () =>
        collection(userRef, 'userstorage')
      );
      const userStorageDocRef = await runInInjectionContext(this.injector, () =>
        addDoc(userStorageColRef, {
          channel: user.userstorage,
        })
      );
      const userStorageId = userStorageDocRef.id;
      console.log('user id ist',userId);
      console.log('user storage id ist', userStorageId);
      return {
        userId,
        userStorageId
      };
    } catch (error) {
      throw error;
    }
  }

  async updateUserDocument(userId: string, data: any) {
    return runInInjectionContext(this.injector, () => {
      const userDocRef = doc(this.firestore, 'users', userId);
      return updateDoc(userDocRef, data);
    });
  }

  async createInitialUser(user: User): Promise<{ userId: string; userStorageId: string }> {
    try {
      const userData: any = {
        name: user.name,
        email: user.email,
        password: user.password,
        avatar: 'empty-avatar.png',
        registrationComplete: false
      };

      const userRef = await runInInjectionContext(this.injector, () =>
        addDoc(collection(this.firestore, 'users'), userData)
      );
      const userId = userRef.id;

      const userStorageColRef = runInInjectionContext(this.injector, () =>
        collection(userRef, 'userstorage')
      );
      
      const userStorageDocRef = await runInInjectionContext(this.injector, () =>
        addDoc(userStorageColRef, {
        })
      );
      const userStorageId = userStorageDocRef.id;
      this.pendingRegistrationId.next(userId);
      return {
        userId,
        userStorageId
      };
    } catch (error) {
      console.error('Error creating initial user:', error);
      throw error;
    }
  }

  getPendingRegistrationId(): string | null {
    return this.pendingRegistrationId.getValue();
  }

  async completeUserRegistration(avatarPath: string): Promise<boolean> {
    const userId = this.pendingRegistrationId.getValue();
    if (!userId) {
      console.error('No user ID for registration');
      return false;
    }

    try {
      await runInInjectionContext(this.injector, () =>
        updateDoc(doc(this.firestore, 'users', userId), {
          avatar: avatarPath,
          registrationComplete: true
        })
      );

      this.pendingRegistrationId.next(null);

      console.log('User registration completed successfully');
      return true;
    } catch (error) {
      console.error('Update failed:', error);
      return false;
    }
  }

  async cleanupIncompleteRegistration(): Promise<void> {
    const userId = this.pendingRegistrationId.getValue();
    if (userId) {
      await runInInjectionContext(this.injector, () =>
        deleteDoc(doc(this.firestore, 'users', userId))
      );

      this.pendingRegistrationId.next(null);
    }
  }

  async addNewChannel(allChannels: {}, userId: string, user: string) {
    const dateNow = new Date();
    dateNow.setHours(0, 0, 0, 0);
    const channelWithUser = {
      ...allChannels,
      userId: [userId],
      createdBy: user,
      createdAt: dateNow,
    };
    await runInInjectionContext(this.injector, () =>
      addDoc(collection(this.firestore, 'channels'), channelWithUser)
    );
  }

  async getChannelUserId(channelId: string) {
    const channelRef = this.getSingleChannelRef(channelId);
    this.unsubscribeChannelCreaterName = runInInjectionContext(this.injector, () =>
      onSnapshot(channelRef, (element) => {
        const data = element.data();
        if (data) {
          this.channelCreaterId = data['createdBy'];
          this.getChannelUserName(this.channelCreaterId);
        }
      })
    );
  }

  getChannelUserName(userId: string) {
    const channelRef = this.getSingleUserRef(userId);
    this.unsubscribeChannelCreater = runInInjectionContext(this.injector, () =>
      onSnapshot(channelRef, (element) => {
        const data = element.data();
        if (data) {
          this.channelCreaterName = data['name'];
          console.log('channel creater id ist', this.channelCreaterId);
          console.log('channel creater name', this.channelCreaterName);
        }
      })
    );
  }

  async showCurrentUserData() {
    const userRef = this.getSingleUserRef(this.currentUserId);
    this.unsubscribeUserData = runInInjectionContext(this.injector, () =>
      docData(userRef)
    ).subscribe((data) => {
      this.currentUser = new User(data);
    });
    const storageRef = this.getUserSubCol(this.currentUserId);
    const storageSnapshot = await runInInjectionContext(this.injector, () =>
      getDocs(storageRef)
    );
    storageSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('doc data', data);
      this.userSubcollectionChannelId = data['channelId'];
      this.userSubcollectionId = doc.id;
      this.userSubcollectionChannelName = data['channelname'];  
      this.userSubcollectionDescription = data['description'];
    });
    this.showUserChannel()
  }

  showUserChannel() {
    const channelRef = this.getChannelRef();
    this.unsubscribeUserChannels = runInInjectionContext(this.injector, () =>
      collectionData(channelRef, { idField: 'channelId' })
    ).subscribe(channels => {
      this.channels = [];
      this.channels = channels;
      this.checkChannel();
      this.channelsLoaded$.next(true);
    });
  }

  // checkChannel() {
  //   this.showChannelByUser = [];
  //   this.channels.forEach((channel) => {
  //     if (
  //       Array.isArray(channel.userId) &&
  //       channel.userId.includes(this.currentUserId)
  //     ) {
        
  //       this.showChannelByUser.push({
  //         ...channel,
  //       });
  //     }
  //   });
  // }

  checkChannel() {
  this.showChannelByUser = this.channels.filter(channel =>
    Array.isArray(channel.userId) && channel.userId.includes(this.currentUserId)
    );
    this.updateChannelByUser.next(this.showChannelByUser);
  }

  async updateUserStorage(userId: string, storageId: string, item: {}) {
    const storageDocRef = runInInjectionContext(this.injector, () =>
      doc(this.getUserSubCol(userId), storageId)
    );
    await runInInjectionContext(this.injector, () =>
      updateDoc(storageDocRef, item)
    );
  }

  async editChannel(docId: string, item: {}) {
    const singleChannelRef = this.getSingleChannelRef(docId);
    await runInInjectionContext(this.injector, () =>
      updateDoc(singleChannelRef, item)
    );
  }

  async updateUserName(newName: string): Promise<void> {
    if (!this.currentUserId) {
      throw new Error('Kein eingeloggter Benutzer');
    }

    const userRef = this.getSingleUserRef(this.currentUserId);
    await runInInjectionContext(this.injector, () =>
      updateDoc(userRef, { name: newName })
    );
    if (this.currentUser) {
      this.currentUser.name = newName;
    }
  }

  getAllUsers(): Observable<User[]> {
    return runInInjectionContext(this.injector, () =>
      collectionData(this.getUsersCollection(), { idField: 'userId' })
    ) as Observable<User[]>;
  }
}