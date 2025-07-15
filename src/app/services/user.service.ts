import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { Firestore, collection, query, where, getDocs, addDoc, onSnapshot, doc, CollectionReference, collectionData, getDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { User } from '../../models/user.class';
import { Channel } from '../../models/channel.class';
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore = inject(Firestore);
  private router = inject(Router);
  private auth = inject(Auth);
  private injector = inject(Injector);

  private pendingRegistrationId = new BehaviorSubject<string | null>(null);
  pendingRegistrationId$ = this.pendingRegistrationId.asObservable();

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
    return runInInjectionContext(this.injector, () => 
      collection(this.firestore, 'users')
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
      this.loginIsSucess = true;
    }
  }

  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(this.auth, provider);
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
      
      const userRef = await runInInjectionContext(this.injector, () => 
        addDoc(collection(this.firestore, 'users'), userData)
      );
      const userId = userRef.id;
      return userId;
    } catch (error) {
      throw error;
    }
  }

  async createInitialUser(user: User): Promise<string> {
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

      this.pendingRegistrationId.next(userId);
      
      console.log('Initial user created with ID:', userId);
      return userId;
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

  async addNewChannel(allChannels: {}, userId: string, user: string) {
    const dateNow = new Date();
    dateNow.setHours(0, 0, 0, 0);
    const channelWithUser = {
      ...allChannels,
      userId: [userId],
      createdBy: user,
      createdAt: dateNow
    };
    await runInInjectionContext(this.injector, () =>
      addDoc(collection(this.firestore, 'channels'), channelWithUser)
    );
  }

  getChannelUserId() {
    const firstChannel = this.showChannelByUser[0];
    this.channelCreaterId = firstChannel.createdBy;
  }

  async getChannelUserName() {
    const channelRef = this.getSingleUserRef(this.channelCreaterId);
    const snapshot = await runInInjectionContext(this.injector, () =>
      getDoc(channelRef)
    );
    const data = snapshot.data();
    if (data) {
      this.channelCreaterName = data['name'];
      this.channelCreaterLastname = data['lastname'];
    }
  }

  async updateUserDocument(userId: string, data: any) {
    return runInInjectionContext(this.injector, () =>
      updateDoc(doc(this.firestore, 'users', userId), data)
    );
  }
}