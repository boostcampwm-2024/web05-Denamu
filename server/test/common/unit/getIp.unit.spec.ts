import { getIp } from '@common/util/getIp';

const createRequest = (
  realIp: string | string[] | undefined,
  remoteAddress = '127.0.0.1',
) =>
  ({
    headers: { 'x-real-ip': realIp },
    socket: { remoteAddress },
  }) as unknown as Parameters<typeof getIp>[0];

describe(`${getIp.name} Unit Test`, () => {
  it('x-real-ip가 있으면 해당 IP를 반환한다.', () => {
    expect(getIp(createRequest('203.0.113.1'))).toBe('203.0.113.1');
  });

  it('x-real-ip가 없으면 socket.remoteAddress를 반환한다.', () => {
    expect(getIp(createRequest(undefined, '10.0.0.5'))).toBe('10.0.0.5');
  });

  it('x-real-ip가 배열(문자열 아님)이면 socket.remoteAddress로 폴백한다.', () => {
    expect(getIp(createRequest(['203.0.113.1'], '10.0.0.5'))).toBe(
      '10.0.0.5',
    );
  });
});
