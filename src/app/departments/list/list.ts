import { Component, OnDestroy, OnInit, ChangeDetectorRef, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { departmentModel } from '../../../model/departments';
import { Subscription } from 'rxjs';
import { d_Add } from '../add/add';
import { Departments } from '../../service/departments';

@Component({
  selector: 'd_app-list',
  imports: [CommonModule, d_Add],
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class d_List implements OnInit, OnDestroy {

  _list: departmentModel[] = [];
  subs = new Subscription();

  datasource = { data: [] as departmentModel[] };

  showModal: boolean = false;
  currentDepartment: departmentModel | null = null;
  isAddMode: boolean = true;

  constructor(
    private departmentsService: Departments,
    private cdr: ChangeDetectorRef,
     @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  loadDepartments() {
    let _sub = this.departmentsService.Getall().subscribe({
      next: (data) => {
        this._list = data;
        this.datasource.data = [...this._list];  
        this.cdr.detectChanges();  
      },
      error: (err) => {
        console.error('Load error:', err);
        if (isPlatformBrowser(this.platformId)) {
          alert('Failed to load departments.');  // FIXED: "departments" not "employees"
        } else {
          console.error('SSR: Failed to load departments (no alert available).');
        }
      }
    });
    this.subs.add(_sub);
  }

  updateList() {
    this.loadDepartments();  
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
    this.loadDepartments();
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  add() {
    this.currentDepartment = null;
    this.isAddMode = true;
    this.showModal = true;
  }

  openModal(id: string) {
    if (id) {
      this.isAddMode = false;
      this.departmentsService.Get(id).subscribe({
        next: (item) => {
          this.currentDepartment = item;
          this.showModal = true;
        },
        error: (err) => {
          console.error('Get error:', err);
          if (isPlatformBrowser(this.platformId)) {
            alert(`Failed to load department ${id}. Check ID type or server.`);
          } else {
            console.error(`SSR: Failed to load department ${id}.`);
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
    this.currentDepartment = null;
  }

  onCancelled() {
    this.showModal = false;
    this.currentDepartment = null;
  }

  Edit(id: string) {
    this.openModal(id);
  }

  Delete(id: string) {
    if (confirm('Are you sure to delete this record?')) {
      this.departmentsService.Delete(id).subscribe({
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
}