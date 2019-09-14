import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.css']
})
export class ChangepasswordComponent implements OnInit {
  error = null;
  success = false;

  constructor(private authService: AuthService) { }

  ngOnInit() {
  }

  onUpdatePassword(form: NgForm) {
    const password = form.value.password;
    const newPassword = form.value.newPassword;
    const newPassword2 = form.value.newPassword2;

    this.authService.changePassword(password, newPassword, newPassword2).subscribe(
      () => {
        this.error = null;
        this.success = true;
        this.authService.logout();
      },
      (httpErrorResponse: HttpErrorResponse) => {
        this.error = httpErrorResponse.error;
        this.success = false;
      }

    );
  }
}
