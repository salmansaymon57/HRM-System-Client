import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { companyModel } from '../../model/company';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class branchService {
  private apiUrl = 'https://localhost:44393/api/CompanyBranch'; 

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

  private getAuthHeaders(): HttpHeaders {
    if (isPlatformBrowser(this.platformId)){
      const token = localStorage.getItem('authToken');
      
      console.log('Token retrieved for Departments:', token ? `Present (starts: ${token.substring(0,10)}...ends: ${token.slice(-10)})` : 'Missing');  // Masked token log
      
      if (token) {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`
        });
        console.log('Full headers for Departments request:', headers.keys().map(k => `${k}: ${k === 'Authorization' ? 'Bearer [MASKED]' : headers.get(k)}`).join(', '));  // Log all headers
        return headers;
      }
    }
    console.log('No token or server-side: Empty headers for Departments');
    return new HttpHeaders();
  }

  Getall(): Observable<companyModel[]> {
    const headers = this.getAuthHeaders();
    const requestUrl = this.apiUrl;
    console.log(`Sending GET to ${requestUrl} with headers:`, headers.keys().length > 0 ? 'Auth included' : 'No auth');  // Pre-send log
    return this.http.get<companyModel[]>(requestUrl, { headers });
  }

  // Apply similar logging to other methods if needed (Get, Create, etc.)
  Get(id: string): Observable<companyModel> {  
    const headers = this.getAuthHeaders();
    const requestUrl = `${this.apiUrl}/${id}`;
    console.log(`Sending GET to ${requestUrl} with headers:`, headers.keys().length > 0 ? 'Auth included' : 'No auth');
    return this.http.get<companyModel>(requestUrl, { headers });
  }

  Create(data: Omit<companyModel, 'id'>): Observable<companyModel> {  
    const headers = this.getAuthHeaders();
    const requestUrl = this.apiUrl;
    console.log(`Sending POST to ${requestUrl} with headers:`, headers.keys().length > 0 ? 'Auth included' : 'No auth');
    return this.http.post<companyModel>(requestUrl, data, { headers });
  }

  Update(data: companyModel): Observable<companyModel> {
    const headers = this.getAuthHeaders();
    const requestUrl = `${this.apiUrl}/${data.id}`;
    console.log(`Sending PUT to ${requestUrl} with headers:`, headers.keys().length > 0 ? 'Auth included' : 'No auth');
    return this.http.put<companyModel>(requestUrl, data, { headers });
  }

  Delete(id: string): Observable<void> {  
    const headers = this.getAuthHeaders();
    const requestUrl = `${this.apiUrl}/${id}`;
    console.log(`Sending DELETE to ${requestUrl} with headers:`, headers.keys().length > 0 ? 'Auth included' : 'No auth');
    return this.http.delete<void>(requestUrl, { headers });
  }
  
}
