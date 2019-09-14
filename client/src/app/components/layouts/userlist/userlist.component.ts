import { Component, OnInit } from "@angular/core";
import { Observable, from } from "rxjs";
import { NgForm } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";

import { User } from "src/app/components/layouts/userlist/user.model";
import { Story } from "../../../models/story.model";
import { UserListService } from "src/app/components/layouts/userlist/UserList.service";
import { AuthService } from "src/app/service/auth.service";
import { StoryService } from "../../../service/story.service";

@Component({
  selector: "app-userlist",
  templateUrl: "./userlist.component.html",
  styleUrls: ["./userlist.component.css"]
})
export class UserlistComponent implements OnInit {
  userlist$: Observable<User[]>;
  stories$: Observable<Story[]>;
  userStory$: Observable<Story[]>;

  userStories: Story[] = [];
  selectedUser: User = new User(null, null, null, null);
  currentUser: User = new User(null, null, null, null);

  error = null;
  success = false;
  err = null;
  changed = false;

  constructor(
    private storyService: StoryService,
    private userListService: UserListService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.userlist$ = this.userListService.getUsers();
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
  }

  // public trackByFunction(story) {
  //   if (!story) return null;
  //   return story.getMyStory(story._id);
  // }

  userDetails(user: User) {
    this.selectedUser = Object.assign({}, user);
    this.userStories = [];
    this.storyService.getMyStory(this.selectedUser._id).subscribe(
      res => {
        this.userStories = res;
      },
      err => {
        console.log(err);
        this.userStories = [];
      }
    );
  }

  onUserDelete(user: User) {
    this.selectedUser = Object.assign({}, user);
  }

  onCategoryDeleteSubmit() {
    this.userListService.deleteUser(this.selectedUser._id).subscribe(
      () => {
        this.userlist$ = this.userListService.getUsers();
        this.selectedUser = new User(null, null, null, null);
      },
      error => console.error(error)
    );
  }

  disableDelete(user) {
    return user._id === this.currentUser._id;
  }

  onInvite(form: NgForm) {
    const email = form.value.email;

    this.authService.invite(email).subscribe(
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

  onRoleChange() {
    this.userListService.changeRole(this.selectedUser._id).subscribe(
      () => {
        this.err = null;
        this.changed = true;
      },
      (httpErrorResponse: HttpErrorResponse) => {
        this.err = httpErrorResponse.error;
        this.changed = false;
      }
    );
  }
}
