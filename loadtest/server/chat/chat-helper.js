const crypto = require('crypto');

/**
 * 각 가상 사용자(VU)에게 세션 내내 고정 UUID를 부여한다.
 * $uuid를 매번 호출하면 메시지마다 다른 userId가 생성되어
 * Redis에 무한히 socket_client:{userId} 키가 누적되는 문제를 방지한다.
 */
function generatePersistentUserId(context, events, done) {
  context.vars.persistentUserId = crypto.randomUUID();
  return done();
}

module.exports = { generatePersistentUserId };
