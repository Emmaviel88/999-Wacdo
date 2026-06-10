import { createAction, props } from '@ngrx/store';

export const setMapCenter = createAction(
  '[Map] Set Center',
  props<{ center: { lat: number; lon: number } }>()
);

export const clearMapCenter = createAction(
  '[Map] Clear Center'
);
