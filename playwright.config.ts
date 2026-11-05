import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: "http://localhost:8081",
    headless: true,
    ignoreHTTPSErrors: true,
    reducedMotion: "reduce",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "EXPO_PUBLIC_DESIGN_PREVIEW=true npx expo start --web --port 8081 --clear",
    url: "http://localhost:8081",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
