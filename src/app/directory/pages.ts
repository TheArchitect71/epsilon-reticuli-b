import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { Subscription, finalize } from 'rxjs';
import { ClientsService } from '../clients.service';

@Component({
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-overview',
  template: ` <div class="page-heading">
      <div>
        <h1>Your people, connected.</h1>
        <p>
          A shared place for profiles, expertise, and the details that matter.
        </p>
      </div>
      <a
        class="button primary"
        routerLink="/people/new"
        *ngIf="!store.loading && !store.error"
        >Add person</a
      >
    </div>
    <p *ngIf="store.loading" role="status">Loading directory…</p>
    <div *ngIf="store.error" class="error" role="alert">
      {{ store.error }} <button (click)="store.load()">Try again</button>
    </div>
    <ng-container *ngIf="!store.loading && !store.error">
      <div class="stats">
        <div>
          <strong>{{ store.people.length }}</strong
          ><span>People in the directory</span>
        </div>
        <div>
          <strong>{{ organizations }}</strong
          ><span>Organizations</span>
        </div>
        <div>
          <strong>{{ expertise }}</strong
          ><span>Areas of expertise</span>
        </div>
      </div>
      <section class="panel">
        <div class="section-heading">
          <h2>Directory preview</h2>
          <a routerLink="/people">View all people</a>
        </div>
        <p *ngIf="!store.people.length">
          Your directory is empty. Add the first person to get started.
        </p>
        <a
          class="person-row"
          *ngFor="let person of store.people.slice(-5).reverse()"
          [routerLink]="['/people', person.id]"
          ><span class="avatar">{{ person.name.slice(0, 1) }}</span
          ><span
            ><strong>{{ person.name }}</strong
            ><small
              >{{ person.role }} ·
              {{ person.organization || 'No organization' }}</small
            ></span
          ><span class="status">{{ person.status }}</span></a
        >
      </section>
      <section class="intro">
        <h2>One workspace, two beginnings.</h2>
        <p>
          Epsilon Reticuli B’s browsing and Epsilon’s profile editor now share
          one directory. Add people from any field or try a historical astronaut
          sample from the About page.
        </p>
        <a routerLink="/about">How this workspace works</a>
      </section>
    </ng-container>`,
})
export class OverviewComponent {
  constructor(public store: ClientsService) {}
  get organizations() {
    return new Set(this.store.people.map((p) => p.organization).filter(Boolean))
      .size;
  }
  get expertise() {
    return new Set(this.store.people.map((p) => p.expertise).filter(Boolean))
      .size;
  }
}

@Component({
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-directory',
  templateUrl: './directory.html',
})
export class DirectoryComponent implements OnDestroy {
  query = '';
  status = '';
  organization = '';
  sort = 'name';
  view = 'cards';
  message = '';
  private subscription: Subscription;
  constructor(
    public store: ClientsService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.subscription = route.queryParamMap.subscribe((params) => {
      this.query = params.get('q') || '';
      this.status = params.get('status') || '';
      this.organization = params.get('organization') || '';
      this.sort = params.get('sort') === 'role' ? 'role' : 'name';
      this.view = params.get('view') === 'table' ? 'table' : 'cards';
    });
    this.message =
      router.getCurrentNavigation()?.extras.state?.['message'] || '';
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  get statuses() {
    return [...new Set(this.store.people.map((p) => p.status))].sort();
  }
  get organizations() {
    return [
      ...new Set(this.store.people.map((p) => p.organization).filter(Boolean)),
    ].sort();
  }
  get filtered() {
    const query = this.query.trim().toLowerCase();
    return this.store.people
      .filter(
        (p) =>
          (!query ||
            [p.name, p.role, p.organization, p.expertise]
              .join(' ')
              .toLowerCase()
              .includes(query)) &&
          (!this.status || p.status === this.status) &&
          (!this.organization || p.organization === this.organization),
      )
      .sort(
        (a, b) =>
          a[this.sort].localeCompare(b[this.sort]) ||
          a.name.localeCompare(b.name),
      );
  }
  apply() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.query || null,
        status: this.status || null,
        organization: this.organization || null,
        sort: this.sort,
        view: this.view,
      },
      replaceUrl: true,
    });
  }
  clear() {
    this.query = this.status = this.organization = '';
    this.apply();
  }
}

