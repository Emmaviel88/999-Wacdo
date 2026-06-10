import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CommuneService } from './commune.service';
import { Commune } from './commune';

describe('CommuneService', () => {
  let service: CommuneService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CommuneService]
    });

    service = TestBed.inject(CommuneService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch communes without department filter', () => {
    const mock: Commune[] = [
      { nom: 'Paris', code: '75056', codeDepartement: '75', codeRegion: '11', population: 2148271 }
    ];

    let result: Commune[] | undefined;
    service.getCommunes().subscribe((data) => (result = data));

    const req = httpMock.expectOne((r) => r.url === 'https://geo.api.gouv.fr/communes');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('codeDepartement')).toBeNull();
    req.flush(mock);
    expect(result).toEqual(mock);
  });

  it('should include department filter when provided', () => {
    const mock: Commune[] = [];
    let result: Commune[] | undefined;
    service.getCommunes('75').subscribe((data) => (result = data));

    const req = httpMock.expectOne((r) => r.url === 'https://geo.api.gouv.fr/communes');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('codeDepartement')).toBe('75');
    req.flush(mock);
    expect(result).toEqual(mock);
  });
});
