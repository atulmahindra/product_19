import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import {MatDialogModule} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { SharedService } from '../shared.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-my-dialog-content',
  imports: [CommonModule,MatDialogModule, MatButtonModule,MatFormFieldModule,MatIconModule,MatInputModule,ReactiveFormsModule],
  templateUrl: './my-dialog-content.component.html',
  styleUrl: './my-dialog-content.component.scss'
})
export class MyDialogContentComponent {
  projectForm: FormGroup;
constructor(
  private fb: FormBuilder,
  private http: HttpClient,
   private router: Router,
  private _shared_service: SharedService,
    public dialogRef: MatDialogRef<MyDialogContentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
ngOnInit(){
  console.log(this.data)
this.projectForm = this.fb.group({
      project_name: ['', Validators.required]
    });
}
  onClose(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    // You could pass some data back
    this.dialogRef.close({ result: 'some value' });
  }
   onCancel(): void {
    this.dialogRef.close();
  }
  onSubmit(): void {
    console.log(this.projectForm.value)
    if (this.projectForm.valid) {
      const payload = { project_name: this.projectForm.value };
      
      // Example API call
      this._shared_service.create_new_project(payload).subscribe((res)=>{
        console.log(res)
        if(res){
           this.dialogRef.close(true);
            this.router.navigate(['/Dashboard']);
        }
      });
    }
  }
}
