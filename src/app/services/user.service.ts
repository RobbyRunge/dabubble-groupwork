import { Injectable, inject, Injector, runInInjectionContext, OnInit } from '@angular/core';
import { Firestore, collection, query, where, getDocs, addDoc, onSnapshot, doc, CollectionReference, collectionData, getDoc, updateDoc, deleteDoc, docData } from '@angular/fire/firestore';
import { User } from '../../models/user.class';
import { Observable } from 'rxjs';
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { BehaviorSubject } from 'rxjs';
import { ChannelService } from './channel.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private firestore = inject(Firestore);
  channelService = inject(ChannelService);
  private router = inject(Router);
  private auth = inject(Auth);
  private injector = inject(Injector);

  showChannel = true;
  showChatPartnerHeader = true;

  usersIdsInChannel: any[] = [];
  userNamesInChannel: any[] = [];
  userAvatarInChannel: any[] = [];

  private pendingRegistrationId = new BehaviorSubject<string | null>(null);
  pendingRegistrationId$ = this.pendingRegistrationId.asObservable();
 
  loginIsSucess = false;
  chatId: any = '';

  getUsersCollection(): CollectionReference {
    return runInInjectionContext(this.injector, () =>
      collection(this.firestore, 'users')
    );
  }

  getSingleUserRef(docId: string) {
    return runInInjectionContext(this.injector, () =>
      doc(this.getUsersCollection(), docId)
    );
  }

  getUserRefsByIds() {
  return this.usersIdsInChannel.map(id =>
    runInInjectionContext(this.injector, () =>
        doc(this.getUsersCollection(), id)
      )
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
      this.channelService.currentUserId = userDoc.id;
    }
    const userStorageSnapshot = await runInInjectionContext(this.injector, () =>
      getDocs(this.channelService.getUserSubCol(this.channelService.currentUserId))
    );
    if (!userStorageSnapshot.empty) {
      const userStorage = userStorageSnapshot.docs[0];
      this.channelService.userSubcollectionId = userStorage.id;
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
        this.channelService.currentUserId = userId;
        this.channelService.userSubcollectionId = userStorageId;
      } else {
        const userDoc = result.docs[0];
        this.channelService.currentUserId = userDoc.id;
      }

      this.loginIsSucess = true;
      this.router.navigate(['mainpage', this.channelService.currentUserId]);
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
        this.channelService.currentUserId = userDoc.id;
        this.channelService.currentUser = new User(userDoc.data());
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

  async updateUserName(newName: string): Promise<void> {
    if (!this.channelService.currentUserId) {
      throw new Error('Kein eingeloggter Benutzer');
    }
    const userRef = this.getSingleUserRef(this.channelService.currentUserId);
    await runInInjectionContext(this.injector, () =>
      updateDoc(userRef, { name: newName })
    );
    if (this.channelService.currentUser) {
      this.channelService.currentUser.name = newName;
    }
  }

  getAllUsers(): Observable<User[]> {
    return runInInjectionContext(this.injector, () =>
      collectionData(this.getUsersCollection(), { idField: 'userId' })
    ) as Observable<User[]>;
  }

  async getUserIdsFromChannel(docId: string) {
    const singleChannel = this.channelService.getSingleChannelRef(docId);
    const snapshot = await runInInjectionContext(this.injector, () =>
      getDoc(singleChannel));
      if (snapshot.exists()) {
      const data = snapshot.data();
      if (data && Array.isArray(data['userId'])) {
        this.usersIdsInChannel = data['userId'];
        console.log('users in channel id', this.usersIdsInChannel);
        for (const id of this.usersIdsInChannel) {
        const name = this.getSingleUserRef(id);
        const nameSnap =  await runInInjectionContext(this.injector, () =>
          getDoc(name));
        const dataName = nameSnap.data();
        if (dataName) {
          const userName = dataName['name'];
          const userAvatar = dataName['avatar'];  
          this.userNamesInChannel.push(userName);
          this.userAvatarInChannel.push(userAvatar);
          }
        }
      }
      console.log('names', this.userNamesInChannel);
        console.log('avatar', this.userAvatarInChannel);
    }
}
} 