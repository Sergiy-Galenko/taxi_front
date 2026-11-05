# Taxi App

Expo SDK 54 / React Native 0.81.5 / React 19.1, with passenger and driver roles.

Use Node 22 LTS and npm. Install with `npm ci`, copy `.env.example` to `.env.local`, and set the actual backend origin. `EXPO_PUBLIC_*` values are public bundle configuration; never put credentials in them.

```sh
npm ci
npm run verify
npx expo install --check
npx expo-doctor
npm start
```

`npm run android` requires a configured Android SDK and Java. `npm run ios` requires full Xcode and CocoaPods. Rebuild a development client after adding native modules such as SecureStore.

Release builds require `EXPO_PUBLIC_API_URL` to be an explicit public HTTPS URL. Invalid/missing release configuration disables API calls; it never falls back to localhost. Development builds can use Metro's host or simulator loopback. Explicit environment URLs are preserved.

Authentication and passenger/driver registration retain the existing frontend-declared API contracts. Sessions use SecureStore; token-only legacy sessions require a fresh login. Login determines the role navigator. Driver registration returns to login instead of treating a pending account as verified. The existing driver profile endpoint provides account status after login.

Booking, route/fare quotes, live matching, active rides, scheduled rides, trip history, driver dispatch/earnings and document upload have no implemented backend contract in this repository. These screens display explicit unavailable states. No local timer or hardcoded offer creates a successful ride, payment, verification or financial balance. Vehicle choice and address entry remain available. Payment choices are preferences, not linked instruments.

Address autocomplete sends typed searches to the configured places service (Photon by default); native location/geocoding uses the platform provider. Review privacy disclosures and service terms before release.

Test form population requires both a development build and `EXPO_PUBLIC_ENABLE_PREVIEW=true`. There is no guest driver preview or embedded login account.

Read [the engineering audit](docs/AUDIT.md) for findings, code locations, verification evidence, backend requirements and the complete manual checklist. [Changed files](docs/audit/changed-files.md) lists the review surface.
