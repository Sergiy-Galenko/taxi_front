# Engineering audit and refactor

Date: 2026-11-05 (Europe/Kyiv). Baseline: `06223bbd0d7ae2d03914c8d8d3f250e175988321`, equal to `git ls-remote origin HEAD` at inspection. The worktree was clean before work. No commits, pushes or deployments were performed.

## 1. Executive summary

Confirmed unsafe frontend paths have been removed: guest driver navigation, timer-generated matches/completions/payment notices, local offer acceptance and earnings, false document submission, false scheduled bookings, and fabricated history/payment identity. Authentication now has one state owner, secure session persistence, initialization, role routing, expiry and logout. Existing backend paths and registration payload keys remain in use.

This is **not a production-readiness certification**. Backend dispatch, pricing, ride restoration, cancellation, payment and document submission remain blocked by missing contracts. Native runtime/layout acceptance and numerical performance measurements require devices/toolchains that are unavailable here. Remaining dependency advisories are recorded, not hidden by a forced major upgrade.

## 2. Inspection and evidence

The tracked-file inventory is [inventory.json](audit/inventory.json). Inspection covered configuration/lockfile, bootstrap/providers, navigation, all screen/component/hook/service families, driver scaffolding, types, validation, themes, both dictionaries and assets. Source review was combined with repository-wide searches, TypeScript, ESLint, contract/unit/component checks, Expo checks and both mobile bundle exports. Source demonstrations below are reproducible by tracing the baseline code; no original device run is claimed.

Assets are present and small (icon PNG about 20 KiB, splash PNG about 36 KiB); no measured asset-size defect was found. No custom Metro configuration exists. The direct Metro dependencies/override tree was unnecessary for application imports and was removed. No profiling evidence supports numerical claims about startup, frame rate or memory.

Severity: P0 = unauthenticated protected access or fabricated critical transaction outcome; P1 = serious security/reliability/data-integrity problem; P2 = functional or quality issue; P3 = maintainability concern. “Fixed” refers to the confirmed frontend defect, not delivery of a missing backend service. The backend's own security was not audited.

Baseline locations in this table refer to `git show 06223bb:<path>`; current implementation links are relative to this report. Verification names refer to checked-in tests unless specified otherwise.

## 3. Full issue audit table

