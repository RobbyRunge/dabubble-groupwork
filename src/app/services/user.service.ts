import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, setDoc, query, where, getDocs } from '@angular/fire/firestore';
import { User } from '../../models/user.class';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private firestore: Firestore) { }

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

  async createUserWithSubcollections(user: User): Promise<string> {
    try {
      const userRef = await addDoc(collection(this.firestore, 'users'), {
        name: user.name,
        email: user.email,
        password: user.password,
        avatar: user.avatar
      });
      const userId = userRef.id;
      const channelsCollection = collection(this.firestore, `users/${userRef.id}/channels`);
      await addDoc(channelsCollection, {});
      const chatsCollection = collection(this.firestore, `users/${userRef.id}/chats`);
      await addDoc(chatsCollection, {});
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
      await this.createUserWithSubcollections(user);
      this.clearUserFromLocalStorage();
      return true;
    } catch (error) {
      console.error('Error completing registration:', error);
      return false;
    }
  }
}