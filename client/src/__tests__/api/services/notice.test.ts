import { afterEach, beforeEach, describe, expect, it } from "vitest";

import MockAdapter from "axios-mock-adapter";

import { axiosInstance } from "@/api/instance";
import { getNotice, getNotices } from "@/api/services/notice";
import { NOTICE } from "@/constants/endpoints";

let mock: MockAdapter;

describe("notice service", () => {
  beforeEach(() => {
    mock = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mock.restore();
  });

  it("getNotices는 목록 엔드포인트를 page/limit 파라미터로 GET하고 data.data를 언랩한다", async () => {
    const payload = { result: [{ id: 1, title: "공지" }], page: 1, limit: 10, totalCount: 1, hasMore: false };
    mock.onGet(NOTICE.LIST).reply(200, { message: "성공", data: payload });

    const result = await getNotices({ page: 1, limit: 10 });

    expect(result).toEqual(payload);
    expect(mock.history.get[0].params).toEqual({ page: 1, limit: 10 });
  });

  it("getNotice는 상세 엔드포인트를 GET하고 data.data를 언랩한다", async () => {
    const payload = { id: 5, title: "상세 공지", content: "<p>내용</p>" };
    mock.onGet(NOTICE.DETAIL(5)).reply(200, { message: "성공", data: payload });

    const result = await getNotice(5);

    expect(result).toEqual(payload);
    expect(mock.history.get[0].url).toBe(NOTICE.DETAIL(5));
  });
});
