import { expect, test, type Page } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL || "https://localhost";
const userEmail = process.env.E2E_USER_EMAIL;
const userPassword = process.env.E2E_USER_PASSWORD;
const VISIT_FLAG_KEY = "visit-flag";

const markAsVisited = async (page: Page) => {
  await page.addInitScript(({ key }) => {
    window.localStorage.setItem(
      key,
      JSON.stringify({
        state: { hasVisited: true },
        version: 0,
      }),
    );
  }, { key: VISIT_FLAG_KEY });
};

type JwtPayload = {
  id: number;
  email: string;
  userName: string;
  role: string;
  exp: number;
  iat: number;
};

const decodeJwtPayload = (token: string): JwtPayload => {
  const payload = token.split(".")[1];
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as JwtPayload;
};

test("normal login issues JWT and sets refresh cookie", async ({ context, page }) => {
  if (!userEmail || !userPassword) {
    throw new Error("Set E2E_USER_EMAIL and E2E_USER_PASSWORD in .env.e2e before running auth-jwt.spec.ts");
  }

  await context.clearCookies();
  await markAsVisited(page);
  await page.goto("/signin");

  await page.locator('input[type="email"]').fill(userEmail);
  await page.locator('input[type="password"]').fill(userPassword);

  const loginResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/user/login") &&
      response.request().method() === "POST",
  );

  await page.locator('button[type="submit"]').click();
  const loginResponse = await loginResponsePromise;
  const status = loginResponse.status();
  const loginBody = await loginResponse.json();

  expect(status, `Login failed with status ${status}: ${JSON.stringify(loginBody)}`).toBe(200);
  const accessToken = loginBody?.data?.accessToken as string | undefined;

  expect(accessToken).toBeTruthy();
  const tokenPayload = decodeJwtPayload(accessToken as string);
  expect(tokenPayload.email).toBe(userEmail);
  expect(tokenPayload.role).toBe("user");
  expect(tokenPayload.exp).toBeGreaterThan(tokenPayload.iat);

  const cookies = await context.cookies(baseURL);
  expect(cookies.some((cookie) => cookie.name === "refresh_token")).toBe(true);
  await expect(page).not.toHaveURL(/\/signin$/);
});

test("oauth callback sets refresh cookie and issues JWT through refresh endpoint", async ({ page }) => {
  await markAsVisited(page);
  const refreshResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/user/refresh-token") &&
      response.request().method() === "POST",
  );

  await page.goto("/api/oauth/e2e/callback?provider=google");

  const refreshResponse = await refreshResponsePromise;
  const refreshStatus = refreshResponse.status();
  const refreshBody = await refreshResponse.json();
  const accessToken = refreshBody?.data?.accessToken as string | undefined;

  expect(refreshStatus, `Refresh failed with status ${refreshStatus}: ${JSON.stringify(refreshBody)}`).toBe(200);
  expect(accessToken).toBeTruthy();

  const tokenPayload = decodeJwtPayload(accessToken as string);
  expect(tokenPayload.email).toBe("e2e-google@denamu.local");
  expect(tokenPayload.role).toBe("user");

  await page.waitForURL(
    (url) => url.toString().startsWith(baseURL) && url.pathname === "/",
    { timeout: 60_000 },
  );

  const cookies = await page.context().cookies(baseURL);
  expect(cookies.some((cookie) => cookie.name === "refresh_token")).toBe(true);
});
