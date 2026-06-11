import { createAction, props } from '@ngrx/store';
import { POI } from '../models/poi';

export const setMapCenter = createAction(
  '[Map] Set Center',
  props<{ center: { lat: number; lon: number } }>()
);

export const clearMapCenter = createAction(
  '[Map] Clear Center'
);

export const setPoiResults = createAction(
  '[POI] Set Results',
  props<{ pois: POI[] }> ()
);
