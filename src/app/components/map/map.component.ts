import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectMapCenter } from '../../store/map.selectors';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `<div id="map" class="map-container"></div>`,
  styles: [`
    .map-container {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
    }
  `]
})
export class MapComponent implements OnInit, OnDestroy {
  private map?: L.Map;
  private marker?: L.Marker;

  constructor(private store: Store<{ map: any }>) {}

  ngOnInit(): void {
    // Initialize map
    this.map = L.map('map').setView([46.2276, 2.2137], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    // Subscribe to store
    this.store.select(selectMapCenter).subscribe((center) => {
      if (center && this.map) {
        this.centerMapOnCoords(center);
      }
    });
  }

  private centerMapOnCoords(center: { lat: number; lon: number }): void {
    if (!this.map) return;

    this.map.setView([center.lat, center.lon], 12);

    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    this.marker = L.marker([center.lat, center.lon])
      .bindPopup(`Lat: ${center.lat.toFixed(4)}<br>Lon: ${center.lon.toFixed(4)}`)
      .addTo(this.map)
      .openPopup();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
}

