import { Component, OnInit, ViewChild } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { NgForm } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";

import { StoryService } from "../../../service/story.service";
import { AuthService } from "../../../service/auth.service";
import { Story } from "../../../models/story.model";
import { Comment } from "../../../models/comment.model";
import { User } from "../../layouts/userlist/user.model";
import { catchError } from "rxjs/operators";
import { Rating } from "src/app/models/rating.model";

@Component({
  selector: "app-story-list",
  templateUrl: "./story-list.component.html",
  styleUrls: ["./story-list.component.css"]
})
export class StoryListComponent implements OnInit {
  stories$: Observable<Story[]>;
  operation: string;
  @ViewChild("f", { static: false }) saveCommentForm: NgForm;
  @ViewChild("title", { static: false }) onSearchTitleForm: NgForm;
  selectStory: Story = new Story(
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null
  );
  selectComment: Comment = new Comment(null, null);
  error: { name: string; text: string };
  currentStory: Story;
  public show: boolean = false;
  currentUser: User;
  public errorObject = null;
  selectedStory = new Story(null, null, null, null, null, null);

  err = null;
  saved = false;

  constructor(
    private storyService: StoryService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.stories$ = this.storyService.getAllStory();
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
  }

  // toggle details
  toggle(story) {
    story.show = !story.show;
  }

  // SEARCH STORY
  onSearchTitle(form: NgForm) {
    this.errorObject = null;
    const title = form.value;
    this.onSearchTitleForm.reset();
    this.stories$ = this.storyService.searchStory(title).pipe(
      catchError(err => {
        this.errorObject = err;
        return throwError(err);
      })
    );
  }

  // ADD COMMENT
  onCommentAdd(story: Story) {
    this.operation = "Add";
    this.saveCommentForm.reset();
    this.selectStory = Object.assign({}, story);
    this.error = null;
  }

  onCommentSaveSubmit(form: NgForm, closeButton: HTMLButtonElement) {
    const comment: Comment = new Comment(
      form.value.text,
      this.currentUser.name
    );
    this.storyService.saveComment(this.selectStory._id, comment).subscribe(
      () => {
        this.stories$ = this.storyService.getAllStory();
        closeButton.click();
      },
      (httpErrorResponse: HttpErrorResponse) => {
        this.error = httpErrorResponse.error;
      }
    );
  }

  onPublicStorySave(story: Story) {
    this.selectStory = Object.assign({}, story);
    this.storyService
      .savePublicStory(this.currentUser._id, this.selectStory._id)
      .subscribe(
        () => {
          this.err = null;
          this.saved = true;
        },
        (httpErrorResponse: HttpErrorResponse) => {
          this.error = httpErrorResponse.error;
        }
      );
  }

  onRate($event: { newValue: number }, story: Story) {
    const rating: Rating = new Rating(this.currentUser._id, $event.newValue);
    this.selectStory = Object.assign({}, story);
    this.storyService.rateStory(this.selectStory._id, rating).subscribe(
      () => {
        this.stories$ = this.storyService.getAllStory();
      },
      (httpErrorResponse: HttpErrorResponse) => {
        this.error = httpErrorResponse.error;
      }
    );
    console.log(` newValue: ${$event.newValue}`);
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

  getRating(story: Story) {
    for (const storyRating of story.ratings) {
      if (storyRating.user === this.currentUser._id) {
        return storyRating.rating;
      }
    }
  }
}
