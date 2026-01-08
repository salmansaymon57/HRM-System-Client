import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Table } from 'primeng/table';
import { SelectModule } from 'primeng/select';

import { sectionService } from '../../../service/sections';

import { HttpClient } from '@angular/common/http';

import { CompanySetup } from '../../../service/company-setup';
import { Departments } from '../../../service/departments';
import { sectionModel } from '../../../../model/sections';

export interface ExtendedSection extends sectionModel {
  isActive: boolean;
  createdDate: string;
  modifiedDate: string; 
}

@Component({
  selector: 'app-sections',
  imports: [CommonModule, FormsModule, TableModule, InputTextModule, ButtonModule, SelectModule],
  templateUrl: './sections.html',
  styleUrl: './sections.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Sections implements OnInit, AfterViewInit{
  @ViewChild('dt') dt!: Table;
    
      sections: ExtendedSection[] = []; 
      sectionData: Partial<sectionModel> = {
        id: '',
        departmentName: '',
        sectionCode: 0,
        sectionName: '',
      };
      isSubmitting: boolean = false;
      isSuccess: boolean = false;
      private successTimeout: any;
      private isDataLoaded: boolean = false;
      departmentNames: { name: string }[] = [];
      
    
      constructor(
        private sectionService: sectionService,
        private departmentService: Departments,
        private http: HttpClient,
        @Inject(PLATFORM_ID) private platformId: Object,
        private cdr: ChangeDetectorRef
      ) {}
    
      ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)){
        this.loadDepartments();
        }
      }
    
      private loadDepartments(): void {
        this.departmentService.Getall().subscribe({
          next: (departments: any[]) => {
            this.departmentNames = departments.map(department => ({ name: department.departmentName }));
            console.log('Departments loaded:', this.departmentNames);  // Optional: Log for debugging
          },
          error: (error) => {
            console.error('Error fetching departments:', error);
            this.departmentNames = [];  // Fallback to empty array on error
          }
        });
      }
    
      ngAfterViewInit(): void {
        if (isPlatformBrowser(this.platformId) && !this.isDataLoaded) {
          // Defer to after view is stable
          setTimeout(() => {
            this.loadSections();
          }, 0);
        }
      }

      loadSections(): void {
        if (this.isDataLoaded) return;
        this.isDataLoaded = true;
    
        this.sectionService.Getall().subscribe({
          next: (data) => {
            setTimeout(() => {
              this.sections = data.map(section => ({
                ...section,  // Spread all original section fields including sectionCode
                createdDate: new Date().toISOString().split('T')[0],
                modifiedDate: new Date().toISOString().split('T')[0],
                isActive: true,
              }));
              this.cdr.markForCheck();
            }, 0);
          },
          error: (err) => {
            console.error('Error loading sections:', err);
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


        const submitData = { ...this.sectionData };

        if (submitData.id) {
          (this.sectionService.Update as any)(submitData).subscribe({
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
            departmentName: this.sectionData.departmentName || '',
            sectionCode: this.sectionData.sectionCode || 0,
            sectionName: this.sectionData.sectionName || '',
          };
    
          console.log('Sending createData payload:', createData);
          
          this.sectionService.Create(createData as any).subscribe({
            next: (newSection) => {
              console.log('Create successful:', newSection);
              const extendedNew: ExtendedSection = { 
                ...newSection,  
                createdDate: new Date().toISOString().split('T')[0], 
                modifiedDate: new Date().toISOString().split('T')[0],
                isActive: true
              };
              setTimeout(() => {
                this.sections = [extendedNew, ...this.sections];
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
            this.loadSections();
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
    
      editSection(section: ExtendedSection): void {
        this.sectionData = { ...section };
        this.cdr.markForCheck();
      }
    
      approveSection(section: ExtendedSection): void {
        console.log('Approve:', section);
      }
    
      lockSection(section: ExtendedSection): void {
        console.log('Lock:', section);
      }
    
      deleteSection(id: string): void {
        this.sectionService.Delete(id).subscribe({
          next: () => {
            setTimeout(() => {
              this.sections = this.sections.filter(s => s.id !== id);
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
        this.sectionData = {
          id: '',
          departmentName: '',
          sectionCode: 0,
          sectionName: '',
        };
      }

}