| ID | Severity | Category | Baseline file and lines | Actual behavior / root cause / impact | Reproduction | Code-level fix | Verification | Resolution |
|---|---|---|---|---|---|---|---|---|
| A01 | P0 | Security, navigation | `src/screens/auth/Login.tsx:216–235`; `src/navigation/AppNavigator.tsx:66–100` | Guest test button opened driver workflows; every route was registered in one public stack. | Launch without login; press driver test button. | Remove embedded test login/bypass; mount role-specific navigators using [access policy](../src/navigation/access.ts) and [AppNavigator](../src/navigation/AppNavigator.tsx). | `navigation.test.tsx`, `session.test.ts` cover guest, passenger, driver, expired and logout route registration. | Fixed frontend; server role authorization remains required. |
| A02 | P1 | Security | `src/screens/auth/Login.tsx:18–21,126–139` | Committed test-account credentials and public population button could target a real test account. | Inspect constant and fill button (values intentionally omitted). | Remove account and both test login controls. Passenger registration test data needs `__DEV__` plus explicit opt-in. | Source review, release bundle export. | Fixed source exposure; backend owner should rotate the old test credential if active. Git history is unchanged. |
| A03 | P0 | Correctness, data integrity | `src/screens/passenger/DriverSearch.tsx:17–63` | 2200 ms timer selected a hardcoded driver and emitted a successful match without a booking. | Open search; wait 2.2 seconds. | [Search screen](../src/screens/passenger/DriverSearch.tsx) retains route context and reports unavailable; [ride port](../src/features/rides/gateway.ts) defines matching states and requires server identity. | `passengerScreens.test.tsx` advances 60 seconds; `rides.test.ts` validates match/stale-event rules. | Fabrication fixed; actual dispatch blocked by backend. |
| A04 | P0 | Correctness, data integrity | `src/screens/passenger/ActiveRide.tsx:19,21–40,73–104` | Timers advanced ride state and announced completion/payment; driver coordinates were invented. | Open ride; wait about 18 seconds. | [ActiveRide](../src/screens/passenger/ActiveRide.tsx) reports unavailable; no fictitious marker, transition or payment. Route contract accepts a stable `rideId`; server-snapshot reconciliation rejects duplicates/backwards/other-ride updates. | `passengerScreens.test.tsx`, `rides.test.ts`. | Fabrication fixed; live lifecycle, persistence and restoration blocked by backend. |
| A05 | P0 | Data integrity, security | `src/screens/driver/Home.tsx:29–127` | Hardcoded offers, driver identity/rating, shift and balance; acceptance/completion only mutated React state. | Enter driver screen; accept and complete an offer; balance rises without server activity. | [Driver home](../src/screens/driver/Home.tsx) uses authenticated profile API and explicit unavailable dispatch/financial states; [driver port](../src/features/driver/gateway.ts) separates shift/offers/active trip/earnings and atomic acceptance outcomes. | Role-navigation tests; source review. No backend acceptance test claimed. | Fabrication fixed; dispatch/atomic acceptance/ledger blocked by backend. |
| A06 | P1 | Security, reliability | `src/hooks/useAuth.ts:4–29`; `src/hooks/UserContext.tsx:4–28`; login and registration writes | Per-hook boolean, separate user context and AsyncStorage token disagreed; no restoration; logout retained identity. | Login, restart, or logout from Settings. | [SessionManager](../src/core/auth/session.ts), [storage](../src/core/storage/sessionStorage.ts), shared [provider](../src/hooks/UserContext.tsx); legacy token-only sessions invalidated; serialized writes and logout tombstone. | Session restoration, delayed restore/login, logout, storage failure and invalidation tests. | Fixed; opaque-token validity/revocation requires server support. |
| A07 | P1 | Reliability, security | `src/services/api/http.ts:49–67` | No centralized 401 invalidation or auth header on driver calls. | Expire a token, then request driver profile. | [HTTP client](../src/services/api/http.ts) reads current identity, limits token destinations, requires driver role where applicable and expires only the matching token. | `http.test.ts`, stale-401 session test. | Fixed frontend; server ACLs unverified. |
| A08 | P1 | Security, configuration | `src/config/api.ts:8,51–86`; `src/config/places.ts:1–13` | Dynamic `globalThis.process` access was not Expo's static substitution form; releases could silently use local HTTP; explicit local URL could be rewritten. | Build without API environment or specify an explicit host. | Static `process.env.EXPO_PUBLIC_*`; [URL policy](../src/core/config/apiUrl.ts) rejects invalid/credential-bearing/insecure/private release origins; missing config disables calls; explicit dev URLs preserved. | `config.test.ts`, both release exports and Expo config. | Fixed. |
| A09 | P1 | Reliability | `src/services/api/http.ts:49–67` | Unbounded requests, no cancellation, arbitrary server error text exposed, invalid successful JSON cast blindly. | Stall server; return HTML/empty JSON or sensitive error text. | AbortController timeout and caller cancellation; cleanup; structured safe errors; no automatic transaction retries; runtime auth/driver/places validation. | `http.test.ts`, `authApi.test.ts`, `places.test.ts`. | Fixed. Per-endpoint retry/idempotency/request-ID transport support remains unspecified. |
| A10 | P1 | Data integrity | `src/data/passenger.ts:279–312`; `src/screens/passenger/VehicleSelection.tsx:28–47` | Straight-line coordinate approximation produced fare, route duration and pickup ETA, then became “confirmed” navigation data. | Choose any two places and confirm vehicle. | [Trip summary](../src/data/passenger.ts) returns unavailable values; cards show unavailable; no confirmed fare or quote invented; booking action replaced with explicit unavailable state. | `rides.test.ts`, screen review. | Fixed unsafe presentation; routing/quote API blocked. |
| A11 | P1 | Data integrity | `src/screens/PreorderScreen.tsx:42–56` | Alert claimed scheduled ride/reminder without making any request. | Select route/time and press schedule. | [Preorder](../src/screens/PreorderScreen.tsx) retains route/time/note UI and explains no booking/reminder was created. | Source review; bundle export. | False success fixed; scheduling backend blocked. |
| A12 | P1 | Security, data integrity | `src/screens/auth/driver/Verification.tsx:45–55,173–195`; alternate verification files | Local photos were logged and modal claimed documents were sent although no upload existed. | Select three images; submit. | [Verification screen](../src/screens/auth/driver/Verification.tsx) explicitly reports unavailable; no document collection/logging; legacy modules alias maintained flow. Remove unused camera/gallery module and permissions. | Source/manifest review, Expo checks. | False submission/PII logging fixed; actual upload/review blocked. |
| A13 | P1 | Authentication, navigation | `src/screens/auth/driver/PasswordSetup.tsx:97–109`; `src/screens/auth/driver/DriverVerification.tsx:27–83` | Driver token stored without shared user; obsolete status screen routed approved drivers to passenger home and exposed self-verification action. | Register driver; follow verification; inspect alternate status screen. | Preserve registration request, return to login and unavailable document flow; authenticated driver home reads profile status. Remove alternate success/self-approval UI. | Contract/navigation tests; source review. | Fixed frontend. Server must enforce reviewer-only approval. |
| A14 | P1 | Data integrity | `src/data/passenger.ts:60–163`; `src/screens/TripHistoryScreen.tsx:17–18,45–107`; dictionary payment labels | Fake personal favorites, recent trips, spending, card suffix and fallback rating appeared as user data. | Open history, destination suggestions or Settings on a new account. | Remove fabricated history/favorites/recent categories; keep public place shortcuts; show history unavailable, unlinked payment preference and unknown rating. | Source review, dictionary tests. | Fixed fabricated identity/history; history/payment APIs blocked. |
| A15 | P2 | Responsive layout | `app.json:7`; `src/screens/auth/driver/Registration.tsx:11`; other auth dimension constants | Portrait lock and module-level dimensions did not adapt to resize. | Rotate or resize a foldable/tablet window. | Default orientation; reactive dimensions for dimensional decoration; shared safe-area/scrolling [auth frame](../src/shared/components/AuthScreenFrame.tsx). | TypeScript/exports; native resize acceptance pending. | Code fixed; visual device verification outstanding. |
| A16 | P2 | Responsive layout, accessibility | `src/screens/Home.tsx:505–690`; `src/components/passenger/PassengerTabBar.tsx:72–77` | Fixed absolute overlays stacked address form, suggestions, warnings, CTA and tabs; overlap on short/large-font screens. | Open keyboard in landscape or increase font size. | [Home](../src/screens/Home.tsx) uses window-driven stacked/side-by-side map and scrollable panel; normal-flow tabs; bounded tablet layouts; button content can grow. | Exports/typecheck; device/font/keyboard tests pending. | Structural fix implemented; visual acceptance outstanding. |
| A17 | P2 | Accessibility | `src/components/CustomInput.tsx:140–151`; `AddressInputCard.tsx:79–106`; `BookingFlowLayout.tsx:56–63` | Icon-only controls lacked spoken labels; booking back target was 42×42. | Inspect with screen reader / measure target. | Add translated labels/input names/selected tab state; back target 48×48; error text can shrink/wrap. | Component/source review; real assistive technology test pending. | Code fixed; device verification outstanding. |
| A18 | P2 | Accessibility | `src/theme/passenger.ts:43,70` | White CTA text on the yellow primary-deep backgrounds had inadequate text contrast. | Inspect white text against those colors. | Darken the CTA background to `#926000` for white labels. | Source color review; complete visual contrast audit pending. | Confirmed pair fixed; full screen audit requires rendering. |
| A19 | P2 | Performance, accessibility | `src/screens/auth/Login.tsx:45–74`; auth Animatable screens | Infinite logo loop was never stopped; animations ignored reduced motion. | Navigate away repeatedly; enable reduced motion. | Stop loop/entrance animation on cleanup; [reduced-motion hook](../src/shared/hooks/useReducedMotion.ts) controls auth and Paper animations. | Source review, exports. No numeric memory/frame claim. | Fixed identified cleanup/system-preference defects. |
| A20 | P2 | Correctness, reliability | `src/screens/Home.tsx:256–314,316–395` | Autocomplete already cancelled suggestion requests, but separately geocoded the same input; native/lookup work could outlive screen; stale field work could overwrite selections. | Type quickly, swap/select while lookup runs, then leave screen. | Remove duplicate timed geocoding, abort per-field obsolete work and all work on unmount; check mounted/field values; route submission lock and current-label check. | Places boundary tests/source cleanup review; live interaction test pending. | Fixed source-level races/duplication. |
| A21 | P2 | Reliability, data integrity | `src/hooks/useSettings.tsx:43–88` | Persisted JSON spread without validation; rapid toggles used stale closure; storage rejection could go unhandled. | Seed invalid preferences; toggle multiple fields before render; reject storage write. | [Settings parser](../src/core/storage/preferences.ts) and serialized/ref-backed provider; hydration revision guard; visible storage-failure state. | `preferences.test.tsx`. | Fixed. |
| A22 | P2 | Reliability | `src/hooks/useI18n.tsx:39–60`; `useTheme.tsx:38–51`; `useNotifications.tsx:175–220` | Storage/notification initialization promises had no rejection handling; late updates lacked cleanup in several effects. | Reject storage/native permission access; unmount during load. | Guard late initialization; handle failures; notification import can retry; permission failures return false. | TypeScript/source review; native permission behavior pending. | Identified promise/cleanup defects fixed. |
| A23 | P2 | Correctness | `src/screens/PreorderScreen.tsx:116–131` | Android picker received unsupported `datetime` mode. | Open scheduling picker on Android. | iOS keeps datetime; Android uses sequential date/time modes. | TypeScript/export and source review; Android UI pending. | Code fixed. |
| A24 | P2 | Security, correctness | `src/screens/auth/PassengerRegistration.tsx:103–140`; `driver/PasswordSetup.tsx:124–156`; `src/utils/validation.ts:7–10` | “Secure” passwords used Math.random/biased shuffle; two validators disagreed about symbols. | Generate password; compare validatePassword/getPasswordError. | [Crypto password generator](../src/utils/password.ts) uses native random bytes/rejection sampling/Fisher–Yates, 16 characters; align validator requirement. | `validation.test.ts`; native crypto runtime pending. | Fixed algorithm/source; native entropy API supplied by Expo. |
| A25 | P2 | Correctness | `src/screens/auth/driver/LicenseInfo.tsx:56–84`; `src/utils/validation.ts:90–104`; CarInfo experience validation | Latin license prefixes were formatted as digits and rejected; fractional experience could be truncated by parseInt; whitespace name passed validation. | Enter `AB123456`, `1.5` years, or blank spaces as name. | Support Latin/Cyrillic prefixes; uppercase formatting; require safe integer experience; trim name before validation. | `validation.test.ts`, source review. | Fixed. |
| A26 | P2 | Correctness, accessibility | `src/screens/auth/Login.tsx:98–107`; `src/screens/auth/PassengerRegistration.tsx:177–194`; driver form submit handlers | Submitting untouched invalid fields set errors without marking fields touched; errors remained hidden. | Submit an empty form before blurring inputs. | Mark all relevant fields touched before submit validation; duplicate request refs; abort authentication work on unmount. | Source/typecheck; UI interaction acceptance pending. | Fixed source behavior. |
| A27 | P2 | Localization | `src/screens/auth/Login.tsx:161–163`; `src/screens/auth/driver/Registration.tsx:56–73`; `src/utils/validation.ts:40–115` | Authentication text stayed Ukrainian when English was selected. | Select English, sign out and open registration. | [Auth messages](../src/i18n/authMessages.ts), translated active form labels/errors; preserve validation contracts and English/Ukrainian dictionary parity. | `translations.test.ts`. | Active auth text fixed; server/API fallback messages may still be English. |
| A28 | P2 | Developer experience | `package.json:5–10,28–31,54–70` | No lint/test/typecheck scripts or CI; manual Metro override tree; five Expo patch mismatches. | Run baseline quality scripts/Expo checks. | Strict TS retained; ESLint/Jest/RNTL, [CI](../.github/workflows/verify.yml); remove unused imports/dependencies/Metro overrides; SDK 54 patch alignment. | `npm ci`, verify, Expo checks and both exports. | Fixed project gates; CI itself not executed remotely. |
| A29 | P3 | Maintainability | `src/hooks/UserContext.tsx:11`; API normalizer; `src/driver/*`; alternate auth stacks | `any` allowed invalid roles/extra sensitive fields; duplicate dormant verification/registration prototypes. | Inspect types/import graph. | Whitelist identity/runtime parsers; remove explicit any; legacy aliases point to maintained flow; driver offer stub now explicitly rejects unavailable integration. | TypeScript/ESLint, parser tests; unused modules remain clearly scaffolding. | Fixed unsafe types/duplicate implementations; unused driver scaffold screens retained. |
| A30 | P1 | Dependency security (supported concern) | `package-lock.json:4496,6461,8772`; npm audit | Installer reported 42 advisories including 2 critical. Advisories do not alone establish app exploitability. | Run npm audit on baseline lockfile. | Remove unused direct packages and apply reviewed compatible transitive updates; no forced Expo/navigation major migration. | [Audit JSON](audit/dependencies.json), clean install, Expo Doctor, both bundle exports. | Critical count now 0; remaining advisories open (see limitations). |

