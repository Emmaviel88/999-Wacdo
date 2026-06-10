import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MapState } from './map.state';

export const selectMapState = createFeatureSelector<MapState>('map');

export const selectMapCenter = createSelector(
  selectMapState,
  (state: MapState) => state.center
);
