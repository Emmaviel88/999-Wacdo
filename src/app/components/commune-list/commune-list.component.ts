import { Component, Output, EventEmitter, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { merge, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, switchMap, tap } from 'rxjs/operators';
import { CommuneService } from '../../services/commune-svc/commune.service';
import { Commune } from '../../services/commune-svc/commune';
import { NominatimService } from '../../services/nominatim/nominatim.service';
import { setMapCenter } from '../../store/map.actions';

@Component({
  selector: 'commune-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './commune-list.component.html',
  styleUrls: ['./commune-list.component.css']
})
export class CommuneListComponent {
  searchControl = new FormControl<string>('');
  suggestions$: import('rxjs').Observable<Commune[]> = new Subject<Commune[]>();
  private suggestionsTrigger = new Subject<Commune[]>();
  selectedIndex = -1;
  selectedCoords: { lat: number; lon: number } | null = null;

  @Output() center = new EventEmitter<{ lat: number; lon: number }>();
  

  constructor(private communeService: CommuneService, private nominatim: NominatimService, private cdr: ChangeDetectorRef, private ngZone: NgZone, private store: Store) {
    const search$ = this.searchControl.valueChanges.pipe(
      tap(() => this.selectedCoords = null),  // Reset coords when user types
      startWith<string | null>(''),
      debounceTime(300),
      distinctUntilChanged<string | null>(),
      switchMap((value: string | null) => {
        const query = (value ?? '').trim();
        return query.length >= 3 ? this.communeService.searchCommunes(query, 10) : of([]);
      })
    );

    this.suggestions$ = merge(this.suggestionsTrigger.asObservable(), search$);
    // ensure selected index resets when suggestions change
    this.suggestions$.subscribe(() => (this.selectedIndex = -1));
  }

  highlight(index: number): void {
    this.selectedIndex = index;
  }

  selectSuggestion(commune: Commune): void {
    // Set the input value without triggering the search pipeline
    this.searchControl.setValue(commune.nom, { emitEvent: false });
    // hide suggestions immediately
    this.suggestionsTrigger.next([]);

    // Use commune.centre coordinates to enable button immediately
    if (commune.centre && Array.isArray(commune.centre.coordinates) && commune.centre.coordinates.length >= 2) {
      const [lon, lat] = commune.centre.coordinates;
      this.selectedCoords = { lat, lon };
      console.log('From commune.centre [lat, lon]:', [lat, lon]);
    }

    // Also geocode with Nominatim for more precise coordinates
    const postal = commune.codesPostaux && commune.codesPostaux.length ? commune.codesPostaux[0] : '';
    const geocodeQuery = postal ? `${commune.nom} ${postal} France` : `${commune.nom} France`;
    console.log('Nominatim query:', geocodeQuery);
    this.nominatim.geocode(geocodeQuery).subscribe((res) => {
      console.log('Nominatim response:', res);
      this.ngZone.run(() => {
        if (res) {
          this.selectedCoords = res;
          console.log('Updated from Nominatim [lat, lon]:', [res.lat, res.lon]);
        } else {
          console.log('Nominatim returned null, keeping commune.centre coords');
        }
        this.cdr.markForCheck();
      });
    });
  }

  searchPOI(): void {
    if (this.selectedCoords) {
      this.store.dispatch(setMapCenter({ center: this.selectedCoords }));
      this.center.emit(this.selectedCoords);
    }
  }
}
