import { MAPBOX_ACCESS_TOKEN } from '../../config/mapbox';
import { getMapboxModule } from './native';

let configured = false;

export const configureMapbox = () => {
  if (configured || !MAPBOX_ACCESS_TOKEN) {
    return false;
  }

  const Mapbox = getMapboxModule();

  if (!Mapbox) {
    return false;
  }

  configured = true;
  void Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);
  return true;
};
