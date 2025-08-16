import { Injectable, inject, Injector, runInInjectionContext, ViewChild, ElementRef } from '@angular/core';
import { Firestore, collection, query, where, getDocs, addDoc, onSnapshot, serverTimestamp, orderBy, DocumentReference, doc, updateDoc, CollectionReference, getDoc, limit, increment, writeBatch, WriteBatch, arrayUnion } from '@angular/fire/firestore';
import { UserService } from './user.service';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { ChannelService } from './channel.service';
import { from, map, shareReplay } from 'rxjs';

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
    batch: any;
    showEmojis: boolean = false;

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


    private async getExistingThreadId(chatId: string, parentMessageId: string): Promise<string | null> {
        const threadsCol = collection(this.firestore, `chats/${chatId}/message/${parentMessageId}/threads`);
        const existing = await getDocs(query(threadsCol, limit(1)));
        return existing.empty ? null : existing.docs[0].id;
    }

    private createThreadDocument(batch: WriteBatch, chatId: string, parentMessageId: string, senderId: string, text: string, threadId?: string): string {
        const threadsCol = collection(this.firestore, `chats/${chatId}/message/${parentMessageId}/threads`);
        const newThreadRef = threadId ? doc(threadsCol, threadId) : doc(threadsCol);

        batch.set(newThreadRef, {
            senderId,
            text,
            timestamp: serverTimestamp()
        });

        return newThreadRef.id;
    }

    async getOrCreateThread(chatId: string, parentMessageId: string, senderId: string, text: string, threadId?: string): Promise<string> {
        return runInInjectionContext(this.injector, async () => {
            const existingId = await this.getExistingThreadId(chatId, parentMessageId);
            if (existingId) return existingId;

            const batch = writeBatch(this.firestore);
            const newThreadId = this.createThreadDocument(batch, chatId, parentMessageId, senderId, text, threadId);
            this.incrementThreadCount(batch, chatId, parentMessageId);

            await batch.commit();
            return newThreadId;
        });
    }

    private incrementThreadCount(batch: WriteBatch, chatId: string, parentMessageId: string): void {
        const parentMsgRef = doc(this.firestore, `chats/${chatId}/message/${parentMessageId}`);
        batch.update(parentMsgRef, { 
            threadCount: increment(1),
            lastThreadReply: serverTimestamp()
        });
    }

    async getParrentMessageId() {
        return runInInjectionContext(this.injector, async () => {
            this.parentMessagesRef = collection(this.firestore, `chats/${this.dataUser.chatId}/message`);
            const snapshot = await getDocs(this.parentMessagesRef);
            console.log(this.parentMessagesRef);
            if (!snapshot.empty) {
                return snapshot.docs[0].id;
            }
            return null;
        });
    }

    async sendThreadMessage(chatId: string, rootId: string, senderId: string, text: string) {
        return runInInjectionContext(this.injector, async () => {
            const batch = writeBatch(this.firestore);

            this.createThreadDocument(batch, chatId, rootId, senderId, text);

            this.incrementThreadCount(batch, chatId, rootId);

            await batch.commit();
        });
    }

    listenToMessagesThread() {
        if (this.unsubscribeMessagesThread) {
            this.unsubscribeMessagesThread();
        }
        return runInInjectionContext(this.injector, async () => {
            const messagesRef = collection(this.firestore, `chats/${this.dataUser.chatId}/message/${this.parentMessageId}/threads`);
            const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
            this.unsubscribeMessagesThread = onSnapshot(messagesQuery, (snapshot) => {
                this.messagesThread = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                this.hasMessagesThread = this.messagesThread.length !== 0;
            });
        });
    }

    async checkIfMessageHasThreads(parentMessageId: string) {
        const threadsRef = collection(
            this.firestore,
            `chats/${this.dataUser.chatId}/message/${parentMessageId}/threads`
        );

        const threadsSnap = await getDocs(threadsRef);
        return !threadsSnap.empty;
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

    async updateUserMessage(messageId: string, newMessage: string): Promise<void> {
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

    saveEmoji(emoji: string) {
        const stored = JSON.parse(localStorage.getItem('frequently') || '{}');
        stored[emoji] = (stored[emoji] || 0) + 1;
        localStorage.setItem('frequently', JSON.stringify(stored));
    }

    loadMostUsedEmojis() {
        const stored = localStorage.getItem('frequently');
        if (!stored) return;

        const recent = JSON.parse(stored) as Record<string, number>;
        this.mostUsedEmojis = Object.entries(recent)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([emoji]) => emoji);
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


    private async resolveThreadSenderId(parentMessageId: string): Promise<string> {
        return runInInjectionContext(this.injector, async () => {
            const parentMsgRef = doc(this.firestore, `chats/${this.dataUser.chatId}/message/${parentMessageId}`);
            const snap = await getDoc(parentMsgRef);

            if (!snap.exists()) return this.channelService.currentUserId;

            const data = snap.data() as any;

            const senderId = data?.senderId ??
                data?.userId ??
                data?.sender?.id ??
                this.channelService.currentUserId;

            return senderId;
        });
    }
    async answerOnMessage(parentMessageId: string, parentText: string) {
        this.parentMessageId = parentMessageId;

        const senderIdForThread = await this.resolveThreadSenderId(parentMessageId);

        this.threadId = await this.getOrCreateThread(
            this.dataUser.chatId,
            parentMessageId,
            senderIdForThread,
            parentText,
            this.threadId
        );

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

    hideAllEmojis() {
        this.showEmojis = false;
    }

    getLastThreadReplyTime(messageId: string): Date | null {
        const message = this.messages.find(msg => msg.id === messageId);
        if (message && message.lastThreadReply) {
            return message.lastThreadReply.toDate();
        }
        return null;
    }

    saveEmojisInDatabase(selectedEmoji: string, messageId: string) {
        return runInInjectionContext(this.injector, async () => {
            const messagesRef = doc(this.firestore, `chats/${this.dataUser.chatId}/message/${messageId}`);
            await updateDoc(messagesRef, {
                reactions: arrayUnion({
                    emoji: selectedEmoji,
                    user: this.channelService.currentUser?.name,
                    addedAt: Date.now()
                })
            });
        })
    }

    listenToEmojis(chatId: string, messageId: string) {
        const reactionsRef = collection(
            this.firestore,
            `chats/${chatId}/message/${messageId}/reactions`
        );
        const q = query(reactionsRef, orderBy('createdAt', 'asc'));

        return onSnapshot(q, (snapshot) => {
            const emojis = snapshot.docs.map(doc => doc.data());
        });
    }
}
