import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from './chatbot.service';
import { ChatDocument, ChatMessage } from './chatbot.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  private readonly chatbot = inject(ChatbotService);

  @ViewChild('messagesContainer') messagesContainer?: ElementRef<HTMLDivElement>;

  readonly messages = signal<ChatMessage[]>([]);
  readonly input = signal('');
  readonly sending = signal(false);

  readonly suggestions = [
    'What is CARMA?',
    'How does it work?',
    'What data sources are supported?',
  ];

  useSuggestion(text: string): void {
    this.input.set(text);
    this.send();
  }

  send(): void {
    const question = this.input().trim();
    if (!question || this.sending()) {
      return;
    }

    const userMsg: ChatMessage = { role: 'user', text: question };
    const pending: ChatMessage = { role: 'bot', text: '', loading: true };
    this.messages.update((m) => [...m, userMsg, pending]);
    this.input.set('');
    this.sending.set(true);
    this.scrollToBottom();

    this.chatbot.ask(question).subscribe({
      next: (res) => {
        this.messages.update((all) => {
          const next = [...all];
          next[next.length - 1] = {
            role: 'bot',
            text: res.generation ?? '',
            documents: res.documents,
            context: res.context,
          };
          return next;
        });
        this.sending.set(false);
        this.scrollToBottom();
      },
      error: (err) => {
        console.error(err);
        this.messages.update((all) => {
          const next = [...all];
          next[next.length - 1] = {
            role: 'bot',
            text: 'Sorry, something went wrong contacting the chatbot API.',
            error: true,
          };
          return next;
        });
        this.sending.set(false);
        this.scrollToBottom();
      },
    });
  }

  onEnter(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.shiftKey) {
      return;
    }
    keyboardEvent.preventDefault();
    this.send();
  }

  clear(): void {
    this.messages.set([]);
  }

  getSourceLabel(doc: ChatDocument | string, index: number): string {
    if (typeof doc === 'string') {
      return `Source ${index + 1}`;
    }
    const metadata = doc.metadata ?? {};
    const source = doc.source ?? (metadata['source'] as string | undefined);
    const title = doc.title ?? (metadata['title'] as string | undefined);
    return title ?? source ?? `Source ${index + 1}`;
  }

  getSourceContent(doc: ChatDocument | string): string {
    if (typeof doc === 'string') {
      return doc;
    }
    return doc.page_content ?? doc.content ?? '';
  }

  trackMessage(index: number): number {
    return index;
  }

  private scrollToBottom(): void {
    queueMicrotask(() => {
      const el = this.messagesContainer?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    });
  }
}
