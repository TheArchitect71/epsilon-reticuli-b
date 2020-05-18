import { TestBed } from '@angular/core/testing';

import { AstronautService } from './astronaut.service';

describe('AstronautService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AstronautService = TestBed.get(AstronautService);
    expect(service).toBeTruthy();
  });
});
