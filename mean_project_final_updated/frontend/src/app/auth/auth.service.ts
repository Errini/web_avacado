import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, throwError, timer } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

// Define a simple User interface (adjust as needed)
export interface User {
  _id?: string;
  username: string;
  email: string;
  password?: string; // Only needed for signup/login, not stored long-term
  imagePath?: string; // Added image path
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = "https://3000-i3uc0ulhxr9ub5f1gapc7-ee95336e.manus.computer/api/users"; // Updated backend URL
  private token: string | null = null;
  private authStatusListener = new Subject<boolean>();
  private isAuthenticated = false;
  private tokenTimer: any;
  private userId: string | null = null;
  private username: string | null = null;
  private userImagePath: string | null = null;

  constructor(private http: HttpClient, private router: Router) { }

  getToken(): string | null {
    return this.token;
  }

  getIsAuth(): boolean {
    return this.isAuthenticated;
  }

  getUserId(): string | null {
    return this.userId;
  }

  getUsername(): string | null {
    return this.username;
  }

  getUserImagePath(): string | null {
    return this.userImagePath;
  }

  getAuthStatusListener(): Observable<boolean> {
    return this.authStatusListener.asObservable();
  }

  // Updated signup to handle FormData
  signup(username: string, email: string, password: string, image: File): Observable<any> {
    const userData = new FormData();
    userData.append("username", username);
    userData.append("email", email);
    userData.append("password", password);
    userData.append("image", image, username); // Pass the file with a filename

    return this.http.post<{ message: string, obj: any }>(`${this.authUrl}/signup`, userData)
      .pipe(
        map(response => response.obj), // Return the user object from backend
        catchError(error => {
          const errorMsg = error.error?.error?.message || 'Signup failed due to an unknown error.';
          return throwError(() => new Error(errorMsg));
        })
      );
  }

  // Login method
  login(email: string, password: string): Observable<any> {
    const authData = { email: email, password: password };
    return this.http.post<{ message: string, token: string, expiresIn: number, userId: string, username: string, imagePath: string }>(`${this.authUrl}/login`, authData)
      .pipe(
        tap(response => {
          const token = response.token;
          this.token = token;
          if (token) {
            const expiresInDuration = response.expiresIn; // in seconds
            this.setAuthTimer(expiresInDuration);
            this.isAuthenticated = true;
            this.userId = response.userId;
            this.username = response.username;
            this.userImagePath = response.imagePath;
            this.authStatusListener.next(true);
            const now = new Date();
            const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
            this.saveAuthData(token, expirationDate, this.userId, this.username, this.userImagePath);
            // Navigate after successful login
            this.router.navigate(['/messages']);
          }
        }),
        catchError(error => {
          const errorMsg = error.error?.error?.message || 'Login failed due to an unknown error.';
          this.authStatusListener.next(false);
          return throwError(() => new Error(errorMsg));
        })
      );
  }

  // Auto authenticate user if token is valid
  autoAuthUser(): void {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.userId = authInformation.userId;
      this.username = authInformation.username;
      this.userImagePath = authInformation.imagePath;
      this.setAuthTimer(expiresIn / 1000); // Convert ms back to seconds
      this.authStatusListener.next(true);
    } else {
      this.clearAuthData(); // Clear expired token
    }
  }

  // Logout method
  logout(): void {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.userId = null;
    this.username = null;
    this.userImagePath = null;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['/']); // Navigate to a public page, e.g., login or home
  }

  private setAuthTimer(duration: number): void {
    console.log("Setting timer: " + duration);
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000); // duration is in seconds
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string, username: string, imagePath: string | null): void {
    localStorage.setItem("token", token);
    localStorage.setItem("expiration", expirationDate.toISOString());
    localStorage.setItem("userId", userId);
    localStorage.setItem("username", username);
    if (imagePath) {
        localStorage.setItem("imagePath", imagePath);
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("imagePath");
    // Clear temporary data if still present
    localStorage.removeItem("tempUserId");
    localStorage.removeItem("tempUsername");
  }

  private getAuthData(): { token: string, expirationDate: Date, userId: string, username: string, imagePath: string | null } | null {
    const token = localStorage.getItem("token");
    const expirationDate = localStorage.getItem("expiration");
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");
    const imagePath = localStorage.getItem("imagePath");
    if (!token || !expirationDate || !userId || !username) {
      return null;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId,
      username: username,
      imagePath: imagePath
    };
  }
}

