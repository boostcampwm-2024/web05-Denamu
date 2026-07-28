import { afterEach, beforeEach, describe, expect, it } from "vitest";

import MockAdapter from "axios-mock-adapter";

import { axiosInstance } from "@/api/instance";
import { adminNotice } from "@/api/services/admin/notice";
import { NOTICE } from "@/constants/endpoints";

let mock: MockAdapter;

describe("adminNotice service", () => {
  beforeEach(() => {
    mock = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mock.restore();
  });

  it("getList는 관리자 목록 엔드포인트를 page/limit/status 파라미터로 GET하고 data.data를 언랩한다", async () => {
    const payload = { result: [{ id: 1, title: "공지" }], page: 1, limit: 10, totalCount: 1, hasMore: false };
    mock.onGet(NOTICE.ADMIN_LIST).reply(200, { message: "성공", data: payload });

    const result = await adminNotice.getList({ page: 1, limit: 10, status: "PUBLISHED" });

    expect(result).toEqual(payload);
    expect(mock.history.get[0].params).toEqual({ page: 1, limit: 10, status: "PUBLISHED" });
  });

  it("getDetail은 관리자 상세 엔드포인트를 GET하고 data.data를 언랩한다", async () => {
    const payload = { id: 7, title: "상세", content: "<p>내용</p>" };
    mock.onGet(NOTICE.ADMIN_DETAIL(7)).reply(200, { message: "성공", data: payload });

    const result = await adminNotice.getDetail(7);

    expect(result).toEqual(payload);
    expect(mock.history.get[0].url).toBe(NOTICE.ADMIN_DETAIL(7));
  });

  it("create는 관리자 목록 엔드포인트로 POST하고 payload를 body로 전달한다", async () => {
    const payload = { title: "새 공지", content: "<p>내용</p>" };
    mock.onPost(NOTICE.ADMIN_LIST).reply(201, { message: "성공", data: { id: 1, ...payload } });

    await adminNotice.create(payload);

    expect(mock.history.post).toHaveLength(1);
    expect(mock.history.post[0].url).toBe(NOTICE.ADMIN_LIST);
    expect(JSON.parse(mock.history.post[0].data)).toEqual(payload);
  });

  it("update는 관리자 상세 엔드포인트로 PATCH하고 payload를 body로 전달한다", async () => {
    const payload = { title: "수정된 제목" };
    mock.onPatch(NOTICE.ADMIN_DETAIL(3)).reply(200, { message: "성공", data: { id: 3, title: "수정된 제목" } });

    await adminNotice.update(3, payload);

    expect(mock.history.patch).toHaveLength(1);
    expect(mock.history.patch[0].url).toBe(NOTICE.ADMIN_DETAIL(3));
    expect(JSON.parse(mock.history.patch[0].data)).toEqual(payload);
  });

  it("remove는 관리자 상세 엔드포인트로 DELETE한다", async () => {
    mock.onDelete(NOTICE.ADMIN_DETAIL(3)).reply(200);

    await adminNotice.remove(3);

    expect(mock.history.delete).toHaveLength(1);
    expect(mock.history.delete[0].url).toBe(NOTICE.ADMIN_DETAIL(3));
  });
});
