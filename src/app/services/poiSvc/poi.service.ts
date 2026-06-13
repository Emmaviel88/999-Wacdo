import { Injectable } from '@angular/core';
import { POI } from '../../models/poi';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class PoiService {
    private selectedPoiSubject = new BehaviorSubject<POI | null>(null);
    selectedPoi$ = this.selectedPoiSubject.asObservable();

    private loadingPoisSubject = new BehaviorSubject<boolean>(false);
    loadingPois$ = this.loadingPoisSubject.asObservable();

    selectPoi(poi: POI) {
        this.selectedPoiSubject.next(poi);
    }

    clear() {
        this.selectedPoiSubject.next(null);
    }

    
    setLoading(state: boolean): void {
        this.loadingPoisSubject.next(state);
    }
}

