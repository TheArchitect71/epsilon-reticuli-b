import { BrowserModule } from '@angular/platform-browser';
import { NgModule, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth.service';
import { LoginComponent } from './login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
  OverviewComponent,
  DirectoryComponent,
  PersonDetailComponent,
  PersonFormComponent,
  AboutComponent,
  NotFoundComponent,
} from './directory/pages';
@NgModule({
  declarations: [
    LoginComponent,
    AppComponent,
    OverviewComponent,
    DirectoryComponent,
    PersonDetailComponent,
    PersonFormComponent,
    AboutComponent,
    NotFoundComponent,
  ],
  imports: [BrowserModule, FormsModule, ReactiveFormsModule, AppRoutingModule],
  providers: [
    provideZoneChangeDetection(),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
