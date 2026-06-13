import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectMapCenter } from '../../store/map.selectors';
import * as L from 'leaflet';
import { Observable, Subscription } from 'rxjs';
import { PoiStreamService } from '../../services/poiStream/poi-stream.service';
import { POI } from '../../models/poi';
import { PoiService } from '../../services/poiSvc/poi.service';
import { LeafletModule } from '@bluehalo/ngx-leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  iconUrl: 'assets/leaflet/marker-icon.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png'
});

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, LeafletModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnDestroy {
  private map!: L.Map;
  private marker: L.Marker | null = null;
  private sub?: Subscription;
  private centerLayer = L.layerGroup();
  private poiLayer = L.layerGroup();
 loadingPois$!: Observable<boolean>;
  
  options: L.MapOptions = {
    layers: [
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      })
    ],
    zoom: 6,
    center: L.latLng(46.2276, 2.2137)
  };

  constructor(private store: Store, 
              private poiStream: PoiStreamService, 
              private ngZone: NgZone,
              private cdr: ChangeDetectorRef,
              public poiService: PoiService
            ) {
                this.loadingPois$ = this.poiService.loadingPois$;
            }
  
  public macDoIcon = L.icon({
    iconUrl: 'assets/mcdonalds.ico',
    iconSize: [40, 30],
    iconAnchor: [20, 30],
    popupAnchor: [0, -30]
  });

  ngOnInit(): void {   
    // this.loadingPois$ = this.poiService.loadingPois$;

    this.poiStream.poi$.subscribe(pois => {
      // console.log('🍔 MAP RECEIVED POIS >>>', pois);
      // console.log('MAP EXISTS:', !!this.map);

      if(!this.map) return;

      this.addPoiMarkers(pois);
    })

    this.sub = this.store.select(selectMapCenter).subscribe(center => {
      if (!this.map) {
        // Supprrimé à l'intégration de ngx-leaflet
        // console.log('❌ MAP NOT READY');  
        console.log('⏳ Waiting for map initialization');
        return;
      }

      if (!center) {
        // console.log('🧹 CLEAR MARKER');
        this.centerLayer.clearLayers();
        return;
      }
      // console.log('🚀 CENTERING MAP');
      this.centerMapOnCoords(center);
    });
  }

  private centerMapOnCoords(center: { lat: number; lon: number }): void {

    this.poiLayer.clearLayers();

    this.map.setView([center.lat, center.lon], 9);

    this.centerLayer.clearLayers();

    this.marker = L.marker([center.lat, center.lon]).addTo(this.centerLayer);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    // this.map?.remove();
  }

  private addPoiMarkers(pois: POI[]): void {
    console.log('👉 POIs for bounds:', pois);

    this.poiLayer.clearLayers();

    const bounds: L.LatLngExpression[] = [];

    pois.forEach(poi => {
      const marker = L.marker([poi.lat, poi.lon], {
        icon: this.macDoIcon
      });

      const popupContent = `<div>
                             <strong>${poi.name}</strong><br>
                             ${poi.address?.postcode} - ${poi.address?.city}<br><br>
                             <button class="select-poi-btn"
                             data-poi-id="${poi.id}">
                             Choisir
                             </button>
                           </div>`
      
      marker.bindPopup(popupContent);

      marker.on('popupopen', (e) => {
        const container = e.popup.getElement();
        const btn = container?.querySelector(
          `.select-poi-btn[data-poi-id="${poi.id}"]`
        );

        btn?.addEventListener('click', () => {
          this.ngZone.run(() => {
            this.selectPoi(poi);
            // ✅ fermer le popup Leaflet
            this.map.closePopup();
          });
        });
      });

      // this.poiLayer.addLayer(marker);
      marker.addTo(this.poiLayer);

      bounds.push([poi.lat, poi.lon]);
    });

    if(bounds.length === 0) {
      return;
    }

    if (bounds.length === 1) {
      this.map.setView(bounds[0], 14);
    } else {
      this.map.fitBounds(L.latLngBounds(bounds), {
        padding: [50, 50]
      });
    }
  }

  private selectPoi(poi: POI) {
      console.log('MAP SELECT', poi);

      this.poiService.selectPoi(poi);
      this.cdr.detectChanges();

      // this.poiService.selectedPoi$.subscribe(poi => {
      //   console.log('MAP SERVICE VALUE', poi);
      // });
  }

  // Ajouté pour ngx-leaflet
  onMapReady(map: L.Map): void {
    this.map = map;

    this.poiLayer.addTo(this.map);
    this.centerLayer.addTo(this.map);
  }

  closePoiDetails(): void {
    this.poiService.clear();
  }

}