## 4. Architectural changes

- `src/core/auth`: pure session state/validation and serialized persistence; UI uses one provider through both legacy hooks. States are initializing, guest, authenticated with explicit passenger/driver identity, and expired.
- `src/core/storage`: native SecureStore session adapter; AsyncStorage holds preferences and a non-sensitive logout invalidation marker, never a new token. Identity is minimized to ID, email, name, role, optional phone/rating. These fields exist to restore routing/profile presentation; passwords, documents and arbitrary response fields are not persisted.
- `src/core/config`: testable release URL policy. API-specific paths stay in the existing services to preserve contracts.
- `src/features/rides` and `src/features/driver`: typed integration ports and authoritative snapshot reconciliation. These are **internal contracts**, not invented wire schemas or endpoints. Unconfigured operations return `available: false`; no timer simulates a successful transaction.
- `src/shared`: safe/scrollable auth frame, integration notice and reduced-motion hook.
- Existing screens, design tokens, themes, settings and i18n remain the foundation. No caching library or global ride mock store was added. Server state, credentials and persistent preferences are separate.
- Auth/Passenger/Driver navigator components share the existing route type for migration compatibility, but only the authorized area is mounted. There is no configured deep-link handler or persisted navigation state that can bypass this choice. Native navigation/back interaction still needs device verification.

