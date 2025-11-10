import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { SharedService } from '../shared.service';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { CookieService } from 'ngx-cookie-service';


@Component({
  selector: 'app-my-dialog-content',
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './my-dialog-content.component.html',
  styleUrl: './my-dialog-content.component.scss'
})
export class MyDialogContentComponent {
  projectForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private _authService: AuthService,
    private _shared_service: SharedService,
    public dialogRef: MatDialogRef<MyDialogContentComponent>,
    private cookieService: CookieService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }
  userobject
  ngOnInit() {
    this.userobject = this._authService.getUser('loggedin user data');
    console.log("userslocal", this.userobject);
    console.log(this.data)
    this.projectForm = this.fb.group({
      project_name: ['', Validators.required]
    });
    //  this.router.navigate(['/backend/Dashboard']);
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
      this._shared_service.create_new_project({ project_name: payload.project_name.project_name, email: this.userobject.email, session_id: this.cookieService.get('session_id') }).subscribe((res) => {
        console.log(res)
        if (res) {
          this._shared_service.bot_obj.next(res)
          this.dialogRef.afterClosed().subscribe((data) => {
            if (data) {
              console.log('Received from dialog:', data);
              this.router.navigate(['/backend/Dashboard']);
            }
          });
          this.dialogRef.close(payload.project_name.project_name);
          this._shared_service.project_name.next(payload.project_name.project_name)
          // this.router.navigate(['/backend/Dashboard']);
        }
      });
    }
  }
}
