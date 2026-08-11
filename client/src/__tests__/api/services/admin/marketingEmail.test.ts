import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { FILE, MARKETING_EMAIL } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { adminMarketingEmail } from "@/api/services/admin/marketingEmail";

let mock: MockAdapter;

describe("adminMarketingEmail service", () => {
  beforeEach(() => {
    mock = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mock.restore();
  });

  it("getList는 관리자 목록 엔드포인트를 page/limit 파라미터로 GET하고 data.data를 언랩한다", async () => {
    const payload = {
      result: [
        {
          id: 1,
          subject: "여름 소식",
          recipientCount: 120,
          authorName: "관리자",
          createdAt: "2026-07-20T09:00:00.000Z",
        },
      ],
      page: 1,
      limit: 10,
      totalCount: 1,
      hasMore: false,
    };
    mock.onGet(MARKETING_EMAIL.ADMIN_LIST).reply(200, { message: "성공", data: payload });

    const result = await adminMarketingEmail.getList({ page: 1, limit: 10 });

    expect(result).toEqual(payload);
    expect(mock.history.get[0].params).toEqual({ page: 1, limit: 10 });
  });

  it("getDetail은 관리자 상세 엔드포인트를 GET하고 data.data를 언랩한다", async () => {
    const payload = {
      id: 1,
      subject: "여름 소식",
      content: "<p>안녕하세요</p>",
      recipientCount: 120,
      authorName: "관리자",
      createdAt: "2026-07-20T09:00:00.000Z",
    };
    mock.onGet(MARKETING_EMAIL.ADMIN_DETAIL(1)).reply(200, { message: "성공", data: payload });

    const result = await adminMarketingEmail.getDetail(1);

    expect(result).toEqual(payload);
    expect(mock.history.get[0].url).toBe(MARKETING_EMAIL.ADMIN_DETAIL(1));
  });

  it("send는 관리자 목록 엔드포인트로 POST하고 payload를 body로 전달하며 data.data를 언랩한다", async () => {
    const payload = { subject: "새 소식", content: "<p>내용</p>" };
    const responseData = {
      id: 1,
      subject: "새 소식",
      recipientCount: 120,
      authorName: "관리자",
      createdAt: "2026-07-20T09:00:00.000Z",
    };
    mock.onPost(MARKETING_EMAIL.ADMIN_LIST).reply(201, { message: "성공", data: responseData });

    const result = await adminMarketingEmail.send(payload);

    expect(result).toEqual(responseData);
    expect(mock.history.post).toHaveLength(1);
    expect(mock.history.post[0].url).toBe(MARKETING_EMAIL.ADMIN_LIST);
    expect(JSON.parse(mock.history.post[0].data)).toEqual(payload);
  });

  it("uploadImage는 uploadType=MARKETING_EMAIL_IMAGE 파라미터로 파일을 업로드하고 url을 반환한다", async () => {
    mock
      .onPost(FILE.ADMIN_UPLOAD_IMAGE)
      .reply(200, { message: "성공", data: { url: "https://cdn.example.com/marketing/a.png" } });

    const file = new File(["binary"], "a.png", { type: "image/png" });
    const url = await adminMarketingEmail.uploadImage(file);

    expect(url).toBe("https://cdn.example.com/marketing/a.png");
    expect(mock.history.post).toHaveLength(1);
    expect(mock.history.post[0].url).toBe(FILE.ADMIN_UPLOAD_IMAGE);
    expect(mock.history.post[0].params).toEqual({ uploadType: "MARKETING_EMAIL_IMAGE" });
    expect(mock.history.post[0].headers?.["Content-Type"]).toContain("multipart/form-data");
  });
});
