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

const makeFakeJwt = () => {
  const now = Math.floor(Date.now() / 1000);
  const payload = { id: 1, email: "e2e@denamu.local", userName: "e2e유저", role: "user", iat: now, exp: now + 3600 };
  const b64 = (obj: object) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  return `${b64({ alg: "HS256", typ: "JWT" })}.${b64(payload)}.signature`;
};

const fulfillJson = (status: number, body: object) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

test.beforeEach(async ({ page }) => {
  await page.route(API_PATTERN, (route) => route.fulfill(fulfillJson(401, { message: "no session" })));
});

test("첫 방문 시 /about 으로 리다이렉트된다", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByText("개발자를 위한 최고의 블로그 허브")).toBeVisible();
});

test("/about 페이지가 주요 섹션을 렌더링한다", async ({ page }) => {
  await markVisited(page);
  await page.goto("/about");

  await expect(page.getByText("개발자를 위한 최고의 블로그 허브")).toBeVisible();
  await expect(page.getByText("지금 바로 시작하세요")).toBeVisible();
  await expect(page.getByRole("button", { name: "블로그 둘러보기" })).toBeVisible();
});

test("/signin 에서 로그인 실패 시 실패 toast 를 표시한다", async ({ page }) => {
  await markVisited(page);
  await page.route(/\/\/[^/]+\/api\/users\/login/, (route) => route.fulfill(fulfillJson(401, { message: "invalid" })));
  await page.goto("/signin");

  await page.getByPlaceholder("이메일을 입력하세요").fill("wrong@test.com");
  await page.getByPlaceholder("비밀번호를 입력하세요").fill("wrongpw");
  await page.getByRole("button", { name: "로그인" }).click();

  await expect(page.getByText("로그인 실패").first()).toBeVisible();
});

test("/signin 에서 로그인 성공 시 성공 toast 를 표시한다", async ({ page }) => {
  await markVisited(page);
  await page.route(/\/\/[^/]+\/api\/users\/login/, (route) =>
    route.fulfill(fulfillJson(200, { message: "로그인 되었습니다.", data: { accessToken: makeFakeJwt() } }))
  );
  await page.goto("/signin");

  await page.getByPlaceholder("이메일을 입력하세요").fill("e2e@denamu.local");
  await page.getByPlaceholder("비밀번호를 입력하세요").fill("password");
  await page.getByRole("button", { name: "로그인" }).click();

  await expect(page.getByText("로그인 성공").first()).toBeVisible();
});

test("/signin 에서 회원가입 링크로 이동할 수 있다", async ({ page }) => {
  await markVisited(page);
  await page.goto("/signin");

  await page.getByRole("button", { name: "회원가입" }).click();

  await expect(page).toHaveURL(/\/signup$/);
});

test("/signup 에서 회원가입 성공 시 /signin 으로 이동한다", async ({ page }) => {
  await markVisited(page);
  await page.route(/\/\/[^/]+\/api\/users\/registrations/, (route) =>
    route.fulfill(fulfillJson(200, { message: "인증 메일을 발송했습니다." }))
  );
  await page.goto("/signup");

  await page.getByPlaceholder("이메일을 입력하세요").fill("new@denamu.local");
  await page.getByPlaceholder("비밀번호를 입력하세요").fill("password123");
  await page.getByPlaceholder("이름을 입력해주세요").fill("새유저");
  await page.getByRole("button", { name: "회원가입" }).click();

  await expect(page.getByText("회원가입 성공").first()).toBeVisible();
  await expect(page).toHaveURL(/\/signin$/);
});
