import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

import { Story } from "../models/story.model";
import { AuthService } from "../service/auth.service";
import { Comment } from "../models/comment.model";
import { Rating } from '../models/rating.model';

@Injectable({
  providedIn: "root"
})
export class StoryService {
  API = "http://localhost:3000/api/stories";

  constructor(
    private httpClient: HttpClient,
    private authService: AuthService
  ) { }

  // ALL stories
  getAllStory(): Observable<Story[]> {
    return this.httpClient.get<Story[]>(this.API, {
      headers: this.authService.getAuthHeaders()
    });
  }
  // MY stories
  getMyStory(id: number): Observable<Story[]> {
    return this.httpClient.get<Story[]>(this.API + "/user/" + id, {
      headers: this.authService.getAuthHeaders()
    });
  }
  // save stories
  saveStory(story: Story): Observable<any> {
    return this.httpClient.post(this.API, story, {
      headers: this.authService.getAuthHeaders()
    });
  }
  // delete stories
  deleteStory(storyId: number) {
    return this.httpClient.delete(this.API + "/" + storyId, {
      headers: this.authService.getAuthHeaders()
    });
  }
  // save comments
  saveComment(storyId: number, comment: Comment): Observable<any> {
    return this.httpClient.post(this.API + "/comment/" + storyId, comment, {
      headers: this.authService.getAuthHeaders()
    });
  }
  // search story
  searchStory(title: any): Observable<any> {
    return this.httpClient.get(this.API + "/searchStory/" + title, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // save other users public story
  savePublicStory(userId: number, storyId: number): Observable<any> {
    return this.httpClient.post(
      this.API + "/saveStory/" + storyId,
      { userId },
      {
        headers: this.authService.getAuthHeaders()
      }
    );
  }

  // rate story
  rateStory(storyId: number, rating: Rating): Observable<any> {
    return this.httpClient.post(
      this.API + '/rate/' + storyId, rating, {
        headers: this.authService.getAuthHeaders()
      }
    );
  }
}
