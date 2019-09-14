import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { tap } from "rxjs/operators";
import { Router } from "@angular/router";
import { User } from "../components/layouts/userlist/user.model";

@Injectable({
  providedIn: "root"
})
export class AuthService {
  API = "http://localhost:3000/api/users";
  private authenticated = false;
  private headers: HttpHeaders;
  public user: User;

  constructor(private httpClient: HttpClient, private router: Router) {}

  register(name: string, email: string, password: string, password2: string) {
    return this.httpClient.post<any>(this.API + "/register", {
      name,
      email,
      password,
      password2
    });
  }

  invite(email: string) {
    return this.httpClient.post<any>(this.API + "/invite", {
      email
    });
  }

  login(email: string, password: string) {
    return this.httpClient
      .post<any>(this.API + "/login", { email, password })
      .pipe(
        tap(resData => {
          localStorage.setItem("token", resData.token);
          this.setAuthHeaders(resData.token);
          this.getCurrentUser().subscribe(user => {
            this.user = user;
            this.authenticated = true;
            this.router.navigate(["/stories"]);
          });
        })
      );
  }

  getCurrentUser() {
    return this.httpClient.get<User>(this.API + "/current", {
      headers: this.headers
    });
  }

  isAuthenticated() {
    return this.authenticated;
  }

  getAuthHeaders() {
    return this.headers;
  }

  setAuthHeaders(token: string) {
    this.headers = new HttpHeaders({
      Authorization: token
    });
  }

  getUsername() {
    if (this.user) {
      return this.user.name;
    }
  }

  getId() {
    if (this.user) {
      return this.user._id;
    }
  }

  hasRoleAdmin() {
    if (this.user) {
      return this.user.role === 4;
    }
  }

  logout() {
    this.authenticated = false;
    this.user = null;
    this.headers = null;
    this.router.navigate(["/login"]);
    localStorage.removeItem("token");
  }

  autoLogin() {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }
    this.setAuthHeaders(token);
    this.getCurrentUser().subscribe(user => {
      this.user = user;
      this.authenticated = true;
    });
  }

  changePassword(password: string, newPassword: string, newPassword2: string) {
    return this.httpClient.post<any>(
      this.API + "/changePassword",
      {
        _id: this.user._id,
        password,
        newPassword,
        newPassword2
      },
      { headers: this.headers }
    );
  }
}
