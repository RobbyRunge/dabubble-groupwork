import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { Firestore, collection, query, where, getDocs, addDoc, onSnapshot, serverTimestamp, orderBy, DocumentReference, doc, updateDoc } from '@angular/fire/firestore';
import { UserService } from './user.service';

@Injectable({
    providedIn: 'root',
})
export class ChatService {


    private firestore = inject(Firestore);
    private injector = inject(Injector);
    dataUser = inject(UserService);
    messages: any[] = [];
    hasMessages: boolean = false;
    messageToday: boolean = false;
    mostUsedEmojis: string[] = [];

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

    isFirstMessageOfDay(timestamp: any, index: number): boolean {
        const currentDate = this.getDateWithoutTime(timestamp?.toDate());
        if (!currentDate) return false;

        if (index === 0) return true;

        const prevMsg = this.messages[index - 1];
        const prevDate = this.getDateWithoutTime(prevMsg?.timestamp?.toDate());
        if (!prevDate) return true;

        return currentDate.getTime() !== prevDate.getTime();
    }

    private getDateWithoutTime(date: Date | undefined | null): Date | null {
        if (!date) return null;
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    getDateLabel(timestamp: any): string {
        const date = timestamp?.toDate();
        if (!date) return '';

        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const yesterdayDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

        if (msgDate.getTime() === todayDate.getTime()) return 'Heute';
        if (msgDate.getTime() === yesterdayDate.getTime()) return 'Gestern';

        return date.toLocaleDateString('de-DE', {
            weekday: 'long',
            day: '2-digit',
            month: 'long'
        });
    }

    async updateUserMessage(messageId: string, newMessage: string): Promise<void> {
        const messageDocRef = this.getMessageDoc(messageId);
        await runInInjectionContext(this.injector, () =>
            updateDoc(messageDocRef, { text: newMessage })
        );
    }

    getMessageDoc(messageId: string): DocumentReference {
        return runInInjectionContext(this.injector, () =>
            doc(this.firestore, `chats/${this.dataUser.chatId}/message/${messageId}`)
        );
    }

    loadMostUsedEmojis() {
        const stored = localStorage.getItem('emoji-mart.frequently');
        if (stored) {
            const recent = JSON.parse(stored) as {[emoji: string]:number}; // { "😂": 5, "😍": 4, ... }
            const sorted = Object.entries(recent)
                .sort((a, b) => b[1] - a[1]) // nach Häufigkeit sortieren
                .slice(0, 2)
                .map(([emoji]) => emoji); // nur die Emoji-Zeichen

            this.mostUsedEmojis = sorted;
        }
    }
}
