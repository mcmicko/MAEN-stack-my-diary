import { Comment } from "./comment.model";
import { User } from "../components/layouts/userlist/user.model";
import { Rating } from "./rating.model";

export class Story {
  public _id: number;
  public author: User;
  public title: string;
  public content: string;
  public privacy: boolean;
  public show: boolean;
  public comments: Comment;
  public ratings: Rating[];
  public owner: User;


  constructor(
    id?: number,
    author?: User,
    title?: string,
    content?: string,
    privacy?: boolean,
    comments?: Comment,
    ratings?: Rating[],
    show?: boolean,
    owner?: User
  ) {
    this._id = id;
    this.author = author;
    this.title = title;
    this.content = content;
    this.privacy = privacy;
    this.comments = comments;
    this.ratings = ratings;
    this.show = show;
    this.owner = owner;
  }
}
