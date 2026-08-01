import { afterEach, beforeEach, describe, expect, it } from "vitest";

import MockAdapter from "axios-mock-adapter";

import { axiosInstance } from "@/api/instance";
import { adminQna } from "@/api/services/admin/qna";
import { QNA } from "@/constants/endpoints";

let mock: MockAdapter;

describe("adminQna service", () => {
  beforeEach(() => {
    mock = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mock.restore();
  });

  it("getList는 관리자 목록 엔드포인트를 page/limit/status 파라미터로 GET하고 data.data를 언랩한다", async () => {
    const payload = { result: [{ id: 1, title: "문의" }], page: 1, limit: 10, totalCount: 1, hasMore: false };
    mock.onGet(QNA.ADMIN_LIST).reply(200, { message: "성공", data: payload });

    const result = await adminQna.getList({ page: 1, limit: 10, status: "PENDING" });

    expect(result).toEqual(payload);
    expect(mock.history.get[0].params).toEqual({ page: 1, limit: 10, status: "PENDING" });
  });

  it("getDetail은 관리자 상세 엔드포인트를 GET하고 data.data를 언랩한다", async () => {
    const payload = { id: 7, title: "상세 문의", requiresPassword: false, messages: [] };
    mock.onGet(QNA.ADMIN_DETAIL(7)).reply(200, { message: "성공", data: payload });

    const result = await adminQna.getDetail(7);

    expect(result).toEqual(payload);
    expect(mock.history.get[0].url).toBe(QNA.ADMIN_DETAIL(7));
  });

  it("answer는 관리자 답변 엔드포인트로 POST하고 payload를 body로 전달한다 (응답은 message만 있음)", async () => {
    mock.onPost(QNA.ADMIN_MESSAGES(7)).reply(201, { message: "답변 등록을 성공했습니다." });

    await adminQna.answer(7, { content: "답변 내용" });

    expect(mock.history.post).toHaveLength(1);
    expect(mock.history.post[0].url).toBe(QNA.ADMIN_MESSAGES(7));
    expect(JSON.parse(mock.history.post[0].data)).toEqual({ content: "답변 내용" });
  });
});
