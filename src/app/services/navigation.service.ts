import { Injectable, inject } from '@angular/core';
import { Location } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private location = inject(Location);
  mobileHeaderDevspace = false;
  mobileScreenWidth = window.innerWidth < 1000;

  public _mobileHeaderDevspace = new BehaviorSubject<boolean>(false);
  mobileHeaderDevspace$ = this._mobileHeaderDevspace.asObservable();
  
  private scrollToMessageSubject = new BehaviorSubject<{ messageId: string, highlight: boolean } | null>(null);
  public scrollToMessage$ = this.scrollToMessageSubject.asObservable();
  
  private scrollToBottomSubject = new BehaviorSubject<boolean>(false);
  public scrollToBottom$ = this.scrollToBottomSubject.asObservable();

  goBack() {
    this.location.back();
  }

  navigateToMessage(messageId: string, highlight: boolean = true) {
    this.scrollToMessageSubject.next({ messageId, highlight });
  }
  
  clearScrollTarget() {
    this.scrollToMessageSubject.next(null);
  }
  
  triggerScrollToBottom() {
    this.scrollToBottomSubject.next(true);
  }
}
