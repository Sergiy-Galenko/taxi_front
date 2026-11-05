import { expect, test } from "@playwright/test";
const sizes = [
  [320, 640],
  [360, 780],
  [390, 844],
  [412, 915],
  [480, 800],
  [600, 960],
  [720, 900],
  [840, 1100],
  [1024, 768],
  [1280, 800],
] as const;
for (const [width, height] of sizes) {
  test(`login and booking layout ${width}x${height}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width, height });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("button", { name: "Sign in", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByLabel("Email", { exact: true }).filter({ visible: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `docs/redesign/screenshots/login-${width}x${height}.png`,
    });
    await page.getByLabel("Preview screen").selectOption("Home");
    if (width < 700)
      await expect(page.getByLabel("Booking panel")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Review ride options", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page
      .frameLocator("iframe:visible")
      .locator("canvas")
      .first()
      .waitFor({ timeout: 8000 })
      .catch(() => undefined);
    await page.screenshot({
      path: `docs/redesign/screenshots/home-${width}x${height}.png`,
    });
    for (const screenName of ['PassengerRegistration', 'DriverRegistration', 'VehicleSelection', 'DriverSearch', 'ActiveRide', 'Preorder', 'TripHistory', 'Settings', 'DriverHome']) {
      await page.getByLabel('Preview screen').selectOption(screenName);
      await expect(page.getByRole('heading').first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (screenName === 'PassengerRegistration') {
        const primary = page.getByRole('button', { name: 'Create an account', exact: true });
        await primary.scrollIntoViewIfNeeded(); await expect(primary).toBeVisible();
      }
      if (screenName === 'VehicleSelection') await expect(page.getByRole('button', { name: 'Booking currently unavailable', exact: true })).toBeDisabled();
      if (screenName === 'Settings') {
        const primary = page.getByRole('button', { name: 'Sign out', exact: true });
        await primary.scrollIntoViewIfNeeded(); await expect(primary).toBeVisible();
      }
      if (width === 390 && ['PassengerRegistration', 'Settings', 'DriverHome', 'VehicleSelection'].includes(screenName)) await page.screenshot({ path: `docs/redesign/screenshots/${screenName}-compact.png` });
    }
    expect(errors).toEqual([]);
  });
}
test("fold, unfold and landscape preserve form and booking state", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page
    .getByLabel("Email", { exact: true })
    .filter({ visible: true })
    .fill("review@example.test");
  await page
    .getByLabel("Password", { exact: true })
    .filter({ visible: true })
    .fill("private draft");
  for (const size of [
    { width: 840, height: 1100 },
    { width: 1024, height: 768 },
    { width: 320, height: 640 },
  ]) {
    await page.setViewportSize(size);
    await expect(
      page.getByLabel("Email", { exact: true }).filter({ visible: true }),
    ).toHaveValue("review@example.test");
    await expect(
      page.getByLabel("Password", { exact: true }).filter({ visible: true }),
    ).toHaveValue("private draft");
  }
  await page.getByLabel("Preview screen").selectOption("Home");
  await page
    .getByLabel("Destination", { exact: true })
    .filter({ visible: true })
    .fill("Unsubmitted destination");
  await page.getByRole("radio", { name: "XL", exact: true }).click();
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(
    page.getByLabel("Destination", { exact: true }).filter({ visible: true }),
  ).toHaveValue("Unsubmitted destination");
  await expect(
    page.getByRole("radio", { name: "XL", exact: true }),
  ).toHaveAttribute("aria-checked", "true");
  await page.setViewportSize({ width: 360, height: 780 });
  await expect(
    page.getByLabel("Destination", { exact: true }).filter({ visible: true }),
  ).toHaveValue("Unsubmitted destination");
});
test("dark theme, Ukrainian text and all main screen presentations render", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await page.screenshot({
    path: "docs/redesign/screenshots/login-dark-expanded.png",
  });
  await page
    .getByRole("button", { name: "Change language", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Увійти", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/redesign/screenshots/login-uk-dark-expanded.png",
  });
  for (const screen of [
    "RoleSelection",
    "PassengerRegistration",
    "DriverRegistration",
    "VehicleSelection",
    "DriverSearch",
    "ActiveRide",
    "Preorder",
    "TripHistory",
    "Settings",
    "DriverHome",
  ]) {
    await page.getByLabel("Preview screen").selectOption(screen);
    if (await page.locator("iframe:visible").count())
      await page
        .frameLocator("iframe:visible")
        .locator("canvas")
        .first()
        .waitFor({ timeout: 8000 })
        .catch(() => undefined);
    await page.screenshot({
      path: `docs/redesign/screenshots/${screen}-uk-dark-expanded.png`,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
test("driver wizard preserves drafts through resize and back navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Preview screen").selectOption("DriverRegistration");
  await page
    .getByRole("button", { name: "Start registration", exact: true })
    .click();
  await page
    .getByLabel("Full name", { exact: true })
    .filter({ visible: true })
    .fill("Review Driver");
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(
    page.getByLabel("Full name", { exact: true }).filter({ visible: true }),
  ).toHaveValue("Review Driver");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page
    .getByLabel("Email", { exact: true })
    .filter({ visible: true })
    .fill("review@example.test");
  await page
    .getByLabel("Phone number", { exact: true })
    .filter({ visible: true })
    .fill("+380501234567");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page
    .getByLabel("Car brand", { exact: true })
    .filter({ visible: true })
    .fill("Toyota");
  await page.getByRole("button", { name: "Toyota", exact: true }).click();
  await page
    .getByLabel("Car model", { exact: true })
    .filter({ visible: true })
    .fill("Corolla");
  await page.getByRole("button", { name: "Corolla", exact: true }).click();
  await page
    .getByLabel("Car color", { exact: true })
    .filter({ visible: true })
    .fill("White");
  await page
    .getByLabel("License plate", { exact: true })
    .filter({ visible: true })
    .fill("AA 1234 BB");
  await page
    .getByLabel("Driving experience (years)", { exact: true })
    .filter({ visible: true })
    .fill("5");
  await page.setViewportSize({ width: 320, height: 640 });
  await expect(
    page.getByLabel("Car model", { exact: true }).filter({ visible: true }),
  ).toHaveValue("Corolla");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page
    .getByLabel("Driving license number", { exact: true })
    .filter({ visible: true })
    .fill("AB123456");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(
    page.getByLabel("Password", { exact: true }).filter({ visible: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Go back", exact: true }).click();
  await expect(
    page
      .getByLabel("Driving license number", { exact: true })
      .filter({ visible: true }),
  ).toHaveValue("AB 123456");
  await page.screenshot({
    path: "docs/redesign/screenshots/wizard-license-compact.png",
  });
});
test("simulated large text remains scrollable with reachable primary actions", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByLabel("Email", { exact: true }).filter({ visible: true }),
  ).toBeVisible();
  await page.evaluate(() => {
    for (const element of Array.from(
      document.querySelectorAll<HTMLElement>('[dir="auto"], input'),
    )) {
      const style = getComputedStyle(element);
      element.style.fontSize = `${parseFloat(style.fontSize) * 1.8}px`;
      element.style.lineHeight = `${parseFloat(style.lineHeight) * 1.8}px`;
    }
  });
  const action = page.getByRole("button", { name: "Sign in", exact: true });
  await action.scrollIntoViewIfNeeded();
  await expect(action).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "docs/redesign/screenshots/login-large-text-compact.png",
  });
});
test("booking panel can collapse accessibly and keeps selected public locations through unfold", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Preview screen").selectOption("Home");
  await page
    .getByLabel("Destination", { exact: true })
    .filter({ visible: true })
    .fill("Central Station");
  await page.getByText("Central Station", { exact: true }).first().click();
  await page.getByRole("button", { name: "Expand panel", exact: true }).click();
  await page
    .getByRole("button", { name: "Collapse panel", exact: true })
    .click();
  await expect(page.getByLabel("Booking panel")).toHaveAttribute(
    "aria-valuetext",
    "Collapsed",
  );
  await expect(
    page.getByRole("button", { name: "Review ride options", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Expand panel", exact: true }).click();
  await expect(
    page.getByLabel("Destination", { exact: true }).filter({ visible: true }),
  ).toHaveValue("Central Station");
  await page
    .frameLocator("iframe:visible")
    .locator("canvas")
    .first()
    .waitFor({ timeout: 8000 })
    .catch(() => undefined);
  await page.screenshot({
    path: "docs/redesign/screenshots/home-selected-compact.png",
  });
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(
    page.getByLabel("Destination", { exact: true }).filter({ visible: true }),
  ).toHaveValue("Central Station");
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => undefined);
  await page.screenshot({
    path: "docs/redesign/screenshots/home-selected-expanded.png",
  });
  await page
    .getByRole("button", { name: "Review ride options", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Booking currently unavailable",
      exact: true,
    }),
  ).toBeDisabled();
  await page.screenshot({
    path: "docs/redesign/screenshots/vehicle-selected-expanded.png",
  });
});

test('short keyboard-sized window keeps form and primary action scrollable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 400 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Preview screen').selectOption('Home');
  const destination = page.getByLabel('Destination', { exact: true }).filter({ visible: true });
  await destination.scrollIntoViewIfNeeded(); await destination.fill('Draft address');
  const action = page.getByRole('button', { name: 'Review ride options', exact: true });
  await action.scrollIntoViewIfNeeded(); await expect(action).toBeVisible();
  const map = await page.locator('iframe:visible').boundingBox(); expect(map?.height).toBeGreaterThanOrEqual(47);
  await page.screenshot({ path: 'docs/redesign/screenshots/home-short-window.png' });
});
