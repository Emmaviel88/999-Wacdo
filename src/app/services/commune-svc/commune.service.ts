import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Commune } from './commune';

@Injectable({ providedIn: 'root' })
export class CommuneService {
  private readonly baseUrl = 'https://geo.api.gouv.fr/communes';

  constructor(private http: HttpClient) {}

  getCommunes(departement?: string): Observable<Commune[]> {
    let params = new HttpParams()
      .set('fields', 'nom,code,codesPostaux,codeDepartement,codeRegion,population')
      .set('format', 'json')
      .set('geometry', 'centre');

    if (departement) {
      params = params.set('codeDepartement', departement);
    }

    return this.http.get<Commune[]>(this.baseUrl, { params });
  }

  /**
   * Search communes by name (prefix). Returns up to `limit` results.
   */
  searchCommunes(name: string, limit = 10): Observable<Commune[]> {
    const query = (name ?? '').trim();
    if (!query) {
      return this.getCommunes();
    }

    // Request a larger set from the API and filter locally for prefix matches
    const fetchLimit = Math.max(limit, 50);
    const params = new HttpParams()
      .set('nom', query)
      .set('limit', String(fetchLimit))
      .set('fields', 'nom,code,codesPostaux,codeDepartement,codeRegion,population')
      .set('format', 'json')
      .set('geometry', 'centre');

    return this.http.get<Commune[]>(this.baseUrl, { params }).pipe(
      map((list) =>
        list
          .filter((c) => c.nom?.toLowerCase().startsWith(query.toLowerCase()))
          .slice(0, limit)
      )
    );
  }
}
