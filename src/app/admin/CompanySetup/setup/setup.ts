
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Table } from 'primeng/table';

import { CompanySetup } from '../../../service/company-setup';
import { companyModel } from '../../../../model/company';


interface ExtendedCompany extends companyModel {
  startDate: string; 
  lockedDate: string; 
  editedBy: string;
}

@Component({
  selector: 'app-setup',
  imports: [CommonModule, FormsModule, TableModule, InputTextModule, ButtonModule],
  templateUrl: './setup.html',
  styleUrl: './setup.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Setup implements OnInit, AfterViewInit {
 @ViewChild('dt') dt!: Table;

  companies: ExtendedCompany[] = []; // Stable empty array
  companyData: Partial<companyModel> = {
    id: '',
    companyCode: 0,
    companyShortName: '',
    companyName: '',
    companyNameBangla: '',
    companyAddress: '',
    companyAddressBangla: ''
  };
  isSubmitting: boolean = false;
  isSuccess: boolean = false;
  private successTimeout: any;
  private isDataLoaded: boolean = false;

  constructor(
    private companyService: CompanySetup,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // No async in OnInit
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId) && !this.isDataLoaded) {
      // Defer to after view is stable
      setTimeout(() => {
        this.loadCompanies();
      }, 0);
    }
  }

  loadCompanies(): void {
    if (this.isDataLoaded) return;
    this.isDataLoaded = true;

    this.companyService.Getall().subscribe({
      next: (data) => {
        setTimeout(() => {
          this.companies = data.map(company => ({
            ...company,
            startDate: new Date().toISOString().split('T')[0],
            lockedDate: new Date().toISOString().split('T')[0],
            editedBy: ''
          }));
          this.cdr.markForCheck();
        }, 0);
      },
      error: (err) => {
        console.error('Error loading companies:', err);
        this.isDataLoaded = true;
      }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // If already formatted string
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
    this.cdr.markForCheck(); 

    const submitData = { ...this.companyData };

    if (submitData.id) {
      
      (this.companyService.Update as any)(submitData).subscribe({
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
        companyCode: submitData.companyCode,
        companyShortName: submitData.companyShortName,
        companyName: submitData.companyName,
        companyNameBangla: submitData.companyNameBangla || '',
        companyAddress: submitData.companyAddress,
        companyAddressBangla: submitData.companyAddressBangla || ''
      };
      console.log('Sending createData to API:', createData);
      this.companyService.Create(createData as Omit<companyModel, 'id'>).subscribe({
        next: (newCompany) => {
          console.log('Create successful:', newCompany);
          const extendedNew: ExtendedCompany = { 
            ...newCompany, 
            startDate: new Date().toISOString().split('T')[0], 
            lockedDate: new Date().toISOString().split('T')[0],
            editedBy: '' 
          };
          setTimeout(() => {
            this.companies = [extendedNew, ...this.companies];
            this.cdr.markForCheck();
          }, 0);
          this.handleSubmitSuccess();
        },
        error: (err) => {
          console.error('Create error:', err);
          console.error('Full validation errors:', JSON.stringify(err.error?.errors, null, 2));
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
        this.loadCompanies();
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

  editCompany(company: ExtendedCompany): void {
    this.companyData = { ...company };
    this.cdr.markForCheck();
  }

  approveCompany(company: ExtendedCompany): void {
    console.log('Approve:', company);
  }

  lockCompany(company: ExtendedCompany): void {
    console.log('Lock:', company);
  }

  deleteCompany(id: string): void {
    this.companyService.Delete(id).subscribe({
      next: () => {
        setTimeout(() => {
          this.companies = this.companies.filter(c => c.id !== id);
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
    this.companyData = {
      id: '',
      companyCode: 0,
      companyShortName: '',
      companyName: '',
      companyNameBangla: '',
      companyAddress: '',
      companyAddressBangla: ''
    };
  }
}

