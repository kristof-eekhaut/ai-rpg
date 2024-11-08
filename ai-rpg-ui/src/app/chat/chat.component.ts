import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatMessagesComponent } from './messages/chat-messages.component';
import { ChatInputComponent } from './input/chat-input.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, ChatMessagesComponent, ChatInputComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {

  messageSource: EventSource = new EventSource('http://localhost:8080/chat');

  constructor(private http: HttpClient) {}

  handleChatInput(msg: string): void {
    console.log('INPUT: ', msg);

    this.postMessage(msg).subscribe();
  }

  private postMessage(msg: string): Observable<void> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'text/plain'
      })
    };
    return this.http.post<void>('http://localhost:8080/chat', msg, httpOptions);
  }
}
