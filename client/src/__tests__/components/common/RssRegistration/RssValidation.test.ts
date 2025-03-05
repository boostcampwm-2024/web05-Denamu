import { describe, it, expect } from "vitest";

import {
  validateRssUrl,
  validateName,
  validateBlogger,
  validateEmail,
} from "@/components/RssRegistration/RssValidation.ts";

describe("RSS URL 검증", () => {
  it("유효한 Tistory RSS URL을 검증해야 한다", () => {
    expect(validateRssUrl("https://laurent.tistory.com/rss")).toBe(true);
    expect(validateRssUrl("http://laurent.tistory.com/feed")).toBe(true);
  });

  it("잘못된 형식의 Tistory URL을 거부해야 한다", () => {
    expect(validateRssUrl("https://laurent.tistory.com")).toBe(false);
    expect(validateRssUrl("https://laurent.tistory.com/posts")).toBe(false);
    expect(validateRssUrl("https://fake-tistory.com/rss")).toBe(false);
  });

  it("유효한 Velog RSS URL을 검증해야 한다", () => {
    expect(validateRssUrl("https://v2.velog.io/rss/@junyeokk")).toBe(true);
    expect(validateRssUrl("https://api.velog.io/rss/@junyeokk")).toBe(true);
  });

  it("잘못된 형식의 Velog URL을 거부해야 한다", () => {
    expect(validateRssUrl("https://v2.velog.io/feed/@junyeokk")).toBe(false);
    expect(validateRssUrl("https://velog.io/posts")).toBe(false);
    expect(validateRssUrl("https://velog.io/@junyeokk")).toBe(false);
    expect(validateRssUrl("https://velog.io/feed")).toBe(false);
  });

  it("유효한 Medium RSS URL을 검증해야 한다", () => {
    expect(validateRssUrl("https://medium.com/@junyeokk/feed")).toBe(true);
  });

  it("잘못된 형식의 Medium URL을 거부해야 한다", () => {
    expect(validateRssUrl("https://medium.com/@junyeokk")).toBe(false);
    expect(validateRssUrl("https://medium.com/feed")).toBe(false);
    expect(validateRssUrl("https://fake-medium.com/feed")).toBe(false);
  });

  it("유효한 Naver 블로그 RSS URL을 검증해야 한다", () => {
    expect(validateRssUrl("https://rss.blog.naver.com/junyeokk_")).toBe(true);
  });

  it("잘못된 형식의 Naver 블로그 URL을 거부해야 한다", () => {
    expect(validateRssUrl("https://blog.naver.com/junyeokk_")).toBe(false);
    expect(validateRssUrl("https://rss.blog.naver.com")).toBe(false);
    expect(validateRssUrl("https://fake-naver.com/junyeokk_")).toBe(false);
  });

  it("유효한 이름을 검증해야 한다", () => {
    expect(validateName("Test Name")).toBe(true);
    expect(validateName("홍길동")).toBe(true);
    expect(validateName("A")).toBe(true);
  });

  it("빈 문자열이나 공백만 있는 이름을 거부해야 한다", () => {
    expect(validateName("")).toBe(false);
    expect(validateName(" ")).toBe(false);
    expect(validateName("  ")).toBe(false);
  });

  it("유효한 블로거 이름을 검증해야 한다", () => {
    expect(validateBlogger("DevBlogger")).toBe(true);
    expect(validateBlogger("테크블로거")).toBe(true);
    expect(validateBlogger("B")).toBe(true);
  });

  it("유효한 이메일 주소를 검증해야 한다", () => {
    expect(validateEmail("test@example.com")).toBe(true);
    expect(validateEmail("user.name@domain.co.kr")).toBe(true);
    expect(validateEmail("user+tag@example.com")).toBe(true);
  });

  it("잘못된 이메일 주소를 거부해야 한다", () => {
    expect(validateEmail("")).toBe(false);
    expect(validateEmail("invalid-email")).toBe(false);
    expect(validateEmail("@domain.com")).toBe(false);
    expect(validateEmail("user@")).toBe(false);
    expect(validateEmail("user@domain")).toBe(false);
    expect(validateEmail("user domain@example.com")).toBe(false);
  });
});
