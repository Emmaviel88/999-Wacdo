import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { POI } from '../../models/poi';

@Injectable({ providedIn: 'root' })
export class PoiStreamService {

  private poiSubject = new Subject<POI[]>();
  poi$ = this.poiSubject.asObservable();

  emit(pois: POI[]) {
    console.log('🔥 EMIT CALLED WITH:', pois);
    this.poiSubject.next(pois);
  }
}
