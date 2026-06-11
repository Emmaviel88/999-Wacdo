import { POI } from "../models/poi";

export interface MapState {
  center: { lat: number; lon: number } | null;
  pois: POI[];
}

export const initialMapState: MapState = {
  center: null,
  pois: []
};
