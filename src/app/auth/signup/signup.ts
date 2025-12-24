import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],  // FIXED: Changed from styleUrl to styleUrls
})
export class Signup implements OnInit {

  signupForm: FormGroup;
  submitted = false;
  countries$!: Observable<any[]>;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      country: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
      role: [''],
      isActive: [true] 
    });
  }

  ngOnInit(): void {
    
    this.countries$ = this.http.get<any[]>('https://localhost:44393/api/Countries');
  }

  onSubmit(): void {
    this.submitted = true;

    // FIXED: Added password confirmation check
    if (this.signupForm.invalid || this.signupForm.value.password !== this.signupForm.value.confirmPassword) {
      return;
    }



    const signupData = {
      username: this.signupForm.value.username,
      email: this.signupForm.value.email,
      country: this.signupForm.value.country,  
      phone: this.signupForm.value.phone,
      password: this.signupForm.value.password,
      confirmPassword: this.signupForm.value.confirmPassword,
      role: "User",
      isActive: this.signupForm.value.isActive
    };

    this.http.post('https://localhost:44393/api/User', signupData).subscribe({
      next: (response) => {
        console.log('Signup successful:', response);
        alert('A verification email has been sent to your email address. To complete your sign-up, please verify your email and then log in.');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Signup failed:', error);
        alert('Signup failed. Please try again.');
      }
    });
  }


  //Prevent paste event
  preventPaste(event: ClipboardEvent): void {
    event.preventDefault();
    
    alert('Paste blocked: Please type your password manually.');
   
  }

  get f() { return this.signupForm.controls; }

}