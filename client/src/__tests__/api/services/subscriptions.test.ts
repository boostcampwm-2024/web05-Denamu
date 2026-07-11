import { afterEach, beforeEach, describe, expect, it } from "vitest";

import MockAdapter from "axios-mock-adapter";

import { axiosInstance } from "@/api/instance";
import { subscriptions } from "@/api/services/subscriptions";
import { SUBSCRIPTION } from "@/constants/endpoints";

let mock: MockAdapter;

describe("subscriptions service", () => {
  beforeEach(() => {
    mock = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mock.restore();
  });

  it("create는 해당 RSS 구독 등록 엔드포인트로 POST한다", async () => {
    mock.onPost(SUBSCRIPTION.CREATE(5)).reply(201);

    await subscriptions.create(5);

    expect(mock.history.post).toHaveLength(1);
    expect(mock.history.post[0].url).toBe(SUBSCRIPTION.CREATE(5));
  });

  it("remove는 해당 RSS 구독 해제 엔드포인트로 DELETE한다", async () => {
    mock.onDelete(SUBSCRIPTION.REMOVE(5)).reply(200);

    await subscriptions.remove(5);

    expect(mock.history.delete).toHaveLength(1);
    expect(mock.history.delete[0].url).toBe(SUBSCRIPTION.REMOVE(5));
  });

  it("byUser는 사용자 구독 목록을 조회하고 data.data를 언랩한다", async () => {
    const payload = [
      { id: 1, name: "블로그A", userName: "작가A", rssUrl: "https://a/rss", blogPlatform: "velog", feedCount: 3 },
    ];
    mock.onGet(SUBSCRIPTION.BY_USER(7)).reply(200, { message: "성공", data: payload });

    const result = await subscriptions.byUser(7);

    expect(result).toEqual(payload);
  });

  it("subscribers는 lastId/limit을 쿼리로 전달하고 커서 페이지를 언랩한다", async () => {
    const page = { result: [{ id: 1, userId: 11, userName: "구독자", profileImage: null }], lastId: 1, hasMore: false };
    mock.onGet(SUBSCRIPTION.SUBSCRIBERS(9)).reply(200, { message: "성공", data: page });

    const result = await subscriptions.subscribers(9, 20, 5);

    expect(result).toEqual(page);
    expect(mock.history.get[0].params).toEqual({ lastId: 20, limit: 5 });
  });

  it("subscribers는 limit 기본값 10을 사용한다", async () => {
    mock.onGet(SUBSCRIPTION.SUBSCRIBERS(9)).reply(200, {
      message: "성공",
      data: { result: [], lastId: 0, hasMore: false },
    });

    await subscriptions.subscribers(9);

    expect(mock.history.get[0].params).toEqual({ lastId: undefined, limit: 10 });
  });

  it("feed는 limit/lastId 파라미터로 조회하고 result/hasMore/lastId를 반환한다", async () => {
    const data = { result: [{ id: 1 }, { id: 2 }], hasMore: true, lastId: 2 };
    mock.onGet(SUBSCRIPTION.FEED).reply(200, { message: "성공", data });

    const result = await subscriptions.feed({ limit: 12, lastId: 0, tags: [] });

    expect(result).toEqual(data);
    expect(mock.history.get[0].params).toEqual({ limit: 12, lastId: 0 });
  });
});