## 5. Preserved and changed behavior

| Flow | Before | After |
|---|---|---|
| Passenger login/registration | Existing auth endpoints, token in AsyncStorage, manual resets | Same endpoint/payload keys, validated response, SecureStore session, provider selects route |
| Driver registration | Existing POST, orphan token/ID, incomplete verification navigation | Same POST, validated result, return to login and truthful verification-unavailable information |
| Driver account | Demo identity/offers/balance | Existing authenticated `GET /api/drivers/:id` profile, retry/loading/error, actual returned account status |
| Route entry | Map/location/autocomplete plus invented fare/ETA | Map/location/autocomplete and vehicle selection retained; dashed location connection explicitly not a road route; quote unavailable |
| Ride matching/lifecycle | Successful local timers | No fabricated success, no false financial notices; backend integration required |
| History | Hardcoded personal trips/spending | History-unavailable notice; rendering structure retained for future real records |
| Scheduling | Local success alert | Route/time/note editor retained; explicit no booking/reminder created |
| Verification | Local image selection/logging and false submitted modal | No documents collected without an upload contract; explicit unavailable message |
| Legacy auth modules | Separate unfinished implementations | Compatibility exports to maintained screens, preventing hidden fake success paths |
| Driver scaffolding | Unimplemented API resolved undefined | Offer API rejects explicitly with missing-contract message; no production route to scaffold screens |

