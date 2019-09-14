export class User {
  public _id: number;
  public name: string;
  public email: string;
  public role: number;

  constructor(id: number, name: string, email: string, role: number) {
    this._id = id;
    this.name = name;
    this.email = email;
    this.role = role;
  }
}
