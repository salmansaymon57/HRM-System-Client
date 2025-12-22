import { Component, OnDestroy, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';  
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Employees } from '../../service/employees';
import { employeeModel } from '../../../model/employees';
import { Subscription } from 'rxjs';
import { Add } from '../add/add';
import { d_List } from '../../departments/list/list';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth-service';



@Component({
  selector: 'app-list',
  imports: [CommonModule, Add, d_List],
  templateUrl: './list.html',
  styleUrls: ['./list.css'],
  standalone: true
})
export class List implements OnInit, OnDestroy {
  _list: employeeModel[] = [];
  subs = new Subscription();

  datasource = { data: [] as employeeModel[] };

  showModal: boolean = false;
  currentEmployee: employeeModel | null = null;
  isAddMode: boolean = true;

  constructor(
    private employeesService: Employees,
    private cdr: ChangeDetectorRef, 
    private router: Router,
    private auth: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
    
  ) {}

  loadEmployees() {
    let _sub = this.employeesService.Getall().subscribe({
      next: (data) => {
        this._list = data;
        this.datasource.data = [...this._list];  
        this.cdr.detectChanges();  
      },
      error: (err) => {
        console.error('Load error:', err);
        if (isPlatformBrowser(this.platformId)) {
          alert('Failed to load employees.');
        } else {
          console.error('SSR: Failed to load employees (no alert available).');
        }
      }
    });
    this.subs.add(_sub);
  }

  updateList() {
    this.loadEmployees();  
  }

  ngOnInit() {
    this.loadEmployees();


    if (isPlatformBrowser(this.platformId)){
      const token = localStorage.getItem('authToken');
    if (token == null) {
      this.router.navigate(['/login']);
    }
      
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  

  add() {
    this.currentEmployee = null;
    this.isAddMode = true;
    this.showModal = true;
  }

  openModal(id: string) {
    if (id) {
      this.isAddMode = false;
      this.employeesService.Get(id).subscribe({
        next: (item) => {
          this.currentEmployee = item;
          this.showModal = true;
        },
        error: (err) => {
          console.error('Get error:', err);
          if (isPlatformBrowser(this.platformId)) {
            alert(`Failed to load employee ${id}. Check ID type or server.`);
          } else {
            console.error(`SSR: Failed to load employee ${id}.`);
          }
        }
      });
    } else {
      this.add();
    }
  }

  onSaved() {
    this.updateList();  
    this.showModal = false;
    this.currentEmployee = null;
  }

  onCancelled() {
    this.showModal = false;
    this.currentEmployee = null;
  }

  Edit(id: string) {
    this.openModal(id);
  }

  Delete(id: string) {
    if (confirm('Are you sure to delete this record?')) {

      if (!isPlatformBrowser(this.platformId)) {
        console.warn('SSR: Skipping delete confirmation.');
        return;  // Or handle server-side if needed
      }

      this.employeesService.Delete(id).subscribe({
        next: () => {
          if (isPlatformBrowser(this.platformId)) {
            alert('Deleted Successfully');
          }
          this.updateList();  
        },
        error: (err) => {
          console.error('Delete error:', err);
          if (isPlatformBrowser(this.platformId)) {
            alert(`Failed to delete ${id}. Check server.`);
          } else {
            console.error(`SSR: Failed to delete ${id}.`);
          }
        }
      });
    }
  }

  logout() {
    this.auth.clearToken();
    this.router.navigate(['/login']);
  }
}
