import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  error = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {}

  onLogin(form: NgForm) {
    const email = form.value.email;
    const password = form.value.password;

    this.authService.login(email, password).subscribe(
      res => {
        this.error = null;
      },
      (httpErrorResponse: HttpErrorResponse) => {
        this.error = httpErrorResponse.error;
      }
    );
  }
}
