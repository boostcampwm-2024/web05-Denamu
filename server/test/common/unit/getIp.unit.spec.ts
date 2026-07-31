import { getIp } from '@common/util/getIp';

const createRequest = (
  xff: string | string[] | undefined,
  remoteAddress = '127.0.0.1',
) =>
  ({
    headers: { 'x-forwarded-for': xff },
    socket: { remoteAddress },
  }) as unknown as Parameters<typeof getIp>[0];

describe(`${getIp.name} Unit Test`, () => {
  it('x-forwarded-for 단일 IP면 해당 IP를 반환한다.', () => {
    expect(getIp(createRequest('203.0.113.1'))).toBe('203.0.113.1');
  });

  it('x-forwarded-for에 여러 IP가 있으면 첫 번째 IP를 trim해 반환한다.', () => {
    expect(getIp(createRequest('203.0.113.1, 198.51.100.1'))).toBe(
      '203.0.113.1',
    );
  });

  it('x-forwarded-for가 없으면 socket.remoteAddress를 반환한다.', () => {
    expect(getIp(createRequest(undefined, '10.0.0.5'))).toBe('10.0.0.5');
  });

  it('x-forwarded-for가 배열(문자열 아님)이면 socket.remoteAddress로 폴백한다.', () => {
    expect(getIp(createRequest(['203.0.113.1'], '10.0.0.5'))).toBe('10.0.0.5');
  });
});
