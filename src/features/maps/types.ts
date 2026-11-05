import { Coordinates } from "../../types/passenger";
export interface MapRegion extends Coordinates {
  latitudeDelta: number;
  longitudeDelta: number;
}
export interface TaxiMapHandle {
  animateToRegion(region: MapRegion, duration?: number): void;
  fitToCoordinates(
    coordinates: Coordinates[],
    options: {
      animated?: boolean;
      edgePadding: { top: number; right: number; bottom: number; left: number };
    },
  ): void;
}
export interface TaxiMapProps {
  pickup?: Coordinates | null;
  destination?: Coordinates | null;
  pickupLabel?: string;
  destinationLabel?: string;
  showUserLocation?: boolean;
  onPress?: () => void;
  onViewportChange?: () => void;
}