The removal of local photo selection, the old test login, sample offers/history, self-approval UI and false success notifications is intentional and documented. None of these had an implemented server-backed transaction. Camera/gallery dependencies and permissions were removed after their last application usage was removed. Public geographic shortcuts remain; fake personal Home/Office favorites do not.

## 6. Security improvements

Tokens are kept in native SecureStore with device-only unlocked accessibility. Legacy token-only storage is cleared rather than trusted without a corresponding validated identity. Logout clears memory immediately, serializes cleanup and records a non-sensitive invalidation marker so a failed keychain deletion cannot silently restore the session when the marker was written. If both persistence providers fail, no client can guarantee durable erasure; storage errors remain surfaced/retryable.

JWT expiration is a local early-expiry check, **not signature verification**. Opaque tokens are supported because the existing frontend contract did not promise JWTs; their validity is established by server responses. A 401 invalidates only the token that made the request. Client role checks and route isolation complement server authorization; they cannot replace it.

No registration/document payloads or arbitrary server responses are logged. Error bodies are not echoed into alerts. Password generation uses Expo Crypto. Release API URLs require HTTPS and explicit configuration. Sensitive-response validation strips unknown identity fields. No automatic retry is applied to booking/payment/registration writes.

## 7. Performance changes and measurement limits

Removed duplicate address-resolution timers, perpetual matching/ride timers and the uncleaned logo loop. Obsolete address work is cancelled or ignored. Map overlays are regular layout content rather than a stack of competing absolute panels. No blanket memoization, new data-fetching framework or speculative rendering optimization was introduced. Lists in currently enabled flows are bounded; long-history virtualization awaits a real paginated history contract.

