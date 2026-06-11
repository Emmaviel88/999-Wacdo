import { createReducer, on } from '@ngrx/store';
import { setMapCenter, clearMapCenter, setPoiResults } from './map.actions';
import { MapState, initialMapState } from './map.state';

export const mapReducer = createReducer(
  initialMapState,
  on(setMapCenter, (state, { center }) => ({
    ...state,
    center
  })),
  on(clearMapCenter, (state) => ({
    ...state,
    center: null
  })),
  on(setPoiResults, (state, { pois })=> ({
    ...state,
    pois
  }))
);
