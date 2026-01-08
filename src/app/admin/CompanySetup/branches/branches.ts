import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Table } from 'primeng/table';
import { SelectModule } from 'primeng/select';

import { branchService } from '../../../service/branches';
import { branchModel } from '../../../../model/branches';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { CompanySetup } from '../../../service/company-setup';

interface ExtendedBranch extends branchModel {
  startDate: string; 
  lockedDate: string; 
  editedBy: string;
}

@Component({
  selector: 'app-branches',
  imports: [CommonModule, FormsModule, TableModule, InputTextModule, ButtonModule, SelectModule],
  templateUrl: './branches.html',
  styleUrl: './branches.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Branches implements OnInit, AfterViewInit {
  @ViewChild('dt') dt!: Table;

  branches: ExtendedBranch[] = []; 
  branchData: Partial<branchModel> = {
    id: '',
    branchCode: null,
    branchName: '',
    companyName: '',
    companyNameBangla: '',
    branchAddress: '',
    branchAddressBangla: ''
  };
  isSubmitting: boolean = false;
  isSuccess: boolean = false;
  private successTimeout: any;
  private isDataLoaded: boolean = false;
  companies: { name: string }[] = [];

  constructor(
    private branchService: branchService,
    private http: HttpClient,
    private companyService: CompanySetup,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
    
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

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId) && !this.isDataLoaded) {
      // Defer to after view is stable
      setTimeout(() => {
        this.loadBranches();
      }, 0);
    }
  }

  loadBranches(): void {
    if (this.isDataLoaded) return;
    this.isDataLoaded = true;

    this.branchService.Getall().subscribe({
      next: (data) => {
        setTimeout(() => {
          this.branches = data.map(branch => ({
            ...branch,  // Spread all original branch fields including branchCode
            branchCode: branch.branchCode,
            startDate: new Date().toISOString().split('T')[0],
            lockedDate: new Date().toISOString().split('T')[0],
            editedBy: ''
          }));
          this.cdr.markForCheck();
        }, 0);
      },
      error: (err) => {
        console.error('Error loading branches:', err);
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

    
    const submitData = { ...this.branchData };

    if (submitData.id) {
      
      (this.branchService.Update as any)(submitData).subscribe({
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
        branchCode: submitData.branchCode ?? 0,
        branchName: submitData.branchName,
        companyName: submitData.companyName,
        companyNameBangla: submitData.companyNameBangla || '',
        branchAddress: submitData.branchAddress,
        branchAddressBangla: submitData.branchAddressBangla || ''
      };

      console.log('Sending createData payload:', createData);
      
      this.branchService.Create(createData as any).subscribe({
        next: (newBranch) => {
          console.log('Create successful:', newBranch);
          const extendedNew: ExtendedBranch = { 
            ...newBranch,  
            startDate: new Date().toISOString().split('T')[0], 
            lockedDate: new Date().toISOString().split('T')[0],
            editedBy: '' 
          };
          setTimeout(() => {
            this.branches = [extendedNew, ...this.branches];
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
        this.loadBranches();
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

  editBranch(branch: ExtendedBranch): void {
    this.branchData = { ...branch };
    this.cdr.markForCheck();
  }

  approveBranch(branch: ExtendedBranch): void {
    console.log('Approve:', branch);
  }

  lockBranch(branch: ExtendedBranch): void {
    console.log('Lock:', branch);
  }

  deleteBranch(id: string): void {
    this.branchService.Delete(id).subscribe({
      next: () => {
        setTimeout(() => {
          this.branches = this.branches.filter(b => b.id !== id);
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
    this.branchData = {
      id: '',
      branchName: '',
      companyName: '',
      companyNameBangla: '',
      branchAddress: '',
      branchAddressBangla: ''
    };
  }
}