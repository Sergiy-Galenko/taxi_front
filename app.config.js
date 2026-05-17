const appJson = require('./app.json');

const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';
const enableNativeMaps = process.env.EXPO_PUBLIC_ENABLE_NATIVE_MAPS === 'true';
const existingPlugins = appJson.expo.plugins || [];
const nativeMapsPlugin = [
  'react-native-maps',
  {
    androidGoogleMapsApiKey: googleMapsApiKey,
    iosGoogleMapsApiKey: googleMapsApiKey,
  },
];

module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,
    extra: {
      ...(appJson.expo.extra || {}),
      googleMapsApiKey,
    },
    plugins: enableNativeMaps ? [nativeMapsPlugin, ...existingPlugins] : existingPlugins,
  },
};
