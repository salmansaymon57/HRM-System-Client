import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Table } from 'primeng/table';
import { SelectModule } from 'primeng/select';

import { branchService } from '../../../service/branches';

import { HttpClient } from '@angular/common/http';

import { CompanySetup } from '../../../service/company-setup';
import { Departments } from '../../../service/departments';
import { departmentModel } from '../../../../model/departments';

interface ExtendedDepartment extends departmentModel {
  startDate: string; 
  lockedDate: string; 
  editedBy: string;
}

@Component({
  selector: 'app-departments',
  imports: [CommonModule, FormsModule, TableModule, InputTextModule, ButtonModule, SelectModule],
  templateUrl: './departments.html',
  styleUrl: './departments.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Department implements OnInit, AfterViewInit {
   @ViewChild('dt') dt!: Table;
  
    departments: ExtendedDepartment[] = []; 
    departmentData: Partial<departmentModel> = {
      id: '',
      departmentCode: 0,
      departmentName: '',
      companyName: '',
      branchName: '',
    };
    isSubmitting: boolean = false;
    isSuccess: boolean = false;
    private successTimeout: any;
    private isDataLoaded: boolean = false;
    companies: { name: string }[] = [];
    branches: { name: string }[] = [];
  
    constructor(
      private departmentService: Departments,
      private http: HttpClient,
      private companyService: CompanySetup,
      private branchService: branchService,
      @Inject(PLATFORM_ID) private platformId: Object,
      private cdr: ChangeDetectorRef
    ) {}
  
    ngOnInit(): void {
      this.loadCompanies();
      this.loadBranches();
    }
  
    private loadCompanies(): void {
      this.companyService.GetNames().subscribe({
        next: (companies: any[]) => {
          this.companies = companies.map(company => ({ name: typeof company === 'string' ? company : company.companyName }));
          console.log('Companies loaded:', this.companies);  // Optional: Log for debugging
        },
        error: (error) => {
          console.error('Error fetching companies:', error);
          this.companies = [];  // Fallback to empty array on error
        }
      });
    }

    private loadBranches(): void {
      this.branchService.Getall().subscribe({
        next: (branchData: any[]) => {
          this.branches = branchData.map(branch => ({ name: branch.branchName }));
          console.log('Branches loaded:', this.branches);  // Optional: Log for debugging
        },
        error: (error) => {
          console.error('Error fetching branches:', error);
          this.branches = [];  // Fallback to empty array on error
        }
      });
    }
  
    ngAfterViewInit(): void {
      if (isPlatformBrowser(this.platformId) && !this.isDataLoaded) {
        // Defer to after view is stable
        setTimeout(() => {
          this.loadDepartments();
        }, 0);
      }
    }

    loadDepartments(): void {
      if (this.isDataLoaded) return;
      this.isDataLoaded = true;
  
      this.departmentService.Getall().subscribe({
        next: (data) => {
          setTimeout(() => {
            this.departments = data.map(department => ({
              ...department,  // Spread all original department fields including departmentCode
              startDate: new Date().toISOString().split('T')[0],
              lockedDate: new Date().toISOString().split('T')[0],
              editedBy: ''
            }));
            this.cdr.markForCheck();
          }, 0);
        },
        error: (err) => {
          console.error('Error loading departments:', err);
          this.isDataLoaded = true;
        }
      });
    }
  
    formatDate(dateStr: string): string {
      if (!dateStr) return '—';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr; 
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  
    getRowNumber(index: number): number {
      return index + 1;
    }
  
    onSubmit(): void {
      this.isSubmitting = true;
      this.isSuccess = false;
      if (this.successTimeout) {
        clearTimeout(this.successTimeout);
      }
      this.cdr.markForCheck(); // Mark after state change
  
  
      const submitData = { ...this.departmentData };
  
      if (submitData.id) {
        (this.departmentService.Update as any)(submitData).subscribe({
          next: (response: any) => {
            console.log('Update successful:', response);
            this.handleSubmitSuccess();
          },
          error: (err: any) => {
            console.error('Update error:', err);
            this.isSubmitting = false;
            this.cdr.markForCheck();
          }
        });
      } else {
        const createData = {
          departmentCode: submitData.departmentCode,
          departmentName: submitData.departmentName,
          companyName: submitData.companyName,
          branchName: submitData.branchName,
        };
  
        console.log('Sending createData payload:', createData);
        
        this.departmentService.Create(createData as any).subscribe({
          next: (newDepartment) => {
            console.log('Create successful:', newDepartment);
            const extendedNew: ExtendedDepartment = { 
              ...newDepartment,  
              startDate: new Date().toISOString().split('T')[0], 
              lockedDate: new Date().toISOString().split('T')[0],
              editedBy: '' 
            };
            setTimeout(() => {
              this.departments = [extendedNew, ...this.departments];
              this.cdr.markForCheck();
            }, 0);
            this.handleSubmitSuccess();
          },
          error: (err) => {
            console.error('Create error:', err);
            this.isSubmitting = false;
            this.cdr.markForCheck();
          }
        });
      }
    }
  
    private handleSubmitSuccess(): void {
      if (isPlatformBrowser(this.platformId)) {
        this.isDataLoaded = false; 
        setTimeout(() => {
          this.loadDepartments();
        }, 100); 
      }
      this.isSubmitting = false;
      this.isSuccess = true;
      this.cdr.markForCheck();
      this.successTimeout = setTimeout(() => {
        this.isSuccess = false;
        this.resetForm();
        this.cdr.markForCheck();
      }, 2000);
    }
  
    ngOnDestroy(): void {
      if (this.successTimeout) {
        clearTimeout(this.successTimeout);
      }
    }
  
    editDepartment(department: ExtendedDepartment): void {
      this.departmentData = { ...department };
      this.cdr.markForCheck();
    }
  
    approveDepartment(department: ExtendedDepartment): void {
      console.log('Approve:', department);
    }
  
    lockDepartment(department: ExtendedDepartment): void {
      console.log('Lock:', department);
    }
  
    deleteDepartment(id: string): void {
      this.departmentService.Delete(id).subscribe({
        next: () => {
          setTimeout(() => {
            this.departments = this.departments.filter(d => d.id !== id);
            if (this.dt) {
              this.dt.reset();
            }
            this.cdr.markForCheck();
          }, 0);
        },
        error: (err) => console.error('Delete error:', err)
      });
    }
  
    private resetForm(): void {
      this.departmentData = {
        id: '',
        departmentCode: 0,
        departmentName: '',
        companyName: '',
        branchName: '',
      };
    }
}