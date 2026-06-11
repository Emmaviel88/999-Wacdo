import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { POI } from '../../models/poi';

export interface NominatimResult {
  lat: number;
  lon: number;
}

@Injectable({ providedIn: 'root' })
export class NominatimService {
  private readonly baseUrl = 'https://nominatim.openstreetmap.org/search';

  constructor(private http: HttpClient) {}

  geocode(query: string): Observable<NominatimResult | null> {
    const params = new HttpParams()
      .set('q', query)
      .set('format', 'json')
      .set('limit', '1')
      .set('countrycodes', 'fr');

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      // Nominatim requires a valid User-Agent. Replace with a real contact if needed.
      'User-Agent': '999-Wacdo/1.0 (contact@example.com)'
    });

    return this.http.get<any[]>(this.baseUrl, { params }).pipe(
      map((arr) => {
        const r = arr && arr[0];
        if (!r) return null;
        return { lat: parseFloat(r.lat), lon: parseFloat(r.lon) };
      })
    );
  }

    // Recherche des McDonald's à proximité du lieu sélectionné
  searchMcDo(place: string, limit: number = 5): Observable<POI[]>{
    console.log('🍔 SEARCHING POI FOR:', place);
    // Configure les paramètres de la requête GET
    const params = new HttpParams ()
      .set('q', `McDonald's+${place}+France`) // Recherche des McDonald's à proximité du lieu sélectionné et en France
      .set('format', 'json')                  // format de réponse attendue
      .set('limit', `${limit}`)               // nombre maxi de POIs (selon la valeur de l'input number)
      .set('addressdetails', '1' )            // active les détails d'adresse
      .set('extratags', 1)                    // active les extratags (tél., adresse web, horaires s'ils sont connus)

      return this.http.get<POI[]>(`${this.baseUrl}`, { // retourne le résultat de la requête API 
        params
      }).pipe(
        switchMap((results: any[]) => {
          return of(results.map((result, index) => ({
            id: index,
            name: result.display_name.split(',')[0] || 'McDonald\s',
            lat: parseFloat(result.lat),
            lon: parseFloat(result.lon),
            address: {
              road: result.address?.road,
              city: result.address?.city || result.address?.town || result.address?.village,
              postcode: result.address?.postcode
            },
            details: {
              phone: result.extratags?.phone,
              website: result.extratags?.website,
              openHours: result.extratags?.opening_hours
            }
          }
        )));
    }),
    catchError(error => {
      console.error('Erreur lors de la recherche des McDonald\'s : ', error);
      return of([]);
    })
    );
  }
}