@Component({
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-person-detail',
  templateUrl: './detail.html',
})
export class PersonDetailComponent implements OnDestroy {
  id = '';
  confirming = false;
  deleting = false;
  error = '';
  message = '';
  private subscription: Subscription;
  constructor(
    public store: ClientsService,
    route: ActivatedRoute,
    private router: Router,
  ) {
    this.subscription = route.paramMap.subscribe((params) => {
      this.id = params.get('id') || '';
      this.confirming = false;
      this.error = '';
    });
    this.message =
      router.getCurrentNavigation()?.extras.state?.['message'] || '';
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  get person() {
    return this.store.find(this.id);
  }
  remove() {
    if (this.deleting) return;
    this.deleting = true;
    this.error = '';
    const name = this.person?.name;
    this.store
      .delete(this.id)
      .pipe(finalize(() => (this.deleting = false)))
      .subscribe({
        next: () =>
          this.router.navigate(['/people'], {
            state: { message: name + ' was deleted.' },
          }),
        error: (e) => (this.error = e.message),
      });
  }
}

@Component({
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-person-form',
  templateUrl: './form.html',
})
export class PersonFormComponent implements OnDestroy {
  id = '';
  error = '';
  submitted = false;
  saving = false;
  private subscriptions = new Subscription();
  private initializedId: string | null = null;
  form;
  constructor(
    public store: ClientsService,
    fb: FormBuilder,
    route: ActivatedRoute,
    private router: Router,
  ) {
    this.form = fb.nonNullable.group({
      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(120),
          Validators.pattern(/\S/),
        ],
      ],
      role: [
        '',
        [
          Validators.required,
          Validators.maxLength(120),
          Validators.pattern(/\S/),
        ],
      ],
      organization: ['', Validators.maxLength(160)],
      status: [
        'Active',
        [
          Validators.required,
          Validators.maxLength(80),
          Validators.pattern(/\S/),
        ],
      ],
      expertise: ['', Validators.maxLength(200)],
      notes: ['', Validators.maxLength(4000)],
    });
    this.subscriptions.add(
      route.paramMap.subscribe((params) => {
        this.id = params.get('id') || '';
        this.initializedId = null;
        this.populate();
      }),
    );
    this.subscriptions.add(store.people$.subscribe(() => this.populate()));
  }
  populate() {
    const person = this.store.find(this.id);
    if (person && this.initializedId !== this.id) {
      this.form.patchValue(person);
      this.initializedId = this.id;
    }
  }
  get missing() {
    return this.id && !this.store.loading && !this.store.find(this.id);
  }
  get cancelLink() {
    return this.id ? ['/people', this.id] : ['/people'];
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
  invalid(field: string) {
    const control = this.form.get(field);
    return control.invalid && (control.touched || this.submitted);
  }
  save() {
    if (this.saving) return;
    this.submitted = true;
    this.error = '';
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.saving = true;
    const request = this.id
      ? this.store.update(this.id, this.form.getRawValue())
      : this.store.create(this.form.getRawValue());
    request.pipe(finalize(() => (this.saving = false))).subscribe({
      next: (person) =>
        this.router.navigate(['/people', person.id], {
          state: {
            message: this.id
              ? 'Changes saved.'
              : 'Person added to the directory.',
          },
        }),
      error: (e) => (this.error = e.message),
    });
  }
}

@Component({
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-about',
  template: ` <h1>About this workspace</h1>
    <p class="lead">
      A people directory built from Epsilon Reticuli B and Epsilon Reticuli B.
    </p>
    <section class="panel">
      <h2>Browse, create, update, delete</h2>
      <p>
        The two original demos now share navigation, a data store, and record
        forms. People can belong to any organization or profession. A historical
        astronaut sample can be added below to demonstrate the directory with
        mission and education details.
      </p>
      <p>
        The bundled records are historical sample data, not a current NASA
        roster.
      </p>
    </section>
    <section class="panel">
      <h2>Saved in Betazed MongoDB</h2>
      <p>
        Profiles are stored in MongoDB and belong to your account. Sign in to
        the same Betazed server to retrieve them. Clearing browser storage signs
        you out without deleting your directory.
      </p>
      <button
        type="button"
        (click)="export()"
        [disabled]="store.loading || !!store.error"
      >
        Export directory as JSON
      </button>
      <p role="status" *ngIf="message">{{ message }}</p>
    </section>
    <section class="panel">
      <h2>Try a sample profile</h2>
      <p>
        Add one historical astronaut profile to your account. You can edit or
        delete it just like any other person.
      </p>
      <button
        (click)="addSample()"
        [disabled]="busy || store.loading || !!store.error"
      >
        {{ busy ? 'Adding…' : 'Add sample profile' }}
      </button>
      <p role="alert" *ngIf="error" class="error">{{ error }}</p>
    </section>
    <a routerLink="/people">Go to the directory</a>`,
})
export class AboutComponent {
  message = '';
  busy = false;
  error = '';
  addSample() {
    if (this.busy) return;
    this.busy = true;
    this.error = '';
    this.store
      .addSample()
      .pipe(finalize(() => (this.busy = false)))
      .subscribe({
        next: () => (this.message = 'Sample profile added.'),
        error: (e) =>
          (this.error = e.message || 'The sample could not be added.'),
      });
  }
  constructor(public store: ClientsService) {}
  export() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(this.store.people, null, 2)], {
        type: 'application/json',
      }),
    );
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'epsilon-reticuli-b-people.json';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.message = 'Directory export downloaded.';
  }
}
@Component({
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-not-found',
  template: `<h1>Page not found</h1>
    <p>This address does not match a page in your workspace.</p>
    <a routerLink="/people">Return to people</a>`,
})
export class NotFoundComponent {}
