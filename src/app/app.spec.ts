import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { mapReducer } from './store/map.reducer';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        App,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        provideStore({ map: mapReducer }),
        provideEffects([])
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    fixture.detectChanges();
    expect(app).toBeTruthy();
  });

  it('should render the map component', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('app-map')).toBeTruthy();
  });

  it('should display the commune search input', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const input = compiled.querySelector('#commune-search');

    expect(input).toBeTruthy();
    expect(input?.tagName).toBe('INPUT');
  });

});
