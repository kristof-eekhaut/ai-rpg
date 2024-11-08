import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, signal, ElementRef, Input,
  ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

interface ChatMessage {
  characterName: string;
  content: string;
}

interface ChatBubbleColors {
  background: string;
  name: string;
}

@Component({
  selector: 'app-chat-messages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-messages.component.html',
  styleUrl: './chat-messages.component.scss',
})
export class ChatMessagesComponent implements OnInit, OnDestroy {

  messages = signal<ChatMessage[]>([]);

  private predefinedColors = [
    { background: '#F5F5F5', name: '#666666' }, // gray
    { background: '#D5E8D4', name: '#82B366' }, // green
    { background: '#FFE6CC', name: '#D79B00' }, // orange
    { background: '#E1D5E7', name: '#9673A6' }, // purple
    { background: '#F8CECC', name: '#B85450' }, // red
    { background: '#DAE8FC', name: '#6C8EBF' }, // blue
    { background: '#FFF2CC', name: '#D6B656' }, // yellow
  ];
  private colorMap = new Map<string, ChatBubbleColors>();

  private messageSourceSubscription!: Subscription;
  private cdr = inject(ChangeDetectorRef);

  @Input({alias: 'messageSource', required: true}) messageSource!: EventSource;
  @ViewChild('chatMessagesContainer') chatMessagesContainer!: ElementRef;

  constructor() {}

  ngOnInit(): void {
    this.chatMessageStream();
  }

  private handleChatMessage(message: ChatMessage): void {
    this.assignColorToName(message.characterName);
    this.messages.update((currentMessages) => this.appendChatMessage(currentMessages, message));
    this.cdr.detectChanges();
    this.scrollDown();
  }

  private appendChatMessage(messages: ChatMessage[], message: ChatMessage): ChatMessage[] {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.characterName == message.characterName) {
        lastMessage.content += ' ' + message.content;
        return messages;
      }
    }
    messages.push(message);
    return messages;
  }

  private scrollDown(): void {
    try {
      this.chatMessagesContainer.nativeElement.scrollTop = this.chatMessagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }

  private assignColorToName(name: string): void {
    if (!this.colorMap.has(name)) {
      const color = this.generateColor();
      this.colorMap.set(name, color);
    }
  }

  private generateColor(): ChatBubbleColors {
    return this.predefinedColors.shift() || this.generateRandomColor();
  }

  private generateRandomColor(): ChatBubbleColors {
    const hue = Math.floor(Math.random() * 360);
    return { background: `hsl(${hue}, 70%, 80%)`, name: `hsl(${hue}, 70%, 25%)` };
  }

  getColorsForName(name: string): ChatBubbleColors {
    return this.colorMap.get(name) || { background: '#dcf8c6', name: '#3d7010' };
  }

  private chatMessageStream(): void {
    this.messageSourceSubscription = new Observable<ChatMessage>(observer => {
      this.messageSource.onmessage = (event) => {
        const message: ChatMessage = JSON.parse(event.data);
        observer.next(message);
      };

      this.messageSource.onerror = (error) => {
        observer.error(error);
        this.messageSource.close();
      };

      return () => this.messageSource.close();
    }).subscribe({
      next: (message: ChatMessage) => {
        this.handleChatMessage(message);
      },
      error: (error) => console.error('Event stream error', error)
    });
  }

  ngOnDestroy(): void {
    if (this.messageSourceSubscription) {
      this.messageSourceSubscription.unsubscribe();
    }
  }
}
