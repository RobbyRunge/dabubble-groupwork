import { Injectable, ElementRef } from '@angular/core';

export type PickerSide = 'left' | 'right';
export type PickerContext = 'chat' | 'thread';

interface PickerState {
  visible: boolean;
  top: number;
  left: number;
  anchorEl?: HTMLElement;
  anchorSide: 'left' | 'right';
  currentMessage?: any;
  currentMessageIndex?: number;
  chatContainer?: ElementRef<HTMLElement>;
  emojiPickerRef?: ElementRef<HTMLElement>;
}

@Injectable({ providedIn: 'root' })
export class EmojiPickerService {
  private states: Record<PickerContext, PickerState> = {
    chat: { visible: false, top: 0, left: 0, anchorSide: 'left' },
    thread: { visible: false, top: 0, left: 0, anchorSide: 'left' }
  };

  bindElements(ctx: PickerContext, chatContainer: ElementRef, emojiPickerRef: ElementRef) {
    this.states[ctx].chatContainer = chatContainer;
    this.states[ctx].emojiPickerRef = emojiPickerRef;
  }

  get state() { return this.states; } // für Templates: state.chat.visible etc.

  open(ev: { anchor: HTMLElement; side: 'left' | 'right'; message: any; index: number; context: PickerContext }) {
    const s = this.states[ev.context];
    s.visible = true;
    s.anchorEl = ev.anchor;
    s.anchorSide = ev.side;
    s.currentMessage = ev.message;
    s.currentMessageIndex = ev.index;

    setTimeout(() => this.reposition(ev.context));
  }

  hide(ctx: PickerContext) { 
    this.states[ctx].visible = false;
   }

  reposition(ctx: PickerContext) {
    const s = this.states[ctx];
    const container = s.chatContainer?.nativeElement;
    const anchor = s.anchorEl;
    const pickerEl = s.emojiPickerRef?.nativeElement;
    if (!container || !anchor || !pickerEl) return;

    const cRect = container.getBoundingClientRect();
    const aRect = anchor.getBoundingClientRect();
    const pickerW = pickerEl.offsetWidth ?? 320;
    const pickerH = pickerEl.offsetHeight ?? 340;

    const topIn = aRect.top - cRect.top + container.scrollTop;
    const leftIn = aRect.left - cRect.left + container.scrollLeft;

    let top = topIn - pickerH;
    if (top < container.scrollTop) top = topIn + aRect.height;

    let left = s.anchorSide === 'left'
      ? leftIn
      : leftIn + aRect.width - pickerW;

    const styles = getComputedStyle(container);
    const minLeft = container.scrollLeft + (parseFloat(styles.paddingLeft) || 0);
    const maxLeft = container.scrollLeft + container.clientWidth - (parseFloat(styles.paddingRight) || 0) - pickerW;
    left = Math.max(minLeft, Math.min(left, maxLeft));

    s.top = top;
    s.left = left;
  }
}