Cold-start latency, JS/native memory, dropped frames, resize smoothness and interaction responsiveness were **not measured**. No numerical improvement is claimed. Bundle export timings and byte sizes are build artifacts, not runtime performance benchmarks.

## 8. Verification executed

See [verification.md](audit/verification.md) for final commands/results and toolchain limits. Automated HTTP/API tests use mocked transport; navigation tests inspect the actual navigator's registered screen set with a mocked native stack. These are not backend or device end-to-end tests. CI was authored locally; no remote run is claimed.

## 9. Backend requirements and blocked integrations

Existing frontend-declared API surface, preserved without inventing new endpoints:

| Method | Path | Current use |
|---|---|---|
| POST | `/api/auth/login` | Login; expects token and account identity |
| POST | `/api/auth/register` | Passenger registration with `fullName`, `email`, `phoneNumber`, `password`, `role` |
| POST | `/api/drivers/register` | Driver registration; unchanged registration data keys |
| GET | `/api/drivers/:driverId` | Authenticated, driver-role profile/status retrieval |
| POST | `/api/drivers/:driverId/verify` | Existing service contract retained with authentication/role guard, **no self-approval UI**; backend ownership/authorization must be reviewed before any use |

Required before enabling real trips:

1. Server-authorized quote with stable quote ID, currency, fare, road distance/duration, validity window and explicit fare acceptance rules. Product must define whether any estimate is allowed.
2. Idempotent ride creation with server ride ID; duplicate request reconciliation. No automatic replay of POST after uncertain timeout.
3. Matching/status transport contract: WebSocket, SSE or polling is **not established** by this repo. Specify authentication, event ordering/revisions, duplicate/stale handling, no-driver/expiry/failure outcomes, reconnect and missed-event snapshots.
4. Server-authorized cancellation, cancellation fees, ambiguous timeout handling and reconciliation. A local “leave screen” action is not cancellation.
5. Active ride snapshot and account-scoped restoration endpoint. Only then persist a validated stable ride ID (clear on logout/terminal state), restore after restart, suspend/resume transport with app foreground state, and test network-loss recovery.
6. Driver shift, offer feed, verified-driver eligibility, server-atomic acceptance with `already_taken`/expiry outcomes, pickup/start/completion authorization, and one-active-trip enforcement. Offers cannot be accepted offline or just from cached React state.
7. Authoritative earnings/ledger and payment confirmation; receipts/history pagination. No local financial ledger and no payment success based on a ride timer.
8. Secure document-upload contract: accepted file/media constraints, upload authorization, retention/deletion, reviewer authorization and submission/verification status. Do not collect identity documents until this exists.
9. Scheduled booking/reminder creation and cancellation, linked payment instrument/provider capability, ride sharing and real fare-alert service. Settings currently store preferences only.
10. Session validation/refresh/revocation/logout contracts and server ownership/role checks on every resource, including profile/verification. Driver registration's returned token is deliberately not promoted into a verified driver session; fresh login establishes the account.
11. Correlation/request IDs and retry semantics must be agreed with backend before adding custom headers or replay behavior. Frontend currently sends no invented request-ID header.

