import { Injectable, inject } from '@angular/core';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private location = inject(Location);

  goBack() {
    this.location.back();
  }
}
