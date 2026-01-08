import { unitService } from './../../../service/units';
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

import { unitModel } from '../../../../model/units';

export interface ExtendedUnit extends unitModel {
  createdDate: string;
  modifiedDate: string; 
  isActive: boolean;
}

@Component({
  selector: 'app-units',
  imports: [CommonModule, FormsModule, TableModule, InputTextModule, ButtonModule, SelectModule],
  templateUrl: './units.html',
  styleUrl: './units.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Units implements OnInit, AfterViewInit {
  @ViewChild('dt') dt!: Table;
    
      units: ExtendedUnit[] = []; 
      unitData: Partial<unitModel> = {
        id: '',
        unitCode: 0,
        unitName: '',
        sectionName: '',
      };
      isSubmitting: boolean = false;
      isSuccess: boolean = false;
      private successTimeout: any;
      private isDataLoaded: boolean = false;
      sectionNames: { name: string }[] = [];
      
    
      constructor(
        private sectionService: sectionService,
        private unitService: unitService,
        private http: HttpClient,
        @Inject(PLATFORM_ID) private platformId: Object,
        private cdr: ChangeDetectorRef
      ) {}
    
      ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)){
          this.loadSections();
        }
      }
    
      private loadSections(): void {
        this.sectionService.Getall().subscribe({
          next: (sections: any[]) => {
            this.sectionNames = sections.map(section => ({ name: section.sectionName }));
            console.log('Sections loaded:', this.sectionNames);  // Optional: Log for debugging
          },
          error: (error) => {
            console.error('Error fetching sections:', error);
            this.sectionNames = [];  // Fallback to empty array on error
          }
        });
      }
    
      ngAfterViewInit(): void {
        if (isPlatformBrowser(this.platformId) && !this.isDataLoaded) {
          // Defer to after view is stable
          setTimeout(() => {
            this.loadUnits();
          }, 0);
        }
      }

      loadUnits(): void {
        if (this.isDataLoaded) return;
        this.isDataLoaded = true;
    
        this.unitService.Getall().subscribe({
          next: (data) => {
            setTimeout(() => {
              this.units = data.map(unit => ({
                ...unit,  // Spread all original unit fields including unitCode
                createdDate: new Date().toISOString().split('T')[0],
                modifiedDate: new Date().toISOString().split('T')[0],
                isActive: true,
              }));
              this.cdr.markForCheck();
            }, 0);
          },
          error: (err) => {
            console.error('Error loading units:', err);
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


        const submitData = { ...this.unitData };

        if (submitData.id) {
          (this.unitService.Update as any)(submitData).subscribe({
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
            unitCode: this.unitData.unitCode,
            unitName: this.unitData.unitName,
            sectionName: this.unitData.sectionName,
          };
    
          console.log('Sending createData payload:', createData);

          this.unitService.Create(createData as any).subscribe({
            next: (newUnit) => {
              console.log('Create successful:', newUnit);
              const extendedNew: ExtendedUnit = { 
                ...newUnit,  
                createdDate: new Date().toISOString().split('T')[0], 
                modifiedDate: new Date().toISOString().split('T')[0],
                isActive: true
              };
              setTimeout(() => {
                this.units = [extendedNew, ...this.units];
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
            this.loadUnits();
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
    
      editUnit(unit: ExtendedUnit): void {
        this.unitData = { ...unit };
        this.cdr.markForCheck();
      }
    
      approveUnit(unit: ExtendedUnit): void {
        console.log('Approve:', unit);
      }
    
      lockUnit(unit: ExtendedUnit): void {
        console.log('Lock:', unit);
      }
    
      deleteUnit(id: string): void {
        this.unitService.Delete(id).subscribe({
          next: () => {
            setTimeout(() => {
              this.units = this.units.filter(u => u.id !== id);
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
        this.unitData = {
          id: '',
          unitCode: 0,
          unitName: '',
          sectionName: '',
        };
      }

}