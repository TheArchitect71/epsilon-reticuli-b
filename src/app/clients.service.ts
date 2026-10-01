import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  map,
  tap,
  throwError,
  switchMap,
} from 'rxjs';
import { AuthService, apiError } from './auth.service';
import { Person, PersonInput } from './types';
@Injectable({ providedIn: 'root' })
export class ClientsService {
  private state = new BehaviorSubject<Person[]>([]);
  people$ = this.state.asObservable();
  loading = false;
  error = '';
  private generation = 0;
  constructor(
    private http: HttpClient,
    auth: AuthService,
  ) {
    auth.session$.subscribe((token) => {
      this.generation++;
      this.state.next([]);
      this.error = '';
      this.loading = false;
      if (token) this.load();
    });
  }
  get people() {
    return this.state.value;
  }
  load() {
    const generation = this.generation;
    this.loading = true;
    this.error = '';
    this.http.get<Person[]>('/api/people').subscribe({
      next: (people) => {
        if (generation !== this.generation) return;
        this.state.next(people);
        this.loading = false;
      },
      error: (e) => {
        if (generation !== this.generation) return;
        this.error = apiError(e);
        this.loading = false;
      },
    });
  }
  find(id: string) {
    return this.people.find((p) => p.id === id);
  }
  create(input: PersonInput) {
    const generation = this.generation;
    return this.http.post<Person>('/api/people', input).pipe(
      tap((person) => {
        if (generation === this.generation)
          this.state.next([...this.people, person]);
      }),
      catchError((e) => throwError(() => new Error(apiError(e)))),
    );
  }
  update(id: string, input: PersonInput) {
    const generation = this.generation;
    return this.http
      .put<Person>('/api/people/' + encodeURIComponent(id), {
        ...this.find(id),
        ...input,
      })
      .pipe(
        tap((person) => {
          if (generation === this.generation)
            this.state.next(this.people.map((p) => (p.id === id ? person : p)));
        }),
        catchError((e) => throwError(() => new Error(apiError(e)))),
      );
  }
  delete(id: string) {
    const generation = this.generation;
    return this.http.delete<void>('/api/people/' + encodeURIComponent(id)).pipe(
      tap(() => {
        if (generation === this.generation)
          this.state.next(this.people.filter((p) => p.id !== id));
      }),
      catchError((e) => throwError(() => new Error(apiError(e)))),
    );
  }
  addSample() {
    return this.http.get<any[]>('assets/astronauts.json').pipe(
      map((rows) => rows[0]),
      switchMap((a) =>
        this.create({
          name: a.name,
          role: 'Astronaut',
          organization: 'NASA sample directory',
          status: a.status,
          expertise: a.undergraduateMajor,
          notes: 'Historical sample profile.',
          spaceWalks: a.spaceWalks,
          spaceFlights: a.spaceFlights,
          missions: a.missions,
          almaMater: a.almaMater,
        }),
      ),
    );
  }
}
