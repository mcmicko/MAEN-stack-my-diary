import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../../service/auth.service';
import { from } from 'rxjs';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  error = null;
  success = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {}

  onRegister(form: NgForm) {
    const name = form.value.name;
    const email = form.value.email;
    const password = form.value.password;
    const password2 = form.value.password2;

    this.authService.register(name, email, password, password2).subscribe(
      () => {
        this.error = null;
        this.success = true;
      },
      (httpErrorResponse: HttpErrorResponse) => {
        this.error = httpErrorResponse.error;
        this.success = false;
      }
    );
  }
}
