import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, Subject } from "rxjs";

import { User } from "./user.model";
import { AuthService } from "../../../service/auth.service";

@Injectable({
  providedIn: "root"
})
export class UserListService {
  API = "http://localhost:3000/api/users";

  constructor(
    private httpClient: HttpClient,
    private authService: AuthService
  ) {}

  getUsers(): Observable<User[]> {
    return this.httpClient.get<User[]>(this.API, {
      headers: this.authService.getAuthHeaders()
    });
  }

  deleteUser(userId: number) {
    return this.httpClient.delete(this.API + "/" + userId, {
      headers: this.authService.getAuthHeaders()
    });
  }

  changeRole(userId): Observable<any> {
    return this.httpClient.post(
      this.API + "/changeRole",
      { _id: userId },
      {
        headers: this.authService.getAuthHeaders()
      }
    );
  }
}
