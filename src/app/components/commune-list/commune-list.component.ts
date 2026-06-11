import { Component, Output, EventEmitter, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { merge, Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, switchMap, tap } from 'rxjs/operators';
import { CommuneService } from '../../services/commune-svc/commune.service';
import { Commune } from '../../services/commune-svc/commune';
import { NominatimService } from '../../services/nominatim/nominatim.service';
import { clearMapCenter, setMapCenter, setPoiResults } from '../../store/map.actions';
import { selectMapCenter } from '../../store/map.selectors';
import { PoiStreamService } from '../../services/poiStream/poi-stream.service';

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

  center$!: Observable<{ lat: number; lon: number } | null>;

  @Output() poiSearch = new EventEmitter<void>();

  @Output() center = new EventEmitter<{ lat: number; lon: number }>();
  

  constructor(private communeService: CommuneService, private nominatim: NominatimService, private cdr: ChangeDetectorRef, private ngZone: NgZone, private store: Store, private poiStream: PoiStreamService) {
    this.center$ = this.store.select(selectMapCenter); // 👈 ICI (AJOUT)
 
    const search$ = this.searchControl.valueChanges.pipe(
      tap(() => {
        this.selectedCoords = null;
        this.store.dispatch(clearMapCenter());
      }),  // Reset coords when user types
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
    this.searchControl.setValue(commune.nom, { emitEvent: false });
    this.suggestionsTrigger.next([]);

    const postal =
      commune.codesPostaux?.length ? commune.codesPostaux[0] : '';

    const geocodeQuery = postal
      ? `${commune.nom} ${postal} France`
      : `${commune.nom} France`;

    console.log('Nominatim query:', geocodeQuery);

    this.nominatim.geocode(geocodeQuery).subscribe((res) => {
      this.ngZone.run(() => {

        const coords =
          res ??
          (commune.centre?.coordinates
            ? {
                lat: commune.centre.coordinates[1],
                lon: commune.centre.coordinates[0]
              }
            : null);

        console.log('🔥 FINAL COORDS:', coords);

        if (!coords) return;

        console.log('selectedCoords =', this.selectedCoords);
        // 🔥 IMPORTANT: ENVOI NG RX
        this.store.dispatch(setMapCenter({ center: coords }));

        // (optionnel : si tu veux garder UI locale)
        this.selectedCoords = coords;
        console.log('L90: selectedCoords après affectation =', this.selectedCoords);
      });
    });
  }

  // searchPOI(): void {
  //   console.log('🔍 SEARCH CLICKED');
    
  //   const place = this.searchControl.value?.trim();

  //   if (!place) {
  //     return;
  //   }

  //   console.log('🔍 SEARCH POI FOR:', place);

  //   this.nominatim.searchMcDo(place, 10)
  //     .subscribe((pois) => {
  //       console.log('🍔 POIs:', pois);

  //   this.store.dispatch(setPoiResults({ pois })); // optionnel plus tard
  //   });
  // }
  searchPOI(): void {
    console.log('🔍 SEARCH CLICKED');

    if (!this.selectedCoords) {
      console.log('❌ NO COORDS');
      return;
    }

    const place = this.searchControl.value ?? ''; 
    // `${this.selectedCoords.lat},${this.selectedCoords.lon}`;

    this.nominatim.searchMcDo(place, 10).subscribe(pois => {
      console.log('🍔 POIS RECEIVED IN COMPONENT:', pois);

      this.poiStream.emit(pois); // 👈 CRUCIAL
    });
  }
}
