import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-verify-email',
  imports: [CardModule, ButtonModule],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css',
})
export class VerifyEmail {

  constructor(private router: Router) {}

  login(){
    this.router.navigate(['/login']);
  }

}
