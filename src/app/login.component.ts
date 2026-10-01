import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, finalize } from 'rxjs';
import { AuthService, apiError } from './auth.service';
@Component({
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-login',
  template: ` <div class="login-intro">
      <h1>Welcome to Epsilon.</h1>
      <p>Your people workspace, backed by Betazed MongoDB.</p>
    </div>
    <form class="panel login-form" [formGroup]="form" (ngSubmit)="submit()">
      <h2>{{ registering ? 'Create an account' : 'Sign in' }}</h2>
      <p>Each account has its own directory.</p>
      <label *ngIf="registering"
        >Your name<input
          formControlName="name"
          autocomplete="name"
          maxlength="120"
      /></label>
      <label *ngIf="registering"
        >Age<input
          type="number"
          min="0"
          max="150"
          step="1"
          formControlName="age"
      /></label>
      <label
        >Username<input
          formControlName="username"
          autocomplete="username"
          maxlength="120"
      /></label>
      <label
        >Password<input
          type="password"
          formControlName="password"
          [attr.autocomplete]="
            registering ? 'new-password' : 'current-password'
          "
      /></label>
      <p *ngIf="registering" class="muted">
        Use at least 8 characters for your password.
      </p>
      <p class="error" role="alert" *ngIf="error">{{ error }}</p>
      <button class="primary" type="submit" [disabled]="busy">
        {{ busy ? 'Please wait…' : registering ? 'Create account' : 'Sign in' }}
      </button>
      <button
        type="button"
        (click)="registering = !registering; error = ''"
        [disabled]="busy"
      >
        {{ registering ? 'I already have an account' : 'Create an account' }}
      </button>
    </form>`,
})
export class LoginComponent {
  registering = false;
  busy = false;
  error = '';
  form;
  constructor(
    fb: FormBuilder,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.form = fb.nonNullable.group({
      name: [''],
      age: [null as number | null],
      username: ['', [Validators.required, Validators.pattern(/\S/)]],
      password: ['', Validators.required],
    });
  }
  submit() {
    if (this.busy) return;
    const { name, age, username, password } = this.form.getRawValue();
    if (
      this.form.invalid ||
      (this.registering &&
        (!name.trim() ||
          !Number.isInteger(age) ||
          age < 0 ||
          age > 150 ||
          password.length < 8))
    ) {
      this.error = this.registering
        ? 'Enter your name, age, username, and a password of at least 8 characters.'
        : 'Enter your username and password.';
      return;
    }
    this.busy = true;
    this.error = '';
    const request = this.registering
      ? this.auth
          .register(name, age, username, password)
          .pipe(switchMap(() => this.auth.login(username, password)))
      : this.auth.login(username, password);
    request.pipe(finalize(() => (this.busy = false))).subscribe({
      next: () => {
        const url =
          this.route.snapshot.queryParamMap.get('returnUrl') || '/overview';
        this.router.navigateByUrl(
          url.startsWith('/') &&
            !url.startsWith('//') &&
            !url.startsWith('/login')
            ? url
            : '/overview',
        );
      },
      error: (e) =>
        (this.error =
          e.status === 401
            ? 'Username or password was incorrect.'
            : apiError(e)),
    });
  }
}
