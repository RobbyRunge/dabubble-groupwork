import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ChatSectionComponent } from './main-content/chat-section/chat-section.component';

export const routes: Routes = [
    { path: "", component: ChatSectionComponent }
];
