import { afterEach, beforeEach, describe, expect, it } from "vitest";

import MockAdapter from "axios-mock-adapter";

import { axiosInstance } from "@/api/instance";
import { addQnaMessage, createQna, getQna, getQnaList, verifyQnaPassword } from "@/api/services/qna";
import { QNA } from "@/constants/endpoints";

let mock: MockAdapter;

describe("qna service", () => {
  beforeEach(() => {
    mock = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mock.restore();
  });

  it("getQnaList는 목록 엔드포인트를 page/limit 파라미터로 GET하고 data.data를 언랩한다", async () => {
    const payload = { result: [{ id: 1, title: "문의" }], page: 1, limit: 10, totalCount: 1, hasMore: false };
    mock.onGet(QNA.LIST).reply(200, { message: "성공", data: payload });

    const result = await getQnaList({ page: 1, limit: 10 });

    expect(result).toEqual(payload);
    expect(mock.history.get[0].params).toEqual({ page: 1, limit: 10 });
  });

  it("getQna는 상세 엔드포인트를 GET하고 data.data를 언랩한다", async () => {
    const payload = { id: 5, title: "상세 문의", isSecret: false, requiresPassword: false, messages: [] };
    mock.onGet(QNA.DETAIL(5)).reply(200, { message: "성공", data: payload });

    const result = await getQna(5);

    expect(result).toEqual(payload);
    expect(mock.history.get[0].url).toBe(QNA.DETAIL(5));
  });

  it("createQna는 목록 엔드포인트로 POST하고 생성된 id를 반환한다", async () => {
    mock.onPost(QNA.LIST).reply(201, { message: "성공", data: { id: 9 } });

    const result = await createQna({ title: "제목", content: "내용", isSecret: false });

    expect(result).toEqual({ id: 9 });
    expect(JSON.parse(mock.history.post[0].data)).toEqual({ title: "제목", content: "내용", isSecret: false });
  });

  it("verifyQnaPassword는 verify 엔드포인트로 비밀번호를 POST한다", async () => {
    const payload = { id: 5, title: "상세 문의", requiresPassword: false, messages: [] };
    mock.onPost(QNA.VERIFY(5)).reply(200, { message: "성공", data: payload });

    const result = await verifyQnaPassword(5, { password: "1234" });

    expect(result).toEqual(payload);
    expect(JSON.parse(mock.history.post[0].data)).toEqual({ password: "1234" });
  });

  it("addQnaMessage는 messages 엔드포인트로 추가 질문을 POST한다 (응답은 message만 있음)", async () => {
    mock.onPost(QNA.MESSAGES(5)).reply(201, { message: "추가 질문 등록을 성공했습니다." });

    await addQnaMessage(5, { content: "추가 질문" });

    expect(mock.history.post).toHaveLength(1);
    expect(mock.history.post[0].url).toBe(QNA.MESSAGES(5));
    expect(JSON.parse(mock.history.post[0].data)).toEqual({ content: "추가 질문" });
  });
});
