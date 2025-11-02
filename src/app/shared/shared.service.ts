import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from './snackbar/snackbar.component';
import { MatDialog } from '@angular/material/dialog';
import { MyDialogContentComponent } from './my-dialog-content/my-dialog-content.component';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, catchError, throwError } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private API_URL = environment.API_URL;

  bot_obj = new BehaviorSubject<any>(null);
  project_name = new BehaviorSubject<any>(null);
  constructor(private _snackBar: MatSnackBar, private dialog: MatDialog, private http: HttpClient) {

  }
  err_hand(err: HttpErrorResponse) {
    // if(err.error.message = 'Token was not recognised'){
    //   return throwError(() => new Error(err.error.message));
    // }
    console.log(err.error.detail.message);
    console.log("eroor",err)
    return throwError(() => this.opensnacbar(this.errorMsgs[err.error.detail.message]));

    // this.display_err = this.errors[err.error.error.message];
  }

  opensnacbar(message: string) {
    console.log("sancbar", message);
    this._snackBar.openFromComponent(SnackbarComponent, {
      data: {
        message: message,
        snackBar: this._snackBar
      },
      panelClass: 'panel-done',
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    })
  }
  errorMsgs: any = {
    UNKNOWN: 'PLEASE CHECK INTERNET',
    ERROR: 'ERROR',
    EMAIL_EXISTS: 'EMAIL EXISTS',
    OTP_UNVERIFIED: 'PLEASE ENTER VALID OTP',
    NOT_ACTIVATED: 'NOT ACTIVATED',
    INVALID_MOBILE: 'INVALID MOBILE',
    INVALID_CREDENTIALS: 'INVALID CREDENTIALS!',
    EMAIL_NOT_FOUND: "EMAIL NOT FOUND",
    INVALID_EMAIL: 'PLEASE CHECK EMAIL',
    INVALID_PASSWORD: 'INVALID PASSWORD',
    INVALID_NAME: "INVALID NAME",
    PASSWORD_MANDATORY: "PASSWORD_MANDATORY",
    MOBILE_EXISTS: "MOBILE NUMBER ALREADY EXISTS.",
    WRONG_OTP: "WRONG OTP",
    ALREADY_LOGGEDIN: "ALREADY LOGGEDIN",
    REACHED_MAX_LIMIT: 'Token Exhausted',
    OTP_EXPIRED: "OTP EXPIRED",
    'MOBILE_NUMBER_MUST_BE_A_VALID_10_DIGIT_INDIAN_MOBILE_NUMBER.': 'MOBILE MUST BE INDIAN MOBILE NUMBER. ',
    AUTHORISATION_FAILURE: "Authorisation Failure - You Dont have the access to Add a User",
    CANNOT_DELETE: "You Cannot Delete This Role Because It's Already Assigned To A User.",
    NO_PERMISSIONS: 'Please Select Side Navigation',
    "User created On Logione Successfully but not created on SSO Authentication Failure": "User created On Logione Successfully but not created on SSO Authentication Failure",
    'Token was not recognised': "User Not Available",
    ROLE_NOT_FOUND: "ROLE NOT FOUND",
    'Not Found': 'Not Found',
    USER_NOT_ACTIVATED: "USER_NOT_ACTIVATED"
  }
  open_dialog(data: any) {
    this.dialog.open(MyDialogContentComponent, {
      // width: '400px',
      panelClass: 'custom-dialog-container', // custom class for dialog box
      backdropClass: 'custom-dialog-backdrop', // custom blur for background
      data: data
    });

  }

  create_new_project(data) {
    console.log(data.project_name)
    // const queryString = new URLSearchParams(data.project_name as any).toString();
    const queryString = new URLSearchParams(data.project_name).toString().replace(/\+/g, '%20');

    return this.http.get<any>(this.API_URL + `v1/analysis/getOptions?${queryString}`)
      .pipe(
        catchError(err => {
          console.log(err)
          return this.err_hand(err);

        })
      )
  }
  getOptions_bot(data) {
    console.log(data)
    return this.http.post<any>(this.API_URL + `v1/analysis/getOptions`, data)
      .pipe(
        catchError(err => {
          console.log(err)
          return this.err_hand(err);

        })
      )
  }
  startAnalysis(data) {
    console.log(data)
    // data["recordID"] = "6901afb64c873f3f9939de93"
    return this.http.post<any>(this.API_URL + `v1/ai/startAnalysis`, data)
      .pipe(
        catchError(err => {
          console.log(err)
          return this.err_hand(err);

        })
      )
  }
  aiChatBot(data) {
    console.log(data)
    // data["recordID"] = "6901afb64c873f3f9939de93"
    return this.http.post<any>(this.API_URL + `v1/ai/aiChatBot`, data)
      .pipe(
        catchError(err => {
          console.log(err)
          return this.err_hand(err);

        })
      )
  }
  checkAnalysisStatus(data) {
    console.log(data)
    // data["recordID"] = "6901afb64c873f3f9939de93"
    return this.http.post<any>(this.API_URL + `v1/ai/checkAnalysisStatus`, data)
      .pipe(
        catchError(err => {
          console.log(err)
          return this.err_hand(err);

        })
      )
  }


  uploadfile(data) {

    const formData = new FormData()
    console.log("formData", formData)
    formData.append('file', data.file)
    formData.append('file_type', data.file_type)
    formData.append('recordID', data.recordID)
    //  formData.append('recordID', "6901afb64c873f3f9939de93")

    return this.http.post<any>(this.API_URL + `v1/analysis/validateDataFile`, formData)
      .pipe(
        catchError(err => {
          console.log(err)
          return this.err_hand(err);
        })
      )
  }

}
