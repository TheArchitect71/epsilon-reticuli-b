import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  OverviewComponent,
  DirectoryComponent,
  PersonDetailComponent,
  PersonFormComponent,
  AboutComponent,
  NotFoundComponent,
} from './directory/pages';
import { authGuard } from './auth.service';
import { LoginComponent } from './login.component';
const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Sign in · Epsilon Reticuli B',
  },
  { path: '', redirectTo: 'overview', pathMatch: 'full' },
  {
    path: 'overview',
    canActivate: [authGuard],
    component: OverviewComponent,
    title: 'Overview · Epsilon Reticuli B',
  },
  {
    path: 'people',
    canActivate: [authGuard],
    component: DirectoryComponent,
    title: 'People · Epsilon Reticuli B',
  },
  {
    path: 'people/new',
    canActivate: [authGuard],
    component: PersonFormComponent,
    title: 'Add person · Epsilon Reticuli B',
  },
  {
    path: 'people/:id/edit',
    canActivate: [authGuard],
    component: PersonFormComponent,
    title: 'Edit person · Epsilon Reticuli B',
  },
  {
    path: 'people/:id',
    canActivate: [authGuard],
    component: PersonDetailComponent,
    title: 'Profile · Epsilon Reticuli B',
  },
  {
    path: 'about',
    canActivate: [authGuard],
    component: AboutComponent,
    title: 'About · Epsilon Reticuli B',
  },
  {
    path: '**',
    component: NotFoundComponent,
    title: 'Page not found · Epsilon Reticuli B',
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
