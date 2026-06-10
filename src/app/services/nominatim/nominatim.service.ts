import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

    return this.http.get<any[]>(this.baseUrl, { params, headers }).pipe(
      map((arr) => {
        const r = arr && arr[0];
        if (!r) return null;
        return { lat: parseFloat(r.lat), lon: parseFloat(r.lon) };
      })
    );
  }
}
