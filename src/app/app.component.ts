import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { LoginComponent } from "./login/login.component";
import { ChatSectionComponent } from "./main-content/chat-section/chat-section.component";
import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';

interface Item {
  name: string;
}

@Component({
  selector: 'app-root',
  imports: [
    //LoginComponent,
    ChatSectionComponent,
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
