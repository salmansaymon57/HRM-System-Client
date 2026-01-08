import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { departmentModel } from '../../../model/departments';
import { Departments } from '../../service/departments';

@Component({
  selector: 'd_app-add',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add.html',
  styleUrl: './add.css',
})
export class d_Add implements OnInit, OnDestroy {
  @Input() editData: departmentModel | null = null;
  @Input() isAddMode: boolean = true;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  _form!: FormGroup;
  title: string = "Add Department";

  constructor(private service: Departments, private builder: FormBuilder) {}

  ngOnInit() {
    this.title = this.isAddMode ? "Add Department" : "Edit Department";

    this._form = this.builder.group({
      id: this.builder.control({ value: '', disabled: true }),  
      name: this.builder.control('', Validators.compose([Validators.required, Validators.minLength(3)])),
      description: this.builder.control('', Validators.required),
      isActive: this.builder.control('', Validators.required),
      createdDate: this.builder.control('', Validators.required),
      modifiedDate: this.builder.control('', Validators.required),
    });

    if (!this.isAddMode && this.editData) {
      this._form.patchValue({
        id: this.editData.id,
        name: this.editData.departmentName,
        DepartmentCode: this.editData.departmentCode,
        companyName: this.editData.companyName,
        branchName: this.editData.branchName,
        isActive: this.editData.isActive,
      });
    }
  }

  ngOnDestroy() {}

  onCancel() {
    this.cancelled.emit();
  }

  onSubmit() {
    if (this._form.valid) {
      const formValue = this._form.getRawValue();
      let _data: Partial<departmentModel> = {  
        departmentCode: formValue.departmentCode,
        departmentName: formValue.departmentName,
        companyName: formValue.companyName,
        branchName: formValue.branchName,
        isActive: formValue.isActive,
      };

      if (this.isAddMode) {
       
        const createData = { ..._data };
        delete createData.id;  
        this.service.Create(createData as Omit<departmentModel, 'id'>).subscribe({
          next: (newItem) => { 
            console.log('Created:', newItem); 
            alert('Saved Successfully');
            this.saved.emit();
          },
          error: (err) => {
            console.error('Create error:', err);
            alert('Failed to save. Check form/server.');
          }
        });
      } else {
        
        _data.id = formValue.id as string;
        this.service.Update(_data as departmentModel).subscribe({
          next: () => {
            alert('Updated Successfully');
            this.saved.emit();
          },
          error: (err) => {
            console.error('Update error:', err);
            alert('Failed to update.');
          }
        });
      }
    } else {
      alert('Please fix form errors.');
    }
  }

}
