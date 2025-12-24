import { routes } from './../../app.routes';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';  // Add OnInit, OnDestroy
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../service/auth-service';
import { Router, ActivatedRoute } from '@angular/router';  // Add ActivatedRoute
import { Subject } from 'rxjs';  // For cleanup (optional, but good practice)
import { takeUntil } from 'rxjs/operators';  // For cleanup

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit, OnDestroy {  // Implement OnInit, OnDestroy
  constructor(
    private fb: FormBuilder, 
    private auth: AuthService, 
    private router: Router,
    private route: ActivatedRoute,  // Inject ActivatedRoute
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  form: any;
  showSuccessMessage = false;  // Flag for popup
  showFailMessage = false;     // Flag for failure popup
  private destroy$ = new Subject<void>();  // For cleanup

  ngOnInit(): void {
    this.form = this.fb.group({
      identifier: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });

    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('authToken');
      if (token) {
        console.log('Token found, redirecting to dashboard');  // DEBUG
        this.router.navigate(['/dashboard']);
      }
    }
    
    // Check for signup success query param (browser-only for SSR safety)
    if (isPlatformBrowser(this.platformId)) {
      this.route.queryParams
        .pipe(takeUntil(this.destroy$))
        .subscribe(params => {
          console.log('Query params snapshot:', params);  // DEBUG: {signup: 'success'} or {}
          if (params['signup'] === 'success') {
            console.log('SUCCESS: Triggering popup!');  // DEBUG
            this.showSuccessMessage = true;
            setTimeout(() => {
              console.log('TIMEOUT: Hiding popup');  // DEBUG
              this.showSuccessMessage = false;
            }, 10000);
            // Clear query param
            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: { signup: null },
              queryParamsHandling: 'merge',
            }).then(() => {
              console.log('Query param cleared from URL');  // DEBUG
            });
          } else {
            console.log('No success param found');  // DEBUG
          }
        });
    } else {
      console.log('SSR mode: Skipping query param check');  // DEBUG
    }


    if (isPlatformBrowser(this.platformId)) {
      this.route.queryParams
        .pipe(takeUntil(this.destroy$))
        .subscribe(params => {
          console.log('Query params snapshot:', params);  // DEBUG: {signup: 'success'} or {}
          if (params['signup'] === 'failed') {
            console.log('SUCCESS: Triggering popup!');  // DEBUG
            this.showFailMessage = true;
            setTimeout(() => {
              console.log('TIMEOUT: Hiding popup');  // DEBUG
              this.showFailMessage = false;
            }, 10000);
            // Clear query param
            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: { signup: null },
              queryParamsHandling: 'merge',
            }).then(() => {
              console.log('Query param cleared from URL');  // DEBUG
            });
          } else {
            console.log('No success param found');  // DEBUG
          }
        });
    } else {
      console.log('SSR mode: Skipping query param check');  // DEBUG
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
        next: (response: any) => {
          console.log('Full login response:', response);
          const token = response.token || response.accessToken || response;
          if (token && typeof token === 'string') {
            console.log('Extracted token (masked):', token ? `Starts: ${token.substring(0, 10)}...` : 'None');
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

  // Prevent paste event
  preventPaste(event: ClipboardEvent): void {
    event.preventDefault();
    alert('Paste blocked: Please type your password manually.');
  }
}