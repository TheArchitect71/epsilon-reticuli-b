import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ClientsService } from './clients.service';
import { AuthService, authInterceptor } from './auth.service';
const person = { id: 'person-1', name: 'Ada', role: 'Researcher', organization: 'Lab', status: 'Active', expertise: 'Math', notes: '' };
describe('Betazed directory client', () => {
  let http: HttpTestingController; let store: ClientsService;
  beforeEach(() => {
    sessionStorage.setItem('epsilon.session.v1', 'test-token');
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController); store = TestBed.inject(ClientsService);
    http.expectOne('/api/people').flush([person]);
  });
  afterEach(() => { http.verify(); sessionStorage.clear(); });
  it('reads records from the API with bearer authentication', () => { store.load(); const req = http.expectOne('/api/people'); expect(req.request.headers.get('Authorization')).toBe('Bearer test-token'); req.flush([]); expect(store.people).toEqual([]); });
  it('updates state only after the server confirms create, update, and delete', () => {
    store.create({ ...person, name: 'Ben' }).subscribe(); expect(store.people.length).toBe(1);
    http.expectOne('/api/people').flush({ ...person, id: 'person-2', name: 'Ben' }); expect(store.people.length).toBe(2);
    store.update('person-2', { ...person, name: 'Ben', notes: 'Updated' }).subscribe();
    const update = http.expectOne('/api/people/person-2'); expect(update.request.method).toBe('PUT'); update.flush({ ...person, id: 'person-2', name: 'Ben', notes: 'Updated' }); expect(store.find('person-2').notes).toBe('Updated');
    store.delete('person-2').subscribe(); expect(store.people.length).toBe(2); http.expectOne('/api/people/person-2').flush(null); expect(store.people.length).toBe(1);
  });
  it('preserves background fields during edits', () => { store.load(); http.expectOne('/api/people').flush([{ ...person, spaceFlights: 2 }]); store.update(person.id, { ...person, notes: 'Changed' }).subscribe(); const req = http.expectOne('/api/people/person-1'); expect(req.request.body.spaceFlights).toBe(2); req.flush({ ...person, spaceFlights: 2 }); });
  it('keeps state unchanged after a rejected save', () => { let error = ''; store.create(person).subscribe({ error: e => error = e.message }); http.expectOne('/api/people').flush({ message: 'Database unavailable' }, { status: 503, statusText: 'Unavailable' }); expect(store.people).toEqual([person]); expect(error).toBe('Database unavailable'); });
  it('clears the previous account data and ignores a late response after logout', () => { store.load(); const req = http.expectOne('/api/people'); TestBed.inject(AuthService).logout(); req.flush([person]); expect(store.people).toEqual([]); });
  it('reports network failures and can retry', () => { store.load(); http.expectOne('/api/people').error(new ProgressEvent('error')); expect(store.error).toContain('could not be reached'); store.load(); http.expectOne('/api/people').flush([]); expect(store.error).toBe(''); expect(store.loading).toBeFalse(); });
  it('ends an expired session on a protected API response', () => { store.load(); http.expectOne('/api/people').flush({}, { status: 401, statusText: 'Unauthorized' }); expect(TestBed.inject(AuthService).token).toBe(''); expect(store.people).toEqual([]); });
});
