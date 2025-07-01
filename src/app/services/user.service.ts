import { Injectable, inject } from '@angular/core';
import { Firestore, collection, query, where, getDocs, addDoc, onSnapshot, doc, CollectionReference, collectionData } from '@angular/fire/firestore';
import { User } from '../../models/user.class';

@Injectable({ providedIn: 'root' })
export class UserService {
  

  private firestore = inject(Firestore);
  
  userData: User[] = [];

  currentUserId!: string;

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

    // return !result.empty;
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

  getChanbelRef(docId: string) {
    return collection(this.getSingleUserRef(docId), 'channels');
  }

   getChatRef(docId: string) {
    return collection(this.getSingleUserRef(docId), 'chats');
  }

}