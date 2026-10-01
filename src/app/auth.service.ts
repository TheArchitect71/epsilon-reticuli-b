import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { Router, CanActivateFn } from '@angular/router';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';
const TOKEN_KEY = 'epsilon.session.v1';
export function apiError(error: HttpErrorResponse) {
  if (error.status === 0)
    return 'Betazed could not be reached. Check that the API and MongoDB are running.';
  if (error.status === 401) return 'Your session has expired. Sign in again.';
  const message = error.error?.message;
  return typeof message === 'string'
    ? message
    : 'The request failed. Please try again.';
}
@Injectable({ providedIn: 'root' })
export class AuthService {
  private session = new BehaviorSubject<string>(
    sessionStorage.getItem(TOKEN_KEY) || '',
  );
  session$ = this.session.asObservable();
  get token() {
    return this.session.value;
  }
  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}
  login(username: string, password: string) {
    return this.http
      .post<{ access_token: string }>('/api/auth/login', {
        username: username.trim(),
        password,
      })
      .pipe(
        tap((result) => {
          sessionStorage.setItem(TOKEN_KEY, result.access_token);
          this.session.next(result.access_token);
        }),
      );
  }
  register(name: string, age: number, username: string, password: string) {
    return this.http.post('/api/users', {
      name: name.trim(),
      age,
      username: username.trim(),
      password,
    });
  }
  logout(returnUrl = '/overview') {
    sessionStorage.removeItem(TOKEN_KEY);
    this.session.next('');
    this.router.navigate(['/login'], { queryParams: { returnUrl } });
  }
}
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  return auth.token
    ? true
    : inject(Router).createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url },
      });
};
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const protectedRequest =
    request.url.startsWith('/api/') &&
    !['/api/auth/login', '/api/users'].includes(request.url);
  if (protectedRequest && auth.token)
    request = request.clone({
      setHeaders: { Authorization: 'Bearer ' + auth.token },
    });
  return next(request).pipe(
    catchError((error) => {
      if (protectedRequest && error.status === 401) auth.logout(router.url);
      return throwError(() => error);
    }),
  );
};