No local API was listening on `localhost:3001` during verification (connection failed; HTTP status `000`). No backend repository or valid test environment was provided. Runtime response schemas remain the contracts declared by this frontend, not server-verified documentation.

## 10. Known limitations / unresolved concerns

- Remaining npm advisories: see JSON snapshot and final verification summary. Navigation 6's decode/query chain and Expo tooling dependencies still need a separately verified remediation/migration. No forced SDK 58 or Navigation 7 upgrade was applied. A package advisory is a supported concern, not proof of an exploitable production path.
- Full native Xcode/Android builds, permission dialogs, native maps, SecureStore/Crypto on hardware and all font/keyboard/foldable layouts remain unverified. Successful Hermes exports do not prove native compilation or UI correctness.
- Active ride state restoration, cancellation, reconnect, offer conflicts and real payments are intentionally unavailable until backend contracts exist. Their type boundaries/tests do not constitute completed integrations.
- Backend token signatures, revoked opaque tokens, resource ownership and reviewer permissions cannot be verified here. Revoke any active old test credential outside this repository.
- Active authentication form labels/errors and unavailable states support English/Ukrainian. Arbitrary external/server/system errors and some English API fallback messages are not fully localized. Auth forms retain their established dark visual treatment; full light-theme visual parity needs design/device review.
- Several unused driver scaffold screens remain intentionally unmounted. No numerical performance/memory profile was possible. Web is not a supported validation target for the current native maps setup.
- Address searches go to a third-party geocoder by default and native geocoding uses platform services. Release privacy disclosures, rate/usage limits and geographic coverage require product/service-owner review.
- If saving a theme/language preference fails, it remains usable in memory for that session; only the main settings persistence currently exposes a visible save-failure banner.

## 11. Manual verification checklist

Do not mark these as device/backend passed based on the automated suite.

