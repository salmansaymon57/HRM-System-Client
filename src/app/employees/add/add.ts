import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Employees } from '../../service/employees';
import { employeeModel } from '../../../model/employees';

@Component({
  selector: 'app-add',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add.html',
  styleUrl: './add.css',
  standalone: true
})
export class Add implements OnInit, OnDestroy {
  @Input() editData: employeeModel | null = null;
  @Input() isAddMode: boolean = true;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  _form!: FormGroup;
  title: string = "Add Employee";

  constructor(private service: Employees, private builder: FormBuilder) {}

  ngOnInit() {
    this.title = this.isAddMode ? "Add Employee" : "Edit Employee";

    this._form = this.builder.group({
      id: this.builder.control({ value: '', disabled: true }),  
      firstName: this.builder.control('', Validators.compose([Validators.required, Validators.minLength(3)])),
      lastName: this.builder.control('', Validators.required),
      email: this.builder.control('', [Validators.required, Validators.email]),
      phoneNumber: this.builder.control('', Validators.required),
      dateOfBirth: this.builder.control('', Validators.required),
      hireDate: this.builder.control('', Validators.required),
      salary: this.builder.control('', Validators.required),
      departmentId: this.builder.control('', Validators.required),
      departmentName: this.builder.control('', Validators.required),
      createdDate: this.builder.control('', Validators.required),
      modifiedDate: this.builder.control('', Validators.required)
    });

    if (!this.isAddMode && this.editData) {
      this._form.patchValue({
        id: this.editData.id,
        firstName: this.editData.firstName,
        lastName: this.editData.lastName,
        email: this.editData.email,
        phoneNumber: this.editData.phoneNumber,
        dateOfBirth: this.editData.dateOfBirth,
        hireDate: this.editData.hireDate,
        salary: this.editData.salary,
        departmentId: this.editData.departmentId,
        departmentName: this.editData.departmentName,
        createdDate: this.editData.createdDate,
        modifiedDate: this.editData.modifiedDate
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
      let _data: Partial<employeeModel> = {  
        firstName: formValue.firstName as string,
        lastName: formValue.lastName as string,
        email: formValue.email as string,
        phoneNumber: formValue.phoneNumber as string,
        dateOfBirth: formValue.dateOfBirth as Date,
        hireDate: formValue.hireDate as Date,
        salary: formValue.salary as number,
        departmentId: formValue.departmentId as string,
        departmentName: formValue.departmentName as string,
        createdDate: formValue.createdDate as Date,
        modifiedDate: formValue.modifiedDate as Date
      };

      if (this.isAddMode) {
       
        const createData = { ..._data };
        delete createData.id;  
        this.service.Create(createData as Omit<employeeModel, 'id'>).subscribe({
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
        this.service.Update(_data as employeeModel).subscribe({
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
