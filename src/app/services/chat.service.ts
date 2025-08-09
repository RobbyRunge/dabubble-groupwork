import { Injectable, inject, Injector, runInInjectionContext, ViewChild, ElementRef } from '@angular/core';
import { Firestore, collection, query, where, getDocs, addDoc, onSnapshot, serverTimestamp, orderBy, DocumentReference, doc, updateDoc, CollectionReference, getDoc } from '@angular/fire/firestore';
import { UserService } from './user.service';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { ChannelService } from './channel.service';

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
    private drawer!: MatDrawer;
    selectedUser: any;
    channelService = inject(ChannelService);
    private router = inject(Router);
    chatService: any;
    private unsubscribeMessages?: (() => void);
    private unsubscribeMessagesThread?: (() => void);
    messageDocRef: any;
    threadRef: any
    isThreadAktiv: boolean = false;
    chatId: string = '';
    parentMessageId: string = '';
    threadId: string = '';
    senderId: string = '';
    text: string = '';
    messageText: string = '';
    messagesThread: any[] = [];
    hasMessagesThread: boolean = false;
    parentMessagesRef: any;

    async getOrCreateChatId(userId1: string, userId2: string): Promise<string> {
        return runInInjectionContext(this.injector, async () => {
            const chatsRef = collection(this.firestore, 'chats');

            if (userId1 === userId2) {
                return await this.getOrCreateSelfChat(chatsRef, userId1);
            }

            const existingChatId = await this.findExistingChatBetweenUsers(chatsRef, userId1, userId2);
            if (existingChatId) {
                return existingChatId;
            }

            return await this.createNewChat(chatsRef, [userId1, userId2]);
        });
    }

    private async getOrCreateSelfChat(chatsRef: CollectionReference, userId: string): Promise<string> {
        const selfQuery = query(chatsRef, where('user', '==', [userId]));
        const selfSnapshot = await getDocs(selfQuery);

        if (!selfSnapshot.empty) {
            return selfSnapshot.docs[0].id;
        }

        const newSelfChat = await addDoc(chatsRef, { user: [userId] });
        return newSelfChat.id;
    }

    private async findExistingChatBetweenUsers(chatsRef: CollectionReference, userId1: string, userId2: string): Promise<string | null> {
        const q = query(chatsRef, where('user', 'array-contains', userId1));
        const snapshot = await getDocs(q);

        for (const doc of snapshot.docs) {
            const users = doc.data()['user'];
            if (Array.isArray(users) && users.includes(userId2) && users.length === 2) {
                return doc.id;
            }
        }

        return null;
    }

    private async createNewChat(chatsRef: CollectionReference, users: string[]): Promise<string> {
        const newChat = await addDoc(chatsRef, { user: users });
        return newChat.id;
    }


    async sendMessage(messageText: string, senderId: any) {
        return runInInjectionContext(this.injector, async () => {
            if (this.isThreadAktiv) {
                await this.sendThreadMessage(this.dataUser.chatId, this.parentMessageId, senderId, this.text);
            } else {
                await this.sendChatMessage(messageText, senderId)
            }
        })
    }

    async sendChatMessage(messageText: string, senderId: any) {
        return runInInjectionContext(this.injector, async () => {
            const messagesRef = collection(this.firestore, `chats/${this.dataUser.chatId}/message`);
            await addDoc(messagesRef, {
                text: messageText,
                senderId: senderId,
                timestamp: serverTimestamp(),
            });
        })
    }

    async getOrCreateThread(chatId: string, parentMessageId: string, senderId: string, text: string, threadId: string): Promise<string> {
        return runInInjectionContext(this.injector, async () => {
            this.threadRef = collection(this.firestore, `chats/${chatId}/message/${parentMessageId}/threads/${parentMessageId}/messages`);
            const snapshot = await getDocs(this.threadRef);
            if (!snapshot.empty) {
                return snapshot.docs[0].id;
            }
            const newThread = await addDoc(this.threadRef, {
                senderId,
                text,
                timestamp: serverTimestamp()
            });
            return parentMessageId;
        })
    }

    async getParrentMessageId() {
        return runInInjectionContext(this.injector, async () => {
            this.parentMessagesRef = collection(this.firestore, `chats/${this.dataUser.chatId}/message`);
            const snapshot = await getDocs(this.parentMessagesRef);
            if (!snapshot.empty) {
                return snapshot.docs[0].id;
            }
            return null;
        });
    }

    async sendThreadMessage(chatId: string, rootId: string, senderId: string, text: string) {
        return runInInjectionContext(this.injector, async () => {
            const threadMessageRef = collection(this.firestore, `chats/${chatId}/message/${rootId}/threads/messages`);
            await addDoc(threadMessageRef, {
                senderId,
                text,
                timestamp: serverTimestamp()
            });
            const rootRef = doc(this.firestore, `chats/${chatId}/messages/${rootId}`);
            await updateDoc(rootRef, {
                replyCount: ((await getDoc(rootRef)).data()?.['replyCount'] ?? 0) + 1,
                lastReplyAt: serverTimestamp()
            });
    })
}

