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
    hasMessages = false;

    async getOrCreateChatId(userId1: string, userId2: string): Promise<string> {
        return runInInjectionContext(this.injector, async () => {
            const chatsRef = collection(this.firestore, 'chats');

            if (userId1 === userId2) {
                const selfQuery = query(chatsRef, where('user', '==', [userId1]));
                const selfSnapshot = await getDocs(selfQuery);

                if (!selfSnapshot.empty) {
                    return selfSnapshot.docs[0].id;
                }

                const newSelfChat = await addDoc(chatsRef, {
                    user: [userId1],
                });

                return newSelfChat.id;
            }

            const q = query(chatsRef, where('user', 'array-contains', userId1));
            const snapshot = await getDocs(q);

            for (const doc of snapshot.docs) {
                const users = doc.data()['user'];
                if (users.includes(userId2) && users.length === 2) {
                    return doc.id;
                }
            }

            const newChat = await addDoc(chatsRef, {
                user: [userId1, userId2]
            });

            return newChat.id;
        });
    }

    async sendMessage(messageText: string, senderId: any) {
        return runInInjectionContext(this.injector, async () => {
            const messagesRef = collection(this.firestore, `chats/${this.dataUser.chatId}/message`);
            await addDoc(messagesRef, {
                text: messageText,
                senderId: senderId,
                timestamp: serverTimestamp(),
            });
        })
    }



    listenToMessages() {
        return runInInjectionContext(this.injector, async () => {
            const messagesRef = collection(this.firestore, `chats/${this.dataUser.chatId}/message`);
            const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));

            onSnapshot(messagesQuery, (snapshot) => {
                this.messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                if (this.messages.length !== 0) {
                    this.hasMessages = true;
                } else {
                    this.hasMessages = false;
                }
            });
        }
        )
    }

        isToday(timestamp: any): boolean {
        const date = timestamp?.toDate();
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    }

}