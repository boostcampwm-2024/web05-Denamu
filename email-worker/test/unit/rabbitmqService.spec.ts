import 'reflect-metadata';

import { Channel, ConsumeMessage } from 'amqplib';

import { RabbitMQService } from '@rabbitmq/rabbitmq.service';
import { RabbitMQManager } from '@rabbitmq/rabbitmq.manager';

describe('RabbitmqService unit test', () => {
  let rabbitmqService: RabbitMQService;
  let mockRabbitMQManager: jest.Mocked<RabbitMQManager>;
  let mockChannel: jest.Mocked<Channel>;
  let publish: jest.Mock;
  let sendToQueue: jest.Mock;
  let consume: jest.Mock;
  let ack: jest.Mock;
  let nack: jest.Mock;
  let cancel: jest.Mock;
  let getChannel: jest.Mock;

  beforeEach(() => {
    publish = jest.fn().mockReturnValue(true);
    sendToQueue = jest.fn().mockReturnValue(true);
    consume = jest.fn().mockResolvedValue({ consumerTag: 'test-consumer-tag' });
    ack = jest.fn();
    nack = jest.fn();
    cancel = jest.fn().mockResolvedValue({});

    mockChannel = {
      publish,
      sendToQueue,
      consume,
      ack,
      nack,
      cancel,
    } as Partial<Channel> as jest.Mocked<Channel>;

    getChannel = jest.fn().mockResolvedValue(mockChannel);

    mockRabbitMQManager = {
      getChannel,
    } as any;

    rabbitmqService = new RabbitMQService(mockRabbitMQManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage unit test', () => {
    it('exchange와 routingKey를 사용하여 메시지를 발행한다', async () => {
      const exchange = 'TestExchange';
      const routingKey = 'test.routing.key';
      const message = JSON.stringify({ data: 'test-data' });

      await rabbitmqService.sendMessage(exchange, routingKey, message);

      expect(getChannel).toHaveBeenCalledTimes(1);
      expect(publish).toHaveBeenCalledTimes(1);
      expect(publish).toHaveBeenCalledWith(
        exchange,
        routingKey,
        Buffer.from(message),
      );
    });
  });

  describe('sendMessageToQueue unit test', () => {
    it('큐에 메시지를 직접 전송한다', async () => {
      const queue = 'test.queue';
      const message = JSON.stringify({ data: 'test-data' });

      await rabbitmqService.sendMessageToQueue(queue, message);

      expect(getChannel).toHaveBeenCalledTimes(1);
      expect(sendToQueue).toHaveBeenCalledTimes(1);
      expect(sendToQueue).toHaveBeenCalledWith(
        queue,
        Buffer.from(message),
        undefined,
      );
    });

    it('옵션과 함께 큐에 메시지를 전송한다', async () => {
      const queue = 'test.queue';
      const message = JSON.stringify({ data: 'test-data' });
      const options = {
        headers: {
          'x-retry-count': 1,
        },
      };

      await rabbitmqService.sendMessageToQueue(queue, message, options);

      expect(sendToQueue).toHaveBeenCalledWith(
        queue,
        Buffer.from(message),
        options,
      );
    });
  });

  describe('consumeMessage unit test', () => {
    it('큐에서 메시지를 소비하고 consumerTag를 반환한다', async () => {
      const queue = 'test.queue';
      const onMessage = jest.fn();

      const consumerTag = await rabbitmqService.consumeMessage(
        queue,
        onMessage,
      );

      expect(getChannel).toHaveBeenCalledTimes(1);
      expect(consume).toHaveBeenCalledTimes(1);
      expect(consume).toHaveBeenCalledWith(
        queue,
        expect.any(Function),
      );
      expect(consumerTag).toBe('test-consumer-tag');
    });

    it('메시지를 파싱하고 onMessage 콜백을 호출한 후 ack 처리한다', async () => {
      const queue = 'test.queue';
      const testPayload = { type: 'test', data: 'test-data' };
      const onMessage = jest.fn().mockResolvedValue(undefined);

      mockChannel.consume.mockImplementation((q, callback) => {
        const mockMessage: ConsumeMessage = {
          content: Buffer.from(JSON.stringify(testPayload)),
          properties: {
            headers: { 'x-retry-count': 2 },
          },
        } as any;

        callback(mockMessage);
        return Promise.resolve({ consumerTag: 'test-consumer-tag' });
      });

      await rabbitmqService.consumeMessage(queue, onMessage);

      // 비동기 콜백 처리를 위해 잠시 대기
      await new Promise((resolve) => setImmediate(resolve));

      expect(onMessage).toHaveBeenCalledWith(testPayload, 2);
      expect(ack).toHaveBeenCalledTimes(1);
    });

    it('메시지가 null이면 아무 작업도 하지 않는다', async () => {
      const queue = 'test.queue';
      const onMessage = jest.fn();

      mockChannel.consume.mockImplementation((q, callback) => {
        callback(null);
        return Promise.resolve({ consumerTag: 'test-consumer-tag' });
      });

      await rabbitmqService.consumeMessage(queue, onMessage);

      await new Promise((resolve) => setImmediate(resolve));

      expect(onMessage).not.toHaveBeenCalled();
      expect(ack).not.toHaveBeenCalled();
    });

    it('x-retry-count 헤더가 없으면 0으로 처리한다', async () => {
      const queue = 'test.queue';
      const testPayload = { type: 'test' };
      const onMessage = jest.fn().mockResolvedValue(undefined);

      mockChannel.consume.mockImplementation((q, callback) => {
        const mockMessage: ConsumeMessage = {
          content: Buffer.from(JSON.stringify(testPayload)),
          properties: {
            headers: {},
          },
        } as any;

        callback(mockMessage);
        return Promise.resolve({ consumerTag: 'test-consumer-tag' });
      });

      await rabbitmqService.consumeMessage(queue, onMessage);

      await new Promise((resolve) => setImmediate(resolve));

      expect(onMessage).toHaveBeenCalledWith(testPayload, 0);
    });

    it('SHUTDOWN_IN_PROGRESS 에러 발생 시 메시지를 큐에 반환한다 (nack with requeue)', async () => {
      const queue = 'test.queue';
      const testPayload = { type: 'test' };
      const onMessage = jest
        .fn()
        .mockRejectedValue(new Error('SHUTDOWN_IN_PROGRESS'));

      let capturedMessage: ConsumeMessage;
      mockChannel.consume.mockImplementation((q, callback) => {
        capturedMessage = {
          content: Buffer.from(JSON.stringify(testPayload)),
          properties: {
            headers: {},
          },
        } as any;

        callback(capturedMessage);
        return Promise.resolve({ consumerTag: 'test-consumer-tag' });
      });

      await rabbitmqService.consumeMessage(queue, onMessage);

      await new Promise((resolve) => setImmediate(resolve));

      expect(nack).toHaveBeenCalledWith(
        capturedMessage,
        false,
        true,
      );
      expect(ack).not.toHaveBeenCalled();
    });

    it('일반 에러 발생 시 메시지를 nack 처리한다 (requeue false)', async () => {
      const queue = 'test.queue';
      const testPayload = { type: 'test' };
      const onMessage = jest.fn().mockRejectedValue(new Error('Some error'));

      let capturedMessage: ConsumeMessage;
      mockChannel.consume.mockImplementation((q, callback) => {
        capturedMessage = {
          content: Buffer.from(JSON.stringify(testPayload)),
          properties: {
            headers: {},
          },
        } as any;

        callback(capturedMessage);
        return Promise.resolve({ consumerTag: 'test-consumer-tag' });
      });

      await rabbitmqService.consumeMessage(queue, onMessage);

      await new Promise((resolve) => setImmediate(resolve));

      expect(nack).toHaveBeenCalledWith(
        capturedMessage,
        false,
        false,
      );
      expect(ack).not.toHaveBeenCalled();
    });
  });

  describe('closeConsumer unit test', () => {
    it('consumerTag로 consumer를 취소한다', async () => {
      const consumerTag = 'test-consumer-tag';

      await rabbitmqService.closeConsumer(consumerTag);

      expect(getChannel).toHaveBeenCalledTimes(1);
      expect(cancel).toHaveBeenCalledTimes(1);
      expect(cancel).toHaveBeenCalledWith(consumerTag);
    });
  });
});