listenToMessagesThread() {
            if (this.unsubscribeMessagesThread) {
                this.unsubscribeMessagesThread();
            }

    return runInInjectionContext(this.injector, async () => {
        const messagesRef = collection(this.firestore,
            `chats/${this.dataUser.chatId}/message/${this.parentMessageId}/threads/${this.threadId}/messages`);
        const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));

        this.unsubscribeMessagesThread = onSnapshot(messagesQuery, (snapshot) => {
            this.messagesThread = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.hasMessagesThread = this.messagesThread.length !== 0;
        });
    });
}



listenToMessages() {
    if (this.unsubscribeMessages) {
        this.unsubscribeMessages();
    }

    return runInInjectionContext(this.injector, async () => {
        const messagesRef = collection(this.firestore, `chats/${this.dataUser.chatId}/message`);
        const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));

        this.unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
            this.messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.hasMessages = this.messages.length !== 0;
        });
    });
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

    async updateUserMessage(messageId: string, newMessage: string): Promise < void> {
    this.messageDocRef = this.getMessageDoc(messageId);
    await runInInjectionContext(this.injector, () =>
updateDoc(this.messageDocRef, { text: newMessage })
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
        const recent = JSON.parse(stored) as { [emoji: string]: number };
        const sorted = Object.entries(recent)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([emoji]) => emoji);

        this.mostUsedEmojis = sorted;
    }
}
setDrawer(drawer: MatDrawer) {
    this.drawer = drawer;
}

toggle() {
    this.drawer?.toggle();
}

open() {
    this.drawer?.open();
}

close() {
    this.drawer?.close();
}

isOpen(): boolean {
    return this.drawer?.opened || false;
}

    async onUserClick(index: number, user: any) {
    this.selectedUser = user;
    this.channelService.setCheckdValue(user);
    this.dataUser.chatId = await this.getOrCreateChatId(this.channelService.currentUserId, user.userId);
    this.router.navigate(['/mainpage', this.channelService.currentUserId, 'chats', this.dataUser.chatId]);
    this.listenToMessages();
    this.dataUser.showChannel = false;
    this.dataUser.showChatPartnerHeader = true;
}

ngOnDestroy() {
    if (this.unsubscribeMessages) {
        this.unsubscribeMessages();
    }
    if (this.unsubscribeMessagesThread) {
        this.unsubscribeMessagesThread();
    }
}

    async answerOnMessage(parentMessageId: string, parentText: string) {
    this.parentMessageId = parentMessageId;
    this.threadId = await this.getOrCreateThread(
        this.dataUser.chatId,
        parentMessageId,
        this.channelService.currentUserId,
        parentText,
        this.threadId,
    );
    this.isThreadAktiv = true;

    this.open();

    this.router.navigate([
        '/mainpage',
        this.channelService.currentUserId,
        'chats',
        this.dataUser.chatId,
        'threads',
        this.threadId
    ]);

    this.listenToMessagesThread();
}
}
