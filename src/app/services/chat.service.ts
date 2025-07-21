import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { Firestore, collection, query, where, getDocs, addDoc, onSnapshot, serverTimestamp, orderBy } from '@angular/fire/firestore';
import { UserService } from './user.service';

@Injectable({
    providedIn: 'root',
})
export class ChatService {


    private firestore = inject(Firestore);
    private injector = inject(Injector);
    dataUser = inject(UserService);
    messages: any[] = [];
    messageText: string | undefined;

    async getOrCreateChatId(userId1: string, userId2: string): Promise<string> {
        return runInInjectionContext(this.injector, async () => {
            const chatsRef = collection(this.firestore, 'chats');
            const q = query(chatsRef, where('user', 'array-contains', userId1));

            const snapshot = await getDocs(q);
            for (const doc of snapshot.docs) {
                const users = doc.data()['user'];
                if (users.includes(userId2)) {
                    return doc.id;
                }
            }

            const newChat = await addDoc(chatsRef, {
                user: [userId1, userId2]
            });
            return newChat.id;
        });
    }

    async sendMessage(messageText: string, dataUser: any) {
        const messagesRef = collection(this.firestore, `chats/${this.dataUser.chatId}/message`);
        await addDoc(messagesRef, {
            text: messageText,
            senderId: dataUser.currentUserId,
            timestamp: serverTimestamp(),
        });
        this.messageText = '';
    }


    listenToMessages() {
        return runInInjectionContext(this.injector, async () => {
            const messagesRef = collection(this.firestore, `chats/${this.dataUser.chatId}/message`);
            const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));

            onSnapshot(messagesQuery, (snapshot) => {
                this.messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log('Nachrichten in Reihenfolge:', this.messages);
            });
        }
        )
    }


}