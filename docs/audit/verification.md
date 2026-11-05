# Verification evidence

Executed locally on 2026-11-05 (Europe/Kyiv). Baseline was clean and matched remote HEAD `06223bbd0d7ae2d03914c8d8d3f250e175988321`.

| Check | Result | Scope / limits |
|---|---|---|
| `npm ci` | Passed, both initial baseline and final lockfile install | Deprecation/install-script notices and vulnerability summary remain in npm output. Final install used the actual lockfile. |
| `npx tsc --noEmit` / `npm run typecheck` | Passed | Strict TypeScript retained; no ignored TypeScript errors added. |
| `npm run lint` | Passed, zero warnings | ESLint recommended TypeScript rules; no explicit `any` remains in application source. |
| `npm test` | Passed: **69 tests, 13 suites** | Unit/contract/component checks; transport and native stack are mocked. No real server/native end-to-end pass is claimed. |
| `npx expo install --check` | Passed | SDK 54 compatible versions; no blind SDK major upgrade. |
| `npx expo-doctor` | Passed: **18/18** | An intermediate duplicate `expo-constants` was resolved and checks rerun. |
| `EXPO_PUBLIC_API_URL=https://api.example.invalid npx expo export --platform android --platform ios --output-dir dist` | Passed for Android and iOS | Production JS/Hermes/asset export. **Not** APK/AAB or Xcode archive compilation. Configuration uses a reserved invalid test domain; no live API request or secret was needed. |
| `npx expo config --type public --json` | Passed | Orientation default, tablet support retained, foreground location plugin; camera/audio/legacy storage blocked; SecureStore plugin present. |
| `git diff --check` | Passed | No patch whitespace errors. |
| `npm audit --json` | Completed; nonzero status due unresolved advisories | Final snapshot: **38 advisories: 0 critical, 8 high, 17 moderate, 13 low**. See `dependencies.json`; package counts include propagated/development advisories, not confirmed app exploits. |
| Backend availability | Unavailable | `curl` to `http://localhost:3001` could not connect, HTTP status `000`. No supplied test-backend URL or server repository. |
| iOS native build / simulator | Blocked by missing prerequisites | `xcode-select -p` points to `/Library/Developer/CommandLineTools`; `xcrun simctl list devices booted` reports no `simctl` utility. Full Xcode is not installed/configured. |
| Android native build / device | Blocked by missing prerequisites | No `adb` in PATH; `java -version` reports no Java Runtime. No Android SDK/device session available. |
| Cold start / responsiveness / memory / large-font/foldable visual checks | Not executed | Require native runtime/devices; no numerical performance or visual-layout acceptance claimed. |

Final direct dependency versions are in [installed.json](installed.json). Raw quality-check/Expo-check output is in [checks.txt](checks.txt). The final export result is in [bundle-export.txt](bundle-export.txt).

Coverage includes authenticated-area registration for guest/passenger/driver/expired sessions; session restoration, logout and races; storage invalidation; protected HTTP role checks; origin configuration; auth and driver payload/response contracts; cancellation/timeouts/no retries; malformed places data; unavailable rides and removal of timer success; preference write ordering/failure; dictionary parity; validation consistency. Component tests use React Native Testing Library with explicit native/UI mocks.

CI was authored in `.github/workflows/verify.yml`; it has not been pushed or executed on GitHub. Native/mobile manual cases are tracked individually in [the audit checklist](../AUDIT.md#11-manual-verification-checklist).
