import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';

interface Doc { page_content?: string; metadata?: { source?: string; title?: string } }
interface Res { question: string; generation: string; context: string; documents: Doc[] }
interface Msg { role: 'user' | 'bot'; text: string; docs?: Doc[]; loading?: boolean; error?: boolean }

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header><h1>Carma Chatbot</h1></header>
    <main>
      @if (!msgs.length) { <div class="empty">Ask Carma a question to get started.</div> }
      @for (m of msgs; track $index) {
        <div class="msg" [class.user]="m.role === 'user'">
          <div class="bubble" [class.err]="m.error">
            @if (m.loading) { <span class="dot"></span><span class="dot"></span><span class="dot"></span> }
            @else { {{ m.text }} }
          </div>
          @if (m.docs?.length) {
            <details>
              <summary>Sources ({{ m.docs!.length }})</summary>
              @for (d of m.docs!; track $index) {
                <div class="doc">
                  <b>{{ d.metadata?.title || d.metadata?.source || 'Source ' + ($index + 1) }}</b>
                  <p>{{ d.page_content }}</p>
                </div>
              }
            </details>
          }
        </div>
      }
    </main>
    <footer>
      <input [(ngModel)]="text" (keyup.enter)="send()" placeholder="Ask Carma..." [disabled]="busy">
      <button (click)="send()" [disabled]="busy || !text.trim()">Send</button>
    </footer>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100vh; max-width: 800px; margin: auto;
      background: #0f172a; color: #f1f5f9; font: 14px system-ui, sans-serif }
    header { padding: 16px 20px; border-bottom: 1px solid #334155 }
    h1 { margin: 0; font-size: 20px; background: linear-gradient(135deg, #6366f1, #a78bfa);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent }
    main { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 14px }
    .empty { margin: auto; color: #94a3b8 }
    .msg { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; max-width: 80% }
    .msg.user { align-self: flex-end; align-items: flex-end }
    .bubble { padding: 10px 14px; border-radius: 14px; background: #1e293b; white-space: pre-wrap; line-height: 1.5 }
    .msg.user .bubble { background: #6366f1; color: #fff }
    .bubble.err { background: #7f1d1d }
    .dot { display: inline-block; width: 6px; height: 6px; margin: 0 2px; border-radius: 50%;
      background: #94a3b8; animation: b 1.2s infinite }
    .dot:nth-child(2) { animation-delay: .2s } .dot:nth-child(3) { animation-delay: .4s }
    @keyframes b { 0%,60%,100% { opacity: .3 } 30% { opacity: 1 } }
    details { background: #1e293b; border-radius: 10px; padding: 8px 12px; font-size: 13px; width: 100% }
    summary { cursor: pointer; color: #a78bfa; font-weight: 600 }
    .doc { margin-top: 8px; padding: 8px 10px; background: #0f172a; border-radius: 6px }
    .doc b { color: #a78bfa; font-size: 12px }
    .doc p { margin: 4px 0 0; color: #94a3b8; font-size: 12px; max-height: 100px; overflow: auto }
    footer { display: flex; gap: 8px; padding: 16px 20px; border-top: 1px solid #334155 }
    input { flex: 1; padding: 10px 14px; background: #1e293b; border: 1px solid #334155;
      border-radius: 10px; color: inherit; font: inherit; outline: none }
    input:focus { border-color: #6366f1 }
    button { padding: 10px 22px; background: #6366f1; color: #fff; border: 0;
      border-radius: 10px; cursor: pointer; font: 600 14px inherit }
    button:disabled { opacity: .5; cursor: not-allowed }
  `],
})
class App {
  private http = inject(HttpClient);
  msgs: Msg[] = [];
  text = '';
  busy = false;

  send() {
    const q = this.text.trim();
    if (!q || this.busy) return;
    this.msgs.push({ role: 'user', text: q }, { role: 'bot', text: '', loading: true });
    this.text = '';
    this.busy = true;
    this.http.post<Res>('/api/chat', { question: q }).subscribe({
      next: r => {
        this.msgs[this.msgs.length - 1] = { role: 'bot', text: r.generation, docs: r.documents };
        this.busy = false;
      },
      error: () => {
        this.msgs[this.msgs.length - 1] = { role: 'bot', text: 'API error', error: true };
        this.busy = false;
      },
    });
  }
}

bootstrapApplication(App, { providers: [provideHttpClient()] });
