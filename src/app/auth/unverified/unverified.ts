import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-unverified',
  imports: [CardModule, ButtonModule],
  templateUrl: './unverified.html',
  styleUrl: './unverified.css',
})
export class Unverified {
  constructor(private router: Router) {}

  login(){
    this.router.navigate(['/login']);
  }

}
