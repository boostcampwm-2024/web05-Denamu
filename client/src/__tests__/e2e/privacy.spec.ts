import { expect, test, type Page } from "@playwright/test";

const API_PATTERN = /\/\/[^/]+\/api\//;
const VISIT_FLAG_KEY = "visit-flag";

const markVisited = async (page: Page) => {
  await page.addInitScript(
    ({ key }) => {
      window.localStorage.setItem(key, JSON.stringify({ state: { hasVisited: true }, version: 0 }));
    },
    { key: VISIT_FLAG_KEY }
  );
};

test.beforeEach(async ({ page }) => {
  await page.route(API_PATTERN, (route) =>
    route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ message: "no session" }) })
  );
  await markVisited(page);
});

test("/privacy 페이지가 처리방침 본문을 렌더링한다", async ({ page }) => {
  await page.goto("/privacy");

  await expect(page.getByRole("heading", { level: 1, name: "개인정보처리방침" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: /제 1조/ })).toBeVisible();
  await expect(page.getByText("소셜 로그인 시 (Google, GitHub)")).toBeVisible();
});

test("/about 의 Footer 링크로 /privacy 에 진입할 수 있다", async ({ page }) => {
  await page.goto("/about");

  await page.getByRole("link", { name: "개인정보처리방침" }).click();

  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.getByRole("heading", { level: 1, name: "개인정보처리방침" })).toBeVisible();
});

test("'메인 페이지로 돌아가기' 클릭 시 홈으로 이동한다", async ({ page }) => {
  await page.goto("/privacy");

  await page.getByRole("button", { name: /메인 페이지로 돌아가기/ }).click();

  await expect(page).toHaveURL(/\/$/);
});
