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
      role: ['', Validators.required],
      isActive: [true] 
    });
  }

  ngOnInit(): void {
    // FIXED: Added cca3 to fields for country code values
    this.countries$ = this.http.get<any[]>('https://restcountries.com/v3.1/all?fields=name,cca3');
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
      country: this.signupForm.value.country,  // Now uses cca3 code (e.g., "USA")
      phone: this.signupForm.value.phone,
      password: this.signupForm.value.password,
      confirmPassword: this.signupForm.value.confirmPassword,
      role: this.signupForm.value.role,
      isActive: this.signupForm.value.isActive
    };

    this.http.post('https://localhost:44393/api/User', signupData).subscribe({
      next: (response) => {
        console.log('Signup successful:', response);
        alert('Signup successful! Please log in.');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Signup failed:', error);
        alert('Signup failed. Please try again.');
      }
    });
  }

  get f() { return this.signupForm.controls; }

}