import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { RatingModule } from "ng-starrating";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { RegistrationComponent } from "./components/auth/registration/registration.component";
import { HeaderComponent } from "./components/layouts/header/header.component";
import { NotFoundComponent } from "./components/layouts/not-found/not-found.component";
import { LoginComponent } from "./components/auth/login/login.component";
import { FooterComponent } from "./components/layouts/footer/footer.component";
import { HomeComponent } from "./components/layouts/home/home.component";
import { StoryListComponent } from "./components/stories/story-list/story-list.component";
import { MyStoryComponent } from "./components/stories/my-story/my-story.component";
import { UserlistComponent } from "./components/layouts/userlist/userlist.component";
import { ChangepasswordComponent } from "./components/auth/changepassword/changepassword.component";
import { AngularFontAwesomeModule } from "angular-font-awesome";

@NgModule({
  declarations: [
    AppComponent,
    RegistrationComponent,
    HeaderComponent,
    NotFoundComponent,
    LoginComponent,
    FooterComponent,
    HomeComponent,
    StoryListComponent,
    MyStoryComponent,
    UserlistComponent,
    ChangepasswordComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    AngularFontAwesomeModule,
    RatingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
