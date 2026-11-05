jest.mock('../src/config/places', () => ({ PLACES_API_URL: 'https://places.example.test/api', KYIV_SEARCH_CENTER: { latitude: 50, longitude: 30 }, KYIV_SEARCH_BBOX: { minLongitude: 29, minLatitude: 49, maxLongitude: 31, maxLatitude: 51 } }));
jest.mock('../src/services/api/http', () => ({ requestJson: jest.fn() }));
import { requestJson } from '../src/services/api/http';
import { searchKyivPlaceSuggestions } from '../src/services/places/kyivPlaces';
const request = jest.mocked(requestJson);
test('validates external coordinates and drops malformed records', async () => {
  request.mockResolvedValue({ features: [
    { geometry: { coordinates: [30.5, 50.4] }, properties: { name: 'Place', osm_id: 1, city: 'Kyiv' } },
    { geometry: { coordinates: [NaN, 50] }, properties: { name: 'Invalid' } },
    { geometry: { coordinates: [200, 50] }, properties: { name: 'Invalid' } },
    null, { geometry: { coordinates: [30, 50] }, properties: { name: { invalid: true } } },
  ] });
  const signal = new AbortController().signal;
  const result = await searchKyivPlaceSuggestions('Place', 'en', 6, signal);
  expect(result).toHaveLength(1); expect(result[0].coords).toEqual({ latitude: 50.4, longitude: 30.5 });
  expect(request).toHaveBeenCalledWith(expect.stringContaining('https://places.example.test/api/'), expect.objectContaining({ signal, timeoutMs: 8000 }));
});
test('rejects malformed places response safely', async () => {
  request.mockResolvedValue({ features: 'bad data' });
  await expect(searchKyivPlaceSuggestions('Place', 'en')).rejects.toThrow('Invalid places response');
});
test('does not request suggestions for an empty query', async () => {
  expect(await searchKyivPlaceSuggestions(' ', 'uk')).toEqual([]); expect(request).not.toHaveBeenCalled();
});
