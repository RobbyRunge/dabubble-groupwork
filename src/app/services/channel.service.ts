import {
  inject,
  Injectable,
  Injector,
  runInInjectionContext,
  OnDestroy,
} from '@angular/core';
import {
  addDoc,
  arrayUnion,
  collection,
  collectionData,
  CollectionReference,
  doc,
  docData,
  Firestore,
  getDocs,
  onSnapshot,
  updateDoc,
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Allchannels } from '../../models/allchannels.class';
import { User } from '../../models/user.class';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  constructor() { }

  private firestore = inject(Firestore);
  private injector = inject(Injector);

  private updateChannelByUser = new BehaviorSubject<Allchannels[]>([]);
  showChannelByUser$ = this.updateChannelByUser.asObservable();

  public channelsLoaded$ = new BehaviorSubject<boolean>(false);

  private isCheckedSubject = new BehaviorSubject<any>(null);
  public isChecked$ = this.isCheckedSubject.asObservable();

  private activeChannelIdSubject = new BehaviorSubject<string>('');
  public activeChannelId$ = this.activeChannelIdSubject.asObservable();

  userData: User[] = [];
  currentUser?: User;
  currentUserId!: string;
  channels: any[] = [];
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
  selectedUser: any


  unsubscribeUserData!: Subscription;
  unsubscribeUserChannels!: Subscription;
  unsubscribeDeleteUserFromCh!: () => void;
  unsubscribeChannelCreater!: () => void;
  unsubscribeChannelCreaterName!: () => void;
  unsubscribeUserStorage!: Subscription;

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

  async addNewChannel(allChannels: {}, userId: string, user: string) {
    const dateNow = new Date();
    dateNow.setHours(0, 0, 0, 0);
    const channelWithUser = {
      ...allChannels,
      userId: [userId],
      createdBy: user,
    };
    const docRef = await runInInjectionContext(this.injector, () =>
      addDoc(collection(this.firestore, 'channels'), channelWithUser)
    );
    const generatedChannelId = docRef.id;
    await runInInjectionContext(this.injector, () => 
     updateDoc(doc(this.firestore, 'channels', generatedChannelId), {
      channelId: generatedChannelId,
     })
    )
  }

  async getChannelUserId(channelId: string) {
    const channelRef = this.getSingleChannelRef(channelId);
    this.unsubscribeChannelCreaterName = runInInjectionContext(
      this.injector,
      () =>
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
      this.userSubcollectionChannelId = data['channelId'];
      this.userSubcollectionId = doc.id;
      this.userSubcollectionChannelName = data['channelname'];
      this.userSubcollectionDescription = data['description'];
    });
    this.showUserChannel();
  }

  showUserChannel() {
    const channelRef = this.getChannelRef();
    this.unsubscribeUserChannels = runInInjectionContext(this.injector, () =>
      collectionData(channelRef, { idField: 'channelId' })
    ).subscribe((channels) => {
      this.channels = [];
      this.channels = channels;
      this.checkChannel();
      this.channelsLoaded$.next(true);
    });
  }

  checkChannel() {
    this.showChannelByUser = this.channels.filter(
      (channel) =>
        Array.isArray(channel.userId) &&
        channel.userId.includes(this.currentUserId)
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

  async deleteUserFromCh(channelId: string, item: any) {
    const channelRef = this.getSingleChannelRef(channelId);
    this.unsubscribeDeleteUserFromCh = runInInjectionContext(
      this.injector, () =>
        onSnapshot(channelRef, async (element) => {
          const data = element.data();
          if (data && Array.isArray(data['userId'])) {
            const filteredUserIds = data['userId'].filter((channelUser: string) => channelUser !== this.currentUserId);
            item.userId = filteredUserIds;
            await runInInjectionContext(this.injector, () =>
              updateDoc(channelRef, item)
            );
          }
        })
    );
  }
  
  async addUserToCh(channelId: string, newUserId: string) {
    const channelRef = this.getSingleChannelRef(channelId);
    await runInInjectionContext(this.injector, () =>
        updateDoc(channelRef, {
          userId: arrayUnion(newUserId)
      })
    );
  }

  setCheckdValue(user: string) {
    this.isCheckedSubject.next(user)
  }

  setActiveChannelId(channelId: string) {
    this.activeChannelIdSubject.next(channelId);
    this.currentChannelId = channelId;
  }

  getUserData() {
    this.isChecked$.subscribe(user => {
      this.selectedUser = user
    })
  }

  ngOnDestroy(): void {
    if (this.unsubscribeUserData) {
      this.unsubscribeUserData.unsubscribe();
    }
    if (this.unsubscribeUserChannels) {
      this.unsubscribeUserChannels.unsubscribe();
    }
    if (this.unsubscribeUserStorage) {
      this.unsubscribeUserStorage.unsubscribe();
    }
    if (this.unsubscribeChannelCreater) {
      this.unsubscribeChannelCreater();
    }
    if (this.unsubscribeChannelCreaterName) {
      this.unsubscribeChannelCreaterName();
    }
    if (this.unsubscribeDeleteUserFromCh) {
      this.unsubscribeDeleteUserFromCh();
    }
  }
}