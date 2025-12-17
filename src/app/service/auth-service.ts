import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private apiUrl = 'https://localhost:44393/api/Login';
   
  constructor(private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  login(credentials: { identifier: string; password: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, credentials);
  }

  storeToken(token: string): void {
    if (isPlatformBrowser(this.platformId)){
    localStorage.setItem('authToken', token);
    console.log('Token stored (masked):', token ? `Starts: ${token.substring(0, 10)}...` : 'None');  // DEBUG
    }
  }

  

  clearToken(): void {
    if (isPlatformBrowser(this.platformId)){
    localStorage.removeItem('authToken');
    console.log('Token cleared');  // DEBUG
    }
  }
  
}
