import { expect, test, type Page } from "@playwright/test";

const adminEmail = process.env.DEMO_ADMIN_EMAIL || "creativelab.co.th@gmail.com";
const adminPassword = process.env.DEMO_ADMIN_PASSWORD || "";

const protectedPages = [
  { path: "/dashboard", text: "Operations Dashboard" },
  { path: "/map", text: "Risk Map" },
  { path: "/optimizer", text: "Optimization" },
  { path: "/imports", text: "Data Imports" },
  { path: "/reports", text: "Reports" },
  { path: "/settings", text: "Settings" },
];

async function login(page: Page) {
  if (!adminPassword) throw new Error("DEMO_ADMIN_PASSWORD must be set for e2e tests.");

  await page.goto("/login");
  await page.getByLabel("Email").fill(adminEmail);
  await page.getByLabel("Password").fill(adminPassword);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    body: document.body.scrollWidth,
    doc: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));

  expect(Math.max(overflow.body, overflow.doc)).toBeLessThanOrEqual(overflow.viewport + 2);
}

for (const viewport of [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 1000 },
]) {
  test(`public landing is responsive on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Open RangerQ" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Deploy Now" })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test(`protected app pages are responsive on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await login(page);

    for (const appPage of protectedPages) {
      await page.goto(appPage.path);
      await expect(page.getByRole("heading", { name: appPage.text })).toBeVisible();
      if (appPage.path === "/map") {
        const mapBox = page.getByLabel("Khao Yai risk map");
        await expect(mapBox).toBeVisible();
        const box = await mapBox.boundingBox();
        expect(box?.height).toBeGreaterThan(300);
        expect(await page.locator(".maplibregl-canvas").count()).toBeGreaterThan(0);
      }
      await expectNoHorizontalOverflow(page);
    }
  });
}
