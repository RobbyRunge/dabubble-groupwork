import { Injectable, inject } from '@angular/core';
import { Location } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private location = inject(Location);
  
  // Observable for message navigation
  private scrollToMessageSubject = new BehaviorSubject<{ messageId: string, highlight: boolean } | null>(null);
  public scrollToMessage$ = this.scrollToMessageSubject.asObservable();

  goBack() {
    this.location.back();
  }

  // Method to trigger scrolling to a specific message
  navigateToMessage(messageId: string, highlight: boolean = true) {
    this.scrollToMessageSubject.next({ messageId, highlight });
  }

  // Clear the scroll target
  clearScrollTarget() {
    this.scrollToMessageSubject.next(null);
  }
}
