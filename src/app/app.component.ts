import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';

interface Item {
  name: string;
}

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'DaBubble';

  firestore = inject(Firestore);
  itemCollection = collection(this.firestore, 'users');
  item$ = collectionData(this.itemCollection);
}
