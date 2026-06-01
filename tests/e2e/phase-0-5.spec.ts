import { expect, test } from "@playwright/test";
import path from "node:path";

const adminEmail = process.env.DEMO_ADMIN_EMAIL || "creativelab.co.th@gmail.com";
const adminPassword = process.env.DEMO_ADMIN_PASSWORD || "";

async function login(page: import("@playwright/test").Page) {
  if (!adminPassword) throw new Error("DEMO_ADMIN_PASSWORD is required for Playwright login tests");
  await page.goto("/login");
  await page.getByLabel("Email").fill(adminEmail);
  await page.getByLabel("Password").fill(adminPassword);
  await page.getByRole("button", { name: "Sign in" }).click();
  try {
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10_000 });
  } catch {
    await page.getByLabel("Email").fill(adminEmail);
    await page.getByLabel("Password").fill(adminPassword);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  }
}

test("home loads with product entry and deploy action", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Q Forest Twin")).toBeVisible();
  await expect(page.getByRole("link", { name: "Open RangerQ" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Deploy Now" })).toBeVisible();
});

test("protected routes redirect to login", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/);
  await expect(page.getByRole("heading", { name: "Sign in to operations" })).toBeVisible();
});

test("login form does not expose credentials and rejects old defaults", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByLabel("Email")).toHaveValue("");
  await expect(page.getByLabel("Password")).toHaveValue("");
  await expect(page.getByText("change-this-password")).toHaveCount(0);

  await page.getByLabel("Email").fill("admin@rangerq.local");
  await page.getByLabel("Password").fill("change-this-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/login\?error=invalid$/);
  await expect(page.getByText("Invalid email or password.")).toBeVisible();
});

test("demo login opens dashboard", async ({ page }) => {
  await login(page);

  await expect(page.getByRole("heading", { name: "Operations Dashboard" })).toBeVisible();
  await expect(page.getByText("Khao Yai Operations")).toBeVisible();
  await expect(page.getByText("Data source freshness")).toBeVisible();
});

test("protected pages render phase 3-5 application surfaces", async ({ page }) => {
  test.setTimeout(60_000);

  await login(page);

  const pages = [
    ["/map", "Risk Map"],
    ["/optimizer", "Optimization"],
    ["/imports", "Data Imports"],
    ["/reports", "Reports"],
    ["/settings", "Settings"],
  ] as const;

  for (const [path, heading] of pages) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  }
});

test("map page exposes phase 7 risk map controls and fallback table", async ({ page }) => {
  await login(page);
  await page.goto("/map");

  await expect(page.getByRole("heading", { name: "Risk Map" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Fire Risk" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Wildlife Risk" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Combined Priority" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Patrol Plan" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Khao Yai risk layer" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Low-bandwidth zone table" })).toBeVisible();
});

test("imports page exposes all phase 4 import paths", async ({ page }) => {
  await login(page);
  await page.goto("/imports");

  await expect(page.getByRole("heading", { name: "SMART export" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Camera detections" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Visitor pressure" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Manual ranger note" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Download sample CSV" })).toHaveCount(3);
});

test("sample SMART CSV upload works", async ({ page }) => {
  test.setTimeout(60_000);

  await login(page);
  await page.goto("/imports");

  await page.getByLabel("SMART export CSV").setInputFiles(path.join(process.cwd(), "public", "demo", "smart_patrol_sample.csv"));
  await page.getByRole("heading", { name: "SMART export" }).locator("..").getByRole("button", { name: "Upload" }).click();
  await expect(page.getByText(/Imported \d+ records/)).toBeVisible({ timeout: 45_000 });
});

