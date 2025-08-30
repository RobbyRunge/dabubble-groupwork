import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { Observable, of, BehaviorSubject, from, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ChannelService } from './channel.service';
import { collection, Firestore, onSnapshot, getDocs, query, collectionGroup, where } from '@angular/fire/firestore';

export interface SearchResult {
  id: string;
  name: string;
  type: 'channel' | 'user' | 'message';
  avatar?: string;
  description?: string;
  messageText?: string;
  senderName?: string;
  timestamp?: any;
  channelName?: string;
  isDirectMessage?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private channelService = inject(ChannelService);
  private firestore = inject(Firestore);
  private injector = inject(Injector);
  private allUsersCache: any[] = [];
  private usersSubject = new BehaviorSubject<any[]>([]);

  constructor() {
    this.setupUsersListener();
  }

  searchMessages(keyword: string): Observable<SearchResult[]> {
    if (!keyword.trim()) {
      return of([]);
    }

    return runInInjectionContext(this.injector, () => {
      const chatMessages$ = from(this.searchMessagesInChats(keyword));
      const channelMessages$ = from(this.searchMessagesInChannels(keyword));

      return forkJoin([chatMessages$, channelMessages$]).pipe(
        map(([chatMessages, channelMessages]) => [...chatMessages, ...channelMessages]),
        catchError(error => {
          console.error('Error searching messages:', error);
          return of([]);
        })
      );
    });
  }

  private async searchMessagesInChats(keyword: string): Promise<SearchResult[]> {
    try {
      const chatsRef = collection(this.firestore, 'chats');
      const chatsSnapshot = await getDocs(chatsRef);
      const results: SearchResult[] = [];

      for (const chatDoc of chatsSnapshot.docs) {
        const chatId = chatDoc.id;
        const chatData = chatDoc.data();
        const chatUsers = chatData['user'] || [];

        // Prüfe, ob der aktuelle User Mitglied des Chats ist
        if (!chatUsers.includes(this.channelService.currentUserId)) {
          continue; // Skip chats the user is not a member of
        }

        const messagesSnapshot = await runInInjectionContext(this.injector, async () => {
          const messagesRef = collection(this.firestore, `chats/${chatId}/message`);
          const messagesSnapshot = await getDocs(messagesRef);
          return messagesSnapshot;
        });

        for (const messageDoc of messagesSnapshot.docs) {
          const messageData = messageDoc.data();
          const messageText = messageData['text'] || '';

          if (messageText.toLowerCase().includes(keyword.toLowerCase())) {
            const senderName = await this.getSenderName(messageData['senderId']);

            results.push({
              id: `chat-${chatId}-${messageDoc.id}`,
              name: `von ${senderName}`,
              type: 'message',
              description: this.truncateText(messageText, 100),
              messageText: messageText,
              senderName: senderName,
              timestamp: messageData['timestamp'],
              isDirectMessage: true
            });
          }
        }
      }

      return results.slice(0, 10); // Limitiere auf 10 Ergebnisse
    } catch (error) {
      console.error('Error searching chat messages:', error);
      return [];
    }
  }

  private async searchMessagesInChannels(keyword: string): Promise<SearchResult[]> {
    try {
      const channelsRef = collection(this.firestore, 'channels');
      const channelsSnapshot = await getDocs(channelsRef);
      const results: SearchResult[] = [];

      for (const channelDoc of channelsSnapshot.docs) {
        const channelId = channelDoc.id;
        const channelData = channelDoc.data();
        const channelName = channelData['channelname'] || 'Unbekannter Channel';

        // Prüfe, ob der User Mitglied des Channels ist
        const userIds = channelData['userId'] || [];
        if (!userIds.includes(this.channelService.currentUserId)) {
          continue; // Skip channels the user is not a member of
        }

        try {
          const messagesSnapshot = await runInInjectionContext(this.injector, async () => {
            const messagesRef = collection(this.firestore, `channels/${channelId}/message`);
            const messagesSnapshot = await getDocs(messagesRef);
            return messagesSnapshot;
          });

          for (const messageDoc of messagesSnapshot.docs) {
            const messageData = messageDoc.data();
            const messageText = messageData['text'] || '';

            if (messageText.toLowerCase().includes(keyword.toLowerCase())) {
              const senderName = await this.getSenderName(messageData['senderId']);

              results.push({
                id: `channel-${channelId}-${messageDoc.id}`,
                name: `Nachricht in #${channelName}`,
                type: 'message',
                description: this.truncateText(messageText, 100),
                messageText: messageText,
                senderName: senderName,
                timestamp: messageData['timestamp'],
                channelName: channelName,
                isDirectMessage: false
              });
            }
          }
        } catch (error) {
          // Channel might not have messages collection yet
          console.log(`No messages found in channel ${channelId}`);
        }
      }

      return results.slice(0, 10); // Limitiere auf 10 Ergebnisse
    } catch (error) {
      console.error('Error searching channel messages:', error);
      return [];
    }
  }

  private async getSenderName(senderId: string): Promise<string> {
    try {
      const user = this.allUsersCache.find(u => u.userId === senderId);
      return user?.name || 'Unbekannter User';
    } catch (error) {
      return 'Unbekannter User';
    }
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
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
        description: channel.description
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