import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomeComponent } from "./components/layouts/home/home.component";
import { RegistrationComponent } from "./components/auth/registration/registration.component";
import { NotFoundComponent } from "./components/layouts/not-found/not-found.component";
import { ChangepasswordComponent } from "./components/auth/changepassword/changepassword.component";
import { LoginComponent } from "./components/auth/login/login.component";
import { StoryListComponent } from "./components/stories/story-list/story-list.component";
import { MyStoryComponent } from "./components/stories/my-story/my-story.component";
import { UserlistComponent } from "./components/layouts/userlist/userlist.component";
import { AuthGuard } from "./auth.guard";

const routes: Routes = [
  { path: "", redirectTo: "/login", pathMatch: "full" },
  { path: "home", component: HomeComponent },
  { path: "registration", component: RegistrationComponent },
  { path: "login", component: LoginComponent },
  {
    path: "stories",
    component: StoryListComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: "user" }
  },
  {
    path: "mystory",
    component: MyStoryComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: "user" }
  },
  {
    path: "changepassword",
    component: ChangepasswordComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: "user" }
  },
  {
    path: "userlist",
    component: UserlistComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: "admin" }
  },
  { path: "**", component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