test("settings page exposes phase 5 sync controls", async ({ page }) => {
  await login(page);
  await page.goto("/settings");

  await expect(page.getByRole("button", { name: "Run weather sync" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Run FIRMS sync" })).toBeVisible();
  await expect(page.getByText("Google Apps Script database")).toBeVisible();
  await expect(page.getByText("Real hotspot sync enabled")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Audit log" })).toBeVisible();
});

test("dashboard can run phase 6 risk scoring", async ({ page }) => {
  test.setTimeout(90_000);

  await login(page);
  await page.goto("/dashboard");

  await expect(page.getByRole("button", { name: "Run risk scoring" })).toBeVisible();
  await page.getByRole("button", { name: "Run risk scoring" }).click();
  await expect(page.getByText(/Risk scoring complete for \d+ zones/)).toBeVisible({ timeout: 30_000 });
});

test("optimizer returns selected zones and QUBO payload", async ({ page }) => {
  test.setTimeout(90_000);

  await login(page);
  await page.goto("/optimizer");

  await expect(page.getByRole("heading", { name: "Optimization" })).toBeVisible();
  await page.getByRole("button", { name: "Run optimization" }).click();
  await expect(page.getByText(/Optimization selected \d+ zones/)).toBeVisible({ timeout: 45_000 });
  await expect(page.getByRole("heading", { name: "Selected patrol zones" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ranger action plan" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "QUBO payload" })).toBeVisible();
  await expect(page.getByText("patrol_zone_selection")).toBeVisible();
  await page.getByRole("button", { name: "Submit/log qBraid" }).click();
  await expect(page.getByText(/Command: python scripts\/qbraid\/qbraid_submit.py/)).toBeVisible({ timeout: 45_000 });
});

test("reports page generates daily action plan and export controls", async ({ page }) => {
  await login(page);
  await page.goto("/reports");

  await expect(page.getByRole("heading", { name: "Reports" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Daily patrol report" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ranger action plan" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Top 5 patrol zones" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Export CSV" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Print report" })).toBeVisible();
});

test("daily report CSV export downloads", async ({ page }) => {
  await login(page);
  await page.goto("/reports");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Export CSV" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/rangerq-daily-report-\d{4}-\d{2}-\d{2}\.csv/);
});

test("import and sync APIs require authentication", async ({ request }) => {
  const endpoints = [
    "/api/imports/smart",
    "/api/imports/camera",
    "/api/imports/visitors",
    "/api/imports/manual-note",
    "/api/risk/run",
    "/api/optimize/run",
    "/api/optimize/qbraid",
    "/api/sync/weather",
    "/api/sync/firms",
  ];

  for (const endpoint of endpoints) {
    const response = await request.post(endpoint, { data: {} });
    expect(response.status(), endpoint).toBe(401);
  }

  const reportResponse = await request.get("/api/reports/daily");
  expect(reportResponse.status(), "/api/reports/daily").toBe(401);
});

test("qBraid stays in safe fallback when credentials are missing", async ({ page }) => {
  test.setTimeout(90_000);

  await login(page);
  await page.goto("/optimizer");

  await page.getByRole("button", { name: "Run optimization" }).click();
  await expect(page.getByText(/Optimization selected \d+ zones/)).toBeVisible({ timeout: 45_000 });
  await page.getByRole("button", { name: "Submit/log qBraid" }).click();
  await expect(page.getByText(/Command: python scripts\/qbraid\/qbraid_submit.py/)).toBeVisible({ timeout: 45_000 });
  await expect(page.getByRole("button", { name: "Submit/log qBraid" })).toBeVisible();
});

test("health endpoint returns backend and freshness JSON", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok(), "/api/health").toBeTruthy();
  const payload = await response.json() as {
    ok?: boolean;
    service?: string;
    checks?: { googleSheets?: { status?: string }; apiKeys?: { firms?: boolean }; freshness?: unknown[] };
  };

  expect(payload.ok).toBeTruthy();
  expect(payload.service).toContain("RangerQ");
  expect(payload.checks?.googleSheets?.status).toBe("ok");
  expect(payload.checks?.apiKeys?.firms).toBeTruthy();
  expect(Array.isArray(payload.checks?.freshness)).toBeTruthy();
});
