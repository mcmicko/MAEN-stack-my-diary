import { Component, OnInit, ViewChild } from "@angular/core";
import { Observable, from } from "rxjs";
import { NgForm } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";

import { AuthService } from "../../../service/auth.service";
import { StoryService } from "../../../service/story.service";
import { Story } from "../../../models/story.model";
import { User } from "../../layouts/userlist/user.model";

@Component({
  selector: "app-my-story",
  templateUrl: "./my-story.component.html",
  styleUrls: ["./my-story.component.css"]
})
export class MyStoryComponent implements OnInit {
  userStory$: Observable<Story[]>;
  stories$: Observable<Story[]>;
  currentUser: User;

  @ViewChild("f", { static: false }) saveStoryForm: NgForm;
  selectedStory: Story = new Story(null, null, null, null, null, null);
  error: { title: string; author: string; publishDate: string };
  operation: string;

  constructor(
    private storyService: StoryService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      this.userStory$ = this.storyService.getMyStory(this.currentUser._id);
    });
  }
  // DELETE MY STORY
  onStoryDelete(story: Story) {
    this.selectedStory = Object.assign({}, story);
  }

  onStoryDeleteSubmit() {
    this.storyService.deleteStory(this.selectedStory._id).subscribe(
      () => {
        this.authService.getCurrentUser().subscribe(user => {
          this.userStory$ = this.storyService.getMyStory(user._id);
        });
        this.selectedStory = new Story(null, null, null, null, null, null);
      },
      error => console.error(error)
    );
  }

  // ADD STORY
  onStoryAdd() {
    this.operation = "Add";
    this.saveStoryForm.reset();
    this.selectedStory = new Story(
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    );
    this.error = null;
  }

  onStorySaveSubmit(form: NgForm, closeButton: HTMLButtonElement) {
    const story: Story = new Story(
      this.operation === "Add" ? null : this.selectedStory._id,
      this.authService.user,
      form.value.title,
      form.value.content,
      form.value.privacy === true ? true : false
    );
    this.storyService.saveStory(story).subscribe(
      () => {
        this.userStory$ = this.storyService.getMyStory(this.currentUser._id);
        closeButton.click();
      },
      (httpErrorResponse: HttpErrorResponse) => {
        this.error = httpErrorResponse.error;
      }
    );
  }

  // EDIT MY STORY
  onStoryEdit(story: Story) {
    this.operation = "Edit";
    this.selectedStory = JSON.parse(JSON.stringify(story));
    this.error = { title: null, author: null, publishDate: null };
  }

  // toggle details
  toggle(story) {
    story.show = !story.show;
  }

  avgRating(story: Story) {
    let sum = 0;
    if (story.ratings.length !== 0) {
      for (const item of story.ratings) {
        sum += item.rating;
      }
      const avg = sum / story.ratings.length;
      return avg;
    } else {
      return 0;
    }
  }
}
