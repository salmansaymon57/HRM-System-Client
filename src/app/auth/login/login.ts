import { routes } from './../../app.routes';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../service/auth-service';

import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }


  form : any;

  ngOnInit(): void {
    this.form = this.fb.group({
      identifier: ['', Validators.required],
      password: ['', [ Validators.required, Validators.minLength(8)]]
    });

    if (isPlatformBrowser(this.platformId)){
      const token = localStorage.getItem('authToken');
    if (token) {
      this.router.navigate(['/dashboard']);
    }
      
    }

    
  }

 submit() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  } else {
    const payload = {
      identifier: this.form.value.identifier,
      password: this.form.value.password
    };
    this.auth.login(payload).subscribe({
      next: (response: any) => {  // Explicitly type as 'any' for flexibility
        console.log('Full login response:', response);  // DEBUG: Check this in console
        
        // Extract token - adjust 'token' key based on your API response (e.g., 'accessToken')
        const token = response.token || response.accessToken || response;  // Fallback to raw if direct string
        
        if (token && typeof token === 'string') {
          console.log('Extracted token (masked):', token ? `Starts: ${token.substring(0, 10)}...` : 'None');  // DEBUG
          this.auth.storeToken(token);
          this.router.navigate(['/dashboard']);
        } else {
          console.error('No valid token in response:', response);
          alert('Login failed: Invalid response from server. Check console.');
        }
      },
      error: (error) => {
        console.error('Login failed:', error);
        alert('Login failed. Please check your credentials and try again.');
      }
    });
  } 
}

//Prevent paste event
  preventPaste(event: ClipboardEvent): void {
    event.preventDefault();
    
    alert('Paste blocked: Please type your password manually.');
   
  }
}