| # | Workflow | Automated/static coverage | Remaining manual work |
|---|---|---|---|
| 1 | Passenger registration/login | Existing payload/response contract, session validation; no backend | Run valid/invalid/duplicate registration and login against test backend |
| 2 | Driver registration | Existing POST retained; duplicate/unmount guards reviewed | Submit on both platforms and verify stored server record |
| 3 | Driver verification | False submission removed; unavailable state | Connect upload/review API and test pending/active/blocked privileges |
| 4 | Session restoration | Session/storage unit tests including roles, malformed and expired credentials | Restart real native build with passenger/driver/expired/revoked credentials |
| 5 | Logout | Memory/disk/race/invalidation tests | Logout, kill/relaunch, back gesture and locked-keychain failure |
| 6 | Unauthorized navigation | Guest/passenger/driver/expired registered-route tests; protected HTTP role denial | Exercise native navigation, malformed links and server ACLs |
| 7 | Autocomplete | Response validation/cancellation boundary and source cleanup | Rapid typing, selection/swap, no results, timeout, aborted query |
| 8 | Location denied | Safe manual pickup path reviewed | Deny/disable/re-enable permission on iOS and Android |
| 9 | Route selection | No invented fare/road route; editor retained | Validate real pickup/destination selection and visible dashed line explanation |
| 10 | Ride creation | Explicit unavailable gateway; no real request | Implement and test idempotency/ambiguous timeout before enabling |
| 11 | Driver matching | No timer success; snapshot validation tests | Real no-driver, match, duplicate, expiry and transport reconnect tests |
| 12 | Cancellation | Unavailable typed boundary | Server cancellation, fees, duplicate cancel and network failure |
| 13 | Active ride | No local completion/payment; transition reconciliation | Real live status/location and passenger-vs-driver actions |
| 14 | Offer acceptance | No demo offers; typed conflict/unavailable boundary | Two drivers race to accept; reject loser and duplicate taps |
| 15 | Ride completion | No local success or financial balance changes | Authorized completion + authoritative payment/ledger |
| 16 | Offline recovery | HTTP network/timeout tests, profile retry | Airplane mode while loading/matching/riding; reconcile after reconnect |
| 17 | Background/foreground | Session expiry and profile refresh wiring | Background long enough to expire; resume network transport once implemented |
| 18 | Restart during ride | Stable-ID/restore boundary only | Backend active snapshot + account-scoped persisted ride ID required |
| 19 | Large font | Flexible/scrollable controls and labels reviewed | Maximum accessibility font + VoiceOver/TalkBack |
| 20 | Small screen | Scrollable layouts implemented | Smallest supported device, keyboard open, all actions reachable |
| 21 | Foldable resize | Window-dimension layout, no business-state keys/remounts | Fold/unfold mid-form and while selecting route |
| 22 | Landscape | Orientation unlocked; side-by-side map/panel | Both rotations, keyboard, tablet split-screen and system insets |
| 23 | Android back | Native stack remains; role navigator replacement | Hardware back/gesture from each screen; cannot return to prior account |
| 24 | Translation switching | Dictionary key/interpolation parity tests; auth labels translated | Switch both languages, restart and validate error strings |
| 25 | Light/dark themes | Existing theme provider retained; CTA contrast pair fixed | Both modes/auto, system appearance change, all forms/cards/maps |

## 12. Recommended next steps

1. Review this patch and remaining dependency exposure; rotate the old test credential if it exists on a server. Confirm the real API origin and backend contracts listed above.
2. Run native builds and the full device checklist on a small handset, iOS/Android tablets and a foldable/resizable Android emulator. Capture visual/accessibility failures before declaring layout acceptance.
3. Implement backend adapters incrementally: session validation, profile eligibility, quote, ride create/read/cancel, matching transport, driver atomic acceptance, ledger/payment, documents and history. Enable each action only after integration tests prove its authoritative server behavior.
4. Record cold-start/render/memory profiles on representative devices, then optimize demonstrated bottlenecks. Plan dependency major migrations as separately tested changes.

## 13. Files modified

The complete review surface is [changed-files.md](audit/changed-files.md), grouped into modified and new files. The report, inventory, dependency snapshot and verification evidence are included there. All changes are local and uncommitted.

## References consulted

Expo documents that public environment variables must use static dot notation for bundling: [Expo environment variables](https://docs.expo.dev/guides/environment-variables/). SecureStore selection was checked against the installed SDK's `bundledNativeModules.json` and [Expo SecureStore documentation](https://docs.expo.dev/versions/latest/sdk/securestore/) (the archived SDK 54 URL now redirects to latest; version compatibility was therefore taken from installed SDK metadata). Actual compatibility results are from the executed Expo commands, not assumed from current online versions.
