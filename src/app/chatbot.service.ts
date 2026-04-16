import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatApiResponse } from './chatbot.model';

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/chat';

  ask(question: string): Observable<ChatApiResponse> {
    return this.http.post<ChatApiResponse>(this.apiUrl, { question });
  }
}
