import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectMapCenter } from '../../store/map.selectors';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';
import { PoiStreamService } from '../../services/poiStream/poi-stream.service';
import { POI } from '../../models/poi';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  iconUrl: 'assets/leaflet/marker-icon.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png'
});

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnDestroy {
  private map!: L.Map;
  private marker: L.Marker | null = null;
  private sub?: Subscription;
  private poiLayer = L.layerGroup();
  private poiMarkers: L.Marker[] = [];

  constructor(private store: Store, private poiStream: PoiStreamService) {}
  
  public macDoIcon = L.icon({
    iconUrl: 'assets/mcdonalds.ico',
    iconSize: [40, 30],
    iconAnchor: [20, 30],
    popupAnchor: [0, -30]
  });

  ngOnInit(): void {
    console.log('🔥 MAP ONINIT CALLED');
    
    this.map = L.map('map').setView([46.2276, 2.2137], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);  

    this.poiLayer.addTo(this.map);

    console.log('🧪 BEFORE SUBSCRIBE POI');

    this.poiStream.poi$.subscribe(pois => {
      console.log('🍔 MAP RECEIVED POIS >>>', pois);
      console.log('MAP EXISTS:', !!this.map);
      
      if(!this.map) return;

      this.clearPoiMarkers();
      this.addPoiMarkers(pois);
    })

    console.log('🧪 AFTER SUBSCRIBE POI');

    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //   attribution: '&copy; OpenStreetMap contributors'
    // }).addTo(this.map);

    this.sub = this.store.select(selectMapCenter).subscribe(center => {
      if (!this.map) {
        console.log('❌ MAP NOT READY');  
        return;
      }

      if (!center) {
        console.log('🧹 CLEAR MARKER');
        this.clearMarker();
        return;
      }
      console.log('🚀 CENTERING MAP');
      this.centerMapOnCoords(center);
    });
  }

  private centerMapOnCoords(center: { lat: number; lon: number }): void {
    this.map.setView([center.lat, center.lon], 9);

    this.clearMarker();

    this.marker = L.marker([center.lat, center.lon])
      // .bindPopup(
      //   `Lat: ${center.lat.toFixed(4)}<br>Lon: ${center.lon.toFixed(4)}`
      // )
      .addTo(this.map);
      // .openPopup();
  }

  private clearMarker(): void {
    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.map?.remove();
  }

  private clearPoiMarkers(): void {
    this.poiMarkers.forEach(m => this.map?.removeLayer(m));
    this.poiMarkers = [];
  }

  private addPoiMarkers(pois: POI[]): void {
    console.log('👉 POIs for bounds:', pois);

    this.poiLayer.clearLayers();

    const bounds: L.LatLngExpression[] = [];

    // console.log('👉 ADD MARKERS CALLED', pois);
    pois.forEach(poi => {
      const marker = L.marker([poi.lat, poi.lon], {
        icon: this.macDoIcon
      });
      // .addTo(this.map!);
      
      marker.bindPopup(`${ poi.name } - ${ poi.address?.city }`)

      // console.log('marker coords:', poi.lat, poi.lon);

      // markers.push([poi.lat, poi.lon]);
      this.poiLayer.addLayer(marker);

      this.poiMarkers.push(marker);

      bounds.push([poi.lat, poi.lon]);
    });

    if (bounds.length === 1) {
      this.map.setView(bounds[0], 14);
    } else {
      this.map.fitBounds(L.latLngBounds(bounds), {
        padding: [50, 50]
      });
    }
  }

  private showPois(pois: any[]): void {
    if (!this.map) return;

    this.clearPoiMarkers();

    pois.forEach(poi => {
      const marker = L.marker([poi.lat, poi.lon])
        .bindPopup(`
          <b>${poi.name}</b><br/>
          ${poi.address?.road || ''} ${poi.address?.city || ''}
        `)
        .addTo(this.map!);

      this.poiMarkers.push(marker);
    });
  }
}