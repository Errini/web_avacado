import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'; // HttpParams added
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// Updated Message interface
export interface Message {
  _id?: string;
  content: string;
  user?: { // User info is now an object
    _id: string;
    username: string;
    imagePath?: string; // Added imagePath
  };
  // Temporary field to pass userId for creation until auth is done
  userId?: string; 
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private messages: Message[] = [];  private messagesUrl = "https://3000-i3uc0ulhxr9ub5f1gapc7-ee95336e.manus.computer/api/messages"; // Updated backend URL

  constructor(private http: HttpClient) { }

  // Helper to get temporary userId
  private getTempUserId(): string | null {
    return localStorage.getItem('tempUserId'); // Using localStorage temporarily
  }

  getMessages(): Observable<Message[]> {
    return this.http.get<{ message: string, obj: Message[] }>(this.messagesUrl)
      .pipe(
        map(response => {
          this.messages = response.obj;
          return this.messages; // Messages now include populated user object
        }),
        catchError(error => throwError(() => new Error('Error fetching messages: ' + error.message)))
      );
  }

  addMessage(messageContent: string): Observable<Message> {
    const tempUserId = this.getTempUserId();
    if (!tempUserId) {
      return throwError(() => new Error('User not logged in (temp check)'));
    }
    const body = JSON.stringify({ content: messageContent, userId: tempUserId }); // Pass userId temporarily
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    // Add token later
    return this.http.post<{ message: string, obj: Message }>(this.messagesUrl /* + token */, body, { headers: headers })
      .pipe(
        map(response => {
          const newMessage = response.obj; // Backend returns populated message
          this.messages.push(newMessage);
          return newMessage;
        }),
        catchError(error => throwError(() => new Error('Error adding message: ' + error.message)))
      );
  }

  updateMessage(message: Message): Observable<Message> {
    const tempUserId = this.getTempUserId();
    if (!tempUserId) {
      return throwError(() => new Error('User not logged in (temp check)'));
    }
    // Pass userId in body for temporary auth check in backend
    const body = JSON.stringify({ content: message.content, userId: tempUserId }); 
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    // Add token later
    return this.http.put<{ message: string, obj: Message }>(`${this.messagesUrl}/${message._id}` /* + token */, body, { headers: headers })
      .pipe(
        map(response => response.obj), // Backend returns populated message
        catchError(error => {
          const errorMsg = error.error?.error?.message || 'Error updating message.';
          return throwError(() => new Error(errorMsg));
        })
      );
  }

  deleteMessage(message: Message): Observable<any> {
    const tempUserId = this.getTempUserId();
    if (!tempUserId) {
      return throwError(() => new Error('User not logged in (temp check)'));
    }
    // Pass userId as query param for temporary auth check in backend
    let params = new HttpParams().set('userId', tempUserId);
    // Add token later
    return this.http.delete<{ message: string, obj: any }>(`${this.messagesUrl}/${message._id}` /* + token */, { params: params })
      .pipe(
        map(response => {
          this.messages.splice(this.messages.findIndex(m => m._id === message._id), 1);
          return response.obj;
        }),
        catchError(error => {
          const errorMsg = error.error?.error?.message || 'Error deleting message.';
          return throwError(() => new Error(errorMsg));
        })
      );
  }
}

