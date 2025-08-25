import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ChannelService } from './channel.service';
import { collection, getDocs, Firestore } from '@angular/fire/firestore';

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

  constructor() {
    // Lade alle User beim Start des Services
    this.loadAllUsers();
  }

  searchMessages(keyword: string): Observable<any[]> {
    // Beispiel-Daten, später durch echte Suche ersetzen
    const dummyResults = [
      { text: 'Nachricht mit ' + '"' + keyword + '"' },
      { text: 'Noch eine Nachricht mit ' + '"' + keyword + '"' }
    ];
    return of(dummyResults);
  }

  searchChannels(keyword: string): Observable<SearchResult[]> {
    // Hole alle Channels, in denen der aktuelle User Mitglied ist
    const userChannels = this.channelService.showChannelByUser || [];
    
    // Filtere Channels basierend auf dem Suchbegriff
    const filteredChannels = userChannels
      .filter((channel: any) => 
        channel.name && channel.name.toLowerCase().includes(keyword.toLowerCase())
      )
      .map((channel: any) => ({
        id: channel.channelId || channel.id,
        name: channel.name,
        type: 'channel' as const,
        description: channel.description || `${channel.userId?.length || 0} Mitglieder`
      }))
      .slice(0, 10); // Limitiere auf 10 Ergebnisse

    return of(filteredChannels);
  }

  searchUsers(keyword: string): Observable<SearchResult[]> {
    const allUsers = this.getAllUsersFromCache();
    // Filtere User basierend auf dem Suchbegriff
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
      .slice(0, 10); // Limitiere auf 10 Ergebnisse

    return of(filteredUsers);
  }

  private async loadAllUsers() {
    try {
      const usersCollection = collection(this.firestore, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      
      this.allUsersCache = [];
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        this.allUsersCache.push({
          userId: doc.id,
          name: userData['name'],
          email: userData['email'],
          avatar: userData['avatar'],
          active: userData['active'] || false
        });
      });
    } catch (error) {
      console.error('Error loading users from Firebase:', error);
    }
  }

  getAllUsersFromCache(): any[] {
    return this.allUsersCache;
  }
}