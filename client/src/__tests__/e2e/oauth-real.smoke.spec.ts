import { expect, test } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL || "https://localhost";

test("google oauth redirect params smoke @oauth-real", async ({ request }) => {
  const response = await request.get(`${baseURL}/api/oauth?type=google`, {
    maxRedirects: 0,
  });

  expect([302, 303]).toContain(response.status());

  const location = response.headers()["location"];
  expect(location).toBeTruthy();

  const authUrl = new URL(location as string);
  expect(authUrl.hostname).toBe("accounts.google.com");
  expect(authUrl.pathname).toContain("/o/oauth2/v2/auth");

  const expectedRedirectUri = `${baseURL}/api/oauth/callback`;
  expect(authUrl.searchParams.get("redirect_uri")).toBe(expectedRedirectUri);
  expect(authUrl.searchParams.get("client_id")).toBeTruthy();
  expect(authUrl.searchParams.get("scope")).toContain("email");
  expect(authUrl.searchParams.get("scope")).toContain("profile");
  expect(authUrl.searchParams.get("state")).toBeTruthy();
});
