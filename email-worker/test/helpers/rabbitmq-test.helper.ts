import { Channel } from 'amqplib';
import {
  RMQ_EXCHANGES,
  RMQ_QUEUES,
  RMQ_ROUTING_KEYS,
} from '@rabbitmq/rabbitmq.constant';
import { RabbitMQService } from '@rabbitmq/rabbitmq.service';
import { EmailPayload } from '@app-types/types';

/**
 * RabbitMQ Management API를 통해 조회한 메시지 형식
 */
export interface QueueMessage {
  content: EmailPayload;
  headers: Record<string, any>;
  redelivered: boolean;
}

/**
 * RabbitMQ Management API를 통해 메시지를 조회합니다.
 * 메시지를 소비하지 않고 peek만 합니다.
 *
 * @param queueName 조회할 큐 이름
 * @param count 조회할 메시지 개수 (기본값: 100)
 */
export async function getMessagesFromQueue(
  queueName: string,
  count: number = 100,
): Promise<QueueMessage[]> {
  const host = process.env.RABBITMQ_HOST || 'localhost';
  const managementPort = process.env.RABBITMQ_MANAGEMENT_PORT || '15672';
  const user = process.env.RABBITMQ_DEFAULT_USER || 'guest';
  const pass = process.env.RABBITMQ_DEFAULT_PASS || 'guest';

  const url = `http://${host}:${managementPort}/api/queues/%2f/${encodeURIComponent(queueName)}/get`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64'),
    },
    body: JSON.stringify({
      count,
      ackmode: 'ack_requeue_true', // 메시지를 다시 큐에 넣음 (소비하지 않음)
      encoding: 'auto',
    }),
  });

  if (!response.ok) {
    if (response.status === 404) {
      return []; // 큐가 존재하지 않으면 빈 배열 반환
    }
    throw new Error(`Failed to get messages from queue: ${response.statusText}`);
  }

  const messages = await response.json();

  return messages.map((msg: any) => ({
    content: JSON.parse(msg.payload),
    headers: msg.properties?.headers || {},
    redelivered: msg.redelivered,
  }));
}

/**
 * 큐에 있는 메시지 개수를 조회합니다.
 */
export async function getQueueMessageCount(
  channel: Channel,
  queueName: string,
): Promise<number> {
  try {
    const queueInfo = await channel.checkQueue(queueName);
    return queueInfo.messageCount;
  } catch {
    return 0; // 큐가 존재하지 않으면 0 반환
  }
}

/**
 * 이메일 메시지를 발행합니다.
 */
export async function publishEmailMessage(
  rabbitmqService: RabbitMQService,
  payload: EmailPayload,
  headers?: Record<string, any>,
): Promise<void> {
  if (headers) {
    await rabbitmqService.sendMessageToQueue(
      RMQ_QUEUES.EMAIL_SEND,
      JSON.stringify(payload),
      { headers },
    );
  } else {
    await rabbitmqService.sendMessage(
      RMQ_EXCHANGES.EMAIL,
      RMQ_ROUTING_KEYS.EMAIL_SEND,
      JSON.stringify(payload),
    );
  }
}

/**
 * 조건이 충족될 때까지 대기합니다.
 */
export async function waitForCondition(
  condition: () => Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100,
): Promise<boolean> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (await condition()) return true;
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  return false;
}

/**
 * 특정 큐에 메시지가 도착할 때까지 대기합니다.
 */
export async function waitForQueueMessage(
  channel: Channel,
  queueName: string,
  timeout: number = 5000,
): Promise<boolean> {
  return waitForCondition(async () => {
    const count = await getQueueMessageCount(channel, queueName);
    return count > 0;
  }, timeout);
}

/**
 * 모든 이메일 관련 큐를 정리합니다.
 */
export async function purgeAllEmailQueues(channel: Channel): Promise<void> {
  const queuesToPurge = [
    RMQ_QUEUES.EMAIL_SEND,
    RMQ_QUEUES.EMAIL_SEND_WAIT_5S,
    RMQ_QUEUES.EMAIL_SEND_WAIT_10S,
    RMQ_QUEUES.EMAIL_SEND_WAIT_20S,
    RMQ_QUEUES.EMAIL_DEAD_LETTER,
  ];

  for (const queue of queuesToPurge) {
    try {
      await channel.purgeQueue(queue);
    } catch {
      // 큐가 없을 수도 있음
    }
  }
}

/**
 * Mailpit의 모든 이메일을 삭제합니다.
 */
export async function clearMailpit(): Promise<void> {
  const mailpitContainer = (global as any).__MAILPIT_CONTAINER__;
  if (!mailpitContainer) return;

  const webPort = mailpitContainer.getMappedPort(8025);
  const baseUrl = `http://${mailpitContainer.getHost()}:${webPort}`;
  await fetch(`${baseUrl}/api/v1/messages`, { method: 'DELETE' });
}

/**
 * Mailpit에서 이메일 목록을 조회합니다.
 */
export async function getMailpitMessages(): Promise<any[]> {
  const mailpitContainer = (global as any).__MAILPIT_CONTAINER__;
  if (!mailpitContainer) return [];

  const webPort = mailpitContainer.getMappedPort(8025);
  const baseUrl = `http://${mailpitContainer.getHost()}:${webPort}`;
  const response = await fetch(`${baseUrl}/api/v1/messages`);
  const data = await response.json();
  return data.messages || [];
}