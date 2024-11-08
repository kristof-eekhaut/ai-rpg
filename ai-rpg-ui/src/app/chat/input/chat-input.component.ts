import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.scss',
})
export class ChatInputComponent {

  @Output() onSubmit = new EventEmitter<string>();
  @ViewChild('textInput', { static: false }) textInput!: ElementRef<HTMLDivElement>;

  public sendMessage(event?: Event): void {
    if (event) {
      event.preventDefault();
    }

    const msg = this.textInput.nativeElement.innerText.trim();
    if (msg) {
      this.onSubmit.emit(msg);
      this.clearInput();
    }
  }

  private clearInput(): void {
    this.textInput.nativeElement.innerText = '';
  }
}
