import { Injectable, inject } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { ChannelService } from './channel.service';
import { collection, Firestore, onSnapshot, getDocs } from '@angular/fire/firestore';

export interface SearchResult {
  id: string;
  name: string;
  type: 'channel' | 'user' | 'message';
  avatar?: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private channelService = inject(ChannelService);
  private firestore = inject(Firestore);
  private allUsersCache: any[] = [];
  private usersSubject = new BehaviorSubject<any[]>([]);

  constructor() {
    this.setupUsersListener();
  }

  searchMessages(keyword: string): Observable<any[]> {
    const dummyResults = [
      { text: 'Nachricht mit ' + '"' + keyword + '"' },
      { text: 'Noch eine Nachricht mit ' + '"' + keyword + '"' }
    ];
    return of(dummyResults);
  }

  searchChannels(keyword: string): Observable<SearchResult[]> {
    const userChannels = this.channelService.showChannelByUser || [];
    const filteredChannels = userChannels
      .filter((channel: any) =>
        channel.channelname && channel.channelname.toLowerCase().includes(keyword.toLowerCase())
      )
      .map((channel: any) => ({
        id: channel.channelId || channel.id,
        name: channel.channelname,
        type: 'channel' as const,
        description: channel.description || `${channel.userId?.length || 0} Mitglieder`
      }))
      .slice(0, 10);

    return of(filteredChannels);
  }

  searchUsers(keyword: string): Observable<SearchResult[]> {
    const allUsers = this.getAllUsersFromCache();
    const filteredUsers = Array.from(allUsers)
      .filter((user: any) => {
        const hasName = user.name && typeof user.name === 'string';
        const matchesKeyword = !keyword || (hasName && user.name.toLowerCase().includes(keyword.toLowerCase()));
        const notCurrentUser = user.userId !== this.channelService.currentUser?.userId;
        return hasName && matchesKeyword && notCurrentUser;
      })
      .map((user: any) => ({
        id: user.userId || user.id,
        name: user.name,
        type: 'user' as const,
        avatar: user.avatar,
        description: user.active ? 'Online' : 'Offline'
      }))
      .slice(0, 10);

    return of(filteredUsers);
  }

  private setupUsersListener() {
    const usersCollection = collection(this.firestore, 'users');
    onSnapshot(usersCollection, (snapshot) => {
      this.allUsersCache = [];
      snapshot.forEach((doc) => {
        const userData = doc.data();
        this.allUsersCache.push({
          userId: doc.id,
          name: userData['name'],
          email: userData['email'],
          avatar: userData['avatar'],
          active: userData['active'] || false
        });
      });
      this.usersSubject.next(this.allUsersCache);
    }, (error) => {
      console.error('Error setting up users listener:', error);
    });
  }

  getAllUsersFromCache(): any[] {
    return this.allUsersCache;
  }

  getUsersObservable(): Observable<any[]> {
    return this.usersSubject.asObservable();
  }
}