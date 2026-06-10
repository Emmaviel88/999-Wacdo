export interface MapState {
  center: { lat: number; lon: number } | null;
}

export const initialMapState: MapState = {
  center: null
};
