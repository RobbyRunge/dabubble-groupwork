import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ChannelService } from './channel.service';

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
    // Hole alle User aus den Channels, in denen der aktuelle User Mitglied ist
    const userChannels = this.channelService.showChannelByUser || [];
    const allUsers = new Set<any>();

    // Sammle alle User aus allen Channels
    userChannels.forEach((channel: any) => {
      if (channel.members) {
        channel.members.forEach((member: any) => allUsers.add(member));
      }
    });

    // Falls keine members direkt verfügbar sind, nutze userData aus ChannelService
    if (this.channelService.userData && this.channelService.userData.length > 0) {
      this.channelService.userData.forEach(user => allUsers.add(user));
    }

    // Filtere User basierend auf dem Suchbegriff
    const filteredUsers = Array.from(allUsers)
      .filter((user: any) => 
        user.name && user.name.toLowerCase().includes(keyword.toLowerCase()) &&
        user.userId !== this.channelService.currentUser?.userId // Exclude current user
      )
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
}